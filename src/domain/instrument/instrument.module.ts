import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instrument } from '../../database/migrations/entities/instrument.entity';
import { InstrumentRepositoryImpl } from './repository/instrument.repository.impl';
import { InstrumentGetService } from './service/instrument-get.service';
import { InstrumentSearchService } from './service/instrument-search.service';
import { InstrumentSearchController } from './controller/instrument-search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Instrument])],
  controllers: [InstrumentSearchController],
  providers: [
    InstrumentRepositoryImpl,
    InstrumentGetService,
    InstrumentSearchService,
  ],
  exports: [InstrumentGetService, InstrumentSearchService, InstrumentRepositoryImpl],
})
export class InstrumentModule {}
