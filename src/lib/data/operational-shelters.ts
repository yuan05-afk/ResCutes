import type { ShelterRecord } from "@/lib/data/types";
import { getCuratedShelterRecords } from "@/lib/data/philippines-shelters-directory";
import { OPERATIONAL_SHELTER_PROFILES } from "@/lib/data/operational-shelter-profiles";

export function buildOperationalDemoShelters(): ShelterRecord[] {
  return getCuratedShelterRecords().map((shelter) => {
    const profile = OPERATIONAL_SHELTER_PROFILES[shelter.id];
    return {
      id: shelter.id,
      name: shelter.name,
      // Street-level address only - city/region come from directory enrichment
      // so the contact block does not append them twice.
      address: shelter.address,
      latitude: shelter.latitude,
      longitude: shelter.longitude,
      phone: shelter.phone ?? "",
      email: shelter.email,
      website: shelter.website,
      directoryId: shelter.id,
      speciesAccepted: [...shelter.speciesAccepted],
      capabilities: profile?.capabilities ?? [
        "basic veterinary care",
        "wound care",
      ],
      totalCapacity: profile?.totalCapacity ?? 40,
      currentOccupancy: profile?.currentOccupancy ?? 24,
      operationalWorkload: profile?.operationalWorkload ?? 18,
    };
  });
}
