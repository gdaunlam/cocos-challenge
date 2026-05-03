import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { InstrumentsService } from './instruments.service';
import { InstrumentsRepository } from './instruments.repository';
import { Instrument } from '../../database/migrations/entities/instrument.entity';

describe('InstrumentsService', () => {
  let service: InstrumentsService;
  let repository: jest.Mocked<InstrumentsRepository>;

  beforeEach(async () => {
    const mockRepository = {
      findAll: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
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
      const mockInstruments: Instrument[] = [
        { name: 'Guitar', emissionDate: '2024-01-01', amount: 599 },
        { name: 'Piano', emissionDate: '2024-01-01', amount: 2999 },
      ];
      repository.findAll.mockResolvedValue(mockInstruments);
      const result = await service.findAll();
      expect(result).toEqual(mockInstruments);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new instrument', async () => {
      const newInstrument = { name: 'Drums', emissionDate: '2024-01-01', amount: 799 };
      const savedInstrument = { name: 'Drums', emissionDate: '2024-01-01', amount: 799 };
      const allInstruments: Instrument[] = [
        { name: 'Guitar', emissionDate: '2024-01-01', amount: 599 },
        newInstrument,
      ];

      repository.findByName.mockResolvedValue(null);
      repository.save.mockResolvedValue(savedInstrument);
      repository.findAll.mockResolvedValue(allInstruments);

      const result = await service.create(newInstrument);
      expect(result).toEqual(allInstruments);
      expect(repository.save).toHaveBeenCalledWith(newInstrument);
    });

    it('should throw BadRequestException if instrument already exists', async () => {
      const existingInstrument = { name: 'Guitar', emissionDate: '2024-01-01', amount: 599 };
      repository.findByName.mockResolvedValue(existingInstrument);
      await expect(service.create(existingInstrument)).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete an instrument by name', async () => {
      const remainingInstruments: Instrument[] = [
        { name: 'Piano', emissionDate: '2024-01-01', amount: 2999 },
      ];

      repository.delete.mockResolvedValue();
      repository.findAll.mockResolvedValue(remainingInstruments);

      const result = await service.delete('Guitar');
      expect(result).toEqual(remainingInstruments);
      expect(repository.delete).toHaveBeenCalledWith('Guitar');
    });
  });
});