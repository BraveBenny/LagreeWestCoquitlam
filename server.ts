
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import Staff from './models/Staff';
import Shift from './models/Shift';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || '';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// API Routes

// Staff Routes
app.get('/api/staff', async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    const newStaff = new Staff(req.body);
    await newStaff.save();
    res.status(201).json(newStaff);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create staff' });
  }
});

app.delete('/api/staff/:id', async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete staff' });
  }
});

// Shift Routes
app.get('/api/shifts', async (req, res) => {
  try {
    const shifts = await Shift.find();
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

app.post('/api/shifts/generate-range', async (req, res) => {
  const { startDate, endDate, shiftTypes } = req.body;
  try {
    // Clear existing shifts in range
    await Shift.deleteMany({ date: { $gte: startDate, $lte: endDate } });
    
    const newShifts = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      for (const type of shiftTypes) {
        newShifts.push({
          date: dateStr,
          startTime: type.start,
          endTime: type.end,
          role: 'Host'
        });
      }
      current.setDate(current.getDate() + 1);
    }
    
    const created = await Shift.insertMany(newShifts);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: 'Failed to generate range' });
  }
});

app.post('/api/schedule/generate', async (req, res) => {
  try {
    const staff = await Staff.find();
    const shifts = await Shift.find();

    if (!staff.length || !shifts.length) {
      return res.status(400).json({ error: 'Missing staff or shifts' });
    }

    const prompt = `
      Assign Hosts to shift slots.
      Staff: ${JSON.stringify(staff)}
      Shifts: ${JSON.stringify(shifts)}
      Rules: No overlaps, 3 people per day preferred, follow constraints.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assignments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  shiftId: { type: Type.STRING },
                  staffId: { type: Type.STRING },
                },
                required: ['shiftId', 'staffId']
              }
            },
            notes: { type: Type.STRING }
          },
          required: ['assignments', 'notes']
        },
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });

    const result = JSON.parse(response.text);

    // Update DB with assignments
    for (const assignment of result.assignments) {
      await Shift.findByIdAndUpdate(assignment.shiftId, { assignedStaffId: assignment.staffId });
    }

    const updatedShifts = await Shift.find();
    res.json({ shifts: updatedShifts, notes: result.notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI Scheduling failed' });
  }
});

app.delete('/api/shifts', async (req, res) => {
  try {
    await Shift.deleteMany({});
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear shifts' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
