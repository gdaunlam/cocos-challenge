import { registerAs } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { IDatabaseConfig } from './environment';

class EnvironmentVariables {
  DB_HOST!: string;
  DB_PORT!: string;
  DB_USERNAME!: string;
  DB_PASSWORD!: string;
  DB_DATABASE!: string;
}

export const databaseConfiguration = registerAs('database', (): IDatabaseConfig => {
  const envVars = plainToClass(EnvironmentVariables, {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_DATABASE: process.env.DB_DATABASE,
  });

  return {
    dbHost: envVars.DB_HOST || 'localhost',
    dbPort: parseInt(envVars.DB_PORT, 10) || 5432,
    dbUsername: envVars.DB_USERNAME || 'postgres',
    dbPassword: envVars.DB_PASSWORD || 'postgres',
    dbDatabase: envVars.DB_DATABASE || 'nest_alive',
  };
});