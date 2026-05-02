import { Module } from '@nestjs/common';
import { InstrumentsController } from './controller/instruments.controller';
import { InstrumentsService } from './instruments.service';
import { InstrumentsRepository } from './instruments.repository';

@Module({
  controllers: [InstrumentsController],
  providers: [InstrumentsService, InstrumentsRepository],
})
export class InstrumentsModule {}