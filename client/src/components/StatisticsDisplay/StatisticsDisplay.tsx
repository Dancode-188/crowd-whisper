import React from 'react';
import { Zone, DensityData } from '../../types';

interface StatisticsDisplayProps {
  zones: Zone[];
  densityData: DensityData[];
}

const StatisticsDisplay: React.FC<StatisticsDisplayProps> = ({ zones, densityData }) => {
  const calculateAverageDensity = () => {
    if (densityData.length === 0) return 0;
    const sum = densityData.reduce((acc, curr) => acc + curr.value, 0);
    return Math.round((sum / densityData.length) * 10) / 10;
  };

  const findMostCrowdedZone = () => {
    if (densityData.length === 0) return null;
    const maxDensity = densityData.reduce((max, curr) => 
      curr.value > max.value ? curr : max
    , densityData[0]);
    return zones.find(zone => zone.id === maxDensity.zoneId);
  };

  const mostCrowdedZone = findMostCrowdedZone();

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">Statistics</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm text-blue-700 font-medium">Average Density</h3>
            <p className="text-2xl font-bold text-blue-900">{calculateAverageDensity()}%</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm text-blue-700 font-medium">Active Zones</h3>
            <p className="text-2xl font-bold text-blue-900">{zones.length}</p>
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-sm text-orange-700 font-medium">Most Crowded Zone</h3>
          {mostCrowdedZone ? (
            <>
              <p className="text-xl font-bold text-orange-900">{mostCrowdedZone.name}</p>
              <p className="text-sm text-orange-700">
                Density: {densityData.find(d => d.zoneId === mostCrowdedZone.id)?.value}%
              </p>
            </>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsDisplay;