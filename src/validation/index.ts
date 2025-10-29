/**
 * Validation Module Index
 *
 * Central export point for all validation schemas and utilities.
 * This file re-exports all schemas and provides a validation middleware factory.
 */

// Export all user schemas
export * from './user.schema';
export { default as userSchemas } from './user.schema';

// Re-export Zod for convenience
export { z } from 'zod';
