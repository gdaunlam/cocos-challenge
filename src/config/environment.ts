export enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

const validateNodeEnv = (): Environment => {
  const env = process.env.NODE_ENV as Environment;
  if (!Object.values(Environment).includes(env)) {
    return Environment.Development;
  }
  return env;
};

const validatePort = (): number => {
  const port = parseInt(process.env.PORT || '', 10);
  if (isNaN(port) || port < 0 || port > 65535) {
    return 3000;
  }
  return port;
};

export const environment = {
  nodeEnv: validateNodeEnv(),
  enableSwagger: process.env.ENABLE_SWAGGER === 'true',
  port: validatePort(),
} as const;