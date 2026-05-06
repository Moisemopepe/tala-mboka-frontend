import { drcLocations, provinces } from "./drcLocations.js";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

export async function resolveDrcLocation(lat, lng) {
  const resolved = await resolveAdministrativeLocation(lat, lng, "fr");
  return {
    province: resolved.province,
    commune: resolved.commune
  };
}

export async function resolveAdministrativeLocation(lat, lng, language = "fr") {
  const fallback = resolveKinshasaFallback(lat, lng);

  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(lat),
      lon: String(lng),
      addressdetails: "1",
      "accept-language": language
    });
    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`);

    if (!response.ok) return fallback;

    const data = await response.json();
    const address = data.address || {};
    const rawProvince = address.state || address.region || address.province || address.county || address.city || "";
    const rawCommune =
      address.city_district ||
        address.suburb ||
        address.municipality ||
        address.town ||
        address.city ||
        address.county ||
        address.village ||
        "";
    const matchedProvince = matchProvince(rawProvince);
    const province = matchedProvince || rawProvince || fallback.province;
    const commune = matchCommune(matchedProvince, rawCommune) || rawCommune || fallback.commune;

    return {
      country: address.country || "",
      countryCode: address.country_code || "",
      province,
      commune,
      addressText: data.display_name || ""
    };
  } catch (_error) {
    return fallback;
  }
}

export async function resolveDrcCoordinates(province, commune) {
  if (!province || !commune) return null;

  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      q: `${commune}, ${province}, Republique democratique du Congo`,
      limit: "1",
      "accept-language": "fr"
    });
    const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params.toString()}`);

    if (!response.ok) return null;

    const data = await response.json();
    const firstResult = data[0];
    if (!firstResult?.lat || !firstResult?.lon) return null;

    return {
      lat: Number(firstResult.lat),
      lng: Number(firstResult.lon)
    };
  } catch (_error) {
    return null;
  }
}

function matchProvince(value) {
  if (!value) return "";
  const normalized = normalize(value);
  return provinces.find((province) => normalize(province) === normalized || normalized.includes(normalize(province))) || "";
}

function matchCommune(province, value) {
  if (!province || !value) return "";
  const normalized = normalize(value);
  return (
    drcLocations[province]?.find(
      (commune) => normalize(commune) === normalized || normalized.includes(normalize(commune))
    ) || ""
  );
}

function resolveKinshasaFallback(lat, lng) {
  const inKinshasa = lat <= -4.25 && lat >= -4.6 && lng >= 15.15 && lng <= 15.65;

  if (!inKinshasa) {
    return { province: "", commune: "" };
  }

  if (lat > -4.34 && lng > 15.24 && lng < 15.34) {
    return { country: "Democratic Republic of the Congo", countryCode: "cd", province: "Kinshasa", commune: "Gombe", addressText: "" };
  }

  return { country: "Democratic Republic of the Congo", countryCode: "cd", province: "Kinshasa", commune: "Kinshasa", addressText: "" };
}

function normalize(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
