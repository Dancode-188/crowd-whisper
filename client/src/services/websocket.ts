import { io, Socket } from 'socket.io-client';
import { SensorData, Alert } from '../types';

const SOCKET_URL = 'http://localhost:3000';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    if (this.socket) return;

    this.socket = io(SOCKET_URL);

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    // Set up event listeners
    this.socket.on('density_update', (data) => {
      this.notify('density_update', data);
    });

    this.socket.on('alert', (alert: Alert) => {
      this.notify('alert', alert);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendSensorData(data: SensorData) {
    if (!this.socket) return;
    this.socket.emit('sensor_data', data);
  }

  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  unsubscribe(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private notify(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
}

export const websocketService = new WebSocketService();
export default websocketService;