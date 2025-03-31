import { AnyZodObject } from 'zod';

declare module 'zod' {
  interface ZodSchema {
    body?: AnyZodObject;
    params?: AnyZodObject;
    query?: AnyZodObject;
  }
} 