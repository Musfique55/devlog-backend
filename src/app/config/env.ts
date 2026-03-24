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
        'JWT_SECRET'
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
    };
}

export const envVars = loadEnvs(); 