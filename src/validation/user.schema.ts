/**
 * User Validation Schemas
 *
 * Zod schemas for runtime validation of user-related API requests.
 * These schemas match the TypeScript types defined in database.types.ts
 * and api.types.ts, providing runtime type checking and validation.
 */

import { z } from 'zod';

// ============================================================================
// ENUM SCHEMAS (Reusable)
// ============================================================================

/**
 * User role validation schema
 * Matches UserRole type from database.types.ts
 */
export const userRoleSchema = z.enum(['athlete', 'coach', 'admin'], {
  errorMap: () => ({ message: 'Role must be athlete, coach, or admin' }),
});

/**
 * User level validation schema
 * Matches UserLevel type from database.types.ts
 */
export const userLevelSchema = z.enum(['scaled', 'intermediate', 'rx'], {
  errorMap: () => ({ message: 'Level must be scaled, intermediate, or rx' }),
});

/**
 * User gender validation schema
 * Matches UserGender type from database.types.ts
 */
export const userGenderSchema = z.enum(['male', 'female', 'other'], {
  errorMap: () => ({ message: 'Gender must be male, female, or other' }),
});

/**
 * User language validation schema
 * Matches UserLanguage type from database.types.ts
 */
export const userLanguageSchema = z.enum(['uk', 'en', 'ru'], {
  errorMap: () => ({ message: 'Language must be uk, en, or ru' }),
});

/**
 * Payout method validation schema
 * Matches PayoutMethod type from database.types.ts
 */
export const payoutMethodSchema = z.enum(['bank_transfer', 'paypal', 'stripe'], {
  errorMap: () => ({ message: 'Payout method must be bank_transfer, paypal, or stripe' }),
});

// ============================================================================
// REUSABLE FIELD SCHEMAS
// ============================================================================

/**
 * Email validation schema
 * Validates email format
 */
export const emailSchema = z
  .string()
  .email({ message: 'Invalid email format' })
  .max(255, { message: 'Email must be at most 255 characters' })
  .toLowerCase()
  .trim();

/**
 * Phone number validation schema
 * Basic phone number format validation
 */
export const phoneNumberSchema = z
  .string()
  .min(10, { message: 'Phone number must be at least 10 characters' })
  .max(20, { message: 'Phone number must be at most 20 characters' })
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, {
    message: 'Invalid phone number format',
  })
  .trim();

/**
 * URL validation schema
 * Validates URL format (http/https)
 */
export const urlSchema = z
  .string()
  .url({ message: 'Invalid URL format' })
  .max(2048, { message: 'URL must be at most 2048 characters' });

/**
 * Timezone validation schema
 * Validates IANA timezone format (e.g., 'Europe/Kiev')
 */
export const timezoneSchema = z
  .string()
  .min(1, { message: 'Timezone is required' })
  .max(50, { message: 'Timezone must be at most 50 characters' })
  .regex(/^[A-Za-z_]+\/[A-Za-z_]+$/, {
    message: 'Timezone must be in IANA format (e.g., Europe/Kiev)',
  });

/**
 * Date of birth validation schema
 * Must be a valid date and not in the future
 */
