import dynamic from "next/dynamic";

export const MapView = dynamic(
  () => import("@/components/map/map-view").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[200px] w-full animate-pulse items-center justify-center rounded-xl bg-sage/15 text-sm text-graphite/50">
        Loading map...
      </div>
    ),
  },
);
