const data = require('../../../../data/data.json');
import { OrderService } from './order.service';
import { OrderRepositoryImpl } from '../repository/order.repository.impl';
import { InstrumentRepositoryImpl } from '../../instrument/repository/instrument.repository.impl';
import { MarketDataRepositoryImpl } from '../../marketdata/repository/marketdata.repository.impl';
import { cacheService } from '../../shared/cache';
import { Order, OrderType, Side, Status } from '../../../database/entities/order.entity';
import { MarketData } from '../../../database/entities/marketdata.entity';
import { Instrument } from '../../../database/entities/instrument.entity';
import { UserRepositoryImpl } from '../../user/repository/user.repository.impl';
import { User } from '../../../database/entities/user.entity';

const orders = data.orders as Order[];
const marketData = data.marketdata as MarketData[];
const instruments = data.instruments as Instrument[];
const users = data.users as User[];

const createMockOrderRepository = (overrides?: Partial<OrderRepositoryImpl>): OrderRepositoryImpl => ({
  findAll: jest.fn().mockResolvedValue(orders),
  save: jest.fn().mockImplementation((order: Order) => Promise.resolve({ ...order, id: 100 })),
  ...overrides,
} as unknown as OrderRepositoryImpl);

const createMockUserRepository = (overrides?: Partial<UserRepositoryImpl>): UserRepositoryImpl => ({
  getById: jest.fn((userId: number) => Promise.resolve(users.find((u) => u.id === userId) || null)),
  ...overrides,
} as unknown as UserRepositoryImpl);

const createMockInstrumentRepository = (): InstrumentRepositoryImpl => ({
  getById: jest.fn((instrumentId: number) => Promise.resolve(instruments.find((i) => i.id === instrumentId) || null)),
  findAll: jest.fn().mockResolvedValue(instruments),
  findWithSimilarity: jest.fn().mockResolvedValue([]),
} as unknown as InstrumentRepositoryImpl);

const createMockMarketDataRepository = (): MarketDataRepositoryImpl => ({
  findAll: jest.fn().mockResolvedValue(marketData),
} as unknown as MarketDataRepositoryImpl);

