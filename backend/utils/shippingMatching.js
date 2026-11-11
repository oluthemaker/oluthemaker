const normalise = (value) => String(value || "").trim().toLocaleLowerCase().replace(/\s+state$/i, "").replace(/\s+/g, " ");
const matchesList = (list, value) => !list?.length || list.some((entry) => normalise(entry) === normalise(value));

export const zoneMatchesAddress = (zone, address) =>
  normalise(zone.country) === normalise(address.country) &&
  matchesList(zone.states, address.state) &&
  matchesList(zone.cities, address.city);
