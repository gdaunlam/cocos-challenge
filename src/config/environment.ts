export enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

export interface IEnvironmentConfig {
  nodeEnv: Environment;
  enableSwagger: boolean;
  port: number;
}