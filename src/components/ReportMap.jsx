import L from "leaflet";
import "leaflet.heat";
import "leaflet.markercluster";
import { LocateFixed, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polygon, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { categories } from "../utils/categories.js";
import { crisisTypes, damageLevels } from "../utils/crisisOptions.js";
import { distanceKm, formatDistance } from "../utils/risk.js";
import { createFootprintsAround } from "../utils/buildingFootprints.js";
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
  const damage = typeof reportOrCategory === "object" ? damageLevels[reportOrCategory.damageLevel] : null;
  const color = damage?.color || categories[reportOrCategory]?.color || "#16a34a";
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
      const category = categories[report.infrastructureType || report.category] || categories[report.category];
      const damage = damageLevels[report.damageLevel] || damageLevels.partial;
      const distance = userLocation
        ? formatDistance(distanceKm(userLocation, { lat: report.location.lat, lng: report.location.lng }))
        : "";
      const marker = L.marker([report.location.lat, report.location.lng], { icon: markerIcon(report) });
      marker.on("mouseover", () => marker.setIcon(markerIcon(report, { large: true })));
      marker.on("mouseout", () => marker.setIcon(markerIcon(report)));
      marker.bindPopup(
        `<article class="map-popup-card">
          <div class="map-popup-top">
            <span style="color:${category?.color || "#16a34a"}">${escapeHtml(category?.label || report.category)}</span>
            <strong style="background:${damage.color}">${escapeHtml(damage.shortLabel)}</strong>
          </div>
          <h3>${escapeHtml(report.title)}</h3>
          <p>${escapeHtml(report.description || "").slice(0, 120)}</p>
          <div class="map-popup-location">Crisis: ${escapeHtml(crisisTypes[report.crisisType] || "Other crisis")}</div>
          <div class="map-popup-location">Position: ${escapeHtml(report.province || "-")} / ${escapeHtml(report.commune || "-")}</div>
        ${distance ? `<div class="map-popup-distance">${distance} away</div>` : ""}
        <a href="/app/map?report=${escapeHtml(report._id)}">View details</a>
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
      const weights = { minimal: 0.35, partial: 0.72, complete: 0.95 };
      return [report.location.lat, report.location.lng, weights[report.damageLevel] || 0.5];
    });
    const layer = L.heatLayer(points, {
      radius: 34,
      blur: 24,
      maxZoom: 16,
      gradient: {
        0.2: "#16a34a",
        0.5: "#eab308",
        0.75: "#f97316",
        1: "#ef4444"
      }
    });
    map.addLayer(layer);
    return () => map.removeLayer(layer);
  }, [map, reports]);

  return null;
}

function DamageLegend() {
  return (
    <div className="absolute bottom-4 right-4 z-[450] rounded-xl bg-white/90 p-3 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur">
      {Object.entries(damageLevels).map(([key, item]) => (
        <p key={key} className="flex items-center gap-2 py-0.5">
          <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
          {item.shortLabel}
        </p>
      ))}
    </div>
  );
}

export default function ReportMap({
  reports = [],
  height = "min(500px, 62vh)",
  onPick,
  pickedLocation,
  analytics = false,
  userLocation: controlledUserLocation,
  onUserLocation,
  onLocationError,
  onFootprintPick,
  pickedFootprint,
  footprintAreaLabel
}) {
  const [userLocation, setUserLocation] = useState(null);
  const activeUserLocation = controlledUserLocation || userLocation;
  const activeLocation = pickedLocation || activeUserLocation;
  const visibleReports = useMemo(() => reports.slice(0, 500), [reports]);
  const footprints = useMemo(
    () => (onPick && activeLocation ? createFootprintsAround(activeLocation, footprintAreaLabel) : []),
    [activeLocation, footprintAreaLabel, onPick]
  );

  function useLocation() {
    if (!navigator.geolocation) {
      onLocationError?.("GPS is not available on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(nextLocation);
        onUserLocation?.(nextLocation);
        onPick?.(nextLocation);
      },
      () => onLocationError?.("Location permission denied or GPS unavailable.")
    );
  }

  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:h-[400px] lg:h-[500px]" style={{ height }}>
      <div className="absolute left-3 right-3 top-3 z-[450] flex items-center justify-between gap-2">
        <div className="rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-text shadow-sm backdrop-blur">
          {visibleReports.length} reports
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={useLocation}
            className="flex min-h-10 items-center gap-2 rounded-lg bg-white px-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-green-50"
          >
            <LocateFixed size={18} />
            {analytics ? "My location" : ""}
          </button>
          {!onPick && (
            <Button as={Link} to="/app/report" variant="success" size="sm">
              <Plus size={17} />
              Report
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
            <Popup>Your position</Popup>
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
            <Popup>Selected position</Popup>
          </Marker>
        )}
        {footprints.map((footprint) => (
          <Polygon
            key={footprint.id}
            positions={footprint.positions}
            pathOptions={{
              color: pickedFootprint?.id === footprint.id ? "#15803d" : "#0f766e",
              fillColor: pickedFootprint?.id === footprint.id ? "#22c55e" : "#14b8a6",
              fillOpacity: pickedFootprint?.id === footprint.id ? 0.38 : 0.18,
              weight: pickedFootprint?.id === footprint.id ? 3 : 2
            }}
            eventHandlers={{
              click() {
                onFootprintPick?.(footprint);
              }
            }}
          >
            <Popup>
              <strong>{footprint.name}</strong>
              <p>{footprint.id}</p>
              <button type="button" onClick={() => onFootprintPick?.(footprint)}>Use this building</button>
            </Popup>
          </Polygon>
        ))}
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
      {analytics && <DamageLegend />}
    </div>
  );
}
