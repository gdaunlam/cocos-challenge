import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1700000000001 implements MigrationInterface {
  name = 'CreateTables1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR NOT NULL,
        "accountNumber" VARCHAR UNIQUE NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "instruments" (
        "id" SERIAL PRIMARY KEY,
        "ticker" VARCHAR UNIQUE NOT NULL,
        "name" VARCHAR NOT NULL,
        "type" VARCHAR NOT NULL CHECK ("type" IN ('ACCIONES', 'MONEDA'))
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" SERIAL PRIMARY KEY,
        "instrumentId" INTEGER NOT NULL,
        "userId" INTEGER NOT NULL,
        "size" DECIMAL NOT NULL,
        "price" DECIMAL NOT NULL,
        "type" VARCHAR NOT NULL CHECK ("type" IN ('MARKET', 'LIMIT')),
        "side" VARCHAR NOT NULL CHECK ("side" IN ('BUY', 'SELL', 'CASH_IN', 'CASH_OUT')),
        "status" VARCHAR NOT NULL CHECK ("status" IN ('FILLED', 'NEW', 'CANCELLED', 'REJECTED')),
        "datetime" VARCHAR NOT NULL,
        FOREIGN KEY ("instrumentId") REFERENCES "instruments"("id"),
        FOREIGN KEY ("userId") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "marketdata" (
        "id" SERIAL PRIMARY KEY,
        "instrumentId" INTEGER NOT NULL,
        "high" DECIMAL,
        "low" DECIMAL,
        "open" DECIMAL,
        "close" DECIMAL NOT NULL,
        "previousClose" DECIMAL NOT NULL,
        "datetime" VARCHAR NOT NULL,
        FOREIGN KEY ("instrumentId") REFERENCES "instruments"("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_instruments_ticker" ON "instruments"("ticker")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_orders_userId" ON "orders"("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_orders_instrumentId" ON "orders"("instrumentId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_marketdata_instrumentId" ON "marketdata"("instrumentId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_marketdata_instrumentId"`);
    await queryRunner.query(`DROP INDEX "idx_orders_instrumentId"`);
    await queryRunner.query(`DROP INDEX "idx_orders_userId"`);
    await queryRunner.query(`DROP INDEX "idx_instruments_ticker"`);
    await queryRunner.query(`DROP TABLE "marketdata"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "instruments"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
