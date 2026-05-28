export type TestEnvKey =
  | 'PLAYWRIGHT_TEST_BASE_URL'
  | 'TEST_USER_NO_INSTITUTE_EMAIL'
  | 'TEST_USER_NO_INSTITUTE_PASSWORD'
  | 'TEST_USER_DIRECT_EMAIL'
  | 'TEST_USER_DIRECT_PASSWORD'
  | 'TEST_USER_ROLE_SELECTION_EMAIL'
  | 'TEST_USER_ROLE_SELECTION_PASSWORD'
  | 'TEST_USER_MULTI_INST_EMAIL'
  | 'TEST_USER_MULTI_INST_PASSWORD'
  | 'TEST_USER_MULTI_INST2_EMAIL'
  | 'TEST_USER_MULTI_INST2_PASSWORD'
  | 'TEST_USER_INVALID_PASSWORD_EMAIL'
  | 'TEST_USER_INVALID_PASSWORD'
  | 'TEST_USER_INVALID_EMAIL'
  | 'TEST_USER_INVALID_EMAIL_PASSWORD'
  | 'TEST_USER_MALFORMED_EMAIL'
  | 'TEST_USER_MALFORMED_EMAIL_PASSWORD';

export function getRequiredEnv(key: TestEnvKey): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[env] Required environment variable ${key} is missing. ` +
      'Create a frontend/.env file from frontend/.env.example and add the missing value.'
    );
  }
  return value;
}

export function getOptionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}
