"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  applyMarkerHidden,
  MAP_MARKER_FADE_MS,
  markerDataSignature,
  visibleMarkersBoundsSignature,
} from "@/components/map/map-marker-fade";
import { fitMapToMarkers, flyMapToCenter, MAP_CAMERA_FLY_MS } from "@/components/map/map-camera";

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
  legendLayerId?: string;
  address?: string;
  phone?: string;
  region?: string;
  notes?: string;
  capacityLabel?: string;
  sourceLabel?: string;
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
  interactiveLegend?: boolean;
  hiddenLegendLayers?: string[];
  onHiddenLegendLayersChange?: (layers: string[]) => void;
  animateCamera?: boolean;
  fitVisibleMarkers?: boolean;
  flyToSelectedMarker?: boolean;
  selectedMarkerZoom?: number;
  /** Increment to re-trigger fly even when selectedMarkerId is unchanged. */
  cameraRequestId?: number;
  pinSelectedPopup?: boolean;
}

type MarkerRegistryEntry = {
  marker: mapboxgl.Marker;
  element: HTMLElement;
  signature: string;
};

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

function resolveMarkerLayerId(marker: MapMarker): string {
  return (
    marker.legendLayerId ??
    (marker.urgencyLevel === "critical"
      ? "critical"
      : marker.urgencyLevel === "high"
        ? "high"
        : marker.urgencyLevel
          ? "standard"
          : "standard")
  );
}

