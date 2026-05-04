export const infrastructureTypes = {
  residential: "Residential infrastructure",
  commercial: "Commercial infrastructure",
  government: "Government building",
  utility: "Utility infrastructure",
  transport: "Transport and communication",
  communication: "Communication infrastructure",
  health: "Health infrastructure",
  education: "Education infrastructure",
  public_space: "Public space or recreation",
  other: "Other infrastructure"
};

export const crisisTypes = {
  flood: "Flood",
  earthquake: "Earthquake",
  conflict: "Conflict",
  fire: "Fire",
  explosion: "Explosion",
  chemical_incident: "Chemical incident",
  other: "Other crisis"
};

export const damageLevels = {
  minimal: {
    label: "Minimal / no damage",
    shortLabel: "Minimal",
    color: "#16a34a",
    description: "Structurally sound and functional, with only cosmetic or no visible damage."
  },
  partial: {
    label: "Partially damaged",
    shortLabel: "Partial",
    color: "#f97316",
    description: "Repairable, but use may be limited or require caution."
  },
  complete: {
    label: "Completely damaged",
    shortLabel: "Complete",
    color: "#dc2626",
    description: "Structurally unsafe, destroyed, or not usable."
  }
};

export const debrisOptions = {
  unknown: "Unknown",
  no: "No visible debris",
  yes: "Debris requires clearing"
};
