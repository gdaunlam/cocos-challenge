import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get(':userId')
  @ApiResponse({ status: 200, description: 'OK' })
  async calculatePortfolio(@Param('userId', ParseIntPipe) userId: number) {
    return this.portfolioService.calculatePortfolio(userId);
  }
}
