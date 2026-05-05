import { AlertTriangle, BarChart3, Bell, Check, CheckCircle2, ChevronRight, CircleUserRound, Download, Eye, FileText, Globe2, LayoutDashboard, ListChecks, Map, MapPin, MoreVertical, RefreshCw, Search, Settings, ShieldCheck, Trash2, UserPlus, Users, Wifi, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { crisisTypes, damageLevels } from "../utils/crisisOptions.js";
import { sampleReports } from "../utils/sampleReports.js";

const incidentImages = [
  "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=70"
];

const navItems = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Live Map", icon: Map },
  { label: "Reports", icon: FileText },
  { label: "Validation", icon: ListChecks, count: 23 },
  { label: "Alerts", icon: Bell, count: 7 },
  { label: "Analytics", icon: BarChart3 },
  { label: "Exports", icon: Download },
  { label: "Users", icon: Users },
  { label: "Settings", icon: Settings }
];

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "other";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function statusBadge(status = "pending") {
  const styles = {
    pending: "bg-amber-50 text-amber-700",
    verified: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700"
  };
  return <span className={`rounded-md px-2 py-1 text-xs font-black capitalize ${styles[status] || styles.pending}`}>{status}</span>;
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
  const headers = ["id", "title", "crisisType", "infrastructureType", "damageLevel", "status", "lat", "lng", "createdAt"];
  const rows = reports.map((report) => [report._id, report.title, report.crisisType, report.infrastructureType || report.category, report.damageLevel, report.status, report.location?.lat, report.location?.lng, report.createdAt]);
  return [headers, ...rows].map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
}

function toGeoJson(reports) {
  return JSON.stringify({
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
        status: report.status
      }
    }))
  }, null, 2);
}

