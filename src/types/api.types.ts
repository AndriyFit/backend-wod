/**
 * API Request/Response Types for WOD Tracker Backend
 *
 * This file contains all TypeScript types for API endpoints, including:
 * - Request/Response types for each endpoint
 * - Generic API response wrappers
 * - Express Request extensions for authentication
 * - Pagination and error handling types
 */

import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import {
  User,
  UserRole,
  UpdateUserDTO,
  PublicUserProfile,
} from './database.types';

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * Telegram login request payload
 * Data received from Telegram Widget/Bot authentication
 * @see https://core.telegram.org/widgets/login
 */
export interface TelegramLoginRequest {
  /** Telegram user ID */
  id: number;

  /** Telegram username (optional) */
  username?: string;

  /** User's first name from Telegram */
  first_name: string;

  /** User's last name from Telegram (optional) */
  last_name?: string;

  /** Profile photo URL from Telegram (optional) */
  photo_url?: string;

  /** Unix timestamp of authentication */
  auth_date: number;

  /** Security hash for verification */
  hash: string;
}

/**
 * Successful login response
 * Returned after successful authentication with Telegram
 */
export interface LoginResponse {
  /** Always true for successful responses */
  success: true;

  /** Response data payload */
  data: {
    /** Authenticated user information */
    user: User;

    /** JWT access token (short-lived) */
    token: string;

    /** JWT refresh token (long-lived) */
    refreshToken: string;
  };
}

/**
 * Authenticated user context
 * Attached to Express request after successful authentication
 * Used in middleware and controllers to identify the current user
 */
export interface AuthUser {
  /** User's Telegram ID */
  userId: number;

  /** User's role in the system */
  role: UserRole;
}

/**
 * Token refresh request
 * Used to get a new access token using a refresh token
 */
export interface RefreshTokenRequest {
  /** JWT refresh token */
  refreshToken: string;
}

/**
 * Token refresh response
 * Returns new access token
 */
export interface RefreshTokenResponse {
  /** Always true for successful responses */
  success: true;

  /** Response data payload */
  data: {
    /** New JWT access token */
    token: string;

    /** New JWT refresh token (optional, if rotated) */
    refreshToken?: string;
  };
}

// ============================================================================
// USER ENDPOINT TYPES
// ============================================================================

/**
 * Get user by ID request (URL params)
 * Used in routes like GET /api/users/:userId
 */
export interface GetUserRequest {
  /** User ID from URL parameter */
  userId: string;
}

/**
 * Update user profile request (body)
 * Used in routes like PUT /api/users/:id
 */
export interface UpdateUserRequest extends UpdateUserDTO {
  // Extends UpdateUserDTO from database.types
  // All fields from UpdateUserDTO are available
}

/**
 * Personal record creation request
 * Used when athlete logs a new PR
 */
export interface CreateUserRecordRequest {
  /** Exercise name (e.g., "Back Squat", "Fran", "Deadlift") */
  exercise_name: string;

  /** Type of record (e.g., "1RM", "time", "reps") */
  record_type: string;

  /** Record value (weight, time in seconds, reps, etc.) */
  value: number;

  /** Unit of measurement (optional, e.g., "kg", "lb", "seconds") */
  unit?: string;

  /** Date when record was achieved (ISO 8601, optional - defaults to now) */
  achieved_at?: string;
}

/**
 * Single user response
 * Used when fetching one user's profile
 */
export interface UserResponse {
  /** Always true for successful responses */
  success: true;

  /** User data */
  data: User;
}

/**
 * Public user profile response
 * Used when fetching another user's profile (limited data)
 */
export interface PublicProfileResponse {
  /** Always true for successful responses */
  success: true;

  /** Public profile data (no sensitive info) */
  data: PublicUserProfile;
}

/**
 * Users list response with pagination
 * Used when fetching multiple users (e.g., community members)
 */
export interface UsersListResponse {
  /** Always true for successful responses */
  success: true;

  /** Array of users */
  data: User[];

  /** Pagination metadata */
  meta: {
    /** Total number of users matching query */
    total: number;

    /** Current page number (1-indexed) */
    page: number;

    /** Number of items per page */
    limit: number;
  };
}

// ============================================================================
// GENERIC API RESPONSE TYPES
// ============================================================================

/**
 * Generic successful API response
 * Use this as a wrapper for all successful responses
 *
 * @template T - The type of data being returned
 *
 * @example
 * const response: ApiSuccessResponse<User> = {
 *   success: true,
 *   data: userObject,
 *   message: "User created successfully"
 * }
 */
export interface ApiSuccessResponse<T> {
  /** Always true for successful responses */
  success: true;

  /** Response payload */
  data: T;

  /** Optional success message */
  message?: string;
}

/**
 * API error response
 * Returned when an error occurs (400, 401, 403, 404, 500, etc.)
 *
 * @example
 * const errorResponse: ApiErrorResponse = {
 *   success: false,
 *   error: {
 *     message: "User not found",
 *     code: "USER_NOT_FOUND",
 *     details: { userId: 12345 }
 *   }
 * }
 */
export interface ApiErrorResponse {
  /** Always false for error responses */
  success: false;

  /** Error information */
  error: {
    /** Human-readable error message */
    message: string;

    /** Machine-readable error code (optional) */
    code?: string;

    /** Additional error details (optional) */
    details?: unknown;
  };
}

