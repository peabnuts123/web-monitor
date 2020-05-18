/**
 * Config defined through environment variables
 */
const ENV = {
  Config: {
    /** Host name for connection to browser */
    BROWSER_HOST: requiredString('BROWSER_HOST'),
  },
  AWS: {
    /** AWS access key credential: AWS_ACCESS_KEY_ID */
    ACCESS_KEY_ID: requiredString('AWS_ACCESS_KEY_ID'),
    /** AWS secret key credential: AWS_SECRET_ACCESS_KEY */
    SECRET_ACCESS_KEY: requiredString('AWS_SECRET_ACCESS_KEY'),
    /** AWS region associated with the supplied credentials */
    REGION: requiredString('AWS_REGION'),
  },
  Email: {
    /** Email address to send change notices to */
    TO_ADDRESS: requiredString('EMAIL_TO_ADDRESS'),
    /** Email address the change notices are "sent from" */
    FROM_ADDRESS: requiredString('EMAIL_FROM_ADDRESS'),
    /** String to prefix the subject line with (a space will be appended automatically) */
    SUBJECT_PREFIX: requiredString('EMAIL_SUBJECT_PREFIX'),
  }
};

// Validation functions
/**
 * Parse an environment variable and validate it as a required field that must be of type string.
 * @param variableName Environment variable to parse
 */
function requiredString(variableName: string): string {
  const value = process.env[variableName];

  if (value === undefined) {
    throw new Error(`Empty required environment variable: '${variableName}' must be defined`);
  } else {
    return value;
  }
}

export default ENV;
