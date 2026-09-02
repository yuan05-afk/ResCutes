import osmShelters from "@/lib/data/osm-ph-animal-shelters.json";
import { DEMO_SHELTERS } from "@/lib/data/demo-store";
import { auditShelterDirectory } from "@/lib/data/shelter-directory-qa";

export type ShelterSpeciesProfile =
  | "dog_only"
  | "cat_only"
  | "dog_cat"
  | "mixed"
  | "wildlife"
  | "unknown";

export type ShelterDataSource = "verified" | "osm" | "demo_partner";

export interface PhilippinesShelterRecord {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  email?: string;
  speciesAccepted: string[];
  speciesProfile: ShelterSpeciesProfile;
  source: ShelterDataSource;
  sourceUrl?: string;
  notes?: string;
  operator?: string;
  isDemoPartner?: boolean;
  totalCapacity?: number;
  currentOccupancy?: number;
}

export const SHELTER_SPECIES_PROFILE_LABELS: Record<ShelterSpeciesProfile, string> = {
  dog_only: "Dogs only",
  cat_only: "Cats only",
  dog_cat: "Dogs & cats",
  mixed: "Mixed species",
  wildlife: "Wildlife / rescue",
  unknown: "General shelter",
};

export const PHILIPPINES_REGIONS = [
  "All regions",
  "NCR",
  "CAR",
  "Region I",
  "Region II",
  "Region III",
  "Region IV-A",
  "Region IV-B",
  "Region V",
  "Region VI",
  "Region VII",
  "Region VIII",
  "Region IX",
  "Region X",
  "Region XI",
  "Region XII",
  "Region XIII",
  "BARMM",
] as const;

