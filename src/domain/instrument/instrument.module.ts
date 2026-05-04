import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instrument } from '../../database/migrations/entities/instrument.entity';
import { InstrumentRepository } from './instrument.repository';
import { InstrumentRepositoryImpl } from './instrument.repository.impl';
import { InstrumentGetService } from './instrument-get.service';
import { InstrumentSearchService } from './instrument-search.service';

@Module({
  imports: [TypeOrmModule.forFeature([Instrument])],
  providers: [
    { provide: InstrumentRepository, useClass: InstrumentRepositoryImpl },
    InstrumentGetService,
    InstrumentSearchService,
  ],
  exports: [InstrumentGetService, InstrumentSearchService],
})
export class InstrumentModule {}
