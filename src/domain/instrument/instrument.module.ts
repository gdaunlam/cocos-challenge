import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instrument } from '../../database/entities/instrument.entity';
import { InstrumentRepositoryImpl } from './repository/instrument.repository.impl';
import { InstrumentSearchService } from './service/instrument-search.service';
import { InstrumentSearchController } from './controller/instrument-search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Instrument])],
  controllers: [InstrumentSearchController],
  providers: [
    InstrumentRepositoryImpl,
    InstrumentSearchService,
  ],
  exports: [InstrumentSearchService, InstrumentRepositoryImpl],
})
export class InstrumentModule {}
