import { LocateFixed, Send } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import ReportMap from "../components/ReportMap.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { categories } from "../utils/categories.js";
import { drcLocations, provinces } from "../utils/drcLocations.js";
import { resolveDrcLocation } from "../utils/geoLocation.js";

export default function Report() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "road",
    province: "Kinshasa",
    commune: "Gombe"
  });
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState("");
  const [locating, setLocating] = useState(false);

  function update(field, value) {
    setForm((current) => {
      if (field === "province") {
        return { ...current, province: value, commune: drcLocations[value]?.[0] || "" };
      }
      return { ...current, [field]: value };
    });
  }

  async function applyLocation(nextLocation, source = "map") {
    setLocation(nextLocation);
    setMessage(source === "gps" ? "Localisation en cours..." : "Recherche province et commune...");

    const resolved = await resolveDrcLocation(nextLocation.lat, nextLocation.lng);

    if (resolved.province && resolved.commune) {
      setForm((current) => ({
        ...current,
        province: resolved.province,
        commune: resolved.commune
      }));
      setMessage(`Position detectee: ${resolved.province} / ${resolved.commune}`);
      return;
    }

    if (resolved.province) {
      setForm((current) => ({
        ...current,
        province: resolved.province,
        commune: drcLocations[resolved.province]?.[0] || current.commune
      }));
      setMessage(`Province detectee: ${resolved.province}. Choisissez la commune si besoin.`);
      return;
    }

    setMessage("Position GPS trouvee. Choisissez la province et la commune si elles ne sont pas correctes.");
  }

  function useGps() {
    if (!navigator.geolocation) {
      setMessage("GPS indisponible. Touchez la carte pour choisir le lieu.");
      return;
    }

    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      async (position) => {
        await applyLocation({ lat: position.coords.latitude, lng: position.coords.longitude }, "gps");
        setLocating(false);
      },
      () => {
        setLocating(false);
        setMessage("GPS indisponible. Touchez la carte pour choisir le lieu.");
      }
    );
  }

  async function submit(event) {
    event.preventDefault();
    if (!location) {
      setMessage("Choisissez une position GPS ou sur la carte.");
      return;
    }

    const body = new FormData();
    body.append("title", form.title);
    body.append("description", form.description);
    body.append("category", form.category);
    body.append("province", form.province);
    body.append("commune", form.commune);
    body.append("address", `${form.commune}, ${form.province}`);
    body.append("lat", location.lat);
    body.append("lng", location.lng);
    if (image) body.append("image", image);

    const endpoint = isAuthenticated ? "/reports" : "/reports/guest";
    const data = await api(endpoint, { method: "POST", body });

    if (!isAuthenticated) {
      setMessage(data.message || "Votre alerte sera validée avant publication");
      setForm((current) => ({ ...current, title: "", description: "" }));
      setImage(null);
      return;
    }

    navigate("/");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-black text-text">Nouveau signalement</h1>
        <p className="text-sm font-medium text-slate-500">
          {isAuthenticated
            ? "Votre alerte sera publiee directement."
            : "Sans compte, votre alerte sera validée avant publication."}
        </p>
      </div>
      {message && <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">{message}</p>}
      <Card className="space-y-3 p-4">
        <input
          required
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
          placeholder="Titre du probleme"
          className="form-field"
        />
        <textarea
          required
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="Description courte et claire"
          rows={3}
          className="form-field"
        />
        <select value={form.category} onChange={(event) => update("category", event.target.value)} className="form-field">
          {Object.entries(categories).map(([key, item]) => (
            <option value={key} key={key}>
              {item.label}
            </option>
          ))}
        </select>
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={form.province} onChange={(event) => update("province", event.target.value)} className="form-field">
            {provinces.map((province) => (
              <option value={province} key={province}>
                {province}
              </option>
            ))}
          </select>
          <select value={form.commune} onChange={(event) => update("commune", event.target.value)} className="form-field">
            {(drcLocations[form.province] || []).map((commune) => (
              <option value={commune} key={commune}>
                {commune}
              </option>
            ))}
          </select>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setImage(event.target.files?.[0] || null)}
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-bold file:text-primary"
        />
      </Card>
      <Button type="button" onClick={useGps} variant="ghost" className="w-full" disabled={locating}>
        <LocateFixed size={18} />
        {locating ? "Localisation..." : "Utiliser ma position"}
      </Button>
      <ReportMap height="320px" onPick={(nextLocation) => applyLocation(nextLocation, "map")} pickedLocation={location} />
      <Button type="submit" variant="success" size="lg" className="w-full">
        <Send size={18} />
        Envoyer le signalement
      </Button>
    </form>
  );
}
