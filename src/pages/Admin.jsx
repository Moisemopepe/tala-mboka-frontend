import {
  AlertTriangle,
  Check,
  CheckCircle2,
  CircleUserRound,
  Download,
  Edit3,
  Eye,
  FileText,
  History,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Map,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Circle, MapContainer, Popup, TileLayer } from "react-leaflet";
import { Link, useNavigate } from "react-router-dom";
import { api, assetUrl, downloadApiFile } from "../api/client.js";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { crisisTypes, damageLevels, infrastructureTypes } from "../utils/crisisOptions.js";
import { sampleReports } from "../utils/sampleReports.js";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "map", label: "Live Map", icon: Map },
  { key: "reports", label: "Reports", icon: FileText },
  { key: "validation", label: "Validation", icon: ListChecks },
  { key: "exports", label: "Exports", icon: Download },
  { key: "users", label: "Users", icon: Users, adminOnly: true },
  { key: "audit", label: "Audit", icon: History, adminOnly: true }
];

const emptyUserForm = { name: "", email: "", phone: "", password: "", role: "moderator" };

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "other";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function reportImage(report) {
  return assetUrl(report.imageUrls?.[0] || report.imageUrl) || "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=500&q=70";
}

function exportBlob(name, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsv(reports) {
  const headers = ["id", "title", "crisisType", "infrastructureType", "damageLevel", "status", "latitude", "longitude", "createdAt"];
  const rows = reports.map((report) => [
    report._id,
    report.title,
    report.crisisType,
    report.infrastructureType || report.category,
    report.damageLevel,
    report.status,
    report.location?.lat,
    report.location?.lng,
    report.createdAt
  ]);
  return [headers, ...rows].map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
}

function toGeoJson(reports) {
  return JSON.stringify(
    {
      type: "FeatureCollection",
      features: reports.map((report) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [Number(report.location?.lng), Number(report.location?.lat)] },
        properties: {
          id: report._id,
          title: report.title,
          crisisType: report.crisisType,
          infrastructureType: report.infrastructureType || report.category,
          damageLevel: report.damageLevel,
          status: report.status,
          createdAt: report.createdAt
        }
      }))
    },
    null,
    2
  );
}

function statusBadge(status = "pending") {
  const styles = {
    pending: "bg-amber-50 text-amber-700",
    verified: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700"
  };
  return <span className={`rounded-md px-2 py-1 text-xs font-black capitalize ${styles[status] || styles.pending}`}>{status}</span>;
}

