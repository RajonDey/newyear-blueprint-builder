/**
 * Input validation and sanitization utilities
 * Prevents XSS attacks and validates user inputs
 */

import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')
  .max(255, 'Email is too long');

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters');

/**
 * Goal text validation schema
 */
export const goalTextSchema = z
  .string()
  .min(10, 'Goal must be at least 10 characters')
  .max(500, 'Goal is too long');

/**
 * Action step validation schema
 */
export const actionStepSchema = z
  .string()
  .min(5, 'Action step must be at least 5 characters')
  .max(200, 'Action step is too long');

/**
 * Habit validation schema
 */
export const habitSchema = z
  .string()
  .min(5, 'Habit description must be at least 5 characters')
  .max(300, 'Habit description is too long');

/**
 * Motivation text validation schema
 */
export const motivationSchema = z
  .string()
  .min(10, 'Motivation text must be at least 10 characters')
  .max(400, 'Motivation text is too long');

/**
 * Sanitizes user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validates and sanitizes email
 */
export function validateEmail(email: string): { valid: boolean; error?: string; sanitized?: string } {
  try {
    const sanitized = sanitizeInput(email);
    emailSchema.parse(sanitized);
    return { valid: true, sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0]?.message || 'Invalid email' };
    }
    return { valid: false, error: 'Invalid email format' };
  }
}

/**
 * Validates and sanitizes name
 */
export function validateName(name: string): { valid: boolean; error?: string; sanitized?: string } {
  try {
    const sanitized = sanitizeInput(name);
    nameSchema.parse(sanitized);
    return { valid: true, sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0]?.message || 'Invalid name' };
    }
    return { valid: false, error: 'Invalid name format' };
  }
}

/**
 * Validates goal text
 */
export function validateGoalText(text: string): { valid: boolean; error?: string; sanitized?: string } {
  try {
    const sanitized = sanitizeInput(text);
    goalTextSchema.parse(sanitized);
    return { valid: true, sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0]?.message || 'Invalid goal text' };
    }
    return { valid: false, error: 'Invalid goal text format' };
  }
}

/**
 * Validates action step
 */
export function validateActionStep(text: string): { valid: boolean; error?: string; sanitized?: string } {
  try {
    const sanitized = sanitizeInput(text);
    actionStepSchema.parse(sanitized);
    return { valid: true, sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0]?.message || 'Invalid action step' };
    }
    return { valid: false, error: 'Invalid action step format' };
  }
}

/**
 * Validates habit description
 */
export function validateHabit(text: string): { valid: boolean; error?: string; sanitized?: string } {
  try {
    const sanitized = sanitizeInput(text);
    habitSchema.parse(sanitized);
    return { valid: true, sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0]?.message || 'Invalid habit description' };
    }
    return { valid: false, error: 'Invalid habit description format' };
  }
}

/**
 * Validates motivation text
 */
export function validateMotivation(text: string): { valid: boolean; error?: string; sanitized?: string } {
  try {
    const sanitized = sanitizeInput(text);
    motivationSchema.parse(sanitized);
    return { valid: true, sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0]?.message || 'Invalid motivation text' };
    }
    return { valid: false, error: 'Invalid motivation text format' };
  }
}