/** Verified public listings cross-checked against org sites, Wikipedia, and OSM where available. */
const CURATED_SHELTERS: PhilippinesShelterRecord[] = [
  {
    id: "verified-paws-parc",
    name: "PAWS Animal Rehabilitation Center (PARC)",
    address: "Aurora Boulevard cor. Katipunan Avenue, Loyola Heights",
    city: "Quezon City",
    region: "NCR",
    latitude: 14.63322,
    longitude: 121.07676,
    phone: "+63 2 8475 1688",
    website: "https://paws.org.ph/",
    email: "admin@paws.org.ph",
    speciesAccepted: ["dog", "cat"],
    speciesProfile: "dog_cat",
    source: "verified",
    sourceUrl: "https://en.wikipedia.org/wiki/Philippine_Animal_Welfare_Society",
    notes: "Appointment-based intake for cruelty and neglect cases. No walk-in drop-offs.",
  },
  {
    id: "verified-nwrrc",
    name: "National Wildlife Rescue and Research Center",
    address: "Ninoy Aquino Parks and Wildlife Center compound, Diliman",
    city: "Quezon City",
    region: "NCR",
    latitude: 14.65083,
    longitude: 121.04587,
    speciesAccepted: ["wildlife"],
    speciesProfile: "wildlife",
    source: "verified",
    sourceUrl: "https://www.openstreetmap.org/node/3412035792",
    notes: "Government wildlife rescue facility (not a companion-animal shelter).",
  },
  {
    id: "verified-cara",
    name: "CARA Welfare Philippines",
    address: "175 Lopez Rizal St. cor. Samat St.",
    city: "Mandaluyong City",
    region: "NCR",
    latitude: 14.58375,
    longitude: 121.04937,
    phone: "+63 2 8532 3340",
    website: "https://www.caraphil.org/",
    email: "info@caraphil.org",
    speciesAccepted: ["dog", "cat"],
    speciesProfile: "dog_cat",
    source: "verified",
    sourceUrl: "https://www.caraphil.org/contact-us/",
    notes: "Welfare clinic and CNVR programs. Not a public drop-off shelter.",
  },
  {
    id: "verified-hound-haven",
    name: "Hound Haven Philippines",
    address: "353 Pinaglagarian St., Pulong Yantok",
    city: "Angat, Bulacan",
    region: "Region III",
    latitude: 14.9289,
    longitude: 120.9398,
    website: "https://houndhaven.ph/",
    speciesAccepted: ["dog"],
    speciesProfile: "dog_only",
    source: "verified",
    sourceUrl: "https://houndhaven.ph/",
    notes: "Retired working-dog sanctuary and adoption program.",
  },
  {
    id: "verified-pawssion-sjdm",
    name: "Pawssion Project (Bulacan)",
    address: "1429 Paradise 1, Purok 7 Tungkong Mangga",
    city: "San Jose del Monte City, Bulacan",
    region: "Region III",
    latitude: 14.8139,
    longitude: 121.0453,
    website: "https://pawssionproject.com/",
    speciesAccepted: ["dog", "cat"],
    speciesProfile: "dog_cat",
    source: "verified",
    sourceUrl: "https://pawssionproject.com/",
  },
  {
    id: "verified-pawssion-bacolod",
    name: "Pawssion Project (Bacolod)",
    address: "Balay Pawssion, Hacienda Eliza, Barangay Granada",
    city: "Bacolod City",
    region: "Region VI",
    latitude: 10.6407,
    longitude: 122.9682,
    website: "https://pawssionproject.com/",
    speciesAccepted: ["dog", "cat"],
    speciesProfile: "dog_cat",
    source: "verified",
    sourceUrl: "https://pawssionproject.com/",
  },
  {
    id: "verified-part",
    name: "Philippine Animal Rescue Team (PART)",
    address: "4611 Maulawin St.",
    city: "Pagsanjan, Laguna",
    region: "Region IV-A",
    latitude: 14.2729,
    longitude: 121.4538,
    website: "https://philippineanimalrescueteam.com/",
    speciesAccepted: ["dog", "cat"],
    speciesProfile: "dog_cat",
    source: "verified",
    sourceUrl: "https://www.spot.ph/newsfeatures/adulting/109876/where-to-adopt-rescue-dogs-cats-in-the-philippines-a4373-20240830-lfrm",
  },
  {
    id: "verified-laras-ark-mandaluyong",
    name: "Lara's Ark (Mandaluyong)",
    address: "585 Calbayog St.",
    city: "Mandaluyong City",
    region: "NCR",
    latitude: 14.577655,
    longitude: 121.048782,
    speciesAccepted: ["dog", "cat"],
    speciesProfile: "dog_cat",
    source: "verified",
    sourceUrl: "https://financialassistance.ph/animal-shelters-philippines/",
  },
  {
    id: "verified-mby-morong",
    name: "MBY Pet Rescue & Sanctuary",
    address: "113 Sitio Talaga Proper, Barangay Maybancal",
    city: "Morong, Rizal",
    region: "Region IV-A",
    latitude: 14.5115,
    longitude: 121.2395,
    phone: "+63 966 814 4456",
    speciesAccepted: ["dog", "cat"],
    speciesProfile: "dog_cat",
    source: "verified",
    sourceUrl: "https://financialassistance.ph/animal-shelters-philippines/",
  },
  {
    id: "verified-happy-animals-davao",
    name: "Happy Animals Club",
    address: "22 Rigodon Extension, Lanzona Subdivision, Matina Aplaya",
    city: "Davao City",
    region: "Region XI",
    latitude: 7.05117,
    longitude: 125.59172,
    speciesAccepted: ["dog", "cat"],
    speciesProfile: "dog_cat",
    source: "verified",
    sourceUrl: "https://mindanews.com/top-stories/2025/12/animal-shelter-says-we-were-ghosted-by-city-govt/",
    notes: "Private rescue shelter. Confirm operating status before visiting.",
  },
  {
    id: "verified-aarrc",
    name: "Aklan Animal Rescue & Rehabilitation Center",
    address: "Sunflower Road, Andagao",
    city: "Kalibo, Aklan",
    region: "Region VI",
    latitude: 11.7061,
    longitude: 122.3644,
    speciesAccepted: ["dog", "cat"],
    speciesProfile: "dog_cat",
    source: "verified",
    sourceUrl: "https://financialassistance.ph/animal-shelters-philippines/",
  },
  {
    id: "verified-maro-cebu",
    name: "Mayari Animal Rescue Organization (MARO)",
    address: "Sapangdaku, Guadalupe",
    city: "Cebu City",
    region: "Region VII",
    latitude: 10.3186,
    longitude: 123.8784,
    phone: "+63 998 206 6982",
    website: "https://mayarirescue.com/",
    email: "info@mayarirescue.com",
    speciesAccepted: ["dog", "cat"],
    speciesProfile: "dog_cat",
    source: "verified",
    sourceUrl: "https://sugbo.ph/2024/animal-shelters-in-cebu/",
    notes: "Hillside shelter. Contact ahead for visit and volunteer schedules.",
  },
  {
    id: "verified-iro-cebu",
    name: "Island Rescue Organization (IRO)",
    address: "Barangay Guba Road, Barangay Guba",
    city: "Cebu City",
    region: "Region VII",
    latitude: 10.3825,
    longitude: 123.9018,
    phone: "+63 905 341 6042",
    email: "helpiro@gmail.com",
    website: "https://www.iro.org.ph/",
    speciesAccepted: ["dog", "cat"],
    speciesProfile: "dog_cat",
    source: "verified",
    sourceUrl: "https://sugbo.ph/2024/animal-shelters-in-cebu/",
    notes: "Mountain-access shelter. Message ahead before visiting.",
  },
  {
    id: "verified-akf",
    name: "Animal Kingdom Foundation Rescue Center",
    address: "No. 8 Purante St., Barangay Cubcub",
    city: "Capas, Tarlac",
    region: "Region III",
    latitude: 15.328832,
    longitude: 120.596817,
    phone: "+63 939 914 2403",
    website: "https://www.akfrescues.org/",
    speciesAccepted: ["dog"],
    speciesProfile: "dog_only",
    source: "verified",
    sourceUrl: "https://en.wikipedia.org/wiki/Animal_Kingdom_Foundation",
    notes: "Dog meat trade rescue sanctuary. Visits by appointment.",
  },
  {
    id: "verified-peta-asia",
    name: "PETA Asia (Regional Office)",
    address: "Unit 706, West Tower, Philippine Stock Exchange Centre, Ortigas",
    city: "Pasig City",
    region: "NCR",
    latitude: 14.5826,
    longitude: 121.0612,
    website: "https://www.petaasia.com/",
    speciesAccepted: ["dog", "cat", "wildlife"],
    speciesProfile: "mixed",
    source: "verified",
    sourceUrl: "https://www.petaasia.com/",
    notes: "Advocacy office, not an animal intake shelter.",
  },
  {
    id: "verified-red-cubs-cats",
    name: "Red Cubs Pet Patrol (Cat Shelter)",
    address: "7th Avenue, Beverly Hills",
    city: "Antipolo, Rizal",
    region: "Region IV-A",
    latitude: 14.5755,
    longitude: 121.1685,
    phone: "+63 918 985 2149",
    website: "https://redcubspetpatrol.org/",
    speciesAccepted: ["cat"],
    speciesProfile: "cat_only",
    source: "verified",
    sourceUrl: "https://redcubspetpatrol.org/",
  },
  {
    id: "verified-red-cubs-dogs",
    name: "Red Cubs Pet Patrol (Dog Shelter)",
    address: "Banha Subdivision, San Jose",
    city: "Antipolo, Rizal",
    region: "Region IV-A",
    latitude: 14.5902,
    longitude: 121.185,
    phone: "+63 918 985 2149",
    website: "https://redcubspetpatrol.org/",
    speciesAccepted: ["dog"],
    speciesProfile: "dog_only",
    source: "verified",
    sourceUrl: "https://redcubspetpatrol.org/",
  },
  {
    id: "verified-help-mas",
    name: "Mandaluyong Animal Shelter (MAS)",
    address: "588 Nueve de Febrero",
    city: "Mandaluyong City",
    region: "NCR",
    latitude: 14.5863,
    longitude: 121.0439,
    email: "helpmasdogs@gmail.com",
    speciesAccepted: ["dog", "cat"],
    speciesProfile: "dog_cat",
    source: "verified",
    sourceUrl: "https://www.wheninmanila.com/the-mandaluyong-animal-shelter-dogs-need-your-help/",
    notes: "City pound supported by Help MAS volunteers. Donations accepted weekends 1:30–4:00 PM.",
  },
  {
    id: "verified-shelter-hope-bacoor",
    name: "Shelter of Hope Bacoor",
    address: "Blk 4 Lot 23 Officers Avenue, Springville Executive 1, Molino 3",
    city: "Bacoor, Cavite",
    region: "Region IV-A",
    latitude: 14.4195,
    longitude: 120.9598,
    speciesAccepted: ["dog", "cat"],
    speciesProfile: "dog_cat",
    source: "verified",
    sourceUrl: "https://financialassistance.ph/animal-shelters-philippines/",
  },
];

