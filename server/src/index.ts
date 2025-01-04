import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Zone, IZoneDocument } from './models/Zone.js';
import { Alert } from './models/Alert.js';
import { densityService } from './services/DensityService.js';
import { simulationService } from './services/SimulationService.js';
import { SensorData } from './types/index.js';
import { transformZoneDocument } from './utils/transformers.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crowd-whisper')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// WebSocket Connection Handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle sensor data
  socket.on('sensor_data', async (data: SensorData) => {
    try {
      const mongooseZones = await Zone.find();
      // Transform Mongoose documents to Zone interface
      const zones = mongooseZones.map(transformZoneDocument);
      const densityData = await densityService.processReading(data, zones);
      
      if (densityData.length > 0) {
        // Broadcast density updates to all clients
        io.emit('density_update', densityData);
      }
    } catch (error) {
      console.error('Error processing sensor data:', error);
    }
    });

  socket.on('disconnect', () => {
    simulationService.stop(); // Stop simulation when client disconnects
    console.log('Client disconnected:', socket.id);
  });

  // Handle alert acknowledgments
  socket.on('acknowledge_alert', async (alertId: string) => {
    try {
      const updatedAlert = await Alert.findByIdAndUpdate(
        alertId,
        { status: 'acknowledged' },
        { new: true }
      );
      if (updatedAlert) {
        io.emit('alert_updated', { id: updatedAlert._id.toString(), status: 'acknowledged' });
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  });

  socket.on('start_simulation', async () => {
    try {
      const zones = await Zone.find();
      simulationService.start(zones, (sensorData) => {
        // Process the simulated sensor data
        socket.emit('sensor_data', sensorData);
      });
    } catch (error) {
      console.error('Error starting simulation:', error);
    }
  });

  socket.on('stop_simulation', () => {
    simulationService.stop();
  });

  socket.on('add_crowd', ({ zoneId, count }: { zoneId: string; count: number }) => {
    simulationService.addCrowd(zoneId, count);
  });

  socket.on('remove_crowd', ({ zoneId, count }: { zoneId: string; count: number }) => {
    simulationService.removeCrowd(zoneId, count);
  });

  socket.on('trigger_emergency', ({ zoneId }: { zoneId: string }) => {
    simulationService.triggerEmergency(zoneId);
  });
});

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes for initial data loading
app.get('/api/zones', async (req, res) => {
  try {
    const mongooseZones = await Zone.find();
    const zones = mongooseZones.map(zone => ({
      id: zone._id.toString(),
      name: zone.name,
      boundaries: {
        type: "Polygon" as const,
        coordinates: zone.boundaries?.coordinates || []
      },
      currentDensity: zone.currentDensity,
      riskLevel: zone.riskLevel,
      maxCapacity: zone.maxCapacity
    }));
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching zones' });
  }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find({ status: 'active' }).populate('affectedZones');
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching alerts' });
  }
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});