import { TraceService } from '../tracer/trace.service';
import { LoggerMiddleware } from './logger.middleware';
import { Logger } from '@nestjs/common';

describe('LoggerMiddleware', () => {
  let traceService: TraceService;
  let loggedMessages: string[] = [];
  let middleware: LoggerMiddleware;

  beforeEach(() => {
    loggedMessages = [];
    traceService = new TraceService();

    Logger.prototype.log = function (message: string) {
      loggedMessages.push(message);
    };

    middleware = new LoggerMiddleware(traceService);
  });

  afterEach(() => {
    Logger.prototype.log = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should log with trace ID, method, url and user-agent', () => {
      const mockRequest = {
        method: 'GET',
        url: '/instruments/health',
        headers: { 'user-agent': 'curl/7.68.0' },
      };
      const mockResponse = {};
      const mockNext = jest.fn();

      traceService.runWithTraceId('test-trace-123', () => {
        middleware.use(mockRequest as any, mockResponse as any, mockNext as any);
      });

      expect(loggedMessages[0]).toBe(
        '[test-trace-123] GET /instruments/health - curl/7.68.0',
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should show correct URL (not just "/") when logging requests', () => {
      const mockRequest = {
        method: 'POST',
        url: '/instruments',
        headers: { 'user-agent': 'test-client' },
      };
      const mockResponse = {};
      const mockNext = jest.fn();

      traceService.runWithTraceId('trace-url-test', () => {
        middleware.use(mockRequest as any, mockResponse as any, mockNext as any);
      });

      expect(loggedMessages[0]).toContain('/instruments');
    });

    it('should use "-" as default user-agent when not provided', () => {
      const mockRequest = {
        method: 'GET',
        url: '/instruments',
        headers: {},
      };
      const mockResponse = {};
      const mockNext = jest.fn();

      traceService.runWithTraceId('trace-no-agent', () => {
        middleware.use(mockRequest as any, mockResponse as any, mockNext as any);
      });

      expect(loggedMessages[0]).toBe(
        '[trace-no-agent] GET /instruments - -',
      );
    });

    it('should log with no-trace when outside trace context', () => {
      const mockRequest = {
        method: 'GET',
        url: '/test',
        headers: { 'user-agent': 'test' },
      };
      const mockResponse = {};
      const mockNext = jest.fn();

      middleware.use(mockRequest as any, mockResponse as any, mockNext as any);

      expect(loggedMessages[0]).toBe('[no-trace] GET /test - test');
    });

    it('should handle DELETE method correctly', () => {
      const mockRequest = {
        method: 'DELETE',
        url: '/instruments/Guitar',
        headers: { 'user-agent': 'curl/7.68.0' },
      };
      const mockResponse = {};
      const mockNext = jest.fn();

      traceService.runWithTraceId('delete-trace', () => {
        middleware.use(mockRequest as any, mockResponse as any, mockNext as any);
      });

      expect(loggedMessages[0]).toBe(
        '[delete-trace] DELETE /instruments/Guitar - curl/7.68.0',
      );
    });

    it('should call next() to allow request to continue', () => {
      const mockRequest = {
        method: 'GET',
        url: '/health',
        headers: {},
      };
      const mockResponse = {};
      const mockNext = jest.fn();

      middleware.use(mockRequest as any, mockResponse as any, mockNext as any);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });
});