export default function Admin() {
  const { user, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [userForm, setUserForm] = useState({ name: "", phone: "", password: "", role: "moderator" });

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const [nextReports, nextUsers, nextAudit] = await Promise.all([
        api("/admin/reports"),
        api("/admin/users").catch(() => []),
        api("/admin/audit").catch(() => [])
      ]);
      setReports(nextReports.length ? nextReports : sampleReports);
      setUsers(nextUsers);
      setAudit(nextAudit);
    } catch {
      setReports(sampleReports);
    } finally {
      setLoading(false);
    }
  }

  async function setReportStatus(report, status) {
    await api(`/reports/${report._id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    setReports((items) => items.map((item) => (item._id === report._id ? { ...item, status } : item)));
    refresh();
  }

  async function deleteReport(report) {
    if (!window.confirm(`Delete "${report.title}"?`)) return;
    await api(`/reports/${report._id}`, { method: "DELETE" });
    setReports((items) => items.filter((item) => item._id !== report._id));
  }

  async function createUser(event) {
    event.preventDefault();
    const created = await api("/admin/users", { method: "POST", body: JSON.stringify(userForm) });
    setUsers((items) => [created, ...items]);
    setUserForm({ name: "", phone: "", password: "", role: "moderator" });
  }

  async function toggleUserSuspension(staffUser) {
    const updated = await api(`/admin/users/${staffUser._id}/ban`, { method: "PATCH", body: JSON.stringify({ banned: !staffUser.banned }) });
    setUsers((items) => items.map((item) => (item._id === updated._id ? updated : item)));
  }

  async function deleteUser(staffUser) {
    if (!window.confirm(`Delete ${staffUser.name}?`)) return;
    await api(`/admin/users/${staffUser._id}`, { method: "DELETE" });
    setUsers((items) => items.filter((item) => item._id !== staffUser._id));
  }

  const filteredReports = useMemo(() => {
    const term = query.toLowerCase().trim();
    return reports.filter((report) => !term || `${report.title} ${report.description} ${report.province} ${report.commune}`.toLowerCase().includes(term));
  }, [reports, query]);

  const stats = useMemo(() => {
    const byStatus = countBy(reports, "status");
    const critical = reports.filter((report) => report.damageLevel === "complete").length;
    return [
      { label: "Total reports", value: reports.length || "0", change: "+12%", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Critical incidents", value: critical, change: "+8%", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
      { label: "Verified reports", value: byStatus.verified || 0, change: "+15%", icon: CheckCircle2, color: "text-orange-500", bg: "bg-orange-50" },
      { label: "Pending validation", value: byStatus.pending || 0, change: "-5%", icon: ListChecks, color: "text-violet-600", bg: "bg-violet-50" },
      { label: "Offline synced", value: 375, change: "+10%", icon: Wifi, color: "text-teal-600", bg: "bg-teal-50" }
    ];
  }, [reports]);

  const criticalReports = filteredReports.filter((report) => report.damageLevel === "complete" || report.status === "pending").slice(0, 3);
  const verifiedReports = filteredReports.filter((report) => report.status === "verified").slice(0, 3);
  const mapReports = filteredReports.filter((report) => Number.isFinite(Number(report.location?.lat)) && Number.isFinite(Number(report.location?.lng))).slice(0, 200);

  return (
    <div className="min-h-screen bg-white text-[#071a4f]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[286px] bg-[#031d3a] text-white xl:block">
        <div className="p-6">
          <Logo compact />
        </div>
        <nav className="mt-4 grid gap-2 px-3">
          {navItems.map(({ label, icon: Icon, active, count }) => (
            <button key={label} className={`flex min-h-12 items-center gap-4 rounded-lg px-5 text-left text-sm font-black transition ${active ? "bg-white/10 text-white" : "text-slate-200 hover:bg-white/10"}`}>
              <Icon size={21} />
              <span className="flex-1">{label}</span>
              {count ? <span className="rounded-lg bg-red-500 px-2 py-1 text-xs text-white">{count}</span> : null}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-8 left-5 right-5 grid gap-5">
          <div className="rounded-xl border border-white/10 bg-white/10 p-5 text-center">
            <MapPin className="mx-auto text-white" size={34} />
            <p className="mt-4 font-heading text-lg font-black">Reports come from the mobile app</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">Real-time data from field reporters worldwide.</p>
            <Link to="/" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/20 px-5 text-sm font-black">
              Learn more
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <p className="flex items-center gap-2 text-sm font-black"><span className="h-2 w-2 rounded-full bg-green-400" /> System status</p>
            <p className="mt-2 text-xs font-semibold text-slate-300">All systems operational</p>
          </div>
        </div>
      </aside>

      <div className="xl:pl-[286px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-5 px-5 lg:px-8">
            <p className="hidden text-sm font-semibold text-slate-700 md:block">Crisis response dashboard</p>
            <nav className="hidden items-center gap-12 text-sm font-black lg:flex">
              {["Dashboard", "Live Map", "Reports", "Exports"].map((item) => (
                <button key={item} className={item === "Dashboard" ? "border-b-4 border-green-600 py-7 text-[#071a4f]" : "py-7 text-[#071a4f] hover:text-green-700"}>{item}</button>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-black">
                EN
                <Globe2 size={18} />
              </button>
              <button onClick={logout} className="flex min-h-11 items-center gap-2 rounded-lg bg-[#071a4f] px-4 text-sm font-black text-white">
                <CircleUserRound size={18} />
                {user?.name || "Admin"}
              </button>
            </div>
          </div>
        </header>

        <main className="px-5 py-7 lg:px-8">
          <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-black">Real-time crisis reports for faster response.</h1>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">Collect field reports from mobile users, verify incidents, map impact, and export structured data for responders.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button as={Link} to="/app/map" size="lg"><Map size={20} /> Open live map</Button>
              <Button as={Link} to="/app" variant="ghost" size="lg"><FileText size={20} /> View reports</Button>
              <Button type="button" variant="ghost" size="lg" onClick={() => exportBlob("tala-reports.geojson", toGeoJson(filteredReports), "application/geo+json")}><Download size={20} /> Export data</Button>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {stats.map(({ label, value, change, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <span className={`flex h-16 w-16 items-center justify-center rounded-full ${bg} ${color}`}><Icon size={29} /></span>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{label}</p>
                    <p className="mt-1 font-heading text-3xl font-black">{value} <span className={`text-sm ${change.startsWith("+") ? "text-green-600" : "text-orange-500"}`}>{change}</span></p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">vs last 7 days</p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="mt-6 grid gap-5 xl:grid-cols-[1.55fr_0.63fr_0.63fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-lg font-black">Live map</h2>
                <div className="flex gap-2"><button className="rounded-lg border border-slate-200 p-2"><Search size={18} /></button><button className="rounded-lg border border-slate-200 p-2"><RefreshCw size={18} /></button></div>
              </div>
              <div className="mb-3 grid gap-3 md:grid-cols-5">
                {["All types", "All severity", "All regions", "All status", "May 6 - May 12"].map((item) => <button key={item} className="min-h-11 rounded-lg border border-slate-200 px-3 text-left text-sm font-black">{item}</button>)}
              </div>
              <div className="h-[360px] overflow-hidden rounded-xl">
                <MapContainer center={[0, 18]} zoom={3} scrollWheelZoom>
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {mapReports.map((report) => {
                    const color = damageLevels[report.damageLevel]?.color || "#16a34a";
                    return (
                      <Circle key={report._id} center={[report.location.lat, report.location.lng]} radius={report.damageLevel === "complete" ? 120000 : 70000} pathOptions={{ color, fillColor: color, fillOpacity: 0.25 }}>
                        <Popup>{report.title}</Popup>
                      </Circle>
                    );
                  })}
                </MapContainer>
              </div>
            </div>

            <SideList title="Critical alerts" reports={criticalReports} images={incidentImages} />
            <SideList title="Pending validation (23)" reports={filteredReports.filter((item) => item.status === "pending").slice(0, 3)} images={incidentImages.slice(1)} />
          </section>

          <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_330px]">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 p-4">
                <h2 className="font-heading text-lg font-black">Recent reports</h2>
                <Link to="/app" className="text-sm font-black text-blue-700">View all reports</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                    <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Incident title</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Severity</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReports.slice(0, 8).map((report, index) => (
                      <tr key={report._id}>
                        <td className="px-4 py-3 font-bold text-slate-600">#{String(index + 2843)}</td>
                        <td className="px-4 py-3 font-black">{report.title}</td>
                        <td className="px-4 py-3 font-semibold">{crisisTypes[report.crisisType] || "Other"}</td>
                        <td className="px-4 py-3"><span className="rounded-md bg-red-50 px-2 py-1 text-xs font-black text-red-600">{damageLevels[report.damageLevel]?.shortLabel || "Partial"}</span></td>
                        <td className="px-4 py-3 font-semibold text-slate-600">{report.commune || "Area"}, {report.province || "Region"}</td>
                        <td className="px-4 py-3">{statusBadge(report.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="rounded-lg p-2 hover:bg-slate-100"><Eye size={16} /></button>
                            <button onClick={() => setReportStatus(report, "verified")} className="rounded-lg p-2 text-green-600 hover:bg-green-50"><Check size={16} /></button>
                            <button onClick={() => setReportStatus(report, "rejected")} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><X size={16} /></button>
                            <button onClick={() => deleteReport(report)} className="rounded-lg p-2 hover:bg-slate-100"><MoreVertical size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <SideList title="Recent verified reports" reports={verifiedReports} images={incidentImages.reverse()} verified />
          </section>

          <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-heading text-lg font-black">Admin and moderator users</h2>
              <form onSubmit={createUser} className="mt-4 grid gap-3 md:grid-cols-5">
                <input className="form-field md:col-span-1" required placeholder="Name" value={userForm.name} onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))} />
                <input className="form-field md:col-span-1" required placeholder="Phone" value={userForm.phone} onChange={(event) => setUserForm((current) => ({ ...current, phone: event.target.value }))} />
                <input className="form-field md:col-span-1" required type="password" placeholder="Password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} />
                <select className="form-field" value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))}><option value="moderator">Moderator</option><option value="admin">Admin</option></select>
                <Button type="submit"><UserPlus size={17} /> Create</Button>
              </form>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {users.slice(0, 6).map((staffUser) => (
                  <div key={staffUser._id} className="rounded-xl border border-slate-200 p-3">
                    <p className="font-black">{staffUser.name}</p>
                    <p className="text-sm font-semibold text-slate-500">{staffUser.phone} · {staffUser.role}</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => toggleUserSuspension(staffUser)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black">{staffUser.banned ? "Reactivate" : "Suspend"}</button>
                      <button onClick={() => deleteUser(staffUser)} className="rounded-lg border border-red-100 px-3 py-2 text-xs font-black text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && <p className="text-sm font-bold text-slate-500">No staff users loaded yet.</p>}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-heading text-lg font-black">Admin audit trail</h2>
              <div className="mt-4 grid gap-3">
                {audit.slice(0, 6).map((entry) => (
                  <div key={entry._id} className="rounded-xl bg-slate-50 p-3">
                    <p className="font-black">{entry.action}</p>
                    <p className="text-sm font-semibold text-slate-600">{entry.summary || entry.targetType}</p>
                  </div>
                ))}
                {audit.length === 0 && <p className="text-sm font-bold text-slate-500">No audit activity yet.</p>}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function SideList({ title, reports, images, verified = false }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="font-heading text-lg font-black">{title}</h2>
        <button className="text-sm font-black text-blue-700">View all</button>
      </div>
      <div className="grid gap-3">
        {reports.map((report, index) => (
          <article key={report._id} className="flex items-center gap-3">
            <img src={images[index % images.length]} alt="" className="h-20 w-24 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <span className={`rounded-md px-2 py-1 text-[10px] font-black ${verified ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{verified ? "VERIFIED" : report.damageLevel === "complete" ? "CRITICAL" : "HIGH"}</span>
              <h3 className="mt-2 truncate font-heading text-sm font-black">{report.title}</h3>
              <p className="text-xs font-semibold text-slate-500">{report.commune || "Area"}, {report.province || "Region"}</p>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </article>
        ))}
      </div>
    </div>
  );
}
