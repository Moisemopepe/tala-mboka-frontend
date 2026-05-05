export function createFootprintsAround(location, areaLabel = "selected-area") {
  if (!location?.lat || !location?.lng) return [];
  const baseLat = Number(location.lat);
  const baseLng = Number(location.lng);
  const offsets = [
    [-0.00055, -0.00045, 0.00018, 0.00028],
    [-0.0001, -0.0005, 0.00022, 0.0002],
    [0.00035, -0.00036, 0.0002, 0.0003],
    [-0.00042, 0.00005, 0.00024, 0.00022],
    [0.00008, 0.0001, 0.00028, 0.00024],
    [0.00045, 0.00036, 0.0002, 0.00026]
  ];

  return offsets.map(([latOffset, lngOffset, height, width], index) => {
    const south = baseLat + latOffset;
    const west = baseLng + lngOffset;
    const north = south + height;
    const east = west + width;
    const id = `tmc-${areaLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${baseLat.toFixed(4)}-${baseLng.toFixed(4)}-${index + 1}`;
    const coordinates = [
      [west, south],
      [east, south],
      [east, north],
      [west, north],
      [west, south]
    ];

    return {
      id,
      name: `Building footprint ${index + 1}`,
      source: "prototype-osm-style-grid",
      bounds: [
        [south, west],
        [north, east]
      ],
      positions: coordinates.map(([lng, lat]) => [lat, lng]),
      geometry: {
        type: "Polygon",
        coordinates: [coordinates]
      }
    };
  });
}

function boundsFromCoordinates(coordinates) {
  const lats = coordinates.map(([lng, lat]) => lat);
  const lngs = coordinates.map(([lng]) => lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)]
  ];
}

function normalizeOsmGeometry(element) {
  const geometry = element.geometry || [];
  if (geometry.length < 3) return null;
  const coordinates = geometry.map((point) => [Number(point.lon), Number(point.lat)]);
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    coordinates.push(first);
  }

  return {
    id: `osm-${element.type}-${element.id}`,
    name: element.tags?.name || element.tags?.amenity || element.tags?.building || `OSM building ${element.id}`,
    source: "openstreetmap-overpass",
    osmType: element.type,
    osmId: element.id,
    tags: element.tags || {},
    bounds: boundsFromCoordinates(coordinates),
    positions: coordinates.map(([lng, lat]) => [lat, lng]),
    geometry: {
      type: "Polygon",
      coordinates: [coordinates]
    }
  };
}

export async function fetchOsmBuildings(location, radiusMeters = 220) {
  if (!location?.lat || !location?.lng) return [];
  const query = `
    [out:json][timeout:18];
    (
      way["building"](around:${radiusMeters},${location.lat},${location.lng});
      relation["building"](around:${radiusMeters},${location.lat},${location.lng});
    );
    out body geom;
  `;
  const endpoints = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter"
  ];
  let data = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`);
      if (!response.ok) continue;
      data = await response.json();
      break;
    } catch {
      data = null;
    }
  }

  if (!data) throw new Error("OSM building footprints unavailable");

  return (data.elements || [])
    .map(normalizeOsmGeometry)
    .filter(Boolean)
    .slice(0, 40);
}