function severityBadge(level = "partial") {
  const styles = {
    minimal: "bg-green-50 text-green-700",
    partial: "bg-orange-50 text-orange-700",
    complete: "bg-red-50 text-red-700"
  };
  return <span className={`rounded-md px-2 py-1 text-xs font-black ${styles[level] || styles.partial}`}>{damageLevels[level]?.shortLabel || "Partial"}</span>;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [message, setMessage] = useState("");
  const [editingReport, setEditingReport] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editForm, setEditForm] = useState({});

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    setMessage("");
    try {
      const [nextReports, nextUsers, nextAudit] = await Promise.all([
        api("/admin/reports"),
        api("/admin/users").catch(() => []),
        api("/admin/audit").catch(() => [])
      ]);
      setReports(nextReports.length ? nextReports : sampleReports);
      setUsers(nextUsers);
      setAudit(nextAudit);
    } catch (error) {
      setReports(sampleReports);
      setMessage(error.message || "Live API unavailable, showing demo data.");
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  async function setReportStatus(report, status) {
    await api(`/admin/reports/${report._id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    setReports((items) => items.map((item) => (item._id === report._id ? { ...item, status } : item)));
  }

  async function deleteReport(report) {
    if (!window.confirm(`Delete "${report.title}"?`)) return;
    await api(`/admin/reports/${report._id}`, { method: "DELETE" });
    setReports((items) => items.filter((item) => item._id !== report._id));
  }

  function openEdit(report) {
    setEditingReport(report);
    setEditForm({
      title: report.title || "",
      description: report.description || "",
      crisisType: report.crisisType || "other",
      infrastructureType: report.infrastructureType || report.category || "other",
      damageLevel: report.damageLevel || "partial",
      status: report.status || "pending",
      province: report.province || "",
      commune: report.commune || "",
      addressText: report.addressText || report.locationDescription || report.location?.address || ""
    });
  }

  async function submitReportEdit(event) {
    event.preventDefault();
    if (!editingReport) return;
    const body = new FormData();
    Object.entries(editForm).forEach(([key, value]) => body.append(key, value ?? ""));
    const file = event.currentTarget.elements.images?.files?.[0];
    if (file) body.append("images", file);
    const updated = await api(`/admin/reports/${editingReport._id}`, { method: "PATCH", body });
    setReports((items) => items.map((item) => (item._id === updated._id ? updated : item)));
    setEditingReport(null);
    setMessage("Report updated.");
    await refresh();
  }

  async function createUser(event) {
    event.preventDefault();
    setMessage("");
    const created = await api("/admin/users", { method: "POST", body: JSON.stringify(userForm) });
    setUsers((items) => [created, ...items]);
    setUserForm(emptyUserForm);
    setMessage("Admin user created.");
    await refresh();
  }

  async function toggleUserSuspension(staffUser) {
    const updated = await api(`/admin/users/${staffUser._id}/ban`, {
      method: "PATCH",
      body: JSON.stringify({ banned: !staffUser.banned })
    });
    setUsers((items) => items.map((item) => (item._id === updated._id ? updated : item)));
  }

  async function deleteUser(staffUser) {
    if (!window.confirm(`Delete ${staffUser.name}?`)) return;
    await api(`/admin/users/${staffUser._id}`, { method: "DELETE" });
    setUsers((items) => items.filter((item) => item._id !== staffUser._id));
  }

  const filteredReports = useMemo(() => {
    const term = query.toLowerCase().trim();
    return reports.filter((report) => {
      const matchesTerm = !term || `${report.title} ${report.description} ${report.province} ${report.commune} ${report.crisisType}`.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || report.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [reports, query, statusFilter]);

  const mapReports = filteredReports.filter((report) => Number.isFinite(Number(report.location?.lat)) && Number.isFinite(Number(report.location?.lng))).slice(0, 200);
  const pendingReports = reports.filter((report) => report.status === "pending");
  const verifiedReports = reports.filter((report) => report.status === "verified");
  const criticalReports = reports.filter((report) => report.damageLevel === "complete");
  const byDamage = countBy(reports, "damageLevel");
  const byCrisis = countBy(reports, "crisisType");

  const visibleNav = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-slate-50 text-[#061849]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col bg-[#031d3a] text-white xl:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <img src="/tala-mboka-logo.svg" alt="Tala Mboka Crisis" className="h-12 w-12 rounded-xl bg-white object-contain p-1" />
          <div>
            <p className="font-heading text-lg font-black leading-tight">TALA MBOKA <span className="text-green-400">CRISIS</span></p>
            <p className="text-xs font-semibold text-slate-300">Crisis response dashboard</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
          {visibleNav.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`flex min-h-12 w-full items-center gap-4 rounded-lg px-5 text-left text-sm font-black transition ${
                activeSection === key ? "bg-white/10 text-white" : "text-slate-200 hover:bg-white/10"
              }`}
            >
              <Icon size={21} />
              <span className="flex-1">{label}</span>
              {key === "validation" && pendingReports.length > 0 ? <span className="rounded-lg bg-red-500 px-2 py-1 text-xs text-white">{pendingReports.length}</span> : null}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-5">
          <p className="flex items-center gap-2 text-sm font-black"><span className="h-2.5 w-2.5 rounded-full bg-green-400" /> System status</p>
          <p className="mt-1 text-xs font-semibold text-slate-300">All systems operational</p>
        </div>
      </aside>

      <div className="xl:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-5 px-5 lg:px-8">
            <div>
              <p className="text-sm font-semibold text-slate-500">Crisis response dashboard</p>
              <h1 className="font-heading text-xl font-black capitalize md:text-2xl">{navItems.find((item) => item.key === activeSection)?.label || "Dashboard"}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" onClick={refresh} disabled={loading}>
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Refresh
              </Button>
              <button onClick={signOut} className="flex min-h-11 items-center gap-2 rounded-lg bg-[#071a4f] px-4 text-sm font-black text-white">
                <CircleUserRound size={18} />
                {user?.name || "Admin"}
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </header>

        <main className="px-5 py-7 lg:px-8">
          {message && <p className="mb-5 rounded-xl bg-blue-50 p-3 text-sm font-bold text-blue-700">{message}</p>}
          {activeSection === "dashboard" && (
            <DashboardView
              reports={reports}
              stats={{ pending: pendingReports.length, verified: verifiedReports.length, critical: criticalReports.length, byDamage, byCrisis }}
              setActiveSection={setActiveSection}
              mapReports={mapReports}
            />
          )}
          {activeSection === "map" && <MapView reports={mapReports} query={query} setQuery={setQuery} />}
          {activeSection === "reports" && (
            <ReportsView
              reports={filteredReports}
              query={query}
              setQuery={setQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              setReportStatus={setReportStatus}
              deleteReport={deleteReport}
              openDetail={setSelectedReport}
              openEdit={openEdit}
            />
          )}
          {activeSection === "validation" && (
            <ReportsView
              title="Pending validation"
              reports={pendingReports}
              query={query}
              setQuery={setQuery}
              statusFilter="pending"
              setStatusFilter={setStatusFilter}
              setReportStatus={setReportStatus}
              deleteReport={deleteReport}
              openDetail={setSelectedReport}
              openEdit={openEdit}
            />
          )}
          {activeSection === "exports" && <ExportsView reports={reports} />}
          {activeSection === "users" && isAdmin && (
            <UsersView users={users} userForm={userForm} setUserForm={setUserForm} createUser={createUser} toggleUserSuspension={toggleUserSuspension} deleteUser={deleteUser} />
          )}
          {activeSection === "audit" && isAdmin && <AuditView audit={audit} />}
        </main>
      </div>
      {editingReport && (
        <EditReportModal
          report={editingReport}
          form={editForm}
          setForm={setEditForm}
          onClose={() => setEditingReport(null)}
          onSubmit={submitReportEdit}
        />
      )}
      {selectedReport && <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} onEdit={openEdit} setReportStatus={setReportStatus} />}
    </div>
  );
}

function DashboardView({ reports, stats, setActiveSection, mapReports }) {
  const cards = [
    { label: "Total reports", value: reports.length, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Critical incidents", value: stats.critical, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Verified reports", value: stats.verified, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending validation", value: stats.pending, icon: ListChecks, color: "text-orange-600", bg: "bg-orange-50" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="font-heading text-3xl font-black">Real-time crisis reports for faster response.</h2>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">Verify field incidents, map impact, manage staff access, and export structured response data.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => setActiveSection("map")} size="lg"><Map size={20} /> Open live map</Button>
          <Button type="button" onClick={() => setActiveSection("reports")} variant="ghost" size="lg"><FileText size={20} /> View reports</Button>
          <Button type="button" onClick={() => setActiveSection("exports")} variant="ghost" size="lg"><Download size={20} /> Export data</Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <span className={`flex h-16 w-16 items-center justify-center rounded-full ${bg} ${color}`}><Icon size={29} /></span>
              <div>
                <p className="text-sm font-semibold text-slate-500">{label}</p>
                <p className="mt-1 font-heading text-3xl font-black">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <MapPanel reports={mapReports} />
        <div className="grid gap-5">
          <SideList title="Critical alerts" reports={reports.filter((report) => report.damageLevel === "complete").slice(0, 4)} />
          <SideList title="Pending validation" reports={reports.filter((report) => report.status === "pending").slice(0, 4)} />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Breakdown title="Reports by damage level" rows={stats.byDamage} labels={damageLevels} />
        <Breakdown title="Reports by crisis type" rows={stats.byCrisis} labels={crisisTypes} />
      </section>
    </div>
  );
}

function MapView({ reports, query, setQuery }) {
  return (
    <div className="space-y-5">
      <Toolbar query={query} setQuery={setQuery} placeholder="Search map reports..." />
      <MapPanel reports={reports} large />
    </div>
  );
}

function MapPanel({ reports, large = false }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-black">Live map</h2>
        <p className="text-sm font-bold text-slate-500">{reports.length} mapped reports</p>
      </div>
      <div className={`${large ? "h-[72vh]" : "h-[420px]"} overflow-hidden rounded-xl`}>
        <MapContainer center={[-2.8, 23.7]} zoom={5} scrollWheelZoom className="h-full w-full">
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {reports.map((report) => {
            const color = damageLevels[report.damageLevel]?.color || "#16a34a";
            return (
              <Circle key={report._id} center={[report.location.lat, report.location.lng]} radius={report.damageLevel === "complete" ? 80000 : 45000} pathOptions={{ color, fillColor: color, fillOpacity: 0.32 }}>
                <Popup>
                  <div className="max-w-52">
                    <img src={reportImage(report)} alt="" className="mb-2 h-24 w-full rounded-lg object-cover" />
                    <strong>{report.title}</strong>
                    <p>{crisisTypes[report.crisisType] || "Other"} - {damageLevels[report.damageLevel]?.shortLabel || "Partial"}</p>
                    <p>{report.status}</p>
                  </div>
                </Popup>
              </Circle>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

function ReportsView({ title = "Reports", reports, query, setQuery, statusFilter, setStatusFilter, setReportStatus, deleteReport, openDetail, openEdit }) {
  return (
    <div className="space-y-5">
      <Toolbar query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="font-heading text-lg font-black">{title}</h2>
          <p className="text-sm font-bold text-slate-500">{reports.length} reports</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr><th className="px-4 py-3">Evidence</th><th className="px-4 py-3">Incident</th><th className="px-4 py-3">Reporter</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Damage</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report._id}>
                  <td className="px-4 py-3"><img src={reportImage(report)} alt="" className="h-14 w-20 rounded-lg object-cover" /></td>
                  <td className="max-w-[280px] px-4 py-3">
                    <p className="font-black">{report.title}</p>
                    <p className="line-clamp-2 text-xs font-semibold text-slate-500">{report.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-black">{report.reporterSummary?.submittedBy || report.userId?.name || "Anonymous"}</p>
                    <p className="text-xs font-semibold capitalize text-slate-500">{report.reporterSummary?.channel || report.submissionMeta?.channel || report.source || "web"}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{crisisTypes[report.crisisType] || "Other"}</td>
                  <td className="px-4 py-3">{severityBadge(report.damageLevel)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-600">{report.commune || "Area"}, {report.province || "Region"}</td>
                  <td className="px-4 py-3">{statusBadge(report.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openDetail(report)} className="rounded-lg p-2 hover:bg-slate-100" title="View"><Eye size={16} /></button>
                      <button onClick={() => openEdit(report)} className="rounded-lg p-2 hover:bg-slate-100" title="Edit"><Edit3 size={16} /></button>
                      <button onClick={() => setReportStatus(report, "verified")} className="rounded-lg p-2 text-green-600 hover:bg-green-50" title="Verify"><Check size={16} /></button>
                      <button onClick={() => setReportStatus(report, "rejected")} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Reject"><X size={16} /></button>
                      <button onClick={() => deleteReport(report)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Toolbar({ query, setQuery, statusFilter, setStatusFilter, placeholder = "Search reports..." }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
      <label className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} className="form-field pl-10" />
      </label>
      {setStatusFilter && (
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="form-field md:w-56">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      )}
    </div>
  );
}

function ExportsView({ reports }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <ExportCard title="CSV export" text="Spreadsheet-ready report list with reporter metadata, versioning, duplicates, and offline sync fields." onClick={() => downloadApiFile("/reports/export/csv", "tala-mboka-crisis-reports.csv").catch(() => exportBlob("tala-mboka-crisis-reports.csv", toCsv(reports), "text/csv"))} />
      <ExportCard title="GeoJSON export" text="Interoperable GIS export with geolocation, building footprint references, and response metadata." onClick={() => downloadApiFile("/reports/export/geojson", "tala-mboka-crisis-reports.geojson").catch(() => exportBlob("tala-mboka-crisis-reports.geojson", toGeoJson(reports), "application/geo+json"))} />
    </div>
  );
}

function ExportCard({ title, text, onClick }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <Download className="text-green-600" size={34} />
      <h2 className="mt-5 font-heading text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{text}</p>
      <Button type="button" onClick={onClick} className="mt-6"><Download size={18} /> Download</Button>
    </div>
  );
}

function ReportDetailModal({ report, onClose, onEdit, setReportStatus }) {
  const reporter = report.reporterSummary || {};
  const trace = report.responseTrace || {};
  const duplicateCount = trace.possibleDuplicateIds?.length || report.possibleDuplicateIds?.length || 0;
  const coordinates = Number.isFinite(Number(report.location?.lat)) && Number.isFinite(Number(report.location?.lng))
    ? `${Number(report.location.lat).toFixed(5)}, ${Number(report.location.lng).toFixed(5)}`
    : "No GPS";

  function closeAndEdit() {
    onClose();
    onEdit(report);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-green-700">Admin full report view</p>
            <h2 className="mt-1 font-heading text-2xl font-black">{report.title}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{report._id} - v{trace.version || report.version || 1}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-4">
            <img src={reportImage(report)} alt="" className="h-72 w-full rounded-xl object-cover" />
            <InfoCard title="Damage assessment">
              <InfoLine label="Crisis" value={crisisTypes[report.crisisType] || report.crisisType || "Other"} />
              <InfoLine label="Infrastructure" value={infrastructureTypes[report.infrastructureType] || report.infrastructureType || report.category || "Other"} />
              <InfoLine label="Infrastructure name" value={report.infrastructureName || "Not specified"} />
              <InfoLine label="Damage level" value={damageLevels[report.damageLevel]?.label || report.damageLevel || "Partial"} />
              <InfoLine label="Debris clearing" value={report.debris || "unknown"} />
              <InfoLine label="Status" value={report.status} />
            </InfoCard>
            <InfoCard title="Description">
              <p className="text-sm font-semibold leading-6 text-slate-600">{report.description}</p>
            </InfoCard>
            <InfoCard title="Modular survey answers">
              <InfoLine label="Access blocked" value={report.modularAnswers?.accessBlocked ? "Yes" : "No"} />
              <InfoLine label="Services disrupted" value={report.modularAnswers?.servicesDisrupted ? "Yes" : "No"} />
              <InfoLine label="Livelihoods affected" value={report.modularAnswers?.livelihoodsAffected ? "Yes" : "No"} />
              <InfoLine label="People at risk" value={report.modularAnswers?.peopleAtRisk ? "Yes" : "No"} />
            </InfoCard>
          </section>

          <aside className="space-y-4">
            <InfoCard title="Reporter access">
              <InfoLine label="Submitted by" value={reporter.submittedBy || report.userId?.name || "Anonymous community reporter"} />
              <InfoLine label="Contact" value={reporter.contact || "Not provided"} />
              <InfoLine label="Organization" value={reporter.organization || "Not provided"} />
              <InfoLine label="Role" value={reporter.role || "community_member"} />
              <InfoLine label="Consent to contact" value={reporter.consentToContact ? "Yes" : "No"} />
              <InfoLine label="Source" value={reporter.source || report.source || "guest"} />
              <InfoLine label="Channel" value={reporter.channel || report.submissionMeta?.channel || "web"} />
            </InfoCard>
            <InfoCard title="Collection metadata">
              <InfoLine label="Collection time" value={formatDate(trace.collectionTime || report.collectionTime || report.createdAt)} />
              <InfoLine label="Submitted at" value={formatDate(report.createdAt)} />
              <InfoLine label="Offline created" value={formatDate(reporter.offlineCreatedAt || report.submissionMeta?.offlineCreatedAt)} />
              <InfoLine label="Offline synced" value={formatDate(reporter.offlineSyncedAt || report.submissionMeta?.offlineSyncedAt)} />
              <InfoLine label="Language" value={(report.language || "en").toUpperCase()} />
              <InfoLine label="App version" value={reporter.appVersion || "Not provided"} />
              <InfoLine label="Device ID" value={reporter.deviceId || "Not provided"} />
            </InfoCard>
            <InfoCard title="Location and building">
              <InfoLine label="Coordinates" value={coordinates} />
              <InfoLine label="Province" value={report.province || "Not provided"} />
              <InfoLine label="Commune" value={report.commune || "Not provided"} />
              <InfoLine label="Landmark/address" value={report.addressText || report.locationDescription || report.location?.address || "Not provided"} />
              <InfoLine label="Asset ID" value={report.assetId || "Not provided"} />
              <InfoLine label="Building footprint" value={trace.buildingFootprint?.id || report.buildingFootprint?.id || "Not selected"} />
              <InfoLine label="Duplicate score" value={`${Math.round((trace.duplicateScore || report.duplicateScore || 0) * 100)}%`} />
              <InfoLine label="Possible duplicates" value={String(duplicateCount)} />
            </InfoCard>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" onClick={() => setReportStatus(report, "verified")}><Check size={18} /> Verify</Button>
              <Button type="button" variant="danger" onClick={() => setReportStatus(report, "rejected")}><X size={18} /> Reject</Button>
              <Button type="button" variant="ghost" onClick={closeAndEdit}><Edit3 size={18} /> Edit</Button>
              <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 font-heading text-base font-black">{title}</h3>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2 text-sm last:border-b-0 last:pb-0">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right font-black text-[#061849]">{value || "Not provided"}</span>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not provided" : date.toLocaleString();
}

function UsersView({ users, userForm, setUserForm, createUser, toggleUserSuspension, deleteUser }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[430px_1fr]">
      <form onSubmit={createUser} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <ShieldCheck className="text-green-600" size={34} />
        <h2 className="mt-4 font-heading text-xl font-black">Create admin access</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">Only administrators can create moderators or admins.</p>
        <div className="mt-5 grid gap-3">
          <input className="form-field" required placeholder="Full name" value={userForm.name} onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))} />
          <input className="form-field" required type="email" placeholder="Email address" value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} />
          <input className="form-field" placeholder="Phone optional" value={userForm.phone} onChange={(event) => setUserForm((current) => ({ ...current, phone: event.target.value }))} />
          <input className="form-field" required type="password" placeholder="Password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} />
          <select className="form-field" value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))}>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
          <Button type="submit"><UserPlus size={18} /> Create access</Button>
        </div>
      </form>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-heading text-xl font-black">Admin and moderator users</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {users.map((staffUser) => (
            <div key={staffUser._id} className="rounded-xl border border-slate-200 p-4">
              <p className="font-black">{staffUser.name}</p>
              <p className="text-sm font-semibold text-slate-500">{staffUser.email || staffUser.phone} - {staffUser.role}</p>
              <p className="text-xs font-bold text-slate-400">{staffUser.reportCount || 0} reports</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => toggleUserSuspension(staffUser)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black">{staffUser.banned ? "Reactivate" : "Suspend"}</button>
                <button onClick={() => deleteUser(staffUser)} className="rounded-lg border border-red-100 px-3 py-2 text-xs font-black text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {users.length === 0 && <p className="text-sm font-bold text-slate-500">No staff users loaded yet.</p>}
        </div>
      </div>
    </div>
  );
}

function AuditView({ audit }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-heading text-xl font-black">Admin audit trail</h2>
      <div className="mt-5 grid gap-3">
        {audit.map((entry) => (
          <div key={entry._id} className="rounded-xl bg-slate-50 p-4">
            <p className="font-black">{entry.action}</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">{entry.summary || entry.targetType}</p>
            <p className="mt-2 text-xs font-bold text-slate-400">{entry.actor?.name || "System"} - {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ""}</p>
          </div>
        ))}
        {audit.length === 0 && <p className="text-sm font-bold text-slate-500">No audit activity yet.</p>}
      </div>
    </div>
  );
}

function EditReportModal({ report, form, setForm, onClose, onSubmit }) {
  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <form onSubmit={onSubmit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="font-heading text-2xl font-black">Edit report</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{report._id}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <label>
            <span className="mb-1 block text-sm font-black">Title</span>
            <input required className="form-field" value={form.title} onChange={(event) => update("title", event.target.value)} />
          </label>
          <label>
            <span className="mb-1 block text-sm font-black">Description</span>
            <textarea required className="form-field" rows={4} value={form.description} onChange={(event) => update("description", event.target.value)} />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm font-black">Crisis type</span>
              <select className="form-field" value={form.crisisType} onChange={(event) => update("crisisType", event.target.value)}>
                {Object.entries(crisisTypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-sm font-black">Infrastructure</span>
              <select className="form-field" value={form.infrastructureType} onChange={(event) => update("infrastructureType", event.target.value)}>
                {Object.entries(infrastructureTypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-sm font-black">Damage level</span>
              <select className="form-field" value={form.damageLevel} onChange={(event) => update("damageLevel", event.target.value)}>
                {Object.entries(damageLevels).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-sm font-black">Status</span>
              <select className="form-field" value={form.status} onChange={(event) => update("status", event.target.value)}>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="form-field" placeholder="Province" value={form.province} onChange={(event) => update("province", event.target.value)} />
            <input className="form-field" placeholder="Commune" value={form.commune} onChange={(event) => update("commune", event.target.value)} />
          </div>
          <input className="form-field" placeholder="Address text" value={form.addressText} onChange={(event) => update("addressText", event.target.value)} />
          <label>
            <span className="mb-1 block text-sm font-black">Replace photo</span>
            <input name="images" type="file" accept="image/*" className="form-field" />
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit"><Check size={18} /> Save changes</Button>
        </div>
      </form>
    </div>
  );
}

function SideList({ title, reports }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 border-b border-slate-200 pb-3 font-heading text-lg font-black">{title}</h2>
      <div className="grid gap-3">
        {reports.map((report) => (
          <article key={report._id} className="flex items-center gap-3">
            <img src={reportImage(report)} alt="" className="h-16 w-20 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              {severityBadge(report.damageLevel)}
              <h3 className="mt-1 truncate font-heading text-sm font-black">{report.title}</h3>
              <p className="text-xs font-semibold text-slate-500">{report.commune || "Area"}, {report.province || "Region"}</p>
            </div>
          </article>
        ))}
        {reports.length === 0 && <p className="text-sm font-bold text-slate-500">No reports in this section.</p>}
      </div>
    </div>
  );
}

function Breakdown({ title, rows, labels }) {
  const entries = Object.entries(rows || {});
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-heading text-lg font-black">{title}</h2>
      <div className="mt-4 grid gap-3">
        {entries.map(([key, count]) => (
          <div key={key}>
            <div className="mb-1 flex justify-between text-sm font-black">
              <span>{labels[key]?.label || labels[key] || key}</span>
              <span>{count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-green-600" style={{ width: `${Math.min(100, count * 12)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
