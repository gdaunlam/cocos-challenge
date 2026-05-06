import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PortfolioService } from '../service/portfolio.service';
import { PortfolioBody } from './portfolio.interface';
import { PortfolioParamsDto } from './portfolio.params.dto';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get(':userId')
  @ApiResponse({ status: 200, description: 'OK' })
  async calculatePortfolio(
    @Param() params: PortfolioParamsDto,
  ): Promise<PortfolioBody> {
    return this.portfolioService.calculatePortfolio(params.userId);
  }
}
