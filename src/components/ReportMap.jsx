import L from "leaflet";
import "leaflet.heat";
import "leaflet.markercluster";
import { LocateFixed, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { categories } from "../utils/categories.js";
import { distanceKm, formatDistance, getRiskLevel, riskLevels } from "../utils/risk.js";
import Button from "./Button.jsx";

const kinshasa = [-4.325, 15.3222];

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function markerIcon(reportOrCategory, options = {}) {
  const risk = typeof reportOrCategory === "object" ? getRiskLevel(reportOrCategory) : null;
  const color = risk ? riskLevels[risk].color : categories[reportOrCategory]?.color || "#0B5ED7";
  const size = options.large ? 30 : 24;
  return L.divIcon({
    className: "",
    html: `<span class="risk-marker" style="--marker-color:${color};width:${size}px;height:${size}px"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}

function userMarkerIcon() {
  return L.divIcon({
    className: "",
    html: `<span class="user-marker"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
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
      map.setView([location.lat, location.lng], Math.max(map.getZoom(), 14), { animate: true, duration: 0.6 });
    }
  }, [location, map]);
  return null;
}

function ClusterLayer({ reports, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!reports.length) return undefined;

    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      animate: true,
      maxClusterRadius: 46
    });

    reports.slice(0, 500).forEach((report) => {
      const risk = getRiskLevel(report);
      const riskMeta = riskLevels[risk];
      const category = categories[report.category];
      const distance = userLocation
        ? formatDistance(distanceKm(userLocation, { lat: report.location.lat, lng: report.location.lng }))
        : "";
      const marker = L.marker([report.location.lat, report.location.lng], { icon: markerIcon(report) });
      marker.on("mouseover", () => marker.setIcon(markerIcon(report, { large: true })));
      marker.on("mouseout", () => marker.setIcon(markerIcon(report)));
      marker.bindPopup(
        `<article class="map-popup-card">
          <div class="map-popup-top">
            <span style="color:${category?.color || "#0B5ED7"}">${escapeHtml(category?.label || report.category)}</span>
            <strong style="background:${riskMeta.color}">${escapeHtml(riskMeta.label)}</strong>
          </div>
          <h3>${escapeHtml(report.title)}</h3>
          <p>${escapeHtml(report.description || "").slice(0, 120)}</p>
          <div class="map-popup-location">📍 ${escapeHtml(report.province || "-")} / ${escapeHtml(report.commune || "-")}</div>
          ${distance ? `<div class="map-popup-distance">📍 a ${distance} de vous</div>` : ""}
          <a href="/?report=${escapeHtml(report._id)}">Voir detail</a>
        </article>`,
        { maxWidth: 280, className: "modern-popup" }
      );
      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    return () => map.removeLayer(cluster);
  }, [map, reports, userLocation]);

  return null;
}

function HeatLayer({ reports }) {
  const map = useMap();

  useEffect(() => {
    if (!reports.length || !L.heatLayer) return undefined;
    const points = reports.slice(0, 500).map((report) => {
      const risk = riskLevels[getRiskLevel(report)];
      return [report.location.lat, report.location.lng, risk.weight];
    });
    const layer = L.heatLayer(points, {
      radius: 34,
      blur: 24,
      maxZoom: 16,
      gradient: {
        0.2: "#198754",
        0.5: "#FFD60A",
        0.75: "#F97316",
        1: "#DC3545"
      }
    });
    map.addLayer(layer);
    return () => map.removeLayer(layer);
  }, [map, reports]);

  return null;
}

function RiskLegend() {
  return (
    <div className="absolute bottom-4 right-4 z-[450] rounded-2xl bg-white/90 p-3 text-xs font-black text-slate-700 shadow-soft backdrop-blur">
      {Object.entries(riskLevels).map(([key, item]) => (
        <p key={key} className="flex items-center gap-2 py-0.5">
          <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
          {item.label}
        </p>
      ))}
    </div>
  );
}

export default function ReportMap({
  reports = [],
  height = "70vh",
  onPick,
  pickedLocation,
  analytics = false,
  userLocation: controlledUserLocation,
  onUserLocation,
  onLocationError
}) {
  const [userLocation, setUserLocation] = useState(null);
  const activeUserLocation = controlledUserLocation || userLocation;
  const activeLocation = pickedLocation || activeUserLocation;
  const visibleReports = useMemo(() => reports.slice(0, 500), [reports]);

  function useLocation() {
    if (!navigator.geolocation) {
      onLocationError?.("GPS indisponible sur cet appareil.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(nextLocation);
        onUserLocation?.(nextLocation);
        onPick?.(nextLocation);
      },
      () => onLocationError?.("Permission refusee ou GPS indisponible.")
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft" style={{ height }}>
      <div className="absolute left-3 right-3 top-3 z-[450] flex items-center justify-between gap-2">
        <div className="rounded-xl bg-white/95 px-3 py-2 text-xs font-black text-text shadow-soft backdrop-blur">
          {visibleReports.length} alertes
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={useLocation}
            className="flex min-h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-black text-primary shadow-soft"
          >
            <LocateFixed size={18} />
            {analytics ? "Me localiser" : ""}
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
        {analytics && <HeatLayer reports={visibleReports} />}
        {analytics && <ClusterLayer reports={visibleReports} userLocation={activeUserLocation} />}
        {activeUserLocation && !onPick && (
          <Marker position={[activeUserLocation.lat, activeUserLocation.lng]} icon={userMarkerIcon()}>
            <Popup>Votre position</Popup>
          </Marker>
        )}
        {activeLocation && onPick && (
          <Marker
            position={[activeLocation.lat, activeLocation.lng]}
            icon={markerIcon("water")}
            draggable
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
        {!analytics &&
          !onPick &&
          visibleReports.map((report) => (
            <Marker key={report._id} position={[report.location.lat, report.location.lng]} icon={markerIcon(report)}>
              <Popup>
                <div className="max-w-52">
                  <p className="font-bold">{report.title}</p>
                  <p>{categories[report.category]?.label}</p>
                  <p>{report.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
      {analytics && <RiskLegend />}
    </div>
  );
}
