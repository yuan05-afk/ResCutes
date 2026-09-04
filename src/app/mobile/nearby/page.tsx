import { redirect } from "next/navigation";

/** Nearby is merged into the Home map. */
export default function NearbyRedirectPage() {
  redirect("/mobile");
}
