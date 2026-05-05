import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixOrdersSequence1700000000005 implements MigrationInterface {
  name = 'FixOrdersSequence1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const result = await queryRunner.query(`
      SELECT COALESCE(MAX(id), 0) + 1 as next_val FROM orders
    `);
    const nextVal = result[0].next_val;

    await queryRunner.query(`
      SELECT setval('orders_id_seq', ${nextVal}, true)
    `);
  }

  public async down(_: QueryRunner): Promise<void> {
  }
}