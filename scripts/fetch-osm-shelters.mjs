import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const query = `
[out:json][timeout:120];
area["ISO3166-1"="PH"][admin_level=2]->.ph;
(
  node["amenity"="animal_shelter"](area.ph);
  way["amenity"="animal_shelter"](area.ph);
);
out center tags;
`.trim();

const res = await fetch("https://overpass.kumi.systems/api/interpreter", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "ResCutes/1.0 (local dev; shelter map dataset)",
  },
  body: new URLSearchParams({ data: query }),
});

const text = await res.text();
if (!res.ok || text.startsWith("<?xml")) {
  console.error(text.slice(0, 500));
  process.exit(1);
}

const out = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "lib",
  "data",
  "osm-ph-animal-shelters.json",
);
writeFileSync(out, text);
const data = JSON.parse(text);
console.log(`Wrote ${data.elements?.length ?? 0} elements to ${out}`);
