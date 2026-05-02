import { registerAs } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { IEnvironmentConfig } from './environment';

export enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

class EnvironmentVariables {
  NODE_ENV!: string;
  ENABLE_SWAGGER!: boolean;
  PORT!: number;
}

export const configuration = registerAs('environment', (): IEnvironmentConfig => {
  const nodeEnv = (process.env.NODE_ENV || Environment.Development) as Environment;

  if (!Object.values(Environment).includes(nodeEnv)) {
    throw new Error(`Invalid NODE_ENV: ${nodeEnv}`);
  }

  const envVars = plainToClass(EnvironmentVariables, {
    NODE_ENV: process.env.NODE_ENV,
    ENABLE_SWAGGER: process.env.ENABLE_SWAGGER === 'true',
    PORT: parseInt(process.env.PORT || '3000', 10),
  });

  let enableSwagger: boolean;
  if (typeof envVars.ENABLE_SWAGGER === 'boolean') {
    enableSwagger = envVars.ENABLE_SWAGGER;
  } else {
    enableSwagger = process.env.ENABLE_SWAGGER === 'true';
  }

  return {
    nodeEnv,
    enableSwagger,
    port: envVars.PORT,
  };
});