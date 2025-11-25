import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MapNode, MapLink } from '../types';
import { KLANG_VALLEY_NODES, NETWORK_LINKS, getSimulatedTraffic } from '../constants';

interface SpatioMapProps {
  currentTime: number;
  onNodeSelect: (node: MapNode) => void;
  selectedNodeId: string | null;
}

const SpatioMap: React.FC<SpatioMapProps> = ({ currentTime, onNodeSelect, selectedNodeId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle Resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Main D3 Render Effect
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const { width, height } = dimensions;
    const padding = 50;

    // scales
    const xScale = d3.scaleLinear().domain([0, 100]).range([padding, width - padding]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([padding, height - padding]);

    // Retrieve theme colors
    const style = getComputedStyle(document.body);
    const primaryColor = style.getPropertyValue('--primary') || '#4f46e5';
    // We can't easily get the computed hex from oklch var() in JS without a converter in some browsers, 
    // so we will rely on CSS classes for fills/strokes where possible or fallback to standard colors if D3 requires explicit string interpolation.
    // However, D3 handles var() in attributes well for static props, but less so for transitions if interpolating.
    // For simple fills, we use standard hex/colors or assume modern browser support for interpolating vars if used in CSS strings.
    
    // Fallback constants for D3 interpolation if needed
    const TRAFFIC_COLOR = "var(--primary)";
    const NODE_FILL = "var(--card)";
    const NODE_STROKE = "var(--muted-foreground)";
    const NODE_SELECTED_STROKE = "var(--primary)";

    // --- 1. Draw Links (Lines) ---
    const linkGroup = svg.append("g").attr("class", "links");
    
    NETWORK_LINKS.forEach(link => {
      const sourceNode = KLANG_VALLEY_NODES.find(n => n.id === link.source);
      const targetNode = KLANG_VALLEY_NODES.find(n => n.id === link.target);

      if (sourceNode && targetNode) {
        linkGroup.append("line")
          .attr("x1", xScale(sourceNode.x))
          .attr("y1", yScale(sourceNode.y))
          .attr("x2", xScale(targetNode.x))
          .attr("y2", yScale(targetNode.y))
          .attr("stroke", link.color) // Keep semantic line colors
          .attr("stroke-width", 4)
          .attr("stroke-opacity", 0.4)
          .attr("stroke-linecap", "round");
      }
    });

    // --- 2. Animate Traffic (Agents) ---
    const trafficIntensity = getSimulatedTraffic(currentTime, 1.0) / 10;
    const particleCount = Math.floor(trafficIntensity * 5); 

    const particleGroup = svg.append("g").attr("class", "particles");

    NETWORK_LINKS.forEach((link) => {
        const sourceNode = KLANG_VALLEY_NODES.find(n => n.id === link.source);
        const targetNode = KLANG_VALLEY_NODES.find(n => n.id === link.target);
        
        if (!sourceNode || !targetNode) return;

        for(let j=0; j < particleCount; j++) {
            const duration = 2000 + Math.random() * 2000;
            const delay = Math.random() * 2000;

            const particle = particleGroup.append("circle")
                .attr("r", 3)
                .attr("fill", link.color) // Particles follow line color
                .attr("opacity", 0);

            const loop = () => {
                particle.transition()
                    .delay(delay)
                    .duration(duration)
                    .ease(d3.easeLinear)
                    .attrTween("transform", () => {
                        return (t) => {
                            const x = xScale(sourceNode.x) + (xScale(targetNode.x) - xScale(sourceNode.x)) * t;
                            const y = yScale(sourceNode.y) + (yScale(targetNode.y) - yScale(sourceNode.y)) * t;
                            return `translate(${x},${y})`;
                        };
                    })
                    .attrTween("opacity", () => {
                        return (t) => (t < 0.1 || t > 0.9 ? 0 : 1).toString();
                    })
                    .on("end", loop);
            };
            loop();
        }
    });


    // --- 3. Draw Nodes (Stations/Attractions) ---
    const nodeGroup = svg.append("g").attr("class", "nodes");

    const nodes = nodeGroup.selectAll("g")
      .data(KLANG_VALLEY_NODES)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${xScale(d.x)},${yScale(d.y)})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => onNodeSelect(d));

    nodes.each(function(d) {
        const g = d3.select(this);
        const currentPop = getSimulatedTraffic(currentTime, d.basePopularity);
        const radius = 8 + (currentPop / 5);
        const isSelected = d.id === selectedNodeId;

        // Outer glow
        g.append("circle")
            .attr("r", radius + 5)
            .attr("fill", isSelected ? NODE_SELECTED_STROKE : "var(--muted)")
            .attr("opacity", 0.3)
            .append("animate")
            .attr("attributeName", "r")
            .attr("values", `${radius};${radius + 8};${radius}`)
            .attr("dur", "2s")
            .attr("repeatCount", "indefinite");

        // Main node circle
        g.append("circle")
            .attr("r", radius)
            .attr("fill", NODE_FILL)
            .attr("stroke", isSelected ? NODE_SELECTED_STROKE : NODE_STROKE)
            .attr("stroke-width", isSelected ? 4 : 2);
        
        // Label Background
        g.append("rect")
            .attr("x", 12)
            .attr("y", -10)
            .attr("width", d.name.length * 7 + 10)
            .attr("height", 20)
            .attr("rx", 4)
            .attr("fill", "var(--card)")
            .attr("stroke", "var(--border)")
            .attr("stroke-width", 1);

        // Label Text
        g.append("text")
            .text(d.name)
            .attr("x", 17)
            .attr("y", 4)
            .attr("font-size", "11px")
            .attr("font-weight", "600")
            .attr("font-family", "DM Sans")
            .attr("fill", "var(--foreground)");
    });

  }, [dimensions, currentTime, selectedNodeId, onNodeSelect]);

  return (
    <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden relative">
      <div className="absolute top-4 left-4 bg-card/80 backdrop-blur px-3 py-1 rounded-md shadow border border-border text-xs text-muted-foreground font-mono z-10">
        SIMULATION_TIME: {currentTime.toString().padStart(2, '0')}:00
      </div>
      <svg ref={svgRef} width="100%" height="100%" className="touch-none" />
    </div>
  );
};

export default SpatioMap;