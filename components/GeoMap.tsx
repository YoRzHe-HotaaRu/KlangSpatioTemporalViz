import React, { useEffect, useRef } from 'react';
import { MapNode, MapLink } from '../types';
import { KLANG_VALLEY_NODES, NETWORK_LINKS, getSimulatedTraffic } from '../constants';

// Declare L for the global Leaflet instance
declare const L: any;

interface GeoMapProps {
  currentTime: number;
  onNodeSelect: (node: MapNode) => void;
  selectedNodeId: string | null;
}

const GeoMap: React.FC<GeoMapProps> = ({ currentTime, onNodeSelect, selectedNodeId }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const polylineLayerRef = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [3.14, 101.69],
        zoom: 11,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and Lines
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // --- 1. Draw Network Links ---
    if (polylineLayerRef.current) {
        map.removeLayer(polylineLayerRef.current);
    }
    const lines: any[] = [];
    NETWORK_LINKS.forEach(link => {
        const source = KLANG_VALLEY_NODES.find(n => n.id === link.source);
        const target = KLANG_VALLEY_NODES.find(n => n.id === link.target);
        if (source && target) {
            lines.push(
                L.polyline([[source.lat, source.lng], [target.lat, target.lng]], {
                    color: link.color,
                    weight: 3,
                    opacity: 0.6,
                    lineCap: 'round'
                })
            );
        }
    });
    polylineLayerRef.current = L.layerGroup(lines).addTo(map);

    // --- 2. Draw/Update Node Markers ---
    KLANG_VALLEY_NODES.forEach(node => {
        const traffic = getSimulatedTraffic(currentTime, node.basePopularity);
        const size = 12 + (traffic / 5); 
        const isSelected = selectedNodeId === node.id;
        
        // Use CSS variables for colors in the HTML string
        // Note: Inline styles need specific color values or vars that resolve in the context of the page.
        // var(--primary) works perfectly here.
        const iconHtml = `
            <div style="
                width: ${size}px; 
                height: ${size}px; 
                background-color: ${isSelected ? 'var(--primary)' : 'var(--card)'}; 
                border: ${isSelected ? '3px solid var(--card)' : '2px solid var(--muted-foreground)'};
                border-radius: 50%;
                box-shadow: var(--shadow-md);
                position: relative;
                transition: all 0.3s ease;
            ">
                ${isSelected ? '<div class="absolute -inset-2 rounded-full border-2 border-primary animate-ping opacity-75"></div>' : ''}
            </div>
        `;

        const icon = L.divIcon({
            html: iconHtml,
            className: 'custom-leaflet-icon',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });

        if (markersRef.current[node.id]) {
            markersRef.current[node.id].setIcon(icon);
            markersRef.current[node.id].setZIndexOffset(isSelected ? 1000 : 0);
        } else {
            const marker = L.marker([node.lat, node.lng], { icon, title: node.name })
                .addTo(map)
                .on('click', () => onNodeSelect(node));
            
            marker.bindTooltip(`
                <div class="font-sans font-semibold text-foreground text-xs">${node.name}</div>
            `, { 
                direction: 'top', 
                offset: [0, -10], 
                opacity: 0.9,
                className: 'custom-tooltip' 
            });

            markersRef.current[node.id] = marker;
        }
    });

  }, [currentTime, selectedNodeId, onNodeSelect]);

  return (
    <div className="w-full h-full relative">
       <div ref={mapContainerRef} className="w-full h-full bg-muted/20 z-0" />
       <div className="absolute top-4 left-4 bg-card/90 backdrop-blur px-3 py-1 rounded-md shadow border border-border text-xs text-muted-foreground font-mono z-[500] pointer-events-none">
            GEOSPATIAL VIEW
       </div>
    </div>
  );
};

export default GeoMap;