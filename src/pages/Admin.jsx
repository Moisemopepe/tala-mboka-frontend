import {
  BarChart3,
  CheckCircle2,
  Download,
  Edit3,
  FileText,
  MapPinned,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Users,
  Wrench,
  X,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { currentReleaseNotes } from "../config/releaseNotes.js";
import { VERSION } from "../config/version.js";
import { categories, statuses } from "../utils/categories.js";
import { drcLocations, provinces } from "../utils/drcLocations.js";
import { reporterRoles, reporterRoleLabel } from "../utils/reporterRoles.js";

const tabs = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "reports", label: "Reports", icon: FileText },
  { key: "users", label: "Users", icon: Users, adminOnly: true },
  { key: "map", label: "Map", icon: MapPinned },
  { key: "tools", label: "Outils", icon: Wrench }
];

const statusOptions = ["danger", "critique"];
const moderationOptions = {
  pending: "En attente",
  approved: "Publie",
  rejected: "Rejete"
};
const moderationStyles = {
  pending: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  approved: "bg-green-50 text-green-700 ring-green-200",
  rejected: "bg-red-50 text-red-700 ring-red-200"
};
const categoryOptions = Object.keys(categories);
const reporterRoleOptions = Object.keys(reporterRoles);
const versionNotesMaxLength = 2000;

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const storedUser = JSON.parse(localStorage.getItem("tala_user") || "null");
  const currentUser = user || storedUser;
  const isAdmin = currentUser?.role === "admin";
  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || isAdmin);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [reportQuery, setReportQuery] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [reportModeration, setReportModeration] = useState("");
  const [reportCategory, setReportCategory] = useState("");
  const [reportProvince, setReportProvince] = useState("");
  const [reportDateSort, setReportDateSort] = useState("newest");
  const [userQuery, setUserQuery] = useState("");
  const [editingReport, setEditingReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    refreshAdmin();
    const timer = window.setInterval(() => {
      refreshAdmin({ silent: true });
    }, 30000);

    return () => window.clearInterval(timer);
  }, [isAdmin]);

  async function refreshAdmin(options = {}) {
    if (!options.silent) setLoading(true);
    try {
      const [statsData, reportsData, usersData] = await Promise.all([
        api("/admin/stats"),
        api("/admin/reports"),
        isAdmin ? api("/admin/users") : Promise.resolve([])
      ]);
      setStats(statsData);
      setReports(reportsData);
      setUsers(usersData);
      setLastRefresh(new Date());
      setError("");
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("tala_token");
        navigate("/admin/login", { replace: true });
        return;
      }
      setError(err.message);
    } finally {
      if (!options.silent) setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    const updated = await api(`/admin/reports/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    setReports((items) => items.map((item) => (item._id === id ? { ...item, status: updated.status } : item)));
    refreshAdmin();
  }

  async function approveReport(id) {
    const updated = await api(`/admin/reports/${id}/approve`, { method: "PATCH" });
    setReports((items) => items.map((item) => (item._id === id ? updated : item)));
    refreshAdmin();
  }

  async function rejectReport(id) {
    const reason = window.prompt("Raison du rejet (optionnel)") || "";
    const updated = await api(`/admin/reports/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason })
    });
    setReports((items) => items.map((item) => (item._id === id ? updated : item)));
    refreshAdmin();
  }

  async function saveReport(id, payload) {
    const updated = await api(`/admin/reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    setReports((items) => items.map((item) => (item._id === id ? updated : item)));
    setEditingReport(null);
    refreshAdmin();
  }

  async function deleteReport(id) {
    await api(`/admin/reports/${id}`, { method: "DELETE" });
    setReports((items) => items.filter((item) => item._id !== id));
    refreshAdmin();
  }

  async function toggleBan(user) {
    const updated = await api(`/admin/users/${user._id}/ban`, {
      method: "PATCH",
      body: JSON.stringify({ banned: !user.banned })
    });
    setUsers((items) => items.map((item) => (item._id === user._id ? { ...item, banned: updated.banned } : item)));
  }

  async function updateRole(user, role) {
    const updated = await api(`/admin/users/${user._id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role })
    });
    setUsers((items) => items.map((item) => (item._id === user._id ? { ...item, role: updated.role } : item)));
  }

  const filteredReports = useMemo(() => {
    const query = reportQuery.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesQuery =
        !query ||
        report.title?.toLowerCase().includes(query) ||
        report.description?.toLowerCase().includes(query) ||
        report.userId?.name?.toLowerCase().includes(query);
      const matchesStatus = !reportStatus || report.status === reportStatus;
      const currentModeration = report.moderationStatus || "approved";
      const matchesModeration = !reportModeration || currentModeration === reportModeration;
      const matchesCategory = !reportCategory || report.category === reportCategory;
      const matchesProvince = !reportProvince || report.province === reportProvince;
      return matchesQuery && matchesStatus && matchesModeration && matchesCategory && matchesProvince;
    }).sort((a, b) => {
      const left = new Date(a.createdAt).getTime();
      const right = new Date(b.createdAt).getTime();
      return reportDateSort === "oldest" ? left - right : right - left;
    });
  }, [reports, reportQuery, reportStatus, reportModeration, reportCategory, reportProvince, reportDateSort]);

  const filteredUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase();
    return users.filter((user) => !query || user.name?.toLowerCase().includes(query) || user.phone?.includes(query));
  }, [users, userQuery]);

  const heatPoints = useMemo(() => {
    return reports.map((report) => ({
      center: [report.location.lat, report.location.lng],
      radius: 260 + Math.min((report.likesCount || 0) * 60, 500),
      color: categories[report.category]?.color || "#0B5ED7"
    }));
  }, [reports]);

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-5 lg:space-y-0">
      <aside className="rounded-xl border border-slate-200/70 bg-white p-3 shadow-sm lg:sticky lg:top-24 lg:h-fit">
        <div className="mb-3 hidden items-center gap-2 px-2 py-1 lg:flex">
          <ShieldCheck className="text-primary" size={20} />
          <p className="font-heading font-black text-text">Admin</p>
        </div>
        <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
          {visibleTabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex min-h-12 shrink-0 items-center gap-3 rounded-lg border px-4 text-sm font-semibold transition lg:w-full ${
                activeTab === key
                  ? "border-green-200 bg-green-50 text-primary shadow-sm"
                  : "border-transparent bg-white text-[#1E293B] hover:border-green-200 hover:bg-green-50 hover:text-primary"
              }`}
            >
              <Icon size={19} strokeWidth={2.4} />
              {label}
            </button>
          ))}
        </div>
      </aside>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
          <h1 className="font-heading text-xl font-black text-text md:text-2xl lg:text-3xl">{isAdmin ? "Admin Dashboard" : "Moderateur Dashboard"}</h1>
            <p className="text-sm font-medium text-slate-600 md:text-base">
              Modifier les alertes, gerer les users, suivre les stats et la carte.
            </p>
            {lastRefresh && (
              <p className="mt-1 text-xs font-bold text-slate-400">
                Refresh auto toutes les 30s. Derniere mise a jour: {lastRefresh.toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button type="button" variant="ghost" onClick={refreshAdmin}>
            <SlidersHorizontal size={18} />
            Actualiser
          </Button>
        </div>

        {loading && (
          <Card className="p-5">
            <p className="text-sm font-bold text-slate-600">Chargement des donnees admin...</p>
          </Card>
        )}

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}

        {!loading && activeTab === "dashboard" && (
          <Dashboard stats={stats} reports={reports} users={users} onOpenTab={setActiveTab} isAdmin={isAdmin} />
        )}
        {!loading && activeTab === "reports" && (
          <ReportsPanel
            reports={filteredReports}
            query={reportQuery}
            status={reportStatus}
            moderation={reportModeration}
            category={reportCategory}
            province={reportProvince}
            onQuery={setReportQuery}
            onStatusFilter={setReportStatus}
            onModerationFilter={setReportModeration}
            onCategoryFilter={setReportCategory}
            onProvinceFilter={setReportProvince}
            dateSort={reportDateSort}
            onDateSort={setReportDateSort}
            onStatus={updateStatus}
            onApprove={approveReport}
            onReject={rejectReport}
            onEdit={setEditingReport}
            onDelete={deleteReport}
          />
        )}
        {!loading && isAdmin && activeTab === "users" && (
          <UsersPanel users={filteredUsers} query={userQuery} onQuery={setUserQuery} onToggleBan={toggleBan} onRole={updateRole} />
        )}
        {!loading && activeTab === "map" && <AdminMap reports={reports} heatPoints={heatPoints} />}
        {!loading && activeTab === "tools" && (
          <AdminTools reports={reports} users={users} onOpenTab={setActiveTab} isAdmin={isAdmin} />
        )}
      </section>

      {editingReport && <EditReportModal report={editingReport} onClose={() => setEditingReport(null)} onSave={saveReport} />}
    </div>
  );
}

function Dashboard({ stats, reports, users, onOpenTab, isAdmin }) {
  const cards = [
    { label: "Total reports", value: stats?.reports ?? stats?.totalReports ?? 0, color: "text-primary", tab: "reports" },
    { label: "Danger", value: stats?.dangerReports ?? 0, color: "text-red-600", tab: "reports" },
    { label: "Critique", value: stats?.critiqueReports ?? 0, color: "text-orange-600", tab: "reports" },
    { label: "A moderer", value: stats?.pendingModerationReports ?? 0, color: "text-yellow-600", tab: "reports" },
    { label: "Users", value: stats?.users ?? stats?.totalUsers ?? 0, color: "text-danger", tab: "users", adminOnly: true }
  ];
  const bannedUsers = users.filter((user) => user.banned).length;
  const dangerReports = reports.filter((report) => report.status === "danger").slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.filter((card) => !card.adminOnly || isAdmin).map((card) => (
          <button key={card.label} type="button" onClick={() => onOpenTab(card.tab)} className="text-left">
            <Card className="p-4 transition hover:border-green-200 hover:bg-green-50">
              <p className="text-xs font-black uppercase text-slate-600">{card.label}</p>
              <p className={`mt-2 font-heading text-3xl font-black ${card.color}`}>{card.value}</p>
            </Card>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="p-4">
          <h2 className="font-heading text-lg font-black text-text">Category breakdown</h2>
          <div className="mt-4 space-y-3">
            {(stats?.categoryBreakdown || []).map((item) => (
              <div key={item.category}>
                <div className="mb-1 flex justify-between text-sm font-bold">
                  <span>{categories[item.category]?.label || item.category}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.min((item.count / Math.max(stats.reports ?? stats.totalReports, 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {(stats?.categoryBreakdown || []).length === 0 && <p className="text-sm font-semibold text-slate-500">No data.</p>}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-heading text-lg font-black text-text">Actions rapides</h2>
          <div className="mt-4 space-y-2">
            <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => onOpenTab("reports")}>
              Alertes danger
            </Button>
            {isAdmin && (
              <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => onOpenTab("users")}>
                Gerer les utilisateurs
              </Button>
            )}
            <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => onOpenTab("map")}>
              Voir la heatmap
            </Button>
          </div>
          <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
            Utilisateurs bannis: {bannedUsers}
          </p>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="font-heading text-lg font-black text-text">Alertes danger</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {dangerReports.map((report) => (
            <div key={report._id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-black uppercase text-primary">{categories[report.category]?.label}</p>
              <p className="font-bold text-text">{report.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{report.description}</p>
            </div>
          ))}
          {dangerReports.length === 0 && <p className="text-sm font-semibold text-slate-500">Aucune alerte danger.</p>}
        </div>
      </Card>
    </div>
  );
}

function ReportsPanel({
  reports,
  query,
  status,
  moderation,
  category,
  province,
  onQuery,
  onStatusFilter,
  onModerationFilter,
  onCategoryFilter,
  onProvinceFilter,
  dateSort,
  onDateSort,
  onStatus,
  onApprove,
  onReject,
  onEdit,
  onDelete
}) {
  return (
    <Card className="overflow-hidden">
      <div className="space-y-3 border-b border-slate-100 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-lg font-black text-text">Gestion des alertes</h2>
            <p className="text-sm font-semibold text-slate-600">
              {reports.length} alerte{reports.length > 1 ? "s" : ""} affichee{reports.length > 1 ? "s" : ""}. Modifier,
              filtrer, resoudre ou supprimer les signalements.
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={() => exportCsv("reports.csv", reports)}>
            <Download size={17} />
            Export CSV
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_repeat(5,minmax(140px,170px))]">
          <label className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder="Chercher titre, description, user..."
              className="form-field pl-10"
            />
          </label>
          <select value={status} onChange={(event) => onStatusFilter(event.target.value)} className="form-field">
            <option value="">Toutes gravites</option>
            {statusOptions.map((item) => (
              <option key={item} value={item}>
                {statuses[item]}
              </option>
            ))}
          </select>
          <select value={moderation} onChange={(event) => onModerationFilter(event.target.value)} className="form-field">
            <option value="">Toute moderation</option>
            {Object.entries(moderationOptions).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <select value={category} onChange={(event) => onCategoryFilter(event.target.value)} className="form-field">
            <option value="">Toutes categories</option>
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {categories[item].label}
              </option>
            ))}
          </select>
          <select value={province} onChange={(event) => onProvinceFilter(event.target.value)} className="form-field">
            <option value="">Toutes provinces</option>
            {provinces.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select value={dateSort} onChange={(event) => onDateSort(event.target.value)} className="form-field">
            <option value="newest">Plus recentes</option>
            <option value="oldest">Plus anciennes</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Report</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Statuts</th>
              <th className="px-4 py-3">Province / Commune</th>
              <th className="px-4 py-3">GPS</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <tr key={report._id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-bold text-text">{report.title}</p>
                  <p className="truncate text-slate-600">{report.description}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{report.likesCount || 0} soutiens</p>
                </td>
                <td className="px-4 py-3 font-semibold">{categories[report.category]?.label}</td>
                <td className="px-4 py-3 text-slate-700">
                  <p className="font-semibold">{report.userId?.name || (report.source === "guest" ? "Invité" : "Unknown")}</p>
                  <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    {reporterRoleLabel(report.reporterRole)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="mb-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    {report.source || "user"}
                  </p>
                  <div className="mb-2">
                    <ModerationBadge status={report.moderationStatus || "approved"} />
                  </div>
                  <div className="mb-2">
                    <StatusBadge status={report.status} />
                  </div>
                  <select
                    value={["danger", "critique"].includes(report.status) ? report.status : "suivi"}
                    onChange={(event) => onStatus(report._id, event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-text"
                  >
                    <option value="suivi">Normal</option>
                    {statusOptions.map((item) => (
                      <option key={item} value={item}>
                        {statuses[item]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 font-bold text-slate-700">
                  {report.province || "-"} / {report.commune || "-"}
                  {report.location.address && <p className="text-xs font-semibold text-slate-500">{report.location.address}</p>}
                </td>
                <td className="px-4 py-3 text-xs font-bold text-slate-600">
                  {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {(report.moderationStatus || "approved") === "pending" && (
                      <>
                        <Button type="button" variant="success" size="sm" onClick={() => onApprove(report._id)}>
                          <CheckCircle2 size={16} />
                          Approuver
                        </Button>
                        <Button type="button" variant="danger" size="sm" onClick={() => onReject(report._id)}>
                          <XCircle size={16} />
                          Rejeter
                        </Button>
                      </>
                    )}
                    <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(report)}>
                      <Edit3 size={16} />
                      Modifier
                    </Button>
                    <Button type="button" variant="danger" size="sm" onClick={() => onDelete(report._id)}>
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center font-bold text-slate-500" colSpan={7}>
                  Aucune alerte disponible
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ModerationBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
        moderationStyles[status] || moderationStyles.approved
      }`}
    >
      {moderationOptions[status] || moderationOptions.approved}
    </span>
  );
}