describe('OrderService', () => {
  let mockOrderRepository: OrderRepositoryImpl;
  let mockInstrumentRepository: InstrumentRepositoryImpl;
  let mockMarketDataRepository: MarketDataRepositoryImpl;
  let mockUserRepository: UserRepositoryImpl;

  beforeEach(() => {
    cacheService.clear();
    mockUserRepository = createMockUserRepository();
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
        mockMarketDataRepository,
        mockUserRepository
      );

      const result = await service.createOrder({
        instrumentId: 1,
        userId: 1,
        side: 'BUY' as Side,
        quantity: 10,
        price: undefined,
      });

      expect(result.order.status).toBe(Status.FILLED);
      expect(result.order.side).toBe(Side.BUY);
      expect(result.order.type).toBe(OrderType.MARKET);
    });

    it('BUY LIMIT with quantity: valid order should be NEW', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository,
        mockUserRepository
      );

      const result = await service.createOrder({
        instrumentId: 1,
        userId: 1,
        side: Side.BUY,
        quantity: 10,
        price: 200,
      });

      expect(result.order.status).toBe(Status.NEW);
      expect(result.order.side).toBe(Side.BUY);
      expect(result.order.type).toBe(OrderType.LIMIT);
    });

    it('BUY without funds should be REJECTED', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository,
        mockUserRepository
      );

      const result = await service.createOrder({
        instrumentId: 1,
        userId: 1,
        side: Side.BUY,
        quantity: 10000000,
        price: 1000,
      });

      expect(result.order.status).toBe(Status.REJECTED);
    });

    it('BUY with amount: should calculate max shares and be FILLED (MARKET)', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository,
        mockUserRepository
      );

      const result = await service.createOrder({
        instrumentId: 47,
        userId: 1,
        side: Side.BUY,
        amount: 50000,
        price: undefined,
      });

      const maxShares = Math.floor(50000 / result.order.price);
      expect(result.order.size).toBe(maxShares);
      expect(result.order.status).toBe(Status.FILLED);
      expect(result.order.type).toBe(OrderType.MARKET);
    });
  });

  describe('SELL orders', () => {
    it('SELL MARKET with quantity: valid order should be FILLED', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository,
        mockUserRepository
      );

      const result = await service.createOrder({
        instrumentId: 47,
        userId: 1,
        side: Side.SELL,
        quantity: 10,
        price: undefined,
      });

      expect(result.order.status).toBe(Status.FILLED);
      expect(result.order.side).toBe(Side.SELL);
      expect(result.order.type).toBe(OrderType.MARKET);
    });

    it('SELL LIMIT with quantity: valid order should be NEW', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository,
        mockUserRepository
      );

      const result = await service.createOrder({
        instrumentId: 47,
        userId: 1,
        side: Side.SELL,
        quantity: 10,
        price: 900,
      });

      expect(result.order.status).toBe(Status.NEW);
      expect(result.order.side).toBe(Side.SELL);
      expect(result.order.type).toBe(OrderType.LIMIT);
    });

    it('SELL without holdings should be REJECTED', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository,
        mockUserRepository
      );

      const result = await service.createOrder({
        instrumentId: 47,
        userId: 1,
        side: Side.SELL,
        quantity: 10000,
        price: 900,
      });

      expect(result.order.status).toBe(Status.REJECTED);
    });
  });

  describe('input validation', () => {
    it('should reject when user not found', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository,
        mockUserRepository
      );

      await expect(service.createOrder({
        instrumentId: 47,
        userId: 999,
        side: Side.BUY,
      })).rejects.toThrow('User not found');
    });
    it('should reject when instrument not found', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository,
        mockUserRepository
      );

      await expect(service.createOrder({
        instrumentId: 999,
        userId: 1,
        side: Side.BUY,
      })).rejects.toThrow('Instrument not found');
    });

    it('should reject when neither quantity nor amount provided', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository,
        mockUserRepository
      );

      await expect(service.createOrder({
        instrumentId: 1,
        userId: 1,
        side: Side.BUY,
      })).rejects.toThrow('quantity or amount is required');
    });

    it('should reject when both quantity and amount provided', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository,
        mockUserRepository
      );

      await expect(service.createOrder({
        instrumentId: 1,
        userId: 1,
        side: Side.BUY,
        quantity: 10,
        amount: 1000,
      })).rejects.toThrow('cannot specify both quantity and amount');
    });

    it('should reject when price is zero or negative for LIMIT', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository,
        mockUserRepository
      );

      await expect(service.createOrder({
        instrumentId: 1,
        userId: 1,
        side: Side.BUY,
        quantity: 10,
        price: 0,
      })).rejects.toThrow('Price must be greater than 0');
    });

    it('should reject when effective size is zero (amount < price)', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository,
        mockUserRepository
      );

      await expect(service.createOrder({
        instrumentId: 47,
        userId: 1,
        side: Side.BUY,
        amount: 100,
        price: 1000,
      })).rejects.toThrow('Order size must be greater than 0');
    });

    it('should reject when no market price available', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository,
        mockUserRepository
      );

      await expect(service.createOrder({
        instrumentId: 67,
        userId: 1,
        side: Side.BUY,
        quantity: 10,
      })).rejects.toThrow('No market price available for instrument');
    });
  });

  describe('MARKET price', () => {
    it('MARKET order should use close price from marketdata', async () => {
      const service = new OrderService(
        mockOrderRepository,
        mockInstrumentRepository,
        mockMarketDataRepository,
        mockUserRepository
      );

      const result = await service.createOrder({
        instrumentId: 47,
        userId: 1,
        side: Side.BUY,
        quantity: 10,
        price: undefined,
      });

      const marketPrice = marketData
        .filter(md => md.instrumentId === 47)
        .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())[0]?.close;

      const latestFilledOrder = orders
        .filter(o => o.instrumentId === 47 && o.status === Status.FILLED)
        .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())[0];

      const expectedPrice = latestFilledOrder ? latestFilledOrder.price : marketPrice;

      expect(result.order.price).toBe(expectedPrice);
      expect(result.order.type).toBe(OrderType.MARKET);
    });
  });
});