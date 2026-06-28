// Validation for required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Fatal Error: Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(` - ${varName}`);
  });
  console.error('Please configure them in your .env file.');
  process.exit(1);
}

module.exports = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  cronTimezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata'
};
