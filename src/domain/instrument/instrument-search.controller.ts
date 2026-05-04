import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InstrumentSearchService } from './instrument-search.service';
import { SearchInstrumentsOutput, SearchInstrumentsInput } from './instrument-search.interface';
import { SearchInstrumentsQueryDto } from './instrument-search.query.dto';

@ApiTags('Instruments')
@Controller('instruments')
export class InstrumentSearchController {
  constructor(private readonly instrumentSearchService: InstrumentSearchService) {}

  @Get('search')
  async search(@Query() query: SearchInstrumentsQueryDto): Promise<SearchInstrumentsOutput> {
    const input: SearchInstrumentsInput = {
      query: query.q,
      type: query.type,
      searchBy: query.searchBy as 'ticker' | 'name' | 'both' | undefined,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };
    return this.instrumentSearchService.search(input);
  }
}
