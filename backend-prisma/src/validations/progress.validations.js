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
  moduleId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  simulationId: z.string(),
  score: z.number().optional(),
  flagsFound: z.array(z.string()).optional(),
  timeSpent: z.number().int().min(0).optional(),
  timeSpentSeconds: z.number().int().min(0).optional(),
  attempts: z.number().int().min(1).optional(),
  attemptsCount: z.number().int().min(1).optional(),
  correctCount: z.number().int().min(0).optional(),
  wrongCount: z.number().int().min(0).optional(),
  passed: z.boolean().optional(),
  maxScore: z.number().int().min(0).optional(),
  successRate: z.number().min(0).max(100).optional(),
  wrongActionsCount: z.number().int().min(0).optional(),
  hintUsedCount: z.number().int().min(0).optional(),
  resetCount: z.number().int().min(0).optional(),
  stepCompletionTimes: z.any().optional(),
  finalGradeLabel: z.string().max(64).optional(),
  runId: z.string().uuid().optional()
});

