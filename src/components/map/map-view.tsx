"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";
import { StateMessage } from "@/components/status/state-message";

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
  color?: string;
}

import { DEMO_GEO } from "@/lib/data/metro-manila-geo";

interface MapViewProps {
  center?: { latitude: number; longitude: number };
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  interactive?: boolean;
  onMarkerClick?: (id: string) => void;
  selectedMarkerId?: string;
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
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

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
      interactive,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    map.on("load", () => setLoading(false));
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

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markers.forEach((marker) => {
      const el = document.createElement("div");
      el.className = "map-marker";
      el.style.width = selectedMarkerId === marker.id ? "16px" : "12px";
      el.style.height = selectedMarkerId === marker.id ? "16px" : "12px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = marker.color ?? "#183C35";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
      el.style.cursor = onMarkerClick ? "pointer" : "default";

      if (onMarkerClick) {
        el.addEventListener("click", () => onMarkerClick(marker.id));
      }

      const m = new mapboxgl.Marker({ element: el })
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(mapRef.current!);

      if (marker.label) {
        m.setPopup(
          new mapboxgl.Popup({ offset: 12 }).setText(marker.label),
        );
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
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-bone/80">
          <StateMessage type="loading" message="Loading map..." />
        </div>
      )}
      <div ref={containerRef} className="h-full w-full min-h-[200px]" />
    </div>
  );
}
