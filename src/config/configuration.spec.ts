import { configuration } from './configuration';
import { Environment } from './environment';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('configuration factory', () => {
    it('should return production config with swagger disabled', () => {
      process.env.NODE_ENV = Environment.Production;
      process.env.ENABLE_SWAGGER = 'false';
      process.env.PORT = '3000';

      const config = configuration();

      expect(config.nodeEnv).toBe(Environment.Production);
      expect(config.enableSwagger).toBe(false);
      expect(config.port).toBe(3000);
    });

    it('should return development config with swagger enabled', () => {
      process.env.NODE_ENV = Environment.Development;
      process.env.ENABLE_SWAGGER = 'true';
      process.env.PORT = '3000';

      const config = configuration();

      expect(config.nodeEnv).toBe(Environment.Development);
      expect(config.enableSwagger).toBe(true);
      expect(config.port).toBe(3000);
    });

    it('should return staging config with swagger enabled', () => {
      process.env.NODE_ENV = Environment.Staging;
      process.env.ENABLE_SWAGGER = 'true';
      process.env.PORT = '8080';

      const config = configuration();

      expect(config.nodeEnv).toBe(Environment.Staging);
      expect(config.enableSwagger).toBe(true);
      expect(config.port).toBe(8080);
    });

    it('should throw error for invalid NODE_ENV', () => {
      process.env.NODE_ENV = 'invalid_env';
      process.env.ENABLE_SWAGGER = 'true';
      process.env.PORT = '3000';

      expect(() => configuration()).toThrow('Invalid NODE_ENV: invalid_env');
    });

    it('should default port to 3000 when not set', () => {
      process.env.NODE_ENV = Environment.Development;
      process.env.ENABLE_SWAGGER = 'true';
      delete process.env.PORT;

      const config = configuration();

      expect(config.port).toBe(3000);
    });

    it('should default to development when NODE_ENV not set', () => {
      delete process.env.NODE_ENV;
      process.env.ENABLE_SWAGGER = 'false';
      process.env.PORT = '3000';

      const config = configuration();

      expect(config.nodeEnv).toBe(Environment.Development);
    });

    it('should parse PORT as integer', () => {
      process.env.NODE_ENV = Environment.Development;
      process.env.ENABLE_SWAGGER = 'true';
      process.env.PORT = '8080';

      const config = configuration();

      expect(config.port).toBe(8080);
      expect(typeof config.port).toBe('number');
    });

    it('should handle malformed PORT gracefully', () => {
      process.env.NODE_ENV = Environment.Development;
      process.env.ENABLE_SWAGGER = 'true';
      process.env.PORT = 'not-a-number';

      const config = configuration();

      expect(config.port).toBe(3000);
    });

    it('should parse enableSwagger as boolean true', () => {
      process.env.NODE_ENV = Environment.Development;
      process.env.ENABLE_SWAGGER = 'true';
      process.env.PORT = '3000';

      const config = configuration();

      expect(config.enableSwagger).toBe(true);
      expect(typeof config.enableSwagger).toBe('boolean');
    });

    it('should parse enableSwagger as boolean false', () => {
      process.env.NODE_ENV = Environment.Development;
      process.env.ENABLE_SWAGGER = 'false';
      process.env.PORT = '3000';

      const config = configuration();

      expect(config.enableSwagger).toBe(false);
      expect(typeof config.enableSwagger).toBe('boolean');
    });

    it('should handle empty string enableSwagger as false', () => {
      process.env.NODE_ENV = Environment.Development;
      process.env.ENABLE_SWAGGER = '';
      process.env.PORT = '3000';

      const config = configuration();

      expect(config.enableSwagger).toBe(false);
    });
  });

  describe('Environment enum', () => {
    it('should have development, staging, and production values', () => {
      expect(Environment.Development).toBe('development');
      expect(Environment.Staging).toBe('staging');
      expect(Environment.Production).toBe('production');
    });
  });
});