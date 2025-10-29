/**
 * Validation Middleware
 *
 * Express middleware for validating request data using Zod schemas.
 * Provides type-safe validation for request body, params, and query.
 */

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, ZodSchema } from 'zod';
import { ApiErrorCode } from '../types/api.types';

/**
 * Validation target (which part of the request to validate)
 */
type ValidationTarget = 'body' | 'params' | 'query';

/**
 * Options for validation middleware
 */
interface ValidationOptions {
  /** Whether to strip unknown fields (default: true) */
  stripUnknown?: boolean;
  /** Whether to abort early on first error (default: false) */
  abortEarly?: boolean;
}

/**
 * Validate request data against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate ('body', 'params', or 'query')
 * @param options - Validation options
 *
 * @example
 * // Validate request body
 * router.post('/users',
 *   validate(createUserSchema, 'body'),
 *   userController.create
 * );
 *
 * @example
 * // Validate URL params
 * router.get('/users/:userId',
 *   validate(getUserParamsSchema, 'params'),
 *   userController.getById
 * );
 *
 * @example
 * // Validate query parameters
 * router.get('/users',
 *   validate(paginationQuerySchema, 'query'),
 *   userController.list
 * );
 */
export function validate(
  schema: ZodSchema,
  target: ValidationTarget = 'body',
  options: ValidationOptions = {}
) {
  const { abortEarly = false } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get the data to validate based on target
      const dataToValidate = req[target];

      // Parse and validate the data
      const validated = await schema.parseAsync(dataToValidate, {
        errorMap: (_issue, ctx) => {
          // Custom error messages can be added here
          return { message: ctx.defaultError };
        },
      });

      // Replace the request data with validated (and possibly transformed) data
      (req as any)[target] = validated;

      // Continue to next middleware
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        // Format validation errors
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.code === 'invalid_type' ? undefined : (err as any).received,
        }));

        // Return validation error response
        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            code: ApiErrorCode.VALIDATION_ERROR,
            details: abortEarly ? [validationErrors[0]] : validationErrors,
          },
        });
        return;
      }

      // Handle unexpected errors
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal validation error',
          code: ApiErrorCode.INTERNAL_ERROR,
        },
      });
    }
  };
}

/**
 * Validate multiple parts of the request at once
 *
 * @param schemas - Object mapping validation targets to schemas
 *
 * @example
 * router.put('/users/:userId',
 *   validateMultiple({
 *     params: getUserParamsSchema,
 *     body: updateUserSchema
 *   }),
 *   userController.update
 * );
 */
export function validateMultiple(schemas: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validationPromises: Promise<any>[] = [];
      const targets: ValidationTarget[] = [];

      // Validate body if schema provided
      if (schemas.body) {
        validationPromises.push(schemas.body.parseAsync(req.body));
        targets.push('body');
      }

      // Validate params if schema provided
      if (schemas.params) {
        validationPromises.push(schemas.params.parseAsync(req.params));
        targets.push('params');
      }

      // Validate query if schema provided
      if (schemas.query) {
        validationPromises.push(schemas.query.parseAsync(req.query));
        targets.push('query');
      }

      // Run all validations in parallel
      const results = await Promise.all(validationPromises);

      // Replace request data with validated data
      results.forEach((result, index) => {
        (req as any)[targets[index]!] = result;
      });

      // Continue to next middleware
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        // Format validation errors
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.code === 'invalid_type' ? undefined : (err as any).received,
        }));

        // Return validation error response
        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            code: ApiErrorCode.VALIDATION_ERROR,
            details: validationErrors,
          },
        });
        return;
      }

      // Handle unexpected errors
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal validation error',
          code: ApiErrorCode.INTERNAL_ERROR,
        },
      });
    }
  };
}

/**
 * Create a validation middleware from a Zod object schema
 * This is a convenience function for validating request bodies
 *
 * @param schema - Zod object schema
 *
 * @example
 * router.post('/users',
 *   validateBody(createUserSchema),
 *   userController.create
 * );
 */
export const validateBody = (schema: AnyZodObject) => validate(schema, 'body');

/**
 * Create a validation middleware for URL params
 *
 * @param schema - Zod object schema
 *
 * @example
 * router.get('/users/:userId',
 *   validateParams(getUserParamsSchema),
 *   userController.getById
 * );
 */
export const validateParams = (schema: AnyZodObject) => validate(schema, 'params');

/**
 * Create a validation middleware for query parameters
 *
 * @param schema - Zod object schema
 *
 * @example
 * router.get('/users',
 *   validateQuery(paginationQuerySchema),
 *   userController.list
 * );
 */
export const validateQuery = (schema: AnyZodObject) => validate(schema, 'query');

/**
 * Export default validation middleware
 */
export default {
  validate,
  validateMultiple,
  validateBody,
  validateParams,
  validateQuery,
};
