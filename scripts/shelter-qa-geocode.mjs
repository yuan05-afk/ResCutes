/**
 * QA helper: geocode shelter addresses via Nominatim (1 req/sec).
 * Run: node scripts/shelter-qa-geocode.mjs
 */
const shelters = [
  ["PAWS PARC", "PAWS Animal Rehabilitation Center, Aurora Boulevard Katipunan Avenue, Quezon City, Philippines"],
  ["CARA", "175 Lopez Rizal Street Samat Street, Mandaluyong, Philippines"],
  ["Hound Haven", "353 Pinaglagarian Street Pulong Yantok, Angat, Bulacan, Philippines"],
  ["Pawssion SJDM", "1429 Paradise 1 Tungkong Mangga, San Jose del Monte, Bulacan, Philippines"],
  ["PART", "4611 Maulawin Street, Pagsanjan, Laguna, Philippines"],
  ["Lara's Ark", "585 Calbayog Street, Mandaluyong, Philippines"],
  ["MBY Morong", "113 Pantay Road Maybancal, Morong, Rizal, Philippines"],
  ["Happy Animals Club", "22 Rigodon Extension Lanzona Subdivision, Matina Aplaya, Davao City, Philippines"],
  ["AARRC", "Sunflower Road Andagao, Kalibo, Aklan, Philippines"],
  ["IRO", "Island Rescue Organization, Barangay Guba, Cebu City, Philippines"],
  ["MARO", "Mayari Animal Rescue Organization, Barangay Sapangdako, Guadalupe, Cebu City, Philippines"],
  ["AKF", "8 Purante Street Barangay Cubcub, Capas, Tarlac, Philippines"],
  ["PETA Asia", "Philippine Stock Exchange Centre West Tower, Ortigas, Pasig, Philippines"],
];

async function geocode(label, query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "ph");

  const res = await fetch(url, {
    headers: { "User-Agent": "ResCutes/1.0 shelter-qa" },
  });
  const data = await res.json();
  const hit = data[0];
  if (!hit) {
    console.log(`${label}: NO RESULT`);
    return;
  }
  console.log(
    `${label}: ${hit.lat}, ${hit.lon} | ${hit.display_name?.slice(0, 90)}`,
  );
}

for (const [label, query] of shelters) {
  await geocode(label, query);
  await new Promise((r) => setTimeout(r, 1100));
}
