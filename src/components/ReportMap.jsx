import L from "leaflet";
import { LocateFixed, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { categories, statuses } from "../utils/categories.js";
import Button from "./Button.jsx";

const kinshasa = [-4.325, 15.3222];

function markerIcon(category) {
  const color = categories[category]?.color || "#0f766e";
  return L.divIcon({
    className: "",
    html: `<span class="category-marker" style="background:${color};display:block;width:22px;height:22px"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
}

function ClickPicker({ onPick }) {
  useMapEvents({
    click(event) {
      onPick?.({ lat: event.latlng.lat, lng: event.latlng.lng });
    }
  });
  return null;
}

function MapRecenter({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], Math.max(map.getZoom(), 14), { animate: true });
    }
  }, [location, map]);
  return null;
}

export default function ReportMap({ reports = [], height = "70vh", onPick, pickedLocation }) {
  const [userLocation, setUserLocation] = useState(null);
  const activeLocation = pickedLocation || userLocation;

  function useLocation() {
    navigator.geolocation?.getCurrentPosition((position) => {
      const nextLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
      setUserLocation(nextLocation);
      onPick?.(nextLocation);
    });
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft" style={{ height }}>
      <div className="absolute left-3 right-3 top-3 z-[450] flex items-center justify-between gap-2">
        <div className="rounded-xl bg-white/95 px-3 py-2 text-xs font-black text-text shadow-soft backdrop-blur">
          {reports.length} signalements
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={useLocation}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-soft"
            aria-label="Utiliser ma position"
          >
            <LocateFixed size={18} />
          </button>
          {!onPick && (
            <Button as={Link} to="/report" variant="success" size="sm" className="shadow-soft">
              <Plus size={17} />
              Signaler
            </Button>
          )}
        </div>
      </div>
      <MapContainer center={pickedLocation ? [pickedLocation.lat, pickedLocation.lng] : kinshasa} zoom={12} scrollWheelZoom>
        <MapRecenter location={activeLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onPick && <ClickPicker onPick={onPick} />}
        {activeLocation && (
          <Marker
            position={[activeLocation.lat, activeLocation.lng]}
            icon={markerIcon("water")}
            draggable={Boolean(onPick)}
            eventHandlers={{
              dragend(event) {
                const next = event.target.getLatLng();
                onPick?.({ lat: next.lat, lng: next.lng });
              }
            }}
          >
            <Popup>Position selectionnee</Popup>
          </Marker>
        )}
        {reports.map((report) => (
          <Marker
            key={report._id}
            position={[report.location.lat, report.location.lng]}
            icon={markerIcon(report.category)}
          >
            <Popup>
              <div className="max-w-52">
                <p className="font-bold">{report.title}</p>
                <p>{categories[report.category]?.label}</p>
                <p>{statuses[report.status] || report.status}</p>
                <p>{report.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
