import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid request data'
        });
      }
    }
  };
};

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const wordListSchema = z.object({
  name: z.string().min(1, 'List name is required').max(100, 'List name too long'),
  words: z.array(z.string().min(1).max(50)).length(12, 'Must have exactly 12 words'),
  audioRecordings: z.record(z.string()).optional()
});

export const practiceSessionSchema = z.object({
  listId: z.string().uuid('Invalid list ID'),
  sessionType: z.enum(['teaching', 'practice']),
  attempts: z.array(z.object({
    word: z.string(),
    userSpelling: z.string(),
    correctSpelling: z.string(),
    isCorrect: z.boolean(),
    attemptNumber: z.number().int().positive()
  })),
  score: z.number().int().min(0).max(100),
  durationSeconds: z.number().int().min(0),
  completed: z.boolean()
});