function updateMarkerElement(
  element: HTMLElement,
  marker: MapMarker,
  selected: boolean,
  clickable: boolean,
) {
  const color = marker.color ?? markerColorForUrgency(marker.urgencyLevel);
  element.classList.toggle("rescutes-map-marker-shell--selected", selected);
  element.classList.toggle("rescutes-map-marker-shell--clickable", clickable);
  element.style.removeProperty("background");

  const fade = element.querySelector<HTMLElement>(".rescutes-map-marker-fade");
  if (fade) {
    fade.style.setProperty("--marker-color", color);
  }

  const layerId = resolveMarkerLayerId(marker);
  element.dataset.legendLayer = layerId;
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
  interactiveLegend = true,
  hiddenLegendLayers: controlledHiddenLayers,
  onHiddenLegendLayersChange,
  animateCamera = true,
  fitVisibleMarkers = true,
  flyToSelectedMarker = false,
  selectedMarkerZoom = 13,
  cameraRequestId = 0,
  pinSelectedPopup = false,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const registryRef = useRef<Map<string, MarkerRegistryEntry>>(new Map());
  const removalTimersRef = useRef<Map<string, number>>(new Map());
  const hiddenLegendLayersRef = useRef<Set<string>>(new Set());
  const onMarkerClickRef = useRef(onMarkerClick);
  const pinSelectedPopupRef = useRef(pinSelectedPopup);
  const selectedMarkerIdRef = useRef(selectedMarkerId);
  const markersRef = useRef(markers);
  const flyGenerationRef = useRef(0);
  const [mapError, setMapError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [internalHiddenLayers, setInternalHiddenLayers] = useState<Set<string>>(
    () => new Set(),
  );

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  onMarkerClickRef.current = onMarkerClick;
  pinSelectedPopupRef.current = pinSelectedPopup;
  selectedMarkerIdRef.current = selectedMarkerId;
  markersRef.current = markers;

  const hiddenLegendLayers = useMemo(
    () => new Set(controlledHiddenLayers ?? [...internalHiddenLayers]),
    [controlledHiddenLayers, internalHiddenLayers],
  );

  hiddenLegendLayersRef.current = hiddenLegendLayers;

  const legendItems = useMemo(() => {
    if (customLegendItems && customLegendItems.length > 0) {
      return customLegendItems;
    }
    const mode = resolveLegendMode(legend, markers.length);
    return resolveMapLegendItems(markers, mode);
  }, [customLegendItems, legend, markers]);

  const markerOverlaySignature = useMemo(
    () => markers.map((marker) => markerDataSignature(marker)).sort().join("|"),
    [markers],
  );

  const visibleBoundsSignature = useMemo(
    () => visibleMarkersBoundsSignature(markers, hiddenLegendLayers),
    [markers, hiddenLegendLayers],
  );

  const toggleLegendLayer = useCallback(
    (layerId: string) => {
      const next = new Set(hiddenLegendLayersRef.current);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }

      if (onHiddenLegendLayersChange) {
        onHiddenLegendLayersChange([...next]);
      } else {
        setInternalHiddenLayers(next);
      }
    },
    [onHiddenLegendLayersChange],
  );

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
      for (const timer of removalTimersRef.current.values()) {
        window.clearTimeout(timer);
      }
      removalTimersRef.current.clear();
      registryRef.current.forEach((entry) => entry.marker.remove());
      registryRef.current.clear();
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
    const map = mapRef.current;
    if (!map || loading) return;

    const registry = registryRef.current;
    const nextIds = new Set(markers.map((marker) => marker.id));
    const clickable = Boolean(onMarkerClickRef.current);

    for (const [id, entry] of [...registry.entries()]) {
      if (nextIds.has(id)) continue;

      const existingTimer = removalTimersRef.current.get(id);
      if (existingTimer) window.clearTimeout(existingTimer);

      applyMarkerHidden(entry.element, true, true);
      const timer = window.setTimeout(() => {
        entry.marker.remove();
        registry.delete(id);
        removalTimersRef.current.delete(id);
      }, MAP_MARKER_FADE_MS);
      removalTimersRef.current.set(id, timer);
    }

    for (const marker of markers) {
      const signature = markerDataSignature(marker);
      const selected = selectedMarkerId === marker.id;
      const color = marker.color ?? markerColorForUrgency(marker.urgencyLevel);
      const layerId = resolveMarkerLayerId(marker);
      const hidden = hiddenLegendLayersRef.current.has(layerId);
      const existing = registry.get(marker.id);

      if (existing) {
        const pendingRemoval = removalTimersRef.current.get(marker.id);
        if (pendingRemoval) {
          window.clearTimeout(pendingRemoval);
          removalTimersRef.current.delete(marker.id);
        }

        if (existing.signature !== signature) {
          existing.marker.setLngLat([marker.longitude, marker.latitude]);
          updateMarkerElement(existing.element, marker, selected, clickable);
          existing.signature = signature;
        } else {
          updateMarkerElement(existing.element, marker, selected, clickable);
        }

        applyMarkerHidden(existing.element, hidden, true);
        continue;
      }

      const el = createMapMarkerElement({
        color,
        selected,
        clickable,
        label: marker.label,
        legendLayerId: layerId,
      });

      if (clickable) {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          if (el.classList.contains("rescutes-map-marker--off")) return;
          onMarkerClickRef.current?.(marker.id);
        });
      }

      const mapMarker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(map);

      if (hasMapPopupContent(marker)) {
        const popup = new mapboxgl.Popup({
          offset: 14,
          closeButton: false,
          className: "rescutes-map-popup",
        }).setHTML(buildMapPopupHtml(marker));
        mapMarker.setPopup(popup);

        el.addEventListener("mouseenter", () => {
          if (el.classList.contains("rescutes-map-marker--off")) return;
          if (
            pinSelectedPopupRef.current &&
            selectedMarkerIdRef.current === marker.id
          ) {
            return;
          }
          popup.addTo(map);
        });
        el.addEventListener("mouseleave", () => {
          if (
            pinSelectedPopupRef.current &&
            selectedMarkerIdRef.current === marker.id
          ) {
            return;
          }
          popup.remove();
        });
      }

      applyMarkerHidden(el, true, false);
      requestAnimationFrame(() => {
        applyMarkerHidden(el, hidden, true);
      });

      registry.set(marker.id, {
        marker: mapMarker,
        element: el,
        signature,
      });
    }
  }, [markerOverlaySignature, selectedMarkerId, loading]);

  useEffect(() => {
    for (const entry of registryRef.current.values()) {
      const layerId = entry.element.dataset.legendLayer;
      if (!layerId) continue;
      applyMarkerHidden(
        entry.element,
        hiddenLegendLayers.has(layerId),
        true,
      );
    }
  }, [hiddenLegendLayers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading || !animateCamera) return;

    const runCamera = () => {
      const visible = markers.filter((marker) => {
        const layerId = resolveMarkerLayerId(marker);
        return !hiddenLegendLayers.has(layerId);
      });

      if (fitVisibleMarkers && visible.length > 0) {
        fitMapToMarkers(map, visible);
        return;
      }

      flyMapToCenter(map, center, zoom);
    };

    if (map.isStyleLoaded()) {
      runCamera();
      return;
    }

    map.once("load", runCamera);
  }, [
    visibleBoundsSignature,
    center.latitude,
    center.longitude,
    zoom,
    animateCamera,
    fitVisibleMarkers,
    loading,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading || !animateCamera || !flyToSelectedMarker || !selectedMarkerId) {
      return;
    }

    const marker = markersRef.current.find((item) => item.id === selectedMarkerId);
    if (!marker) return;

    // Generation supersedes older flights. Do NOT cancelAnimationFrame on cleanup -
    // that was the root cause of "map stuck on previous shelter" during rapid clicks:
    // cleanup cancelled the newest pending fly before it ran.
    const generation = ++flyGenerationRef.current;
    const target = {
      latitude: marker.latitude,
      longitude: marker.longitude,
    };

    const fly = () => {
      if (generation !== flyGenerationRef.current) return;
      const liveMap = mapRef.current;
      if (!liveMap || !liveMap.isStyleLoaded()) return;
      // resize() can leave the camera transform briefly invalid; flying in the
      // same turn caused Mapbox: Cannot read properties of undefined (reading 'x').
      try {
        liveMap.resize();
      } catch {
        return;
      }
      window.requestAnimationFrame(() => {
        if (generation !== flyGenerationRef.current) return;
        const mapAfterResize = mapRef.current;
        if (!mapAfterResize || !mapAfterResize.isStyleLoaded()) return;
        flyMapToCenter(mapAfterResize, target, selectedMarkerZoom);
      });
    };

    if (map.isStyleLoaded()) {
      // Immediate schedule so the latest click always wins.
      fly();
      return;
    }

    map.once("load", fly);
    return () => {
      map.off("load", fly);
    };
  }, [
    selectedMarkerId,
    cameraRequestId,
    flyToSelectedMarker,
    selectedMarkerZoom,
    animateCamera,
    loading,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading || !pinSelectedPopup) return;

    function syncPinnedPopups() {
      for (const [id, entry] of registryRef.current.entries()) {
        const popup = entry.marker.getPopup();
        if (!popup) continue;

        if (selectedMarkerId === id) {
          if (!popup.isOpen()) popup.addTo(map);
        } else {
          popup.remove();
        }
      }
    }

    if (flyToSelectedMarker && selectedMarkerId) {
      let applied = false;
      const applyOnce = () => {
        if (applied) return;
        applied = true;
        syncPinnedPopups();
      };

      map.once("moveend", applyOnce);
      const timer = window.setTimeout(applyOnce, MAP_CAMERA_FLY_MS + 80);

      return () => {
        map.off("moveend", applyOnce);
        window.clearTimeout(timer);
      };
    }

    syncPinnedPopups();
  }, [
    selectedMarkerId,
    pinSelectedPopup,
    flyToSelectedMarker,
    loading,
    markerOverlaySignature,
  ]);

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

  const legendIsInteractive = interactiveLegend && legendItems.length > 1;

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
        <MapLegend
          items={legendItems}
          compact={compactLegend}
          interactive={legendIsInteractive}
          hiddenLayerIds={hiddenLegendLayers}
          onToggleLayer={toggleLegendLayer}
        />
      ) : null}
    </div>
  );
}
