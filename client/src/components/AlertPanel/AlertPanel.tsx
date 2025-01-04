import React from 'react';
import { Alert } from '../../types';

interface AlertPanelProps {
  alerts: Alert[];
  onAlertAcknowledge: (alertId: string) => void;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onAlertAcknowledge }) => {
  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 5: return 'bg-red-500';
      case 4: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 2: return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Active</span>;
      case 'acknowledged':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Acknowledged</span>;
      case 'resolved':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Resolved</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">Active Alerts</h2>
      <div className="space-y-4">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className="border rounded-lg p-4 relative"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} />
              <span className="font-semibold">{alert.type.toUpperCase()}</span>
              {getStatusBadge(alert.status)}
            </div>
            
            <p className="text-gray-700 mb-2">{alert.message}</p>
            
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
              <div className="space-x-2">
                {alert.status === 'active' && (
                  <button
                    onClick={() => onAlertAcknowledge(alert.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {alerts.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No active alerts
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertPanel;