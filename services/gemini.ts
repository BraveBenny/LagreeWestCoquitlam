
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Shift, Staff, ScheduleResult } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSchedule = async (
  shifts: Shift[],
  staff: Staff[]
): Promise<ScheduleResult> => {
  if (shifts.length === 0 || staff.length === 0) {
    throw new Error("Please add at least one shift and one staff member.");
  }

  const modelId = "gemini-3-pro-preview";

  const prompt = `
    You are an expert studio manager and scheduler. Your task is to assign Hosts to a list of pre-defined shift slots for the month.
    
    The shifts provided are individual slots. There are exactly 3 slots per day: Morning, Day, and Evening.
    
    **Inputs:**
    1. Shift Slots to Fill: ${JSON.stringify(
      shifts.map(({ id, date, startTime, endTime, role }) => ({
        id,
        date,
        time: `${startTime}-${endTime}`,
        role,
      }))
    )}
    2. Hosts Available: ${JSON.stringify(
      staff.map(({ id, name, role, constraints }) => ({
        id,
        name,
        role,
        constraints,
      }))
    )}

    **Rules & Constraints:**
    1. **No Overlaps**: A Host cannot work two shift slots that overlap in time.
    2. **3 Staff Per Day**: The studio prefers to assign **3 different people** for the 3 daily slots (Morning, Day, Evening). Avoid giving one person multiple shifts in a single day unless strictly necessary due to lack of availability.
    3. **Strict Constraint Adherence**: You MUST follow the natural language constraints provided for each staff member (e.g., "no weekends", "max 20 hours", "only Tuesday mornings"). 
    4. **Minimum Workload**: Ensure every staff member is assigned at least 2 shifts per week (7-day period), provided their constraints allow it. This is a priority.
    5. **Fairness**: Distribute the total hours as evenly as possible among eligible staff.
    6. **Unfilled Shifts**: If a shift slot cannot be filled by ANY host due to valid constraints, add its ID to the 'unfilledShiftIds' list.

    **Output Goal:**
    Produce a valid schedule maximizing coverage and preference for splitting the day among 3 different staff.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      assignments: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            shiftId: { type: Type.STRING },
            staffId: { type: Type.STRING },
            reasoning: { type: Type.STRING, description: "Why this staff was chosen" },
          },
          required: ["shiftId", "staffId"],
        },
      },
      unfilledShiftIds: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      notes: {
        type: Type.STRING,
        description: "General notes about the schedule generation, difficulties encountered, or suggestions.",
      },
    },
    required: ["assignments", "unfilledShiftIds", "notes"],
  };

  try {
    const response = await genAI.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 2048 }, // Use thinking to solve the logic puzzle
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as ScheduleResult;
  } catch (error) {
    console.error("Gemini Scheduling Error:", error);
    throw error;
  }
};
