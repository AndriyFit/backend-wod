/**
 * Database Types for WOD Tracker Backend
 *
 * This file contains all TypeScript type definitions that match the database schema.
 * All types are strictly typed with no 'any' types.
 * Date fields are represented as strings in ISO 8601 format.
 */

// ============================================================================
// ENUMS & UNION TYPES
// ============================================================================

/**
 * User role in the system
 * - athlete: Regular user who tracks workouts
 * - coach: Can create workouts and manage communities
 * - admin: Full system access
 */
export type UserRole = 'athlete' | 'coach' | 'admin';

/**
 * CrossFit workout scaling level
 * - scaled: Modified/easier version of workout
 * - intermediate: Between scaled and RX
 * - rx: As prescribed (standard/advanced level)
 */
export type UserLevel = 'scaled' | 'intermediate' | 'rx';

/**
 * User gender identification
 */
export type UserGender = 'male' | 'female' | 'other';

/**
 * Supported application languages
 * - uk: Ukrainian
 * - en: English
 * - ru: Russian
 */
export type UserLanguage = 'uk' | 'en' | 'ru';

/**
 * Payment methods for coach payouts
 */
export type PayoutMethod = 'bank_transfer' | 'paypal' | 'stripe';

// ============================================================================
// MAIN USER INTERFACE
// ============================================================================

/**
 * Complete User entity matching the database schema
 * Represents all fields stored in the users table
 */
export interface User {
  /** Telegram user ID (primary key) */
  id: number;

  /** Telegram username (without @) */
  username: string | null;

  /** User's first name (required) */
  first_name: string;

  /** User's last name */
  last_name: string | null;

  /** Profile photo URL from Telegram */
  photo_url: string | null;

  /** Contact email address */
  email: string | null;

  /** Contact phone number */
  phone_number: string | null;

  /** User's role in the system */
  role: UserRole;

  /** CrossFit workout level */
  level: UserLevel;

  /** Height in centimeters */
  height_cm: number | null;

  /** Weight in kilograms (up to 999.99) */
  weight_kg: number | null;

  /** Date of birth (ISO 8601 date string) */
  date_of_birth: string | null;

  /** Gender identification */
  gender: UserGender | null;

  /** Years of CrossFit experience */
  experience_years: number | null;

  /** User's fitness goals (free text) */
  goals: string | null;

  /** Known injuries or limitations (free text) */
  injuries: string | null;

  /** Additional notes about the user */
  notes: string | null;

  /** Preferred interface language */
  language: UserLanguage;

  /** User's timezone (IANA format, e.g., 'Europe/Kiev') */
  timezone: string;

  /** Whether notifications are enabled */
  notifications_enabled: boolean;

  /** Whether the account is active */
  is_active: boolean;

  /** Whether the user has verified their account */
  is_verified: boolean;

  /** Bank account number for payouts (coaches only) */
  bank_account_number: string | null;

  /** Name on bank account */
  bank_account_holder: string | null;

  /** Bank name for transfers */
  bank_name: string | null;

  /** PayPal email for payouts */
  paypal_email: string | null;

  /** Preferred payout method for coaches */
  payout_method: PayoutMethod | null;

  /** Account creation timestamp (ISO 8601) */
  created_at: string;

  /** Last profile update timestamp (ISO 8601) */
  updated_at: string;

  /** Last activity/login timestamp (ISO 8601) */
  last_active_at: string | null;
}

// ============================================================================
// DATA TRANSFER OBJECTS (DTOs)
// ============================================================================

/**
 * DTO for creating a new user account
 * Used during registration or Telegram authentication
 */
export interface CreateUserDTO {
  /** Telegram user ID (required) */
  id: number;

  /** User's first name from Telegram (required) */
  first_name: string;

  /** Telegram username (optional) */
  username?: string | null;

  /** User's last name from Telegram (optional) */
  last_name?: string | null;

  /** Profile photo URL from Telegram (optional) */
  photo_url?: string | null;

  /** Initial role assignment (optional, defaults to 'athlete') */
  role?: UserRole;

  /** Preferred language (optional, defaults to 'uk') */
  language?: UserLanguage;
}

/**
 * DTO for updating user profile information
 * All fields are optional except id (to identify the user)
 * Used for profile updates and settings changes
 */
export interface UpdateUserDTO {
  /** User ID (required for identification, but not updated) */
  id: number;

  /** Update username */
  username?: string | null;

  /** Update first name */
  first_name?: string;

  /** Update last name */
  last_name?: string | null;

  /** Update photo URL */
  photo_url?: string | null;

  /** Update email */
  email?: string | null;

  /** Update phone number */
  phone_number?: string | null;

  /** Update workout level */
  level?: UserLevel;

  /** Update height */
  height_cm?: number | null;

  /** Update weight */
  weight_kg?: number | null;

  /** Update date of birth */
  date_of_birth?: string | null;

  /** Update gender */
  gender?: UserGender | null;

  /** Update experience years */
  experience_years?: number | null;

  /** Update fitness goals */
  goals?: string | null;

  /** Update injuries/limitations */
  injuries?: string | null;

  /** Update notes */
  notes?: string | null;

  /** Update language preference */
  language?: UserLanguage;

  /** Update timezone */
  timezone?: string;

  /** Update notification settings */
  notifications_enabled?: boolean;

  /** Update bank account number (coaches only) */
  bank_account_number?: string | null;

  /** Update bank account holder name */
  bank_account_holder?: string | null;

  /** Update bank name */
  bank_name?: string | null;

  /** Update PayPal email */
  paypal_email?: string | null;

  /** Update payout method */
  payout_method?: PayoutMethod | null;
}

/**
 * Public user profile (visible to other users)
 * Excludes sensitive information like contact details and payment info
 */
export interface PublicUserProfile {
  /** User ID */
  id: number;

  /** Username */
  username: string | null;

  /** First name */
  first_name: string;

  /** Last name */
  last_name: string | null;

  /** Profile photo URL */
  photo_url: string | null;

  /** User role */
  role: UserRole;

  /** Workout level */
  level: UserLevel;

  /** Whether account is verified */
  is_verified: boolean;

  /** Years of experience */
  experience_years: number | null;
}

/**
 * Private user profile (user's own full profile)
 * Extends the full User interface with all fields visible
 * Used when user requests their own profile information
 */
export interface PrivateUserProfile extends User {
  // Inherits all fields from User interface
  // This type explicitly shows this is the user's own data
}

/**
 * Coach-specific profile extension
 * Adds coaching statistics to the public profile
 */
export interface CoachProfile extends PublicUserProfile {
  /** Number of communities the coach manages (optional) */
  total_communities?: number;

  /** Number of athletes the coach trains (optional) */
  total_athletes?: number;

  /** Number of workouts the coach has created (optional) */
  total_workouts?: number;
}

// ============================================================================
// TYPE GUARDS (Optional utility functions)
// ============================================================================

/**
 * Type guard to check if a user is a coach
 */
export function isCoach(user: User | PublicUserProfile): boolean {
  return user.role === 'coach';
}

/**
 * Type guard to check if a user is an admin
 */
export function isAdmin(user: User | PublicUserProfile): boolean {
  return user.role === 'admin';
}

/**
 * Type guard to check if a user has elevated privileges (coach or admin)
 */
export function hasElevatedPrivileges(user: User | PublicUserProfile): boolean {
  return user.role === 'coach' || user.role === 'admin';
}
