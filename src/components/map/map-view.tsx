"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";
import { StateMessage } from "@/components/status/state-message";
import { createMapMarkerElement } from "@/components/map/create-map-marker";
import { MapLegend } from "@/components/map/map-legend";
import {
  buildMapPopupHtml,
  hasMapPopupContent,
} from "@/components/map/map-popup";
import {
  markerColorForUrgency,
  resolveMapLegendItems,
  type MapLegendItem,
} from "@/components/map/map-constants";

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
  caseNumber?: string;
  species?: string;
  status?: string;
  color?: string;
  urgencyLevel?: string;
}

import { DEMO_GEO } from "@/lib/data/metro-manila-geo";

type MapLegendMode = "urgency" | "single" | "none" | "auto";

interface MapViewProps {
  center?: { latitude: number; longitude: number };
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  interactive?: boolean;
  onMarkerClick?: (id: string) => void;
  selectedMarkerId?: string;
  legend?: MapLegendMode;
  legendItems?: MapLegendItem[];
  compactLegend?: boolean;
}

function setMapInteractivity(map: mapboxgl.Map, enabled: boolean) {
  const toggle = enabled ? "enable" : "disable";
  map.scrollZoom[toggle]();
  map.dragPan[toggle]();
  map.dragRotate[toggle]();
  map.touchZoomRotate[toggle]();
  map.doubleClickZoom[toggle]();
  map.boxZoom[toggle]();
  map.keyboard[toggle]();
}

function stripOptionalMapLinks(container: HTMLElement) {
  container
    .querySelectorAll('a.mapbox-improve-map, a[href*="openstreetmap.org/fixthemap"]')
    .forEach((el) => el.remove());
}

function resolveLegendMode(
  mode: MapLegendMode,
  markerCount: number,
): "urgency" | "single" | "none" {
  if (mode === "auto") {
    if (markerCount === 0) return "none";
    if (markerCount === 1) return "single";
    return "urgency";
  }
  return mode;
}

export function MapView({
  center = {
    latitude: DEMO_GEO.center.latitude,
    longitude: DEMO_GEO.center.longitude,
  },
  zoom = 11,
  markers = [],
  className,
  interactive = true,
  onMarkerClick,
  selectedMarkerId,
  legend = "auto",
  legendItems: customLegendItems,
  compactLegend = false,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const legendItems = useMemo(() => {
    if (customLegendItems && customLegendItems.length > 0) {
      return customLegendItems;
    }
    const mode = resolveLegendMode(legend, markers.length);
    return resolveMapLegendItems(markers, mode);
  }, [customLegendItems, legend, markers]);

  useEffect(() => {
    if (!containerRef.current || !token) {
      setLoading(false);
      if (!token) setMapError("Mapbox token not configured");
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [center.longitude, center.latitude],
      zoom,
      interactive: true,
      attributionControl: false,
      logoPosition: "bottom-left",
    });

    setMapInteractivity(map, interactive);

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-right",
    );
    mapRef.current = map;

    map.on("load", () => {
      setLoading(false);
      if (containerRef.current) stripOptionalMapLinks(containerRef.current);
    });
    map.on("styledata", () => {
      if (containerRef.current) stripOptionalMapLinks(containerRef.current);
    });
    map.on("error", () => {
      setMapError("Failed to load map");
      setLoading(false);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapRef.current) return;
    setMapInteractivity(mapRef.current, interactive);
  }, [interactive]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !interactive) return;

    const stopBubble = (e: Event) => e.stopPropagation();
    el.addEventListener("wheel", stopBubble, { passive: true });
    el.addEventListener("touchmove", stopBubble, { passive: true });

    return () => {
      el.removeEventListener("wheel", stopBubble);
      el.removeEventListener("touchmove", stopBubble);
    };
  }, [interactive, loading]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markers.forEach((marker) => {
      const color =
        marker.color ?? markerColorForUrgency(marker.urgencyLevel);
      const selected = selectedMarkerId === marker.id;
      const clickable = Boolean(onMarkerClick);

      const el = createMapMarkerElement({
        color,
        selected,
        clickable,
        label: marker.label,
      });

      if (clickable) {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onMarkerClick!(marker.id);
        });
      }

      const m = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(mapRef.current!);

      if (hasMapPopupContent(marker)) {
        const popup = new mapboxgl.Popup({
          offset: 14,
          closeButton: false,
          className: "rescutes-map-popup",
        }).setHTML(buildMapPopupHtml(marker));
        m.setPopup(popup);

        el.addEventListener("mouseenter", () => {
          if (!mapRef.current) return;
          popup.addTo(mapRef.current);
        });
        el.addEventListener("mouseleave", () => popup.remove());
      }

      markersRef.current.push(m);
    });
  }, [markers, selectedMarkerId, onMarkerClick]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter([center.longitude, center.latitude]);
  }, [center.latitude, center.longitude]);

  if (!token || mapError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-bone rounded-lg border border-sage/30",
          className,
        )}
      >
        <StateMessage
          type="error"
          title="Map unavailable"
          message={
            mapError ??
            "Set NEXT_PUBLIC_MAPBOX_TOKEN in your environment to enable maps."
          }
        />
      </div>
    );
  }

  return (
    <div className={cn("rescutes-map relative overflow-hidden rounded-lg", className)}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-bone/80">
          <StateMessage type="loading" message="Loading map..." />
        </div>
      )}
      <div
        ref={containerRef}
        className={cn(
          "h-full w-full min-h-[200px]",
          interactive && "touch-none cursor-grab active:cursor-grabbing",
        )}
      />
      {!loading && legendItems.length > 0 ? (
        <MapLegend items={legendItems} compact={compactLegend} />
      ) : null}
    </div>
  );
}
