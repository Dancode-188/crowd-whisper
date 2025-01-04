import React from 'react';

interface ControlPanelProps {
  isSimulationMode: boolean;
  onToggleSimulation: () => void;
  isCollecting?: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isSimulationMode,
  onToggleSimulation,
  isCollecting = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">Control Panel</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Simulation Mode</span>
          <button
            onClick={onToggleSimulation}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isSimulationMode
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isSimulationMode ? 'Stop Simulation' : 'Start Simulation'}
          </button>
        </div>

        {/* Sensor Collection Status */}
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isCollecting ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-gray-600">
            {isCollecting ? 'Collecting sensor data' : 'Sensor data collection inactive'}
          </span>
        </div>

        {isSimulationMode && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Simulation Controls</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 transition-colors">
                Add Crowd
              </button>
              <button className="bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 transition-colors">
                Move Crowd
              </button>
              <button className="bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 transition-colors">
                Disperse
              </button>
              <button className="bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 transition-colors">
                Emergency
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;