function deriveSpeciesProfile(
  species: string[],
  osmAnimalShelterTag?: string,
): ShelterSpeciesProfile {
  if (osmAnimalShelterTag === "dog") return "dog_only";
  if (osmAnimalShelterTag === "cat") return "cat_only";
  if (osmAnimalShelterTag === "wildlife") return "wildlife";

  const normalized = species.map((s) => s.toLowerCase());
  const hasDog = normalized.includes("dog");
  const hasCat = normalized.includes("cat");
  const hasWildlife = normalized.some((s) =>
    ["wildlife", "bird", "reptile"].includes(s),
  );

  if (hasWildlife && !hasDog && !hasCat) return "wildlife";
  if (hasDog && hasCat && normalized.length === 2) return "dog_cat";
  if (hasDog && !hasCat && normalized.length === 1) return "dog_only";
  if (hasCat && !hasDog && normalized.length === 1) return "cat_only";
  if (normalized.length > 0) return "mixed";
  return "unknown";
}

function formatSpeciesList(species: string[]): string {
  return species
    .map((s) => s.replace(/_/g, " "))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(", ");
}

function inferRegionFromCoords(lat: number, lon: number): string {
  if (lat >= 14.2 && lat <= 14.9 && lon >= 120.8 && lon <= 121.2) return "NCR";
  if (lat >= 6.5 && lat <= 7.5 && lon >= 125.4 && lon <= 125.8) return "Region XI";
  if (lat >= 10.2 && lat <= 11.0 && lon >= 123.7 && lon <= 124.1) return "Region VII";
  if (lat >= 10.5 && lat <= 11.0 && lon >= 122.8 && lon <= 123.2) return "Region VI";
  if (lat >= 14.0 && lat <= 15.5 && lon >= 120.5 && lon <= 121.5) return "Region III";
  if (lat >= 13.5 && lat <= 14.8 && lon >= 120.8 && lon <= 121.8) return "Region IV-A";
  if (lat >= 6.8 && lat <= 7.2 && lon >= 121.9 && lon <= 122.2) return "BARMM";
  if (lat >= 6.8 && lat <= 7.1 && lon >= 121.9 && lon <= 122.2) return "Region IX";
  return "Philippines";
}

