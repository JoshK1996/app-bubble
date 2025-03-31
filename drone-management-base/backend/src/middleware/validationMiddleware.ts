import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { HttpError } from './errorHandler';

/**
 * Validation middleware factory
 * @param schema Zod validation schema
 * @param property Request property to validate (body, query, params)
 * @returns Middleware function
 */
export const validate = (
  schema: z.AnyZodObject,
  property: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req[property]);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        
        return next(new HttpError(`Validation error: ${errorMessages}`, 400));
      }
      
      return next(new HttpError('Validation error occurred', 400));
    }
  };
};

/**
 * Common validation schemas
 */
export const validationSchemas = {
  // User schemas
  createUser: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string(),
    role: z.enum(['admin', 'operator', 'viewer']),
  }),
  
  updateUser: z.object({
    email: z.string().email().optional(),
    name: z.string().optional(),
    role: z.enum(['admin', 'operator', 'viewer']).optional(),
    isActive: z.boolean().optional(),
  }),
  
  // Authentication schemas
  login: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
  
  // Drone schemas
  createDrone: z.object({
    name: z.string(),
    model: z.string(),
    serialNumber: z.string(),
    status: z.enum(['active', 'maintenance', 'inactive']),
    batteryLevel: z.number().min(0).max(100).optional(),
    lastMaintenance: z.string().transform(val => new Date(val)).optional(),
    nextMaintenance: z.string().transform(val => new Date(val)).optional(),
    specifications: z.record(z.any()).optional(),
  }),
  
  updateDrone: z.object({
    name: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    status: z.enum(['active', 'maintenance', 'inactive']).optional(),
    batteryLevel: z.number().min(0).max(100).optional(),
    lastMaintenance: z.string().transform(val => new Date(val)).optional(),
    nextMaintenance: z.string().transform(val => new Date(val)).optional(),
    specifications: z.record(z.any()).optional(),
  }),
  
  // Mission schemas
  createMission: z.object({
    name: z.string(),
    description: z.string().optional(),
    startTime: z.string().transform(val => new Date(val)),
    endTime: z.string().transform(val => new Date(val)).optional(),
    status: z.enum(['planned', 'in-progress', 'completed', 'failed', 'cancelled']),
    type: z.string(),
    droneId: z.string(),
    pilotId: z.string(),
    waypoints: z.array(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        altitude: z.number().optional(),
        speed: z.number().optional(),
        action: z.string().optional(),
      })
    ).optional(),
    parameters: z.record(z.any()).optional(),
  }),
  
  updateMission: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    startTime: z.string().transform(val => new Date(val)).optional(),
    endTime: z.string().transform(val => new Date(val)).optional(),
    status: z.enum(['planned', 'in-progress', 'completed', 'failed', 'cancelled']).optional(),
    type: z.string().optional(),
    droneId: z.string().optional(),
    pilotId: z.string().optional(),
    waypoints: z.array(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        altitude: z.number().optional(),
        speed: z.number().optional(),
        action: z.string().optional(),
      })
    ).optional(),
    parameters: z.record(z.any()).optional(),
  }),
  
  // Maintenance schemas
  createMaintenance: z.object({
    droneId: z.string(),
    type: z.string(),
    description: z.string(),
    scheduledDate: z.string().transform(val => new Date(val)),
    completedDate: z.string().transform(val => new Date(val)).optional(),
    status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']),
    technician: z.string(),
    notes: z.string().optional(),
    parts: z.array(
      z.object({
        name: z.string(),
        serialNumber: z.string().optional(),
        replaced: z.boolean().optional(),
      })
    ).optional(),
  }),
  
  updateMaintenance: z.object({
    type: z.string().optional(),
    description: z.string().optional(),
    scheduledDate: z.string().transform(val => new Date(val)).optional(),
    completedDate: z.string().transform(val => new Date(val)).optional(),
    status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']).optional(),
    technician: z.string().optional(),
    notes: z.string().optional(),
    parts: z.array(
      z.object({
        name: z.string(),
        serialNumber: z.string().optional(),
        replaced: z.boolean().optional(),
      })
    ).optional(),
  }),

  // Pagination parameters
  pagination: z.object({
    page: z.string().transform(val => parseInt(val)).pipe(z.number().int().min(1)).optional().default("1"),
    limit: z.string().transform(val => parseInt(val)).pipe(z.number().int().min(1).max(100)).optional().default("10"),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),

  // ID parameter
  idParam: z.object({
    id: z.string(),
  }),
};

export default { validate, validationSchemas }; 