import { useState, useEffect } from 'react';
import { SensorData } from '../types';

interface SensorDataHookResult {
  isCollecting: boolean;
  startCollection: () => void;
  stopCollection: () => void;
  lastReading: SensorData | null;
}

export const useSensorData = (): SensorDataHookResult => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [lastReading, setLastReading] = useState<SensorData | null>(null);

  useEffect(() => {
    let watchId: number | null = null;

    const collectSensorData = async () => {
      if (!isCollecting) return;

      // Get geolocation data
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const sensorData: SensorData = {
              deviceId: 'browser-' + crypto.randomUUID(),
              timestamp: new Date(),
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            };

            // Add motion data if available
            if ('DeviceMotionEvent' in window) {
              window.addEventListener('devicemotion', (event) => {
                if (event.acceleration) {
                  sensorData.motion = {
                    acceleration: {
                      x: event.acceleration.x || 0,
                      y: event.acceleration.y || 0,
                      z: event.acceleration.z || 0
                    }
                  };
                }
              });
            }

            setLastReading(sensorData);
          },
          (error) => {
            console.error('Error getting location:', error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 5000
          }
        );
      }
    };

    if (isCollecting) {
      collectSensorData();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isCollecting]);

  const startCollection = () => setIsCollecting(true);
  const stopCollection = () => setIsCollecting(false);

  return {
    isCollecting,
    startCollection,
    stopCollection,
    lastReading
  };
};

export default useSensorData;