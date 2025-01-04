import { Zone } from '../types/index.js';
import { IZoneDocument } from '../models/Zone.js';

export const transformZoneDocument = (zoneDoc: IZoneDocument): Zone => {
  // Ensure coordinates are in the correct format
  const coordinates = zoneDoc.boundaries.coordinates.map(polygon =>
    polygon.map(point => [point[0], point[1]] as [number, number])
  );

  return {
    id: zoneDoc._id.toString(),
    name: zoneDoc.name,
    boundaries: {
      type: "Polygon",
      coordinates: coordinates
    },
    currentDensity: zoneDoc.currentDensity,
    riskLevel: zoneDoc.riskLevel,
    maxCapacity: zoneDoc.maxCapacity
  };
};