import { BarChart3, CheckCircle2, Download, Edit3, MapPinned, RefreshCw, Save, Search, ShieldCheck, Trash2, UserPlus, Users, X, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { api, assetUrl } from "../api/client.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { categories } from "../utils/categories.js";
import { crisisTypes, damageLevels, infrastructureTypes } from "../utils/crisisOptions.js";
import { sampleReports } from "../utils/sampleReports.js";

const statusLabels = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected"
};

const statusStyles = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  verified: "bg-green-50 text-green-700 ring-green-200",
  rejected: "bg-red-50 text-red-700 ring-red-200"
};

function statusBadge(status = "pending") {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ring-1 ${statusStyles[status] || statusStyles.pending}`}>
      {statusLabels[status] || status}
    </span>
  );
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "other";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows) {
  const headers = ["id", "crisisType", "infrastructureType", "damageLevel", "description", "imageUrl", "longitude", "latitude", "addressText", "status", "duplicateOf", "createdAt", "updatedAt", "version"];
  const body = rows.map((report) => [
    report._id,
    report.crisisType,
    report.infrastructureType || report.category,
    report.damageLevel,
    report.description,
    report.imageUrl || report.imageUrls?.[0] || "",
    report.location?.lng ?? "",
    report.location?.lat ?? "",
    report.addressText || report.locationDescription || report.location?.address || "",
    report.status,
    report.duplicateOf || "",
    report.createdAt,
    report.updatedAt || "",
    report.version || 1
  ]);
  return [headers, ...body].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
}

function toGeoJson(rows) {
  return {
    type: "FeatureCollection",
    features: rows
      .filter((report) => Number.isFinite(Number(report.location?.lat)) && Number.isFinite(Number(report.location?.lng)))
      .map((report) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [Number(report.location.lng), Number(report.location.lat)]
        },
        properties: {
          id: report._id,
          title: report.title,
          description: report.description,
          crisisType: report.crisisType,
          infrastructureType: report.infrastructureType || report.category,
          damageLevel: report.damageLevel,
          imageUrl: report.imageUrl || report.imageUrls?.[0] || "",
          addressText: report.addressText || report.locationDescription || report.location?.address || "",
          status: report.status,
          duplicateOf: report.duplicateOf || null,
          createdAt: report.createdAt,
          version: report.version || 1
        }
      }))
  };
}

export default function Admin() {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [crisisType, setCrisisType] = useState("");
  const [damageLevel, setDamageLevel] = useState("");
  const [infrastructureType, setInfrastructureType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingReport, setEditingReport] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", phone: "", password: "", role: "moderator" });
  const [userMessage, setUserMessage] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const [nextStats, nextReports, nextUsers] = await Promise.all([api("/admin/stats"), api("/admin/reports"), api("/admin/users").catch(() => [])]);
      setStats(nextStats);
      setReports(nextReports);
      setUsers(nextUsers);
      setError("");
    } catch (err) {
      setReports(sampleReports);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(reportId, nextStatus) {
    const updated = await api(`/reports/${reportId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus })
    });
    setReports((items) => items.map((item) => (item._id === reportId ? { ...item, status: updated.status } : item)));
    refresh();
  }

  async function deleteReport(reportId) {
    if (!window.confirm("Delete this report permanently?")) return;
    await api(`/reports/${reportId}`, { method: "DELETE" });
    setReports((items) => items.filter((item) => item._id !== reportId));
    refresh();
  }

  function openEdit(report) {
    setEditingReport(report);
    setEditImage(null);
    setEditForm({
      title: report.title || "",
      description: report.description || "",
      crisisType: report.crisisType || "other",
      infrastructureType: report.infrastructureType || report.category || "other",
      damageLevel: report.damageLevel || "partial",
      status: report.status || "pending",
      province: report.province || "",
      commune: report.commune || "",
      addressText: report.addressText || report.locationDescription || report.location?.address || "",
      lat: report.location?.lat ?? "",
      lng: report.location?.lng ?? ""
    });
  }

  async function saveReportEdit(event) {
    event.preventDefault();
    if (!editingReport || savingEdit) return;
    setSavingEdit(true);
    try {
      const body = new FormData();
      Object.entries(editForm).forEach(([key, value]) => body.append(key, value ?? ""));
      body.append("category", editForm.infrastructureType || "other");
      if (editImage) body.append("images", editImage);
      const updated = await api(`/admin/reports/${editingReport._id}`, { method: "PATCH", body });
      setReports((items) => items.map((item) => (item._id === updated._id ? updated : item)));
      setEditingReport(null);
      setEditForm(null);
      setEditImage(null);
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  async function createStaffUser(event) {
    event.preventDefault();
    setUserMessage("");
    try {
      const created = await api("/admin/users", {
        method: "POST",
        body: JSON.stringify(userForm)
      });
      setUsers((items) => [created, ...items]);
      setUserForm({ name: "", phone: "", password: "", role: "moderator" });
      setUserMessage(`${created.name} created as ${created.role}.`);
    } catch (err) {
      setUserMessage(err.message);
    }
  }

  const filteredReports = useMemo(() => {
    const term = query.trim().toLowerCase();
    return reports
      .filter((report) => !term || report.title?.toLowerCase().includes(term) || report.description?.toLowerCase().includes(term) || report.province?.toLowerCase().includes(term))
      .filter((report) => !status || report.status === status)
      .filter((report) => !crisisType || report.crisisType === crisisType)
      .filter((report) => !damageLevel || report.damageLevel === damageLevel)
      .filter((report) => !infrastructureType || report.infrastructureType === infrastructureType || report.category === infrastructureType)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reports, query, status, crisisType, damageLevel, infrastructureType]);

  const localStats = useMemo(() => {
    const all = reports.length;
    const byStatus = countBy(reports, "status");
    const byDamage = countBy(reports, "damageLevel");
    const byCrisis = countBy(reports, "crisisType");
    return { all, byStatus, byDamage, byCrisis };
  }, [reports]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase text-primary ring-1 ring-green-100">
            <ShieldCheck size={14} />
            Operations console
          </p>
          <h1 className="mt-3 font-heading text-2xl font-black text-text md:text-3xl">Crisis mapping dashboard</h1>
          <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            Verify citizen reports, reject unusable records, monitor damage patterns, and export structured data for response teams.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" onClick={refresh}>
            <RefreshCw size={17} />
            Refresh
          </Button>
          <Button type="button" variant="ghost" onClick={() => downloadBlob("tala-mboka-crisis-reports.csv", toCsv(filteredReports), "text/csv;charset=utf-8")}>
            <Download size={17} />
            CSV
          </Button>
          <Button type="button" variant="ghost" onClick={() => downloadBlob("tala-mboka-crisis-reports.geojson", JSON.stringify(toGeoJson(filteredReports), null, 2), "application/geo+json;charset=utf-8")}>
            <Download size={17} />
            GeoJSON
          </Button>
        </div>
      </div>

      {loading && <Card className="p-5 text-sm font-bold text-slate-600">Loading operational data...</Card>}
      {error && <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">Using local sample reports until the API is reachable: {error}</p>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ["Total reports", stats?.totalReports ?? localStats.all, "text-primary"],
          ["Pending", stats?.pendingReports ?? localStats.byStatus.pending ?? 0, "text-amber-600"],
          ["Verified", stats?.verifiedReports ?? localStats.byStatus.verified ?? 0, "text-green-700"],
          ["Rejected", stats?.rejected ?? localStats.byStatus.rejected ?? 0, "text-red-600"],
          ["Complete damage", localStats.byDamage.complete ?? 0, "text-red-700"]
        ].map(([label, value, color]) => (
          <Card key={label} className="p-4">
            <p className="text-xs font-black uppercase text-slate-500">{label}</p>
            <p className={`mt-2 font-heading text-3xl font-black ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <Card className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="text-primary" size={22} />
            <h2 className="font-heading text-lg font-black text-text">Damage and crisis statistics</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Breakdown title="Reports by damage level" rows={Object.entries(localStats.byDamage)} labels={damageLevels} />
            <Breakdown title="Reports by crisis type" rows={Object.entries(localStats.byCrisis)} labels={crisisTypes} />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 p-4">
            <MapPinned className="text-primary" size={21} />
            <h2 className="font-heading text-lg font-black text-text">Impact heatmap</h2>
          </div>
          <div className="h-[360px]">
            <MapContainer center={[-4.325, 15.3222]} zoom={5} scrollWheelZoom>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filteredReports.map((report) => {
                const damage = damageLevels[report.damageLevel] || damageLevels.partial;
                const lat = Number(report.location?.lat);
                const lng = Number(report.location?.lng);
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
                return (
                  <Circle key={`heat-${report._id}`} center={[lat, lng]} radius={damage.shortLabel === "Complete" ? 16000 : 9000} pathOptions={{ color: damage.color, fillColor: damage.color, fillOpacity: 0.18, weight: 1 }}>
                    <Popup>{report.title}</Popup>
                  </Circle>
                );
              })}
            </MapContainer>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <Users className="text-primary" size={22} />
          <h2 className="font-heading text-lg font-black text-text">Admin and moderator accounts</h2>
        </div>
        <form onSubmit={createStaffUser} className="grid gap-2 lg:grid-cols-[1fr_180px_180px_150px_auto]">
          <input className="form-field" required value={userForm.name} onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))} placeholder="Full name" />
          <input className="form-field" required value={userForm.phone} onChange={(event) => setUserForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone" />
          <input className="form-field" required type="password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} placeholder="Password" />
          <select className="form-field" value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))}>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
          <Button type="submit" variant="success">
            <UserPlus size={17} />
            Create
          </Button>
        </form>
        {userMessage && <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm font-bold text-primary">{userMessage}</p>}
        <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {users.map((staffUser) => (
            <div key={staffUser._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="font-heading font-black text-text">{staffUser.name}</p>
              <p className="text-sm font-semibold text-slate-600">{staffUser.phone}</p>
              <p className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-black uppercase text-primary ring-1 ring-green-100">{staffUser.role}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="space-y-3 border-b border-slate-100 p-4">
          <div>
            <h2 className="font-heading text-lg font-black text-text">Report verification queue</h2>
            <p className="text-sm font-semibold text-slate-600">{filteredReports.length} reports shown after filters.</p>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[1fr_repeat(4,180px)]">
            <label className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input className="form-field pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, description, or region" />
            </label>
            <select className="form-field" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All statuses</option>
              {Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <select className="form-field" value={crisisType} onChange={(event) => setCrisisType(event.target.value)}>
              <option value="">All crisis types</option>
              {Object.entries(crisisTypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <select className="form-field" value={damageLevel} onChange={(event) => setDamageLevel(event.target.value)}>
              <option value="">All damage levels</option>
              {Object.entries(damageLevels).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
            </select>
            <select className="form-field" value={infrastructureType} onChange={(event) => setInfrastructureType(event.target.value)}>
              <option value="">All infrastructure</option>
              {Object.entries(infrastructureTypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Report</th>
                <th className="px-4 py-3">Classification</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((report) => {
                const category = categories[report.infrastructureType || report.category] || categories.other;
                const damage = damageLevels[report.damageLevel] || damageLevels.partial;
                return (
                  <tr key={report._id} className="align-top">
                    <td className="max-w-[360px] px-4 py-3">
                      <p className="font-heading font-black text-text">{report.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-600">{report.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-black uppercase" style={{ color: category.color }}>{category.label}</p>
                      <p className="mt-1 text-sm font-bold text-slate-700">{crisisTypes[report.crisisType] || "Other crisis"}</p>
                      <span className="mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-black text-white" style={{ background: damage.color }}>{damage.label}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-600">
                      <p>{report.province || "Unknown"} / {report.commune || "Unknown"}</p>
                      <p className="mt-1 text-xs text-slate-500">{report.location?.lat?.toFixed?.(4) || "-"}, {report.location?.lng?.toFixed?.(4) || "-"}</p>
                    </td>
                    <td className="px-4 py-3">{statusBadge(report.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button type="button" size="sm" variant="ghost" onClick={() => openEdit(report)}>
                          <Edit3 size={16} />
                          Edit
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => updateStatus(report._id, "verified")}>
                          <CheckCircle2 size={16} />
                          Verify
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => updateStatus(report._id, "rejected")}>
                          <XCircle size={16} />
                          Reject
                        </Button>
                        <Button type="button" size="sm" variant="danger" onClick={() => deleteReport(report._id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center font-bold text-slate-500">No reports match these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editingReport && editForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 p-3 py-8">
          <form onSubmit={saveReportEdit} className="w-full max-w-4xl rounded-2xl bg-white p-4 shadow-2xl md:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-black text-text">Edit report</h2>
                <p className="text-sm font-semibold text-slate-600">Update classification, location, status, description, and photo.</p>
              </div>
              <button type="button" onClick={() => setEditingReport(null)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm font-black text-slate-700">Title</span>
                <input className="form-field" required value={editForm.title} onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))} />
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm font-black text-slate-700">Description</span>
                <textarea className="form-field min-h-28" required value={editForm.description} onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))} />
              </label>
              <label>
                <span className="mb-1 block text-sm font-black text-slate-700">Crisis type</span>
                <select className="form-field" value={editForm.crisisType} onChange={(event) => setEditForm((current) => ({ ...current, crisisType: event.target.value }))}>
                  {Object.entries(crisisTypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-sm font-black text-slate-700">Infrastructure</span>
                <select className="form-field" value={editForm.infrastructureType} onChange={(event) => setEditForm((current) => ({ ...current, infrastructureType: event.target.value }))}>
                  {Object.entries(infrastructureTypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-sm font-black text-slate-700">Damage level</span>
                <select className="form-field" value={editForm.damageLevel} onChange={(event) => setEditForm((current) => ({ ...current, damageLevel: event.target.value }))}>
                  {Object.entries(damageLevels).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-sm font-black text-slate-700">Status</span>
                <select className="form-field" value={editForm.status} onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value }))}>
                  {Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-sm font-black text-slate-700">Province</span>
                <input className="form-field" value={editForm.province} onChange={(event) => setEditForm((current) => ({ ...current, province: event.target.value }))} />
              </label>
              <label>
                <span className="mb-1 block text-sm font-black text-slate-700">Commune</span>
                <input className="form-field" value={editForm.commune} onChange={(event) => setEditForm((current) => ({ ...current, commune: event.target.value }))} />
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm font-black text-slate-700">Address text</span>
                <input className="form-field" value={editForm.addressText} onChange={(event) => setEditForm((current) => ({ ...current, addressText: event.target.value }))} />
              </label>
              <label>
                <span className="mb-1 block text-sm font-black text-slate-700">Latitude</span>
                <input className="form-field" required value={editForm.lat} onChange={(event) => setEditForm((current) => ({ ...current, lat: event.target.value }))} />
              </label>
              <label>
                <span className="mb-1 block text-sm font-black text-slate-700">Longitude</span>
                <input className="form-field" required value={editForm.lng} onChange={(event) => setEditForm((current) => ({ ...current, lng: event.target.value }))} />
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm font-black text-slate-700">Replace photo</span>
                <input className="form-field" type="file" accept="image/*" onChange={(event) => setEditImage(event.target.files?.[0] || null)} />
              </label>
            </div>

            {(editImage || editingReport.imageUrl || editingReport.imageUrls?.[0]) && (
              <img className="mt-4 h-52 w-full rounded-xl object-cover" src={editImage ? URL.createObjectURL(editImage) : assetUrl(editingReport.imageUrl || editingReport.imageUrls?.[0])} alt="" />
            )}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditingReport(null)}>Cancel</Button>
              <Button type="submit" variant="success" disabled={savingEdit}>
                <Save size={17} />
                {savingEdit ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Breakdown({ title, rows, labels }) {
  const total = Math.max(rows.reduce((sum, [, count]) => sum + count, 0), 1);
  return (
    <div>
      <h3 className="text-sm font-black uppercase text-slate-500">{title}</h3>
      <div className="mt-3 space-y-3">
        {rows.map(([key, count]) => {
          const label = labels[key]?.label || labels[key] || key;
          const color = labels[key]?.color || "#0f766e";
          return (
            <div key={key}>
              <div className="mb-1 flex justify-between gap-3 text-sm font-bold text-slate-700">
                <span>{label}</span>
                <span>{count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full" style={{ width: `${(count / total) * 100}%`, background: color }} />
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <p className="text-sm font-bold text-slate-500">No data yet.</p>}
      </div>
    </div>
  );
}
