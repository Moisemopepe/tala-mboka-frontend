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
