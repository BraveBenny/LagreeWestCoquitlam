import mongoose, { Schema, Document } from 'mongoose';
import { StaffRole } from '../types';

export interface IShift extends Document {
  date: string;
  startTime: string;
  endTime: string;
  role: StaffRole;
  assignedStaffId?: mongoose.Types.ObjectId;
}

const ShiftSchema: Schema = new Schema({
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  role: { type: String, enum: Object.values(StaffRole), default: StaffRole.HOST },
  assignedStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
}, { timestamps: true });

// Ensure _id is mapped to id when sending to frontend
ShiftSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.assignedStaffId) ret.assignedStaffId = ret.assignedStaffId.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export default mongoose.model<IShift>('Shift', ShiftSchema);