function inferCityLabel(lat: number, lon: number): string {
  if (lat >= 6.9 && lat <= 7.0 && lon >= 122.0 && lon <= 122.1) return "Zamboanga City";
  if (lat >= 11.8 && lat <= 11.9 && lon >= 124.8 && lon <= 124.9) return "Catbalogan area";
  if (lat >= 15.5 && lat <= 15.7 && lon >= 120.3 && lon <= 120.4) return "Tarlac area";
  return "Philippines";
}

const OSM_SKIP_IDS = new Set([
  "osm-node-3412035792",
  "osm-way-1434820993",
]);

const OSM_EXCLUDED_NAME_PATTERNS = [/bigdipper/i, /rottweiler/i];

function parseOsmShelters(): PhilippinesShelterRecord[] {
  const elements =
    (osmShelters as unknown as { elements?: OsmElement[] }).elements ?? [];

  return elements
    .map((element): PhilippinesShelterRecord | null => {
      const id = `osm-${element.type}-${element.id}`;
      if (OSM_SKIP_IDS.has(id)) return null;

      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;
      if (lat == null || lon == null) return null;

      const tags = element.tags ?? {};
      const name = tags.name?.trim() || tags.operator?.trim() || "";
      if (!name) return null;

      if (OSM_EXCLUDED_NAME_PATTERNS.some((pattern) => pattern.test(name))) {
        return null;
      }

      const speciesTag = tags["animal_shelter"];
      const speciesAccepted =
        speciesTag === "dog"
          ? ["dog"]
          : speciesTag === "cat"
            ? ["cat"]
            : speciesTag === "wildlife"
              ? ["wildlife"]
              : ["dog", "cat"];

      const city =
        tags["addr:city"] ||
        tags["addr:municipality"] ||
        tags["addr:province"] ||
        inferCityLabel(lat, lon);

      return {
        id,
        name,
        address:
          [tags["addr:street"], tags["addr:city"], tags["addr:province"]]
            .filter(Boolean)
            .join(", ") || "Address from OpenStreetMap",
        city,
        region: inferRegionFromCoords(lat, lon),
        latitude: lat,
        longitude: lon,
        speciesAccepted,
        speciesProfile: deriveSpeciesProfile(speciesAccepted, speciesTag),
        source: "osm",
        sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
        operator: tags.operator,
        notes: "OpenStreetMap community data (ODbL). Verify hours and intake policy directly.",
      };
    })
    .filter((s): s is PhilippinesShelterRecord => s != null);
}

