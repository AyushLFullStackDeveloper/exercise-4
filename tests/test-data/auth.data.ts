export const USERS = {
  // Scenario 1: User without institute
  NO_INSTITUTE: {
    email: 'ayushb@gmail.com',
    password: '123',
    expectedFlow: 'NO_INSTITUTE',
    expectedError: 'No institutes are assigned',
  },

  // Scenario 2: User with 1 Institute + 1 Role
  DIRECT_DASHBOARD: {
    email: 'ayushn@gmail.com',
    password: '123',
    expectedFlow: 'DIRECT_DASHBOARD',
    expectedInstitute: 'Mentrix School of Design',
    expectedRole: 'Admin',
    fullName: 'Ayush Negi',
  },

  // Scenario 3: User with 1 Institute + Multiple Roles
  ROLE_SELECTION: {
    email: 'divyanshu@gmail.com',
    password: '123',
    expectedFlow: 'ROLE_SELECTION',
    expectedInstitute: 'Mentrix Tech Academy',
    roles: ['Admin', 'Student'],
    fullName: 'Divyanshu Saxena',
  },

  // Scenario 4: User with Multiple Institutes + Multiple Roles
  MULTIPLE_INSTITUTES: {
    email: 'ayushl@gmail.com',
    password: '123',
    expectedFlow: 'INSTITUTE_SELECTION',
    institutes: ['Mentrix School of Design', 'Mentrix Tech Academy', 'Mentrix Business School', 'Mentrix Healthcare', 'Mentrix Global School'],
    selectedInstitute: 'Mentrix Business School',
    roles: ['Admin', 'Teacher', 'Student'],
    selectedRole: 'Teacher',
    fullName: 'Ayush Luthra',
  },
  
  MULTIPLE_INSTITUTES_2: {
    email: 'pratik@gmail.com',
    password: '123',
    expectedFlow: 'INSTITUTE_SELECTION',
    institutes: ['Mentrix School of Design', 'Mentrix Tech Academy', 'Mentrix Business School'],
    selectedInstitute: 'Mentrix School of Design',
    roles: ['Admin', 'Student'],
    selectedRole: 'Student',
    fullName: 'Pratik Sharma',
  },

  // Common Edge Cases
  INVALID_PASSWORD: {
    email: 'ayushn@gmail.com',
    password: 'wrongpassword',
    expectedError: 'Invalid credentials',
  },
  
  INVALID_EMAIL: {
    email: 'notanuser@gmail.com',
    password: '123',
    expectedError: 'Invalid credentials',
  },

  MALFORMED_EMAIL: {
    email: 'malformedemail',
    password: '123',
    expectedError: 'Please enter a valid email address.',
  }
};
