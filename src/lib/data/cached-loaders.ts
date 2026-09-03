import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  getDashboardMetrics,
  getCases,
  getAnimals,
  getShelters,
  getRescuers,
  getNotificationsForUser,
  getAdministratorMobileCases,
} from "@/lib/data/service";
import { dashboardTag } from "@/lib/cache-revalidate";

export const getDashboardMetricsCached = cache(function getDashboardMetricsCached() {
  return unstable_cache(
    async () => getDashboardMetrics(),
    ["dashboard-metrics"],
    { revalidate: 120, tags: ["dashboard-metrics"] },
  )();
});

export const getDashboardMapCasesCached = cache(function getDashboardMapCasesCached() {
  return unstable_cache(
    async () => {
      const cases = await getCases({ sortBy: "urgency" });
      return cases
        .filter(
          (c) =>
            !["completed", "rejected", "duplicate", "cancelled"].includes(c.status),
        )
        .slice(0, 10);
    },
    ["dashboard-map-cases-v2"],
    { revalidate: 120, tags: ["dashboard-metrics", "rescue-cases"] },
  )();
});

export const getRescueCasesListCached = cache(function getRescueCasesListCached(
  filtersKey: string,
) {
  return unstable_cache(
    async () => {
      const filters = JSON.parse(filtersKey) as {
        status?: string;
        urgencyLevel?: string;
        rescuerId?: string;
        shelterId?: string;
        search?: string;
        sortBy?: "urgency" | "waiting" | "date";
      };
      return getCases(filters);
    },
    ["rescue-cases-list-v2", filtersKey],
    { revalidate: 60, tags: ["dashboard-metrics", "rescue-cases"] },
  )();
});

export const getAnimalsListCached = cache(function getAnimalsListCached() {
  return unstable_cache(
    async () => getAnimals(),
    ["animals-list-v2"],
    { revalidate: 120, tags: ["animals"] },
  )();
});

export const getSheltersCached = cache(function getSheltersCached() {
  return unstable_cache(
    async () => getShelters(),
    ["shelters-list"],
    { revalidate: 300, tags: ["shelters"] },
  )();
});

export const getRescuersCached = cache(function getRescuersCached() {
  return unstable_cache(
    async () => getRescuers(),
    ["rescuers-list"],
    { revalidate: 300, tags: ["rescuers"] },
  )();
});

export function getMobileHomeDataCached(
  userId: string,
  options: { isRescuer: boolean; isAdministrator?: boolean },
) {
  return unstable_cache(
    async () => {
      const [notifications, myCases] = await Promise.all([
        getNotificationsForUser(userId),
        options.isAdministrator
          ? getAdministratorMobileCases()
          : options.isRescuer
            ? getCases({ rescuerId: userId })
            : getCases({ reporterId: userId }),
      ]);
      return { notifications, myCases };
    },
    ["mobile-home", userId, String(options.isRescuer), String(options.isAdministrator)],
    { revalidate: 60, tags: [dashboardTag(userId), `mobile:${userId}`] },
  )();
}

export function getMobileCasesListCached(
  userId: string,
  options: { isRescuer: boolean; isAdministrator?: boolean },
) {
  return unstable_cache(
    async () =>
      options.isAdministrator
        ? getAdministratorMobileCases()
        : options.isRescuer
          ? getCases({ rescuerId: userId })
          : getCases({ reporterId: userId }),
    ["mobile-cases", userId, String(options.isRescuer), String(options.isAdministrator)],
    { revalidate: 60, tags: [dashboardTag(userId), `mobile:${userId}`] },
  )();
}
