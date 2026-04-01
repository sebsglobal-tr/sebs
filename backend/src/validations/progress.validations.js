// Progress Validation Schemas
import { z } from 'zod';

export const saveProgressSchema = z.object({
  moduleId: z.string().uuid(),
  percentComplete: z.number().int().min(0).max(100),
  lastStep: z.string().optional(),
  isCompleted: z.boolean().optional()
});

export const syncProgressSchema = z.object({
  progressData: z.array(z.object({
    moduleId: z.string().uuid(),
    percentComplete: z.number().int().min(0).max(100).optional(),
    lastStep: z.string().optional(),
    isCompleted: z.boolean().optional()
  }))
});

export const simulationRunSchema = z.object({
  moduleId: z.string().uuid(),
  simulationId: z.string(),
  score: z.number().int().optional(),
  flagsFound: z.array(z.string()).optional(),
  timeSpent: z.number().int().min(0).optional()
});

