interface envVars  {
  DATABASE_URL: string;
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  FRONTEND_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  JWT_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  ADMIN : {
    ADMIN_USERNAME: string;
    ADMIN_EMAIL: string;
    ADMIN_PASSWORD: string;
  }
  EMAIL_SENDER_SMTP_USER: string;
  EMAIL_SENDER_SMTP_PASSWORD: string;
  EMAIL_SENDER_SMTP_HOST: string;
  EMAIL_SENDER_SMTP_PORT: string;
  CLOUDINARY : {
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  }
}


const loadEnvs = () => {
    const envs = [
        'DATABASE_URL',
        'PORT',
        'NODE_ENV',
        'FRONTEND_URL',
        'BETTER_AUTH_SECRET',
        'BETTER_AUTH_URL',
        'ACCESS_TOKEN_EXPIRES_IN',
        'REFRESH_TOKEN_EXPIRES_IN',
        'JWT_SECRET',
        'ADMIN_USERNAME',
        'ADMIN_EMAIL',
        'ADMIN_PASSWORD',
        'EMAIL_SENDER_SMTP_USER',
        'EMAIL_SENDER_SMTP_PASSWORD',
        'EMAIL_SENDER_SMTP_HOST',
        'EMAIL_SENDER_SMTP_PORT',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
    ];

    envs.forEach(env => {
        if (!process.env[env]) {
            throw new Error(`Missing environment variable: ${env}`);
        }
    });

    return {
        DATABASE_URL: process.env.DATABASE_URL as string,
        PORT: process.env.PORT as string,
        NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
        FRONTEND_URL: process.env.FRONTEND_URL as string,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
        ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
        REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
        JWT_SECRET: process.env.JWT_SECRET as string,
        ADMIN: {
            ADMIN_USERNAME: process.env.ADMIN_USERNAME as string,
            ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
            ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
        },
        EMAIL_SENDER_SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string,
        EMAIL_SENDER_SMTP_PASSWORD: process.env.EMAIL_SENDER_SMTP_PASSWORD as string,
        EMAIL_SENDER_SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST as string,
        EMAIL_SENDER_SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT as string,
        CLOUDINARY: {
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
        }
    };
}

export const envVars = loadEnvs(); 