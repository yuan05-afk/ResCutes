import { getPhilippinesShelterDirectory } from "@/lib/data/philippines-shelters-directory";
import type { ShelterRecord } from "@/lib/data/types";

/**
 * Merge operational DB shelters with directory contact fields
 * (phone/email/website/notes/directory id) matched by coordinates or name.
 */
export function enrichSheltersWithDirectoryContacts(
  shelters: ShelterRecord[],
) {
  const directory = getPhilippinesShelterDirectory();

  return shelters.map((shelter) => {
    const byCoords = directory.find(
      (d) =>
        Math.abs(d.latitude - shelter.latitude) < 0.002 &&
        Math.abs(d.longitude - shelter.longitude) < 0.002,
    );
    const byName =
      byCoords ??
      directory.find(
        (d) => d.name.toLowerCase() === shelter.name.toLowerCase(),
      );

    return {
      ...shelter,
      phone: shelter.phone?.trim() || byName?.phone || "",
      email: shelter.email?.trim() || byName?.email,
      website: shelter.website?.trim() || byName?.website,
      directoryId: byName?.id ?? shelter.directoryId,
      notes: byName?.notes,
      city: byName?.city,
      region: byName?.region,
    };
  });
}
