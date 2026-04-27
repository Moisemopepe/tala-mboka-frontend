import { LocateFixed, Send } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import ReportMap from "../components/ReportMap.jsx";
import { categories } from "../utils/categories.js";

export default function Report() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", category: "road" });
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function useGps() {
    navigator.geolocation?.getCurrentPosition(
      (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => setMessage("GPS indisponible. Touchez la carte pour choisir le lieu.")
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
    body.append("lat", location.lat);
    body.append("lng", location.lng);
    if (image) body.append("image", image);

    await api("/reports", { method: "POST", body });
    navigate("/feed");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-black text-text">Nouveau signalement</h1>
        <p className="text-sm font-medium text-slate-500">Ajoutez une description courte et le lieu exact.</p>
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
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setImage(event.target.files?.[0] || null)}
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-bold file:text-primary"
        />
      </Card>
      <Button type="button" onClick={useGps} variant="ghost" className="w-full">
        <LocateFixed size={18} />
        Utiliser ma position
      </Button>
      <ReportMap height="320px" onPick={setLocation} pickedLocation={location} />
      <Button type="submit" variant="success" size="lg" className="w-full">
        <Send size={18} />
        Envoyer le signalement
      </Button>
    </form>
  );
}
