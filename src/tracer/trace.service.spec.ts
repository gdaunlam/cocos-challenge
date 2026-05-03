import { Test, TestingModule } from '@nestjs/testing';
import { TraceService } from './trace.service';

describe('TraceService', () => {
  let service: TraceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TraceService],
    }).compile();

    service = module.get<TraceService>(TraceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTraceId', () => {
    it('should return "no-trace" when no store exists', () => {
      const result = service.getTraceId();
      expect(result).toBe('no-trace');
    });

    it('should return traceId from store when store exists', () => {
      const expectedTraceId = 'test-trace-123';
      service.runWithTraceId(expectedTraceId, () => {
        const result = service.getTraceId();
        expect(result).toBe(expectedTraceId);
      });
    });

    it('should return different traceIds for different contexts', () => {
      service.runWithTraceId('trace-1', () => {
        const id1 = service.getTraceId();
        service.runWithTraceId('trace-2', () => {
          const id2 = service.getTraceId();
          expect(id1).toBe('trace-1');
          expect(id2).toBe('trace-2');
        });
      });
    });
  });

  describe('extractOrCreateTraceId', () => {
    it('should return header value when x-trace-id is present', () => {
      const headers = { 'x-trace-id': 'my-custom-trace' };
      const result = service.extractOrCreateTraceId(headers);
      expect(result).toBe('my-custom-trace');
    });

    it('should generate UUID when x-trace-id is not present', () => {
      const headers = {};
      const result = service.extractOrCreateTraceId(headers);
      expect(result).toBeDefined();
      expect(result).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate different UUIDs for different calls', () => {
      const headers = {};
      const result1 = service.extractOrCreateTraceId(headers);
      const result2 = service.extractOrCreateTraceId(headers);
      expect(result1).not.toBe(result2);
    });

    it('should use header value when present', () => {
      const headers = { 'x-trace-id': 'my-custom-trace' };
      const result = service.extractOrCreateTraceId(headers);
      expect(result).toBe('my-custom-trace');
    });
  });

  describe('runWithTraceId', () => {
    it('should execute callback within trace context', () => {
      const traceId = 'context-trace-456';
      const result = service.runWithTraceId(traceId, () => {
        return service.getTraceId();
      });
      expect(result).toBe(traceId);
    });

    it('should return value from callback', () => {
      const result = service.runWithTraceId('trace-789', () => {
        return { data: 'test', value: 42 };
      });
      expect(result).toEqual({ data: 'test', value: 42 });
    });

    it('should not leak trace context outside callback', () => {
      service.runWithTraceId('inner-trace', () => {
        expect(service.getTraceId()).toBe('inner-trace');
      });
      expect(service.getTraceId()).toBe('no-trace');
    });

    it('should handle nested runWithTraceId (inner sets context)', () => {
      service.runWithTraceId('outer', () => {
        expect(service.getTraceId()).toBe('outer');
        service.runWithTraceId('inner', () => {
          expect(service.getTraceId()).toBe('inner');
        });
        expect(service.getTraceId()).toBe('outer');
      });
    });
  });
});