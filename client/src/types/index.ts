export interface Zone {
    id: string;
    name: string;
    boundaries: {
      type: "Polygon";
      coordinates: [number, number][][];  // Position[][] for GeoJSON compatibility
    };
    currentDensity: number;
    riskLevel: number;
    maxCapacity: number;
}
  
export interface Alert {
    id: string;
    type: "density" | "movement" | "sound" | "emergency";
    severity: 1 | 2 | 3 | 4 | 5; // 1 lowest, 5 highest
    affectedZones: string[];
    timestamp: Date;
    status: "active" | "resolved" | "acknowledged";
    message: string;
}
  
export interface SensorData {
    deviceId: string;
    timestamp: Date;
    location: {
      lat: number;
      lng: number;
    };
    motion?: {
      acceleration: {
        x: number;
        y: number;
        z: number;
      };
    };
    audio?: {
      level: number;
    };
}
  
export interface DensityData {
    zoneId: string;
    timestamp: Date;
    value: number;
    trend: "increasing" | "decreasing" | "stable";
}