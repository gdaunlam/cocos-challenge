import { registerAs } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Environment, IEnvironmentConfig } from './environment';
import { InternalServerErrorException } from '@nestjs/common';

class EnvironmentVariables {
  NODE_ENV!: string;
  ENABLE_SWAGGER!: string;
  PORT!: string;
}

export const configuration = registerAs('environment', (): IEnvironmentConfig => {
  const nodeEnv = (process.env.NODE_ENV || Environment.Development) as Environment;

  if (!Object.values(Environment).includes(nodeEnv)) {
    throw new InternalServerErrorException(`Invalid NODE_ENV: ${nodeEnv}`);
  }

  const envVars = plainToClass(EnvironmentVariables, {
    NODE_ENV: process.env.NODE_ENV,
    ENABLE_SWAGGER: process.env.ENABLE_SWAGGER,
    PORT: process.env.PORT,
  });

  return {
    nodeEnv,
    enableSwagger: envVars.ENABLE_SWAGGER === 'true',
    port: parseInt(envVars.PORT, 10) || 3000,
  };
});