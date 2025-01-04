import { SensorData, Zone, DensityData } from '../types/index.js';
import { Alert } from '../models/Alert.js';

export class DensityService {
  private static readonly DENSITY_THRESHOLD_HIGH = 80; // 80% capacity
  private static readonly DENSITY_THRESHOLD_CRITICAL = 90; // 90% capacity
  
  // Cache of recent sensor readings for density calculations
  private sensorReadings: Map<string, SensorData[]> = new Map();
  // Cache of previous density readings for trend analysis 
  private previousDensities: Map<string, number[]> = new Map();

  constructor() {
    // Clear old readings every minute
    setInterval(() => this.cleanupOldReadings(), 60000);
  }

  private cleanupOldReadings() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);
    
    for (const [zoneId, readings] of this.sensorReadings.entries()) {
      this.sensorReadings.set(
        zoneId,
        readings.filter(reading => new Date(reading.timestamp) > fiveMinutesAgo)
      );
    }
  }

  async processReading(sensorData: SensorData, zones: Zone[]): Promise<DensityData[]> {
    // Find which zone this reading belongs to
    const zone = this.findZoneForReading(sensorData, zones);
    if (!zone) return [];

    // Store the reading
    if (!this.sensorReadings.has(zone.id)) {
      this.sensorReadings.set(zone.id, []);
    }
    this.sensorReadings.get(zone.id)?.push(sensorData);

    // Calculate new density for the zone
    const densityData = await this.calculateZoneDensity(zone);
    
    // Check if we need to generate alerts
    await this.checkDensityAlerts(densityData, zone);

    return [densityData];
  }

  private findZoneForReading(reading: SensorData, zones: Zone[]): Zone | null {
    return zones.find(zone => this.isPointInPolygon(
      [reading.location.lng, reading.location.lat],
      zone.boundaries.coordinates[0]
    )) || null;
  }

  private isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];

      const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }

  private async calculateZoneDensity(zone: Zone): Promise<DensityData> {
    const readings = this.sensorReadings.get(zone.id) || [];
    
    // Calculate density based on number of unique devices in the last 5 minutes
    const uniqueDevices = new Set(readings.map(r => r.deviceId)).size;
    const density = (uniqueDevices / zone.maxCapacity) * 100;

    // Calculate trend
    if (!this.previousDensities.has(zone.id)) {
      this.previousDensities.set(zone.id, []);
    }
    
    const previousDensities = this.previousDensities.get(zone.id)!;
    previousDensities.push(density);
    if (previousDensities.length > 10) previousDensities.shift();

    const trend = this.calculateTrend(previousDensities);

    return {
      zoneId: zone.id,
      timestamp: new Date(),
      value: Math.round(density * 10) / 10,
      trend
    };
  }

  private calculateTrend(densities: number[]): "increasing" | "decreasing" | "stable" {
    if (densities.length < 2) return "stable";
    
    const recentAvg = densities.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const previousAvg = densities.slice(0, -3).reduce((a, b) => a + b, 0) / (densities.length - 3);
    
    const difference = recentAvg - previousAvg;
    if (difference > 5) return "increasing";
    if (difference < -5) return "decreasing";
    return "stable";
  }

  private async checkDensityAlerts(densityData: DensityData, zone: Zone) {
    if (densityData.value >= DensityService.DENSITY_THRESHOLD_CRITICAL) {
      await Alert.create({
        type: 'density',
        severity: 5,
        affectedZones: [zone.id],
        message: `Critical density level (${densityData.value}%) in ${zone.name}!`
      });
    } else if (densityData.value >= DensityService.DENSITY_THRESHOLD_HIGH) {
      await Alert.create({
        type: 'density',
        severity: 3,
        affectedZones: [zone.id],
        message: `High density level (${densityData.value}%) in ${zone.name}.`
      });
    }
  }
}

export const densityService = new DensityService();
export default densityService;