export const dateOfBirthSchema = z
  .string()
  .datetime({ message: 'Date of birth must be a valid ISO 8601 date' })
  .refine(
    (date) => new Date(date) <= new Date(),
    { message: 'Date of birth cannot be in the future' }
  )
  .refine(
    (date) => {
      const birthDate = new Date(date);
      const age = (new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age <= 120;
    },
    { message: 'Date of birth seems invalid (age > 120 years)' }
  );

// ============================================================================
// USER CREATION SCHEMA
// ============================================================================

/**
 * Create user validation schema
 * Validates CreateUserDTO from api.types.ts
 *
 * Used in: POST /api/auth/telegram
 */
export const createUserSchema = z.object({
  /**
   * Telegram user ID (required)
   * Must be a positive integer
   */
  id: z
    .number({
      required_error: 'User ID is required',
      invalid_type_error: 'User ID must be a number',
    })
    .int({ message: 'User ID must be an integer' })
    .positive({ message: 'User ID must be positive' }),

  /**
   * User's first name (required)
   * Between 1 and 100 characters
   */
  first_name: z
    .string({
      required_error: 'First name is required',
      invalid_type_error: 'First name must be a string',
    })
    .min(1, { message: 'First name must be at least 1 character' })
    .max(100, { message: 'First name must be at most 100 characters' })
    .trim(),

  /**
   * Telegram username (optional)
   * Between 3 and 50 characters if provided
   */
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(50, { message: 'Username must be at most 50 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores',
    })
    .trim()
    .optional()
    .nullable(),

  /**
   * User's last name (optional)
   * Up to 100 characters
   */
  last_name: z
    .string()
    .max(100, { message: 'Last name must be at most 100 characters' })
    .trim()
    .optional()
    .nullable(),

  /**
   * Profile photo URL (optional)
   * Must be a valid URL if provided
   */
  photo_url: urlSchema.optional().nullable(),

  /**
   * User role (optional)
   * Defaults to 'athlete' if not provided
   */
  role: userRoleSchema.optional(),

  /**
   * Preferred language (optional)
   * Defaults to 'uk' if not provided
   */
  language: userLanguageSchema.optional(),
});

// Infer TypeScript type from Zod schema
export type CreateUserInput = z.infer<typeof createUserSchema>;

// ============================================================================
// USER UPDATE SCHEMA
// ============================================================================

/**
 * Update user validation schema
 * Validates UpdateUserDTO from api.types.ts
 * All fields are optional
 *
 * Used in: PUT /api/users/:id
 */
export const updateUserSchema = z.object({
  /**
   * User ID (required for identification, but not updated)
   */
  id: z
    .number()
    .int()
    .positive({ message: 'User ID must be positive' }),

  /**
   * Update username
   */
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(50, { message: 'Username must be at most 50 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores',
    })
    .trim()
    .optional()
    .nullable(),

  /**
   * Update first name
   */
  first_name: z
    .string()
    .min(1, { message: 'First name must be at least 1 character' })
    .max(100, { message: 'First name must be at most 100 characters' })
    .trim()
    .optional(),

  /**
   * Update last name
   */
  last_name: z
    .string()
    .max(100, { message: 'Last name must be at most 100 characters' })
    .trim()
    .optional()
    .nullable(),

  /**
   * Update photo URL
   */
  photo_url: urlSchema.optional().nullable(),

  /**
   * Update email
   */
  email: emailSchema.optional().nullable(),

  /**
   * Update phone number
   */
  phone_number: phoneNumberSchema.optional().nullable(),

  /**
   * Update workout level
   */
  level: userLevelSchema.optional(),

  /**
   * Update height in centimeters
   * Between 50 and 250 cm
   */
  height_cm: z
    .number()
    .int({ message: 'Height must be an integer' })
    .min(50, { message: 'Height must be at least 50 cm' })
    .max(250, { message: 'Height must be at most 250 cm' })
    .optional()
    .nullable(),

  /**
   * Update weight in kilograms
   * Between 20 and 300 kg
   */
  weight_kg: z
    .number()
    .min(20, { message: 'Weight must be at least 20 kg' })
    .max(300, { message: 'Weight must be at most 300 kg' })
    .optional()
    .nullable(),

  /**
   * Update date of birth
   * Must be a valid date and not in the future
   */
  date_of_birth: dateOfBirthSchema.optional().nullable(),

  /**
   * Update gender
   */
  gender: userGenderSchema.optional().nullable(),

  /**
   * Update experience years
   * Between 0 and 80 years
   */
  experience_years: z
    .number()
    .int({ message: 'Experience years must be an integer' })
    .min(0, { message: 'Experience years cannot be negative' })
    .max(80, { message: 'Experience years must be at most 80' })
    .optional()
    .nullable(),

  /**
   * Update fitness goals
   */
  goals: z
    .string()
    .max(1000, { message: 'Goals must be at most 1000 characters' })
    .trim()
    .optional()
    .nullable(),

  /**
   * Update injuries/limitations
   */
  injuries: z
    .string()
    .max(1000, { message: 'Injuries must be at most 1000 characters' })
    .trim()
    .optional()
    .nullable(),

  /**
   * Update notes
   */
  notes: z
    .string()
    .max(2000, { message: 'Notes must be at most 2000 characters' })
    .trim()
    .optional()
    .nullable(),

  /**
   * Update language preference
   */
  language: userLanguageSchema.optional(),

  /**
   * Update timezone
   */
  timezone: timezoneSchema.optional(),

  /**
   * Update notification settings
   */
  notifications_enabled: z.boolean().optional(),

  /**
   * Update bank account number (coaches only)
   */
  bank_account_number: z
    .string()
    .min(8, { message: 'Bank account number must be at least 8 characters' })
    .max(34, { message: 'Bank account number must be at most 34 characters' })
    .trim()
    .optional()
    .nullable(),

  /**
   * Update bank account holder name
   */
  bank_account_holder: z
    .string()
    .min(2, { message: 'Bank account holder name must be at least 2 characters' })
    .max(100, { message: 'Bank account holder name must be at most 100 characters' })
    .trim()
    .optional()
    .nullable(),

  /**
   * Update bank name
   */
  bank_name: z
    .string()
    .min(2, { message: 'Bank name must be at least 2 characters' })
    .max(100, { message: 'Bank name must be at most 100 characters' })
    .trim()
    .optional()
    .nullable(),

  /**
   * Update PayPal email
   */
  paypal_email: emailSchema.optional().nullable(),

  /**
   * Update payout method
   */
  payout_method: payoutMethodSchema.optional().nullable(),
});

// Infer TypeScript type from Zod schema
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ============================================================================
// TELEGRAM LOGIN SCHEMA
// ============================================================================

/**
 * Telegram login validation schema
 * Validates TelegramLoginRequest from api.types.ts
 *
 * Used in: POST /api/auth/telegram
 */
export const loginSchema = z.object({
  /**
   * Telegram user ID (required)
   */
  id: z
    .number({
      required_error: 'Telegram ID is required',
      invalid_type_error: 'Telegram ID must be a number',
    })
    .int({ message: 'Telegram ID must be an integer' })
    .positive({ message: 'Telegram ID must be positive' }),

  /**
   * User's first name from Telegram (required)
   */
  first_name: z
    .string({
      required_error: 'First name is required',
      invalid_type_error: 'First name must be a string',
    })
    .min(1, { message: 'First name must be at least 1 character' })
    .max(100, { message: 'First name must be at most 100 characters' })
    .trim(),

  /**
   * Telegram username (optional)
   */
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(50, { message: 'Username must be at most 50 characters' })
    .trim()
    .optional(),

  /**
   * User's last name (optional)
   */
  last_name: z
    .string()
    .max(100, { message: 'Last name must be at most 100 characters' })
    .trim()
    .optional(),

  /**
   * Profile photo URL (optional)
   */
  photo_url: urlSchema.optional(),

  /**
   * Unix timestamp of authentication (required)
   */
  auth_date: z
    .number({
      required_error: 'Authentication date is required',
      invalid_type_error: 'Authentication date must be a number',
    })
    .int({ message: 'Authentication date must be an integer' })
    .positive({ message: 'Authentication date must be positive' })
    .refine(
      (timestamp) => {
        // Check if timestamp is within reasonable bounds (not too old, not in future)
        const now = Math.floor(Date.now() / 1000);
        const fiveMinutesAgo = now - 300; // 5 minutes tolerance
        return timestamp >= fiveMinutesAgo && timestamp <= now + 60;
      },
      { message: 'Authentication date is invalid or expired' }
    ),

  /**
   * Security hash for verification (required)
   */
  hash: z
    .string({
      required_error: 'Authentication hash is required',
      invalid_type_error: 'Hash must be a string',
    })
    .min(64, { message: 'Invalid hash format' })
    .max(64, { message: 'Invalid hash format' })
    .regex(/^[a-f0-9]{64}$/, { message: 'Hash must be a valid SHA-256 hex string' }),
});

// Infer TypeScript type from Zod schema
export type TelegramLoginInput = z.infer<typeof loginSchema>;

// ============================================================================
// USER RECORD (PERSONAL RECORD) SCHEMA
// ============================================================================

/**
 * Create user record validation schema
 * Validates CreateUserRecordRequest from api.types.ts
 *
 * Used in: POST /api/users/:id/records
 */
export const createUserRecordSchema = z.object({
  /**
   * Exercise name (required)
   * e.g., "Back Squat", "Fran", "Deadlift"
   */
  exercise_name: z
    .string({
      required_error: 'Exercise name is required',
      invalid_type_error: 'Exercise name must be a string',
    })
    .min(1, { message: 'Exercise name must be at least 1 character' })
    .max(100, { message: 'Exercise name must be at most 100 characters' })
    .trim(),

  /**
   * Type of record (required)
   * e.g., "1RM", "time", "reps", "distance"
   */
  record_type: z
    .string({
      required_error: 'Record type is required',
      invalid_type_error: 'Record type must be a string',
    })
    .min(1, { message: 'Record type must be at least 1 character' })
    .max(50, { message: 'Record type must be at most 50 characters' })
    .trim(),

  /**
   * Record value (required)
   * Weight in kg/lb, time in seconds, reps, distance in meters, etc.
   */
  value: z
    .number({
      required_error: 'Record value is required',
      invalid_type_error: 'Record value must be a number',
    })
    .positive({ message: 'Record value must be positive' })
    .max(100000, { message: 'Record value seems unreasonably high' }),

  /**
   * Unit of measurement (optional)
   * e.g., "kg", "lb", "seconds", "reps", "meters"
   */
  unit: z
    .string()
    .max(20, { message: 'Unit must be at most 20 characters' })
    .trim()
    .optional(),

  /**
   * Date when record was achieved (optional, defaults to now)
   */
  achieved_at: z
    .string()
    .datetime({ message: 'Achieved date must be a valid ISO 8601 date' })
    .refine(
      (date) => new Date(date) <= new Date(),
      { message: 'Achieved date cannot be in the future' }
    )
    .optional(),
});

// Infer TypeScript type from Zod schema
export type CreateUserRecordInput = z.infer<typeof createUserRecordSchema>;

// ============================================================================
// PAGINATION SCHEMA
// ============================================================================

/**
 * Pagination query validation schema
 * Validates PaginationQuery from api.types.ts
 *
 * Used in: GET endpoints with pagination
 */
export const paginationQuerySchema = z.object({
  /**
   * Page number (1-indexed)
   * Default: 1
   */
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Page must be a positive number',
    }),

  /**
   * Items per page
   * Default: 10, Max: 100
   */
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    }),

  /**
   * Sort field (optional)
   */
  sortBy: z.string().max(50).optional(),

  /**
   * Sort order (optional)
   * Default: 'asc'
   */
  order: z.enum(['asc', 'desc']).optional().default('asc'),
});

// Infer TypeScript type from Zod schema
export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Export all schemas for use in validation middleware
 */
export const userSchemas = {
  // Main schemas
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  login: loginSchema,
  createUserRecord: createUserRecordSchema,
  paginationQuery: paginationQuerySchema,

  // Enum schemas (reusable)
  userRole: userRoleSchema,
  userLevel: userLevelSchema,
  userGender: userGenderSchema,
  userLanguage: userLanguageSchema,
  payoutMethod: payoutMethodSchema,

  // Field schemas (reusable)
  email: emailSchema,
  phoneNumber: phoneNumberSchema,
  url: urlSchema,
  timezone: timezoneSchema,
  dateOfBirth: dateOfBirthSchema,
};

// Default export
export default userSchemas;