function UsersPanel({ users, query, onQuery, onToggleBan, onRole }) {
  return (
    <Card className="overflow-hidden">
      <div className="space-y-3 border-b border-slate-100 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-black text-text">Utilisateurs</h2>
            <p className="text-sm font-semibold text-slate-600">Bannir, debannir et gerer les roles.</p>
          </div>
          <Button type="button" variant="ghost" onClick={() => exportCsv("users.csv", users)}>
            <Download size={17} />
            Export CSV
          </Button>
        </div>
        <label className="relative block w-full">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Chercher nom ou telephone..." className="form-field pl-10" />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Reports</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-4 py-3 font-bold text-text">{user.name}</td>
                <td className="px-4 py-3 text-slate-700">{user.phone}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(event) => onRole(user, event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-text"
                  >
                    <option value="user">user</option>
                    <option value="moderator">moderator</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 font-bold">{user.reportCount}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.banned ? "bg-red-50 text-danger" : "bg-emerald-50 text-success"}`}>
                    {user.banned ? "Banned" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button type="button" variant={user.banned ? "ghost" : "danger"} size="sm" onClick={() => onToggleBan(user)}>
                    {user.banned ? "Unban" : "Ban"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AdminMap({ reports, heatPoints }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 p-4">
        <h2 className="font-heading text-lg font-black text-text">Map analytics</h2>
        <p className="text-sm font-semibold text-slate-600">Tous les signalements + heatmap par zone.</p>
      </div>
      <div className="h-[300px] md:h-[400px] lg:h-[500px]">
        <MapContainer center={[-4.325, 15.3222]} zoom={12} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {heatPoints.map((point, index) => (
            <Circle
              key={`${point.center[0]}-${point.center[1]}-${index}`}
              center={point.center}
              radius={point.radius}
              pathOptions={{ color: point.color, fillColor: point.color, fillOpacity: 0.18, weight: 1 }}
            />
          ))}
          {reports.map((report) => (
            <Marker key={report._id} position={[report.location.lat, report.location.lng]}>
              <Popup>
                <p className="font-bold">{report.title}</p>
                <p>{categories[report.category]?.label}</p>
                <p>{report.province} / {report.commune}</p>
                <p>{statuses[report.status]}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Card>
  );
}

function AdminTools({ reports, users, onOpenTab, isAdmin }) {
  const tools = [
    "Modifier titre, description, categorie, statut et coordonnees des alertes",
    "Approuver ou rejeter les alertes invitees",
    "Supprimer une alerte incorrecte ou abusive",
    "Chercher et filtrer les alertes par categorie, statut ou utilisateur",
    "Exporter les rapports et utilisateurs en CSV",
    "Visualiser toutes les alertes sur la carte analytics avec heatmap"
  ].concat(
    isAdmin
      ? ["Bannir ou debannir un utilisateur", "Promouvoir un utilisateur en moderateur ou admin"]
      : ["Gerer les alertes sans modifier les roles utilisateurs"]
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
      <div className="space-y-4">
        <Card className="p-4">
          <h2 className="font-heading text-xl font-black text-text">Ce que tu peux faire comme admin</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <div key={tool} className="rounded-lg border border-green-100 bg-green-50 p-3 text-sm font-bold text-text">
                {tool}
              </div>
            ))}
          </div>
        </Card>
        {isAdmin && <VersionNotificationForm />}
      </div>
      <Card className="p-4">
        <h2 className="font-heading text-lg font-black text-text">Raccourcis</h2>
        <div className="mt-4 space-y-2">
          <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => onOpenTab("reports")}>
            Reports: {reports.length}
          </Button>
          {isAdmin && (
            <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => onOpenTab("users")}>
              Users: {users.length}
            </Button>
          )}
          <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => onOpenTab("map")}>
            Map analytics
          </Button>
        </div>
      </Card>
    </div>
  );
}

function VersionNotificationForm() {
  const defaultReleaseForm = {
    version: VERSION,
    adminNotes: currentReleaseNotes.adminNotes,
    userNotes: currentReleaseNotes.userNotes
  };
  const [form, setForm] = useState({
    ...defaultReleaseForm
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    const adminNotesLength = form.adminNotes.trim().length;
    const userNotesLength = form.userNotes.trim().length;

    if (adminNotesLength > versionNotesMaxLength || userNotesLength > versionNotesMaxLength) {
      setMessage(`Les notes ne peuvent pas depasser ${versionNotesMaxLength} caracteres.`);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await api("/admin/version-notifications", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setMessage(data.message);
      setForm({
        version: VERSION,
        adminNotes: "",
        userNotes: ""
      });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4">
      <h2 className="font-heading text-lg font-black text-text">Notification de version</h2>
      <p className="text-sm font-semibold text-slate-600">
        Admin/moderateur recoit les notes completes. User recoit seulement les details utiles cote public.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
          value={form.version}
          onChange={(event) => update("version", event.target.value)}
          className="form-field"
          placeholder="Version ex: 0.0.9"
        />
        <textarea
          value={form.adminNotes}
          onChange={(event) => update("adminNotes", event.target.value)}
          className="form-field"
          rows={3}
          maxLength={versionNotesMaxLength}
          placeholder="Notes admin: toutes les modifications techniques et moderation"
        />
        <p className="text-right text-xs font-bold text-slate-500">
          {form.adminNotes.trim().length}/{versionNotesMaxLength} caracteres admin
        </p>
        <textarea
          value={form.userNotes}
          onChange={(event) => update("userNotes", event.target.value)}
          className="form-field"
          rows={3}
          maxLength={versionNotesMaxLength}
          placeholder="Notes user: changements visibles par les utilisateurs"
        />
        <p className="text-right text-xs font-bold text-slate-500">
          {form.userNotes.trim().length}/{versionNotesMaxLength} caracteres user
        </p>
        {message && <p className="rounded-xl bg-green-50 p-3 text-sm font-bold text-primary">{message}</p>}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" variant="success" disabled={loading}>
            {loading ? "Envoi..." : "Notifier la version"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setForm(defaultReleaseForm)}>
            Remettre les notes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function EditReportModal({ report, onClose, onSave }) {
  const [form, setForm] = useState({
    title: report.title || "",
    description: report.description || "",
    category: report.category || "road",
    status: ["danger", "critique"].includes(report.status) ? report.status : "",
    reporterRole: report.reporterRole || "concerned",
    province: report.province || "Kinshasa",
    commune: report.commune || "Gombe",
    lat: report.location?.lat || "",
    lng: report.location?.lng || ""
  });
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    try {
      await onSave(report._id, { ...form, status: form.status || "suivi" });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-slate-950/40 p-3 sm:items-center sm:justify-center">
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-4 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-black text-text">Modifier l'alerte</h2>
            <p className="text-sm font-semibold text-slate-600">Tu peux corriger les infos publiees par l'utilisateur.</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-text">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <input value={form.title} onChange={(event) => update("title", event.target.value)} className="form-field" placeholder="Titre" />
          <textarea value={form.description} onChange={(event) => update("description", event.target.value)} className="form-field" rows={4} placeholder="Description" />
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={form.category} onChange={(event) => update("category", event.target.value)} className="form-field">
              {categoryOptions.map((item) => (
                <option key={item} value={item}>
                  {categories[item].label}
                </option>
              ))}
            </select>
            <select value={form.status} onChange={(event) => update("status", event.target.value)} className="form-field">
              <option value="">Normal</option>
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {statuses[item]}
                </option>
              ))}
            </select>
          </div>
          <select value={form.reporterRole} onChange={(event) => update("reporterRole", event.target.value)} className="form-field">
            {reporterRoleOptions.map((item) => (
              <option key={item} value={item}>
                {reporterRoles[item].label}
              </option>
            ))}
          </select>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={form.province}
              onChange={(event) => {
                const nextProvince = event.target.value;
                setForm((current) => ({
                  ...current,
                  province: nextProvince,
                  commune: drcLocations[nextProvince]?.[0] || ""
                }));
              }}
              className="form-field"
            >
              {provinces.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select value={form.commune} onChange={(event) => update("commune", event.target.value)} className="form-field">
              {(drcLocations[form.province] || []).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="number" step="any" value={form.lat} onChange={(event) => update("lat", event.target.value)} className="form-field" placeholder="Latitude" />
            <input type="number" step="any" value={form.lng} onChange={(event) => update("lng", event.target.value)} className="form-field" placeholder="Longitude" />
          </div>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="success">
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
}

function exportCsv(filename, rows) {
  const flatRows = rows.map((row) => ({
    id: row._id,
    title: row.title,
    name: row.name || row.userId?.name,
    phone: row.phone || row.userId?.phone,
    category: row.category,
    province: row.province,
    commune: row.commune,
    status: row.status,
    reporterRole: row.reporterRole,
    reportCount: row.reportCount,
    likesCount: row.likesCount,
    lat: row.location?.lat,
    lng: row.location?.lng,
    banned: row.banned,
    role: row.role,
    createdAt: row.createdAt
  }));
  const headers = Array.from(new Set(flatRows.flatMap((row) => Object.keys(row))));
  const csv = [
    headers.join(","),
    ...flatRows.map((row) =>
      headers
        .map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`)
        .join(",")
    )
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
