const data = require('../../../../data/data.json');
import { OrderService } from './order.service';
import { OrderRepositoryImpl } from '../repository/order.repository.impl';
import { InstrumentRepositoryImpl } from '../../instrument/repository/instrument.repository.impl';
import { MarketDataRepositoryImpl } from '../../marketdata/repository/marketdata.repository.impl';
import { cacheService } from '../../shared/cache';
import { Order, Side } from '../../../database/migrations/entities/order.entity';
import { MarketData } from '../../../database/migrations/entities/marketdata.entity';
import { Instrument } from '../../../database/migrations/entities/instrument.entity';

const orders = data.orders as Order[];
const marketData = data.marketdata as MarketData[];
const instruments = data.instruments as Instrument[];

const createMockOrderRepository = (overrides?: Partial<OrderRepositoryImpl>): OrderRepositoryImpl => ({
  findByUserId: jest.fn().mockImplementation((userId: number) =>
    Promise.resolve(orders.filter(o => o.userId === userId))
  ),
  findAll: jest.fn().mockResolvedValue(orders),
  save: jest.fn().mockImplementation((order: Order) => Promise.resolve({ ...order, id: 100 })),
  ...overrides,
} as unknown as OrderRepositoryImpl);

const createMockInstrumentRepository = (): InstrumentRepositoryImpl => ({
  findAll: jest.fn().mockResolvedValue(instruments),
  findByType: jest.fn(),
  findById: jest.fn(),
  findWithSimilarity: jest.fn().mockResolvedValue([]),
} as unknown as InstrumentRepositoryImpl);

const createMockMarketDataRepository = (): MarketDataRepositoryImpl => ({
  findAll: jest.fn().mockResolvedValue(marketData),
  findByInstrumentId: jest.fn(),
} as unknown as MarketDataRepositoryImpl);

describe('OrderService', () => {
  let mockOrderRepository: OrderRepositoryImpl;
  let mockInstrumentRepository: InstrumentRepositoryImpl;
  let mockMarketDataRepository: MarketDataRepositoryImpl;

  beforeEach(() => {
    cacheService.clear();
    mockOrderRepository = createMockOrderRepository();
    mockInstrumentRepository = createMockInstrumentRepository();
    mockMarketDataRepository = createMockMarketDataRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('BUY orders', () => {
    it('BUY MARKET with quantity: valid order should be FILLED', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository
      );

      const result = await service.createOrder({
        instrumentId: 1,
        userId: 1,
        side: 'BUY' as Side,
        quantity: 10,
        price: undefined,
      });

      expect(result.order.status).toBe('FILLED');
      expect(result.order.side).toBe('BUY');
      expect(result.order.type).toBe('MARKET');
    });

    it('BUY LIMIT with quantity: valid order should be NEW', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository
      );

      const result = await service.createOrder({
        instrumentId: 1,
        userId: 1,
        side: 'BUY' as Side,
        quantity: 10,
        price: 200,
      });

      expect(result.order.status).toBe('NEW');
      expect(result.order.side).toBe('BUY');
      expect(result.order.type).toBe('LIMIT');
    });

    it('BUY without funds should be REJECTED', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository
      );

      const result = await service.createOrder({
        instrumentId: 1,
        userId: 1,
        side: 'BUY' as Side,
        quantity: 10000000,
        price: 1000,
      });

      expect(result.order.status).toBe('REJECTED');
    });

    it('BUY with amount: should calculate max shares and be FILLED (MARKET)', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository
      );

      const result = await service.createOrder({
        instrumentId: 47,
        userId: 1,
        side: 'BUY' as Side,
        amount: 50000,
        price: undefined,
      });

      const maxShares = Math.floor(50000 / result.order.price);
      expect(result.order.size).toBe(maxShares);
      expect(result.order.status).toBe('FILLED');
      expect(result.order.type).toBe('MARKET');
    });
  });

  describe('SELL orders', () => {
    it('SELL MARKET with quantity: valid order should be FILLED', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository
      );

      const result = await service.createOrder({
        instrumentId: 47,
        userId: 1,
        side: 'SELL' as Side,
        quantity: 10,
        price: undefined,
      });

      expect(result.order.status).toBe('FILLED');
      expect(result.order.side).toBe('SELL');
      expect(result.order.type).toBe('MARKET');
    });

    it('SELL LIMIT with quantity: valid order should be NEW', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository
      );

      const result = await service.createOrder({
        instrumentId: 47,
        userId: 1,
        side: 'SELL' as Side,
        quantity: 10,
        price: 900,
      });

      expect(result.order.status).toBe('NEW');
      expect(result.order.side).toBe('SELL');
      expect(result.order.type).toBe('LIMIT');
    });

    it('SELL without holdings should be REJECTED', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository
      );

      const result = await service.createOrder({
        instrumentId: 47,
        userId: 1,
        side: 'SELL' as Side,
        quantity: 10000,
        price: 900,
      });

      expect(result.order.status).toBe('REJECTED');
    });
  });

  describe('input validation', () => {
    it('should reject when neither quantity nor amount provided', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository
      );

      await expect(service.createOrder({
        instrumentId: 1,
        userId: 1,
        side: 'BUY' as Side,
      })).rejects.toThrow('quantity or amount is required');
    });

    it('should reject when both quantity and amount provided', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository
      );

      await expect(service.createOrder({
        instrumentId: 1,
        userId: 1,
        side: 'BUY' as Side,
        quantity: 10,
        amount: 1000,
      })).rejects.toThrow('cannot specify both quantity and amount');
    });

    it('should reject when price is zero or negative for LIMIT', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository
      );

      await expect(service.createOrder({
        instrumentId: 1,
        userId: 1,
        side: 'BUY' as Side,
        quantity: 10,
        price: 0,
      })).rejects.toThrow('Price must be greater than 0');
    });

    it('should reject when effective size is zero (amount < price)', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository
      );

      await expect(service.createOrder({
        instrumentId: 47,
        userId: 1,
        side: 'BUY' as Side,
        amount: 100,
        price: 1000,
      })).rejects.toThrow('Order size must be greater than 0');
    });

    it('should reject when no market price available', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository
      );

      await expect(service.createOrder({
        instrumentId: 9999,
        userId: 1,
        side: 'BUY' as Side,
        quantity: 10,
      })).rejects.toThrow('No market price available for instrument');
    });

    it('should reject invalid instrumentId', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository
      );

      await expect(service.createOrder({
        instrumentId: 0,
        userId: 1,
        side: 'BUY' as Side,
        quantity: 10,
      })).rejects.toThrow('instrumentId must be a positive number');
    });

    it('should reject invalid userId', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository
      );

      await expect(service.createOrder({
        instrumentId: 1,
        userId: -1,
        side: 'BUY' as Side,
        quantity: 10,
      })).rejects.toThrow('userId must be a positive number');
    });
  });

  describe('MARKET price', () => {
    it('MARKET order should use close price from marketdata', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository
      );

      const result = await service.createOrder({
        instrumentId: 47,
        userId: 1,
        side: 'BUY' as Side,
        quantity: 10,
        price: undefined,
      });

      const marketPrice = marketData
        .filter(md => md.instrumentId === 47)
        .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())[0]?.close;

      const latestFilledOrder = orders
        .filter(o => o.instrumentId === 47 && o.status === 'FILLED')
        .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())[0];

      const expectedPrice = latestFilledOrder ? latestFilledOrder.price : marketPrice;

      expect(result.order.price).toBe(expectedPrice);
      expect(result.order.type).toBe('MARKET');
    });
  });
});