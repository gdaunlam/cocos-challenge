import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';
import { TraceService } from './trace.service';
import { TraceInterceptor } from './trace.interceptor';
import { TraceExceptionFilter } from './trace.filter';
import { TraceMiddleware } from './trace.middleware';
import { LoggerMiddleware } from '../logger/logger.middleware';

describe('Trace Integration (Middleware → Interceptor → Filter)', () => {
  let traceService: TraceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TraceService],
    }).compile();

    traceService = module.get<TraceService>(TraceService);
  });

  describe('TraceInterceptor', () => {
    it('should use existing trace ID from context', (done) => {
      const interceptor = new TraceInterceptor(traceService);

      traceService.runWithTraceId('existing-trace', () => {
        const mockContext = {
          switchToHttp: () => ({
            getRequest: () => ({ headers: {} }),
          }),
        } as ExecutionContext;

        const callHandler: CallHandler = {
          handle: () => of('test'),
        };

        interceptor.intercept(mockContext, callHandler).subscribe({
          next: (value) => {
            expect(value).toBe('test');
            done();
          },
        });
      });
    });

    it('should extract trace ID from x-trace-id header', (done) => {
      const interceptor = new TraceInterceptor(traceService);

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({ headers: { 'x-trace-id': 'custom-trace-123' } }),
        }),
      } as ExecutionContext;

      const callHandler: CallHandler = {
        handle: () => of('test'),
      };

      interceptor.intercept(mockContext, callHandler).subscribe({
        complete: () => done(),
      });
    });

    it('should generate UUID when no trace ID provided', (done) => {
      const interceptor = new TraceInterceptor(traceService);

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({ headers: {} }),
        }),
      } as ExecutionContext;

      const callHandler: CallHandler = {
        handle: () => of('test'),
      };

      interceptor.intercept(mockContext, callHandler).subscribe({
        complete: () => done(),
      });
    });

    it('should propagate trace context to inner observable', (done) => {
      const interceptor = new TraceInterceptor(traceService);

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({ headers: { 'x-trace-id': 'observable-trace' } }),
        }),
      } as ExecutionContext;

      const callHandler: CallHandler = {
        handle: () => of('inner-value'),
      };

      interceptor.intercept(mockContext, callHandler).subscribe({
        next: (value) => {
          expect(value).toBe('inner-value');
          done();
        },
      });
    });
  });

  describe('TraceMiddleware', () => {
    it('should set trace ID in context on request', (done) => {
      const middleware = new TraceMiddleware(traceService);

      const mockRequest = {
        headers: { 'x-trace-id': 'middleware-trace' },
      };
      const mockResponse = {};
      const mockNext = () => {
        done();
      };

      middleware.use(mockRequest as any, mockResponse as any, mockNext as any);
    });

    it('should generate UUID when x-trace-id not in headers', (done) => {
      const middleware = new TraceMiddleware(traceService);

      const mockRequest = {
        headers: {},
      };
      const mockResponse = {};
      const mockNext = () => {
        done();
      };

      middleware.use(mockRequest as any, mockResponse as any, mockNext as any);
    });

    it('should call next() after setting context', () => {
      const middleware = new TraceMiddleware(traceService);
      let nextCalled = false;

      const mockRequest = { headers: { 'x-trace-id': 'trace-next' } };
      const mockResponse = {};
      const mockNext = () => {
        nextCalled = true;
      };

      middleware.use(mockRequest as any, mockResponse as any, mockNext as any);
      expect(nextCalled).toBe(true);
    });
  });

  describe('LoggerMiddleware', () => {
    it('should log with trace ID and correct URL', (done) => {
      const loggerMiddleware = new LoggerMiddleware(traceService);

      const mockRequest = {
        method: 'GET',
        url: '/instrument/search',
        headers: { 'user-agent': 'test-agent' },
      };
      const mockResponse = {};
      const mockNext = () => {
        done();
      };

      loggerMiddleware.use(mockRequest as any, mockResponse as any, mockNext as any);
    });

    it('should use "-" as default user-agent when not provided', (done) => {
      const loggerMiddleware = new LoggerMiddleware(traceService);

      const mockRequest = {
        method: 'GET',
        url: '/instrument',
        headers: {},
      };
      const mockResponse = {};
      const mockNext = () => {
        done();
      };

      loggerMiddleware.use(mockRequest as any, mockResponse as any, mockNext as any);
    });
  });

  describe('TraceExceptionFilter', () => {
    let filter: TraceExceptionFilter;

    beforeEach(() => {
      filter = new TraceExceptionFilter(traceService);
    });

    it('should include traceId in error response', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockRequest = {
        method: 'GET',
        url: '/instrument/search',
      };
      const mockHost = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      };

      const error = new Error('Test error');
      traceService.runWithTraceId('filter-trace-123', () => {
        filter.catch(error, mockHost as any);
      });

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: 'filter-trace-123',
          statusCode: 500,
        }),
      );
    });

    it('should return correct status for HttpException', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockRequest = {
        method: 'POST',
        url: '/instrument',
      };
      const mockHost = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      };

      const httpError = new BadRequestException('Instrument already exists');
      filter.catch(httpError, mockHost as any);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.objectContaining({
            message: 'Instrument already exists',
          }),
        }),
      );
    });

    it('should return 500 for non-HttpException errors', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockRequest = {
        method: 'GET',
        url: '/test',
      };
      const mockHost = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      };

      const error = new Error('Something went wrong');
      filter.catch(error, mockHost as any);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Internal server error',
        }),
      );
    });

    it('should include timestamp in response', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockRequest = {
        method: 'GET',
        url: '/test',
      };
      const mockHost = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      };

      const before = new Date().toISOString();
      filter.catch(new Error('test'), mockHost as any);
      const after = new Date().toISOString();

      const jsonCall = mockResponse.json.mock.calls[0][0];
      expect(jsonCall.timestamp).toBeDefined();
      expect(new Date(jsonCall.timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(before).getTime() - 1000,
      );
      expect(new Date(jsonCall.timestamp).getTime()).toBeLessThanOrEqual(
        new Date(after).getTime() + 1000,
      );
    });

    it('should include path in response', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockRequest = {
        method: 'GET',
        url: '/instrument/search',
      };
      const mockHost = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      };

      filter.catch(new Error('test'), mockHost as any);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/instrument/search',
        }),
      );
    });
  });
});