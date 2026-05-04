// eslint-disable-next-line @typescript-eslint/no-var-requires
const data = require('../../../data/data.json');
import { PortfolioService } from './portfolio.service';
import { PortfolioRepository } from './portfolio.repository';
import { InstrumentRepository } from '../instrument/instrument.repository';
import { MarketDataRepository } from '../marketdata/marketdata.repository';
import { cacheService } from '../shared/cache';
import { Order } from '../../database/migrations/entities/order.entity';
import { Instrument } from '../../database/migrations/entities/instrument.entity';
import { MarketData } from '../../database/migrations/entities/marketdata.entity';

const orders = data.orders as Order[];
const instruments = data.instruments as Instrument[];
const marketData = data.marketdata as MarketData[];

const createMockPortfolioRepository = (overrides?: Partial<PortfolioRepository>): PortfolioRepository => ({
  findOrdersByUserId: jest.fn().mockResolvedValue(orders.filter(o => o.userId === 1)),
  findAllOrders: jest.fn().mockResolvedValue(orders),
  ...overrides,
});

const createMockInstrumentRepository = (): InstrumentRepository => ({
  findAll: jest.fn().mockResolvedValue(instruments),
  findByType: jest.fn(),
  findById: jest.fn(),
  findWithSimilarity: jest.fn().mockResolvedValue([]),
});

const createMockMarketDataRepository = (): MarketDataRepository => ({
  findAll: jest.fn().mockResolvedValue(marketData),
  findByInstrumentId: jest.fn(),
});

describe('PortfolioService', () => {
  let mockPortfolioRepository: PortfolioRepository;
  let mockInstrumentRepository: InstrumentRepository;
  let mockMarketDataRepository: MarketDataRepository;

  beforeEach(() => {
    cacheService.clear();
    mockPortfolioRepository = createMockPortfolioRepository();
    mockInstrumentRepository = createMockInstrumentRepository();
    mockMarketDataRepository = createMockMarketDataRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate portfolio with expected values', async () => {
    const service = new PortfolioService(
      mockPortfolioRepository,
      mockInstrumentRepository,
      mockMarketDataRepository
    );
    const result = await service.calculatePortfolio(1);

    expect(result.totalValue).toBe(900300);
    expect(result.availableCash).toBe(753000);
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
});