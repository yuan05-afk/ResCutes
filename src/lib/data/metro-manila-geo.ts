/**
 * Metro Manila geography for ResCutes demo rescue scenarios.
 * Shelter coordinates align with verified listings on the Philippines shelter map.
 */
export const DEMO_GEO = {
  center: { latitude: 14.5995, longitude: 120.9842 },
  citizenHomeLabel: "Manila, Philippines",
  luna: {
    latitude: 14.6014,
    longitude: 120.9892,
    approximateLatitude: 14.6021,
    approximateLongitude: 120.9900,
    areaLabel: "España Boulevard, Sampaloc, Manila",
  },
  shelters: {
    paws: {
      latitude: 14.63322,
      longitude: 121.07676,
      address: "Aurora Boulevard cor. Katipunan Avenue, Loyola Heights, Quezon City, NCR",
      phone: "+63 2 8475 1688",
    },
    cara: {
      latitude: 14.58375,
      longitude: 121.04937,
      address: "175 Lopez Rizal St. cor. Samat St., Mandaluyong City, NCR",
      phone: "+63 2 8532 3340",
    },
    helpMas: {
      latitude: 14.5863,
      longitude: 121.0439,
      address: "588 Nueve de Febrero, Mandaluyong City, NCR",
      phone: "",
    },
  },
} as const;
