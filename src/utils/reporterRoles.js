export const reporterRoles = {
  concerned: {
    label: "Concerné",
    shortLabel: "Concerné",
    description: "Vous êtes directement touché par ce problème."
  },
  witness: {
    label: "Témoin",
    shortLabel: "Témoin",
    description: "Vous avez observé la situation autour de vous."
  },
  anonymous: {
    label: "Anonyme",
    shortLabel: "Anonyme",
    description: "Votre identité reste discrète dans le signalement."
  }
};

export function reporterRoleLabel(value) {
  return reporterRoles[value]?.label || reporterRoles.concerned.label;
}
