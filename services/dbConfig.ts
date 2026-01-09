
/**
 * DATABASE CONNECTION CONFIGURATION
 * Note: Direct connection from frontend to SQL Server 1433 is restricted by browsers.
 * This configuration is intended for use in a backend environment or via a proxy service.
 */
export const SQL_CONFIG = {
  server: 'srv581460.hstgr.cloud',
  port: 1433,
  authentication: {
    type: 'default',
    options: {
      userName: 'sa', // Standard SQL user, adjust if different
      password: 'YourStrong!Passw0rd'
    }
  },
  options: {
    database: 'CRM_Spotlight_DB', // Assumed database name
    encrypt: true, // Use true for cloud providers
    trustServerCertificate: true
  }
};
