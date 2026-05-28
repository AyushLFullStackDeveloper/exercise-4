/**
 * Test Data — User Personas
 *
 * All credentials are loaded from environment variables defined in `frontend/.env`.
 * Never hardcode emails, passwords, or sensitive identifiers in this file.
 *
 * To set up: copy `frontend/.env.example` → `frontend/.env` and fill in values.
 */

import { getOptionalEnv, getRequiredEnv } from '../utils/env';

/**
 * Reads a required environment variable and throws a clear error if missing.
 */
const getEnv = getRequiredEnv;

/**
 * Reads an optional environment variable, with a configurable fallback.
 */
const getEnvOptional = getOptionalEnv;

// ─────────────────────────────────────────────────────────────────────────────
//  User Persona Definitions
// ─────────────────────────────────────────────────────────────────────────────

export interface UserCredentials {
  email: string;
  password: string;
  expectedFlow?: string;
  expectedError?: string;
  expectedInstitute?: string;
  expectedRole?: string;
  roles?: string[];
  institutes?: string[];
  selectedInstitute?: string;
  selectedRole?: string;
  fullName?: string;
}

export const USERS: Record<string, UserCredentials> = {

  // Scenario 1: User without institute — login succeeds but no institute assigned
  NO_INSTITUTE: {
    email:         getEnv('TEST_USER_NO_INSTITUTE_EMAIL'),
    password:      getEnv('TEST_USER_NO_INSTITUTE_PASSWORD'),
    expectedFlow:  'NO_INSTITUTE',
    expectedError: 'No institutes are assigned',
  },

  // Scenario 2: User with 1 Institute + 1 Role — auto-routes straight to Dashboard
  DIRECT_DASHBOARD: {
    email:             getEnv('TEST_USER_DIRECT_EMAIL'),
    password:          getEnv('TEST_USER_DIRECT_PASSWORD'),
    expectedFlow:      'DIRECT_DASHBOARD',
    expectedInstitute: 'Mentrix School of Design',
    expectedRole:      'Admin',
    fullName:          'Ayush Negi',
  },

  // Scenario 3: User with 1 Institute + Multiple Roles — lands on Role Selection
  ROLE_SELECTION: {
    email:             getEnv('TEST_USER_ROLE_SELECTION_EMAIL'),
    password:          getEnv('TEST_USER_ROLE_SELECTION_PASSWORD'),
    expectedFlow:      'ROLE_SELECTION',
    expectedInstitute: 'Mentrix Tech Academy',
    roles:             ['Admin', 'Student'],
    fullName:          'Divyanshu Saxena',
  },

  // Scenario 4a: User with Multiple Institutes + Multiple Roles
  MULTIPLE_INSTITUTES: {
    email:             getEnv('TEST_USER_MULTI_INST_EMAIL'),
    password:          getEnv('TEST_USER_MULTI_INST_PASSWORD'),
    expectedFlow:      'INSTITUTE_SELECTION',
    institutes:        [
      'Mentrix School of Design',
      'Mentrix Tech Academy',
      'Mentrix Business School',
      'Mentrix Healthcare',
      'Mentrix Global School',
    ],
    selectedInstitute: 'Mentrix Business School',
    roles:             ['Admin', 'Teacher', 'Student'],
    selectedRole:      'Teacher',
    fullName:          'Ayush Luthra',
  },

  // Scenario 4b: Alternate user with Multiple Institutes + Multiple Roles
  MULTIPLE_INSTITUTES_2: {
    email:             getEnv('TEST_USER_MULTI_INST2_EMAIL'),
    password:          getEnv('TEST_USER_MULTI_INST2_PASSWORD'),
    expectedFlow:      'INSTITUTE_SELECTION',
    institutes:        [
      'Mentrix School of Design',
      'Mentrix Tech Academy',
      'Mentrix Business School',
    ],
    selectedInstitute: 'Mentrix School of Design',
    roles:             ['Admin', 'Student'],
    selectedRole:      'Student',
    fullName:          'Pratik Sharma',
  },

  // Edge Case: Wrong password for a known account
  INVALID_PASSWORD: {
    email:         getEnv('TEST_USER_INVALID_PASSWORD_EMAIL'),
    password:      getEnv('TEST_USER_INVALID_PASSWORD'),
    expectedError: 'Invalid credentials',
  },

  // Edge Case: Non-existent account
  INVALID_EMAIL: {
    email:         getEnvOptional('TEST_USER_INVALID_EMAIL', 'notanuser@example.com'),
    password:      getEnvOptional('TEST_USER_INVALID_EMAIL_PASSWORD', 'anypassword'),
    expectedError: 'Invalid credentials',
  },

  // Edge Case: Malformed email (client-side validation)
  MALFORMED_EMAIL: {
    email:         getEnvOptional('TEST_USER_MALFORMED_EMAIL', 'malformedemail'),
    password:      getEnvOptional('TEST_USER_MALFORMED_EMAIL_PASSWORD', 'anypassword'),
    expectedError: 'Please enter a valid email address.',
  },
};
