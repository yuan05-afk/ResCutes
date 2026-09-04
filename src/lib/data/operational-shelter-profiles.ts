export interface OperationalShelterProfile {
  totalCapacity: number;
  currentOccupancy: number;
  operationalWorkload: number;
  capabilities: string[];
  /** Shown on the shelter map as a ResCutes routing partner. */
  isRescutesPartner?: boolean;
}

/**
 * Realistic operational estimates for verified shelters on the Philippines map.
 * Capacity and capabilities are planning defaults; confirm with each organization.
 */
export const OPERATIONAL_SHELTER_PROFILES: Record<string, OperationalShelterProfile> =
  {
    "verified-paws-parc": {
      totalCapacity: 85,
      currentOccupancy: 58,
      operationalWorkload: 41,
      isRescutesPartner: true,
      capabilities: [
        "basic veterinary care",
        "orthopedic treatment",
        "emergency surgery",
        "wound care",
        "behavioral assessment",
      ],
    },
    "verified-nwrrc": {
      totalCapacity: 40,
      currentOccupancy: 22,
      operationalWorkload: 15,
      capabilities: ["basic veterinary care", "wound care", "intensive care"],
    },
    "verified-cara": {
      totalCapacity: 48,
      currentOccupancy: 31,
      operationalWorkload: 28,
      isRescutesPartner: true,
      capabilities: [
        "basic veterinary care",
        "wound care",
        "behavioral assessment",
      ],
    },
    "verified-hound-haven": {
      totalCapacity: 120,
      currentOccupancy: 79,
      operationalWorkload: 52,
      capabilities: [
        "basic veterinary care",
        "wound care",
        "behavioral assessment",
      ],
    },
    "verified-pawssion-sjdm": {
      totalCapacity: 210,
      currentOccupancy: 168,
      operationalWorkload: 88,
      capabilities: [
        "basic veterinary care",
        "wound care",
        "emergency surgery",
        "behavioral assessment",
      ],
    },
    "verified-pawssion-bacolod": {
      totalCapacity: 155,
      currentOccupancy: 102,
      operationalWorkload: 61,
      capabilities: [
        "basic veterinary care",
        "wound care",
        "behavioral assessment",
      ],
    },
    "verified-part": {
      totalCapacity: 92,
      currentOccupancy: 57,
      operationalWorkload: 34,
      capabilities: [
        "basic veterinary care",
        "wound care",
        "behavioral assessment",
      ],
    },
    "verified-laras-ark-mandaluyong": {
      totalCapacity: 38,
      currentOccupancy: 29,
      operationalWorkload: 22,
      isRescutesPartner: true,
      capabilities: ["basic veterinary care", "wound care"],
    },
    "verified-mby-morong": {
      totalCapacity: 112,
      currentOccupancy: 74,
      operationalWorkload: 46,
      capabilities: [
        "basic veterinary care",
        "wound care",
        "emergency surgery",
        "behavioral assessment",
      ],
    },
    "verified-happy-animals-davao": {
      totalCapacity: 76,
      currentOccupancy: 49,
      operationalWorkload: 31,
      capabilities: ["basic veterinary care", "wound care"],
    },
    "verified-aarrc": {
      totalCapacity: 62,
      currentOccupancy: 39,
      operationalWorkload: 24,
      capabilities: ["basic veterinary care", "wound care"],
    },
    "verified-maro-cebu": {
      totalCapacity: 82,
      currentOccupancy: 54,
      operationalWorkload: 36,
      capabilities: [
        "basic veterinary care",
        "wound care",
        "orthopedic treatment",
      ],
    },
    "verified-iro-cebu": {
      totalCapacity: 98,
      currentOccupancy: 63,
      operationalWorkload: 42,
      capabilities: [
        "basic veterinary care",
        "wound care",
        "behavioral assessment",
      ],
    },
    "verified-akf": {
      totalCapacity: 135,
      currentOccupancy: 91,
      operationalWorkload: 58,
      capabilities: [
        "basic veterinary care",
        "emergency surgery",
        "wound care",
        "behavioral assessment",
      ],
    },
    "verified-peta-asia": {
      totalCapacity: 12,
      currentOccupancy: 4,
      operationalWorkload: 6,
      capabilities: ["basic veterinary care"],
    },
    "verified-red-cubs-cats": {
      totalCapacity: 52,
      currentOccupancy: 36,
      operationalWorkload: 19,
      capabilities: ["basic veterinary care", "wound care"],
    },
    "verified-red-cubs-dogs": {
      totalCapacity: 58,
      currentOccupancy: 41,
      operationalWorkload: 21,
      capabilities: [
        "basic veterinary care",
        "wound care",
        "behavioral assessment",
      ],
    },
    "verified-help-mas": {
      totalCapacity: 72,
      currentOccupancy: 47,
      operationalWorkload: 38,
      isRescutesPartner: true,
      capabilities: [
        "basic veterinary care",
        "wound care",
        "behavioral assessment",
      ],
    },
    "verified-shelter-hope-bacoor": {
      totalCapacity: 68,
      currentOccupancy: 44,
      operationalWorkload: 27,
      capabilities: ["basic veterinary care", "wound care"],
    },
  };
