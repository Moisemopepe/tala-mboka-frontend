import {
  BarChart3,
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
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { categories, statuses } from "../utils/categories.js";

const tabs = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "reports", label: "Reports", icon: FileText },
  { key: "users", label: "Users", icon: Users },
  { key: "map", label: "Map", icon: MapPinned },
  { key: "tools", label: "Outils", icon: Wrench }
];

const statusOptions = ["pending", "in_progress", "resolved"];
const categoryOptions = Object.keys(categories);

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [reportQuery, setReportQuery] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [reportCategory, setReportCategory] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [editingReport, setEditingReport] = useState(null);

  useEffect(() => {
    refreshAdmin();
  }, []);

  async function refreshAdmin() {
    try {
      const [statsData, reportsData, usersData] = await Promise.all([
        api("/admin/stats"),
        api("/admin/reports"),
        api("/admin/users")
      ]);
      setStats(statsData);
      setReports(reportsData);
      setUsers(usersData);
      setError("");
    } catch (err) {
      setError(err.message);
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
      const matchesCategory = !reportCategory || report.category === reportCategory;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [reports, reportQuery, reportStatus, reportCategory]);

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
    <div className="space-y-4 lg:grid lg:grid-cols-[220px_1fr] lg:gap-5 lg:space-y-0">
      <aside className="rounded-2xl border border-slate-100 bg-white p-3 shadow-soft lg:sticky lg:top-24 lg:h-fit">
        <div className="mb-3 hidden items-center gap-2 px-2 py-1 lg:flex">
          <ShieldCheck className="text-primary" size={20} />
          <p className="font-heading font-black text-text">Admin</p>
        </div>
        <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex min-h-12 shrink-0 items-center gap-3 rounded-xl border px-4 text-sm font-black transition lg:w-full ${
                activeTab === key
                  ? "border-primary bg-blue-50 text-primary shadow-sm"
                  : "border-transparent bg-white text-[#1E293B] hover:border-blue-100 hover:bg-blue-50 hover:text-primary"
              }`}
            >
              <Icon size={19} strokeWidth={2.4} />
              {label}
            </button>
          ))}
        </div>
      </aside>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-black text-text">Admin Dashboard</h1>
            <p className="text-sm font-medium text-slate-600">
              Modifier les alertes, gerer les users, suivre les stats et la carte.
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={refreshAdmin}>
            <SlidersHorizontal size={18} />
            Actualiser
          </Button>
        </div>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}

        {activeTab === "dashboard" && (
          <Dashboard stats={stats} reports={reports} users={users} onOpenTab={setActiveTab} />
        )}
        {activeTab === "reports" && (
          <ReportsPanel
            reports={filteredReports}
            query={reportQuery}
            status={reportStatus}
            category={reportCategory}
            onQuery={setReportQuery}
            onStatusFilter={setReportStatus}
            onCategoryFilter={setReportCategory}
            onStatus={updateStatus}
            onEdit={setEditingReport}
            onDelete={deleteReport}
          />
        )}
        {activeTab === "users" && (
          <UsersPanel users={filteredUsers} query={userQuery} onQuery={setUserQuery} onToggleBan={toggleBan} onRole={updateRole} />
        )}
        {activeTab === "map" && <AdminMap reports={reports} heatPoints={heatPoints} />}
        {activeTab === "tools" && <AdminTools reports={reports} users={users} onOpenTab={setActiveTab} />}
      </section>

      {editingReport && <EditReportModal report={editingReport} onClose={() => setEditingReport(null)} onSave={saveReport} />}
    </div>
  );
}

function Dashboard({ stats, reports, users, onOpenTab }) {
  const cards = [
    { label: "Total reports", value: stats?.totalReports ?? 0, color: "text-primary", tab: "reports" },
    { label: "Pending", value: stats?.pendingReports ?? 0, color: "text-amber-600", tab: "reports" },
    { label: "Resolved", value: stats?.resolvedReports ?? 0, color: "text-success", tab: "reports" },
    { label: "Users", value: stats?.totalUsers ?? 0, color: "text-danger", tab: "users" }
  ];
  const bannedUsers = users.filter((user) => user.banned).length;
  const urgentReports = reports.filter((report) => report.status === "pending").slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <button key={card.label} type="button" onClick={() => onOpenTab(card.tab)} className="text-left">
            <Card className="p-4 transition hover:border-blue-100 hover:bg-blue-50">
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
                    style={{ width: `${Math.min((item.count / Math.max(stats.totalReports, 1)) * 100, 100)}%` }}
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
              Modifier les alertes
            </Button>
            <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => onOpenTab("users")}>
              Gerer les utilisateurs
            </Button>
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
        <h2 className="font-heading text-lg font-black text-text">Alertes en attente</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {urgentReports.map((report) => (
            <div key={report._id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-black uppercase text-primary">{categories[report.category]?.label}</p>
              <p className="font-bold text-text">{report.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{report.description}</p>
            </div>
          ))}
          {urgentReports.length === 0 && <p className="text-sm font-semibold text-slate-500">Aucune alerte urgente.</p>}
        </div>
      </Card>
    </div>
  );
}

function ReportsPanel({
  reports,
  query,
  status,
  category,
  onQuery,
  onStatusFilter,
  onCategoryFilter,
  onStatus,
  onEdit,
  onDelete
}) {
  return (
    <Card className="overflow-hidden">
      <div className="space-y-3 border-b border-slate-100 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-black text-text">Gestion des alertes</h2>
            <p className="text-sm font-semibold text-slate-600">Modifier, filtrer, resoudre ou supprimer les signalements.</p>
          </div>
          <Button type="button" variant="ghost" onClick={() => exportCsv("reports.csv", reports)}>
            <Download size={17} />
            Export CSV
          </Button>
        </div>
        <div className="grid gap-2 md:grid-cols-[1fr_180px_180px]">
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
            <option value="">Tous statuts</option>
            {statusOptions.map((item) => (
              <option key={item} value={item}>
                {statuses[item]}
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
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Report</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <tr key={report._id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-bold text-text">{report.title}</p>
                  <p className="max-w-sm truncate text-slate-600">{report.description}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{report.likesCount || 0} soutiens</p>
                </td>
                <td className="px-4 py-3 font-semibold">{categories[report.category]?.label}</td>
                <td className="px-4 py-3 text-slate-700">{report.userId?.name || "Unknown"}</td>
                <td className="px-4 py-3">
                  <select
                    value={report.status}
                    onChange={(event) => onStatus(report._id, event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-text"
                  >
                    {statusOptions.map((item) => (
                      <option key={item} value={item}>
                        {statuses[item]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs font-bold text-slate-600">
                  {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
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
                <td className="px-4 py-8 text-center font-bold text-slate-500" colSpan={6}>
                  Aucun resultat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
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
        <label className="relative block max-w-xl">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Chercher nom ou telephone..." className="form-field pl-10" />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
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
      <div className="h-[520px]">
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
                <p>{statuses[report.status]}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Card>
  );
}

function AdminTools({ reports, users, onOpenTab }) {
  const tools = [
    "Modifier titre, description, categorie, statut et coordonnees des alertes",
    "Marquer une alerte en attente, en traitement ou resolue",
    "Supprimer une alerte incorrecte ou abusive",
    "Chercher et filtrer les alertes par categorie, statut ou utilisateur",
    "Bannir ou debannir un utilisateur",
    "Promouvoir un utilisateur en admin ou le remettre en user",
    "Exporter les rapports et utilisateurs en CSV",
    "Visualiser toutes les alertes sur la carte analytics avec heatmap"
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card className="p-4">
        <h2 className="font-heading text-xl font-black text-text">Ce que tu peux faire comme admin</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {tools.map((tool) => (
            <div key={tool} className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm font-bold text-text">
              {tool}
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <h2 className="font-heading text-lg font-black text-text">Raccourcis</h2>
        <div className="mt-4 space-y-2">
          <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => onOpenTab("reports")}>
            Reports: {reports.length}
          </Button>
          <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => onOpenTab("users")}>
            Users: {users.length}
          </Button>
          <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => onOpenTab("map")}>
            Map analytics
          </Button>
        </div>
      </Card>
    </div>
  );
}

function EditReportModal({ report, onClose, onSave }) {
  const [form, setForm] = useState({
    title: report.title || "",
    description: report.description || "",
    category: report.category || "road",
    status: report.status || "pending",
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
      await onSave(report._id, form);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-slate-950/40 p-3 sm:items-center sm:justify-center">
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 shadow-soft">
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
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {statuses[item]}
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
    status: row.status,
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
