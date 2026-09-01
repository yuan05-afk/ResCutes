/**
 * Fictional Metro Manila demo geography for ResCutes hackathon seed data.
 * Not affiliated with real organizations or addresses.
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
    pawsHope: {
      latitude: 14.676,
      longitude: 121.0437,
      address: "45 Katipunan Avenue, Quezon City, Metro Manila",
      phone: "+63 917 678 1234",
    },
    greenValley: {
      latitude: 14.5764,
      longitude: 121.0851,
      address: "12 Ortigas Avenue, Pasig City, Metro Manila",
      phone: "+63 917 890 2345",
    },
    coastalRescue: {
      latitude: 14.4793,
      longitude: 121.0198,
      address: "88 Dr. A. Santos Avenue, Parañaque City, Metro Manila",
      phone: "+63 917 901 3456",
    },
  },
} as const;
