import React, { useState, useEffect } from 'react';
import websocketService from '../../services/websocket';
import useSensorData from '../../hooks/useSensorData';
import { Alert, Zone, DensityData } from '../../types';
import CrowdMap from '../CrowdMap/CrowdMap.tsx';
import AlertPanel from '../AlertPanel/AlertPanel.tsx';
import StatisticsDisplay from '../StatisticsDisplay/StatisticsDisplay.tsx';
import ControlPanel from '../ControlPanel/ControlPanel.tsx';

const Dashboard: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [densityData, setDensityData] = useState<DensityData[]>([]);
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  // Load initial mock data
  const { isCollecting, startCollection, stopCollection, lastReading } = useSensorData();

  // Connect to WebSocket and load initial data
  useEffect(() => {
    websocketService.connect();

    // Subscribe to real-time updates
    websocketService.subscribe('density_update', (newDensityData: DensityData[]) => {
      setDensityData(newDensityData);
    });

    websocketService.subscribe('alert', (newAlert: Alert) => {
      setAlerts(prev => [...prev, newAlert]);
    });

    // Load initial mock data
    const loadMockData = () => {
      const mockZones: Zone[] = [
        {
          id: "zone1",
          name: "Main Stage",
          boundaries: {
            type: "Polygon",
            coordinates: [[[0,0], [0,10], [10,10], [10,0], [0,0]]]
          },
          currentDensity: 75,
          riskLevel: 3,
          maxCapacity: 1000
        },
        {
          id: "zone2",
          name: "Food Court",
          boundaries: {
            type: "Polygon",
            coordinates: [[[12,0], [12,10], [22,10], [22,0], [12,0]]]
          },
          currentDensity: 45,
          riskLevel: 1,
          maxCapacity: 500
        }
      ];

      const mockDensityData: DensityData[] = [
        {
          zoneId: "zone1",
          timestamp: new Date(),
          value: 75,
          trend: "increasing"
        },
        {
          zoneId: "zone2",
          timestamp: new Date(),
          value: 45,
          trend: "stable"
        }
      ];

      setZones(mockZones);
      setDensityData(mockDensityData);
    };

    loadMockData();

    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Send sensor data when available
  useEffect(() => {
    if (lastReading) {
      websocketService.sendSensorData(lastReading);
    }
  }, [lastReading]);

  const handleAlertAcknowledge = (alertId: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId
          ? { ...alert, status: 'acknowledged' }
          : alert
      )
    );
  };

  const toggleSimulationMode = () => {
    const newMode = !isSimulationMode;
    setIsSimulationMode(newMode);
    
    // Start/stop sensor data collection based on simulation mode
    if (newMode) {
      startCollection();
    } else {
      stopCollection();
    }
  };

  return (
    <div className="h-screen w-full bg-gray-100 p-4">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Main visualization area */}
        <div className="col-span-8 bg-white rounded-lg shadow-lg p-4">
          <CrowdMap
            zones={zones}
            densityData={densityData}
            isSimulationMode={isSimulationMode}
          />
        </div>

        {/* Right sidebar */}
        <div className="col-span-4 space-y-4">
          <AlertPanel
            alerts={alerts}
            onAlertAcknowledge={handleAlertAcknowledge}
          />
          <StatisticsDisplay
            zones={zones}
            densityData={densityData}
          />
          <ControlPanel
            isSimulationMode={isSimulationMode}
            onToggleSimulation={toggleSimulationMode}
            isCollecting={isCollecting}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;