type OsmElement = {
  type: "node" | "way";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function demoPartnerShelters(): PhilippinesShelterRecord[] {
  return DEMO_SHELTERS.map((shelter) => ({
    id: shelter.id,
    name: `${shelter.name} (ResCutes partner)`,
    address: shelter.address,
    city: shelter.address.split(",").pop()?.trim() ?? "Metro Manila",
    region: "NCR",
    latitude: shelter.latitude,
    longitude: shelter.longitude,
    phone: shelter.phone,
    speciesAccepted: shelter.speciesAccepted,
    speciesProfile: deriveSpeciesProfile(shelter.speciesAccepted),
    source: "demo_partner" as const,
    notes: "Operational partner in the ResCutes demo routing workflow.",
    isDemoPartner: true,
    totalCapacity: shelter.totalCapacity,
    currentOccupancy: shelter.currentOccupancy,
  }));
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isNearDuplicate(
  a: PhilippinesShelterRecord,
  b: PhilippinesShelterRecord,
): boolean {
  const nameA = normalizeName(a.name);
  const nameB = normalizeName(b.name);
  if (nameA === nameB) return true;
  if (nameA.includes(nameB) || nameB.includes(nameA)) {
    const dLat = Math.abs(a.latitude - b.latitude);
    const dLon = Math.abs(a.longitude - b.longitude);
    return dLat < 0.02 && dLon < 0.02;
  }
  return false;
}

function mergeShelterDirectories(
  primary: PhilippinesShelterRecord[],
  secondary: PhilippinesShelterRecord[],
): PhilippinesShelterRecord[] {
  const merged = [...primary];
  for (const candidate of secondary) {
    if (merged.some((existing) => isNearDuplicate(existing, candidate))) {
      continue;
    }
    merged.push(candidate);
  }
  return merged;
}

let cachedShelters: PhilippinesShelterRecord[] | null = null;

export function resetPhilippinesShelterDirectoryCache() {
  cachedShelters = null;
}

export function getPhilippinesShelterDirectory(): PhilippinesShelterRecord[] {
  if (cachedShelters) return cachedShelters;

  const osm = parseOsmShelters();
  const demo = demoPartnerShelters();
  cachedShelters = mergeShelterDirectories(
    mergeShelterDirectories(CURATED_SHELTERS, demo),
    osm,
  ).sort((a, b) => a.name.localeCompare(b.name));

  const issues = auditShelterDirectory(cachedShelters);
  if (issues.length > 0 && process.env.NODE_ENV !== "production") {
    console.warn(
      "[ResCutes] Shelter directory QA issues:",
      issues.slice(0, 5),
      issues.length > 5 ? `…and ${issues.length - 5} more` : "",
    );
  }

  return cachedShelters;
}

export function formatShelterSpeciesLabel(shelter: PhilippinesShelterRecord): string {
  if (shelter.speciesAccepted.length > 0) {
    return formatSpeciesList(shelter.speciesAccepted);
  }
  return SHELTER_SPECIES_PROFILE_LABELS[shelter.speciesProfile];
}

export const PHILIPPINES_MAP_CENTER = {
  latitude: 12.8797,
  longitude: 121.774,
};

export const PHILIPPINES_MAP_ZOOM = 5.2;
