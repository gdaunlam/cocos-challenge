const data = require('../../../../data/data.json');
import { PortfolioService } from './portfolio.service';
import { PortfolioRepositoryImpl } from '../repository/portfolio.repository.impl';
import { InstrumentRepositoryImpl } from '../../instrument/repository/instrument.repository.impl';
import { MarketDataRepositoryImpl } from '../../marketdata/repository/marketdata.repository.impl';
import { cacheService } from '../../shared/cache';
import { Order } from '../../../database/entities/order.entity';
import { Instrument } from '../../../database/entities/instrument.entity';
import { MarketData } from '../../../database/entities/marketdata.entity';
import { User } from '../../../database/entities/user.entity';
import { UserRepositoryImpl } from '../../user/repository/user.repository.impl';

const users = data.users as User[];
const orders = data.orders as Order[];
const instruments = data.instruments as Instrument[];
const marketData = data.marketdata as MarketData[];

const createMockUserRepository = (overrides?: Partial<UserRepositoryImpl>): UserRepositoryImpl => ({
  getById: jest.fn((userId: number) => Promise.resolve(users.find((u) => u.id === userId) || null)),
  ...overrides,
} as unknown as UserRepositoryImpl);

const createMockPortfolioRepository = (overrides?: Partial<PortfolioRepositoryImpl>): PortfolioRepositoryImpl => ({
  findOrdersByUserId: jest.fn(userId => Promise.resolve(orders.filter(o => o.userId === userId))),
  ...overrides,
} as unknown as PortfolioRepositoryImpl);

const createMockInstrumentRepository = (): InstrumentRepositoryImpl => ({
  findAll: jest.fn().mockResolvedValue(instruments),
  findWithSimilarity: jest.fn().mockResolvedValue([]),
} as unknown as InstrumentRepositoryImpl);

const createMockMarketDataRepository = (): MarketDataRepositoryImpl => ({
  findAll: jest.fn().mockResolvedValue(marketData),
} as unknown as MarketDataRepositoryImpl);

describe('PortfolioService', () => {
  let mockPortfolioRepository: PortfolioRepositoryImpl;
  let mockInstrumentRepository: InstrumentRepositoryImpl;
  let mockMarketDataRepository: MarketDataRepositoryImpl;
  let mockUserRepository: UserRepositoryImpl;

  beforeEach(() => {
    cacheService.clear();
    mockPortfolioRepository = createMockPortfolioRepository();
    mockInstrumentRepository = createMockInstrumentRepository();
    mockMarketDataRepository = createMockMarketDataRepository();
    mockUserRepository = createMockUserRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate portfolio with expected values', async () => {
    const service = new PortfolioService(
      mockPortfolioRepository,
      mockInstrumentRepository,
      mockMarketDataRepository,
      mockUserRepository
    );
    const result = await service.calculatePortfolio(1);

    expect(result.totalValue).toBe(900300);
    expect(result.availableCash).toBe(627500);
    expect(result.positions.length).toBe(3);

    const irsa = result.positions.find(p => p.ticker === 'IRSA');
    const poll = result.positions.find(p => p.ticker === 'POLL');
    const bma = result.positions.find(p => p.ticker === 'BMA');

    expect(irsa).toBeDefined();
    expect(irsa!.quantity).toBe(40);
    expect(irsa!.marketValue).toBe(37600);

    expect(poll).toBeDefined();
    expect(poll!.quantity).toBe(500);
    expect(poll!.marketValue).toBe(125000);

    expect(bma).toBeDefined();
    expect(bma!.quantity).toBe(-10);
    expect(bma!.marketValue).toBe(-15300);
  });

  it('should return user not found when user does not exist', async () => {
    const service = new PortfolioService(
      mockPortfolioRepository,
      mockInstrumentRepository,
      mockMarketDataRepository,
      mockUserRepository
    );

    await expect(service.calculatePortfolio(999)).rejects.toThrow('User not found');
  });
});