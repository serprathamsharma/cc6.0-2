"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category?: string;
  status?: string;
  imageUrl?: string;
}

interface ImpactMapProps {
  points: MapPoint[];
  onSelectPoint?: (id: string) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

export function ImpactMap({
  points,
  onSelectPoint,
  className = "w-full h-[450px] rounded-2xl overflow-hidden border border-white/10",
  center = [78.9629, 20.5937], // Default centered on India
  zoom = 4.5,
}: ImpactMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Use OpenFreeMap vector tile style (free, fast, keyless)
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/positron",
      center,
      zoom,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: "© OpenFreeMap © OpenStreetMap contributors",
      }),
      "bottom-right"
    );

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Update markers when points change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    points.forEach((p) => {
      if (!p.lat || !p.lng) return;

      // Custom HTML Marker with pulse animation
      const el = document.createElement("div");
      el.className = "group cursor-pointer";
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-emerald-500/20 animate-ping"></div>
          <div class="relative w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-lg flex items-center justify-center text-white transition-transform group-hover:scale-125">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        </div>
      `;

      el.addEventListener("click", () => {
        onSelectPoint?.(p.id);
      });

      const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="padding: 6px; font-family: sans-serif; font-size: 12px; color: #0f172a;">
          <strong style="display:block; margin-bottom: 2px;">${p.title}</strong>
          <span style="color: #059669; font-weight: 600; font-size: 10px; text-transform: uppercase;">${p.status || "verified"}</span>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([p.lng, p.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [points, onSelectPoint]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
