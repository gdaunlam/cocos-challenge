import { Order, Status } from '../../database/entities/order.entity';
import { MarketData } from '../../database/entities/marketdata.entity';
import { InternalServerErrorException } from '@nestjs/common';

export class MarketPricesResolver {
  static getMarketPrice(
    orders: Order[],
    marketData: MarketData[],
    instrumentId: number
  ): number {
    const priceMap = this.getLatestPricesMap(orders, marketData);
    const price = priceMap.get(instrumentId);
    if (price === undefined || price === null) {
      throw new InternalServerErrorException('No market price available for instrument');
    }
    return price;
  }

  static getLatestPricesMap(
    orders: Order[],
    marketData: MarketData[]
  ): Map<number, number> {
    const priceMap = new Map<number, number>();

    const filledOrders = orders.filter(o => o.status === Status.FILLED);
    const sortedOrders = [...filledOrders].sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    );

    for (const order of sortedOrders) {
      if (!priceMap.has(order.instrumentId)) {
        priceMap.set(order.instrumentId, order.price);
      }
    }

    const sortedMarketData = [...marketData].sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    );

    for (const md of sortedMarketData) {
      if (!priceMap.has(md.instrumentId)) {
        priceMap.set(md.instrumentId, md.close);
      }
    }

    return priceMap;
  }
}
