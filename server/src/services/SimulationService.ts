import { SensorData } from '../types/index.js';
import { IZoneDocument } from '../models/Zone.js';

interface SimulationConfig {
  deviceCount: number;
  updateInterval: number; // in milliseconds
  movementSpeed: number; // in meters per second
}

export class SimulationService {
  private isRunning: boolean = false;
  private simulatedDevices: Map<string, { lat: number; lng: number }> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private zones: IZoneDocument[] = [];
  private config: SimulationConfig = {
    deviceCount: 100,
    updateInterval: 1000,
    movementSpeed: 1.5
  };

  constructor(config?: Partial<SimulationConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  start(zones: IZoneDocument[], onUpdate: (data: SensorData) => void) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.zones = zones;

    // Initialize simulated devices
    this.initializeDevices();

    // Start update loop
    this.updateInterval = setInterval(() => {
      this.updateDevicePositions(onUpdate);
    }, this.config.updateInterval);
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.simulatedDevices.clear();
  }

  private initializeDevices() {
    // Clear existing devices
    this.simulatedDevices.clear();

    // Create new devices with random positions within zones
    for (let i = 0; i < this.config.deviceCount; i++) {
      const deviceId = `sim-device-${i}`;
      const randomZone = this.zones[Math.floor(Math.random() * this.zones.length)];
      const position = this.getRandomPositionInZone(randomZone);
      this.simulatedDevices.set(deviceId, position);
    }
  }

  private updateDevicePositions(onUpdate: (data: SensorData) => void) {
    this.simulatedDevices.forEach((position, deviceId) => {
      // Add some random movement
      const newPosition = this.calculateNewPosition(position);
      this.simulatedDevices.set(deviceId, newPosition);

      // Generate sensor data
      const sensorData: SensorData = {
        deviceId,
        timestamp: new Date(),
        location: {
          lat: newPosition.lat,
          lng: newPosition.lng
        },
        motion: {
          acceleration: {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
            z: Math.random() * 2 - 1
          }
        }
      };

      // Send update
      onUpdate(sensorData);
    });
  }

  private calculateNewPosition(currentPos: { lat: number; lng: number }) {
    // Add random movement within reasonable bounds
    const latChange = (Math.random() - 0.5) * 0.0001 * this.config.movementSpeed;
    const lngChange = (Math.random() - 0.5) * 0.0001 * this.config.movementSpeed;

    return {
      lat: currentPos.lat + latChange,
      lng: currentPos.lng + lngChange
    };
  }

  private getRandomPositionInZone(zone: IZoneDocument) {
    // Get zone boundaries
    const coordinates = zone.boundaries.coordinates[0]; // First polygon
    
    // Calculate bounds
    const lats = coordinates.map(coord => coord[1]);
    const lngs = coordinates.map(coord => coord[0]);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Generate random position within bounds
    return {
      lat: minLat + Math.random() * (maxLat - minLat),
      lng: minLng + Math.random() * (maxLng - minLng)
    };
  }

  // Methods to manipulate crowd behavior
  addCrowd(zoneId: string, count: number) {
    const zone = this.zones.find(z => z._id.toString() === zoneId);
    if (!zone) return;

    for (let i = 0; i < count; i++) {
      const deviceId = `sim-device-${this.simulatedDevices.size}`;
      const position = this.getRandomPositionInZone(zone);
      this.simulatedDevices.set(deviceId, position);
    }
  }

  removeCrowd(zoneId: string, count: number) {
    const devicesInZone = Array.from(this.simulatedDevices.keys())
      .slice(0, count);
    
    devicesInZone.forEach(deviceId => {
      this.simulatedDevices.delete(deviceId);
    });
  }

  triggerEmergency(zoneId: string) {
    // Implement emergency behavior - rapid movement away from a point
    // This will be called from the control panel
  }
}

export const simulationService = new SimulationService();
export default simulationService;