/**
 * Generic API response (success or error)
 * Use this as return type for API handlers
 *
 * @template T - The type of data being returned on success
 *
 * @example
 * async function getUser(id: number): Promise<ApiResponse<User>> {
 *   try {
 *     const user = await db.getUser(id);
 *     return { success: true, data: user };
 *   } catch (error) {
 *     return {
 *       success: false,
 *       error: { message: "Failed to fetch user" }
 *     };
 *   }
 * }
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Pagination metadata
 * Contains information about paginated results
 */
export interface PaginationMeta {
  /** Total number of items across all pages */
  total: number;

  /** Current page number (1-indexed) */
  page: number;

  /** Number of items per page */
  limit: number;

  /** Total number of pages */
  totalPages: number;
}

/**
 * Generic paginated response
 * Use for endpoints that return lists with pagination
 *
 * @template T - The type of items in the array
 *
 * @example
 * const response: PaginatedResponse<User> = {
 *   success: true,
 *   data: [user1, user2, user3],
 *   meta: {
 *     total: 100,
 *     page: 1,
 *     limit: 10,
 *     totalPages: 10
 *   }
 * }
 */
export interface PaginatedResponse<T> {
  /** Always true for successful responses */
  success: true;

  /** Array of items for current page */
  data: T[];

  /** Pagination information */
  meta: PaginationMeta;
}

/**
 * Query parameters for pagination
 * Use in routes that support pagination
 */
export interface PaginationQuery {
  /** Page number (1-indexed, default: 1) */
  page?: string;

  /** Items per page (default: 10, max: 100) */
  limit?: string;

  /** Sort field (optional) */
  sortBy?: string;

  /** Sort order (optional, default: 'asc') */
  order?: 'asc' | 'desc';
}

// ============================================================================
// EXPRESS REQUEST EXTENSIONS
// ============================================================================

/**
 * Authenticated Express Request
 * Use this type in routes that require authentication
 * The auth middleware will attach the `user` property
 *
 * @example
 * router.get('/profile', authMiddleware, (req: AuthRequest, res) => {
 *   const userId = req.user?.userId; // TypeScript knows user exists
 *   // ... fetch and return user profile
 * });
 */
export interface AuthRequest extends Request {
  /**
   * Authenticated user context
   * Populated by authentication middleware
   * Will be undefined if middleware hasn't run or auth failed
   */
  user?: AuthUser;
}

/**
 * Authenticated Request with typed body
 * Use when you need both authentication and typed request body
 *
 * @template T - The type of the request body
 *
 * @example
 * router.put('/users/:id',
 *   authMiddleware,
 *   (req: AuthRequestWithBody<UpdateUserDTO>, res) => {
 *     const userId = req.user?.userId;
 *     const updates = req.body; // TypeScript knows body is UpdateUserDTO
 *   }
 * );
 */
export interface AuthRequestWithBody<T> extends Request<ParamsDictionary, unknown, T> {
  /**
   * Authenticated user context
   * Populated by authentication middleware
   */
  user?: AuthUser;
}

/**
 * Authenticated Request with typed params
 * Use when you need both authentication and typed URL parameters
 *
 * @template P - The type of URL params
 *
 * @example
 * router.get('/users/:userId',
 *   authMiddleware,
 *   (req: AuthRequestWithParams<GetUserRequest>, res) => {
 *     const userId = req.params.userId; // TypeScript knows params shape
 *   }
 * );
 */
export interface AuthRequestWithParams<P extends ParamsDictionary> extends Request<P> {
  /**
   * Authenticated user context
   * Populated by authentication middleware
   */
  user?: AuthUser;
}

/**
 * Authenticated Request with typed body and params
 * Use when you need authentication, typed body, and typed URL parameters
 *
 * @template T - The type of the request body
 * @template P - The type of URL params
 *
 * @example
 * router.put('/users/:userId',
 *   authMiddleware,
 *   (req: AuthRequestWithBodyAndParams<UpdateUserDTO, GetUserRequest>, res) => {
 *     const userId = req.params.userId;
 *     const updates = req.body;
 *   }
 * );
 */
export interface AuthRequestWithBodyAndParams<T, P extends ParamsDictionary> extends Request<P, unknown, T> {
  /**
   * Authenticated user context
   * Populated by authentication middleware
   */
  user?: AuthUser;
}

// ============================================================================
// VALIDATION ERROR TYPES
// ============================================================================

/**
 * Single validation error
 * Represents one field validation failure
 */
export interface ValidationError {
  /** Field name that failed validation */
  field: string;

  /** Validation error message */
  message: string;

  /** Value that was rejected (optional) */
  value?: unknown;
}

/**
 * Validation error response
 * Returned when request validation fails (400 Bad Request)
 */
export interface ValidationErrorResponse extends ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: 'VALIDATION_ERROR';
    /** Array of specific field errors */
    details: ValidationError[];
  };
}

// ============================================================================
// COMMON ERROR CODES
// ============================================================================

/**
 * Standard error codes used across the API
 * Use these constants for consistent error handling
 */
export enum ApiErrorCode {
  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TELEGRAM_AUTH_FAILED = 'TELEGRAM_AUTH_FAILED',

  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Not found errors (404)
  NOT_FOUND = 'NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  WORKOUT_NOT_FOUND = 'WORKOUT_NOT_FOUND',
  COMMUNITY_NOT_FOUND = 'COMMUNITY_NOT_FOUND',

  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Conflict errors (409)
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

/**
 * HTTP status code type
 * Common status codes used in API responses
 */
export type HttpStatusCode =
  | 200 // OK
  | 201 // Created
  | 204 // No Content
  | 400 // Bad Request
  | 401 // Unauthorized
  | 403 // Forbidden
  | 404 // Not Found
  | 409 // Conflict
  | 500; // Internal Server Error
