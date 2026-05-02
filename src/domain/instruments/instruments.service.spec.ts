import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { InstrumentsService } from './instruments.service';
import { InstrumentsRepository } from './instruments.repository';
import { Instrument } from '../../interfaces/instrument.class';

describe('InstrumentsService', () => {
  let service: InstrumentsService;
  let repository: jest.Mocked<InstrumentsRepository>;
  let mockInstruments: Instrument[];

  beforeEach(async () => {
    mockInstruments = [
      { name: 'Guitar', emissionDate: '2024-01-01', amount: 599 },
      { name: 'Piano', emissionDate: '2024-01-01', amount: 2999 },
    ];

    const mockRepository = {
      findAll: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstrumentsService,
        { provide: InstrumentsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<InstrumentsService>(InstrumentsService);
    repository = module.get(InstrumentsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all instruments', async () => {
      repository.findAll.mockResolvedValue(mockInstruments);
      const result = await service.findAll();
      expect(result).toEqual(mockInstruments);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new instrument', async () => {
      repository.findAll.mockResolvedValue(mockInstruments);
      repository.save.mockResolvedValue();
      const newInstrument = { name: 'Drums', emissionDate: '2024-01-01', amount: 799 };
      const result = await service.create(newInstrument);
      expect(result).toContainEqual(newInstrument);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if instrument already exists', async () => {
      repository.findAll.mockResolvedValue([mockInstruments[0]]);
      await expect(service.create(mockInstruments[0])).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete an instrument by name', async () => {
      repository.findAll.mockResolvedValue(mockInstruments);
      repository.save.mockResolvedValue();
      const result = await service.delete('Guitar');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Piano');
      expect(repository.save).toHaveBeenCalled();
    });
  });
});