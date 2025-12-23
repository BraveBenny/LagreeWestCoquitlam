import mongoose, { Schema, Document } from 'mongoose';
import { StaffRole } from '../types';

export interface IStaff extends Document {
  name: string;
  role: StaffRole;
  constraints: string;
  avatar: string;
}

const StaffSchema: Schema = new Schema({
  name: { type: String, required: true },
  role: { type: String, enum: Object.values(StaffRole), default: StaffRole.HOST },
  constraints: { type: String, default: 'No specific constraints.' },
  avatar: { type: String },
}, { timestamps: true });

// Ensure _id is mapped to id when sending to frontend
StaffSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export default mongoose.model<IStaff>('Staff', StaffSchema);