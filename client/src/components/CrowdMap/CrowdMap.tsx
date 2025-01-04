import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Zone, DensityData } from '../../types';
import { GeoProjection } from 'd3-geo';

interface CrowdMapProps {
  zones: Zone[];
  densityData: DensityData[];
  isSimulationMode: boolean;
}

const CrowdMap: React.FC<CrowdMapProps> = ({ zones, densityData, isSimulationMode }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || zones.length === 0) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    
    // Clear previous content
    svg.selectAll('*').remove();

    // Set up dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Create color scale for density
    const colorScale = d3.scaleSequential()
      .domain([0, 100]) // density percentage
      .interpolator(d3.interpolateReds);

    // Convert zones to GeoJSON FeatureCollection
    const geoJsonData = {
      type: "FeatureCollection" as const,
      features: zones.map(zone => ({
        type: "Feature" as const,
        geometry: {
          type: "Polygon" as const,
          coordinates: zone.boundaries.coordinates
        },
        properties: {
          id: zone.id,
          name: zone.name
        }
      }))
    };

    // Create projection
    const projection: GeoProjection = d3.geoMercator()
      .fitSize([width, height], geoJsonData);

    const pathGenerator = d3.geoPath(projection);

    // Draw zones
    const g = svg.append('g');

    zones.forEach(zone => {
      const density = densityData.find(d => d.zoneId === zone.id)?.value || 0;
      
      const feature = {
        type: "Feature" as const,
        geometry: {
          type: "Polygon" as const,
          coordinates: zone.boundaries.coordinates
        },
        properties: {
          id: zone.id,
          name: zone.name
        }
      };
      
      g.append('path')
        .datum(feature)
        .attr('fill', colorScale(density))
        .attr('stroke', '#000')
        .attr('stroke-width', 1)
        .attr('d', pathGenerator)
        .on('mouseover', (event) => {
          d3.select(event.currentTarget)
            .attr('stroke-width', 2)
            .attr('stroke', '#666');
        })
        .on('mouseout', (event) => {
          d3.select(event.currentTarget)
            .attr('stroke-width', 1)
            .attr('stroke', '#000');
        });

      // Get centroid for label placement
      const centroid = pathGenerator.centroid(feature);
      
      g.append('text')
        .attr('x', centroid[0])
        .attr('y', centroid[1])
        .attr('text-anchor', 'middle')
        .attr('fill', density > 50 ? '#fff' : '#000')
        .text(zone.name);
    });

    // Add simulation controls if in simulation mode
    if (isSimulationMode) {
      const controls = svg.append('g')
        .attr('transform', `translate(${width - 100}, 20)`);
      
      controls.append('rect')
        .attr('width', 80)
        .attr('height', 30)
        .attr('rx', 5)
        .attr('fill', '#fff')
        .attr('stroke', '#000');

      controls.append('text')
        .attr('x', 40)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .text('Simulate');
    }
  }, [zones, densityData, isSimulationMode]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default CrowdMap;