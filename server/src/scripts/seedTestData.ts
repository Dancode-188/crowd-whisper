import mongoose from 'mongoose';
import { Zone } from '../models/Zone.js';
import dotenv from 'dotenv';

dotenv.config();

const testZones = [
  {
    name: 'Main Stage',
    boundaries: {
      type: 'Polygon' as const,
      coordinates: [[
        [0.0, 0.0],      // Bottom-left
        [0.0, 0.005],    // Top-left
        [0.005, 0.005],  // Top-right
        [0.005, 0.0],    // Bottom-right
        [0.0, 0.0]       // Close the polygon
      ]]
    },
    currentDensity: 0,
    riskLevel: 1,
    maxCapacity: 1000
  },
  {
    name: 'Food Court',
    boundaries: {
      type: 'Polygon' as const,
      coordinates: [[
        [0.006, 0.0],
        [0.006, 0.004],
        [0.01, 0.004],
        [0.01, 0.0],
        [0.006, 0.0]
      ]]
    },
    currentDensity: 0,
    riskLevel: 1,
    maxCapacity: 500
  },
  {
    name: 'Entry Plaza',
    boundaries: {
      type: 'Polygon' as const,
      coordinates: [[
        [0.002, -0.004],
        [0.002, -0.001],
        [0.008, -0.001],
        [0.008, -0.004],
        [0.002, -0.004]
      ]]
    },
    currentDensity: 0,
    riskLevel: 1,
    maxCapacity: 750
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crowd-whisper');
    console.log('Connected to MongoDB');

    // Clear existing zones
    await Zone.deleteMany({});
    console.log('Cleared existing zones');

    // Insert test zones
    const createdZones = await Zone.create(testZones);
    console.log('Created test zones:', createdZones.map(zone => zone.name));

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding script
seedDatabase();