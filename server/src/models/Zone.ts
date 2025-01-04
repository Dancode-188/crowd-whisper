import mongoose, { Document, Schema, Types } from 'mongoose';

// Define the coordinate type
type Coordinate = [number, number];
type Polygon = Coordinate[][];

export interface IZoneDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  boundaries: {
    type: "Polygon";
    coordinates: Polygon;
  };
  currentDensity: number;
  riskLevel: number;
  maxCapacity: number;
  createdAt: Date;
  updatedAt: Date;
}

const zoneSchema = new Schema({
  name: { type: String, required: true },
  boundaries: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]],
      required: true,
      validate: {
        validator: function(coordinates: number[][][]) {
          return coordinates.every(polygon => 
            polygon.every(point => point.length === 2)
          );
        },
        message: 'Each coordinate must be a pair of numbers [longitude, latitude]'
      }
    }
  },
  currentDensity: { type: Number, default: 0 },
  riskLevel: { type: Number, default: 1 },
  maxCapacity: { type: Number, required: true }
}, {
  timestamps: true
});

export const Zone = mongoose.model<IZoneDocument>('Zone', zoneSchema);