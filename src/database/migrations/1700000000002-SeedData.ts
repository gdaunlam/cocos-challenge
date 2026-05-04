import { MigrationInterface, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.envs/.${process.env.NODE_ENV || 'development'}` });

interface SeedData {
  users: Array<{ id: number; email: string; accountNumber: string }>;
  instruments: Array<{ id: number; ticker: string; name: string; type: 'ACCIONES' | 'MONEDA' }>;
  orders: Array<{
    id: number;
    instrumentId: number;
    userId: number;
    size: number;
    price: number;
    type: 'MARKET' | 'LIMIT';
    side: 'BUY' | 'SELL' | 'CASH_IN' | 'CASH_OUT';
    status: 'FILLED' | 'NEW' | 'CANCELLED' | 'REJECTED';
    datetime: string;
  }>;
  marketdata: Array<{
    id: number;
    instrumentId: number;
    date: string;
    open: number | null;
    high: number | null;
    low: number | null;
    close: number;
    previousClose: number;
  }>;
}

export class SeedData1700000000002 implements MigrationInterface {
  name = 'SeedData1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const dataPath = path.join(__dirname, '..', '..', '..', '..', 'data', 'data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data: SeedData = JSON.parse(rawData);

    for (const user of data.users) {
      await queryRunner.query(
        `INSERT INTO "users" ("id", "email", "accountNumber") VALUES ($1, $2, $3)`,
        [user.id, user.email, user.accountNumber]
      );
    }

    for (const instrument of data.instruments) {
      await queryRunner.query(
        `INSERT INTO "instruments" ("id", "ticker", "name", "type") VALUES ($1, $2, $3, $4)`,
        [instrument.id, instrument.ticker, instrument.name, instrument.type]
      );
    }

    for (const order of data.orders) {
      await queryRunner.query(
        `INSERT INTO "orders" ("id", "instrumentId", "userId", "size", "price", "type", "side", "status", "datetime") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [order.id, order.instrumentId, order.userId, order.size, order.price, order.type, order.side, order.status, order.datetime]
      );
    }

    for (const md of data.marketdata) {
      await queryRunner.query(
        `INSERT INTO "marketdata" ("id", "instrumentId", "datetime", "open", "high", "low", "close", "previousClose") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [md.id, md.instrumentId, md.date, md.open, md.high, md.low, md.close, md.previousClose]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "marketdata"`);
    await queryRunner.query(`DELETE FROM "orders"`);
    await queryRunner.query(`DELETE FROM "instruments"`);
    await queryRunner.query(`DELETE FROM "users"`);
  }
}
