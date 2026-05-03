import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInstrumentsTable1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE instruments (
        name VARCHAR PRIMARY KEY,
        emission_date VARCHAR NOT NULL,
        amount DECIMAL NOT NULL
      )
    `);

    await queryRunner.query(`
      INSERT INTO instruments (name, emission_date, amount) VALUES
      ('USD', '2024-01-01', 1000000),
      ('ARS', '2024-01-01', 5000000),
      ('BTC', '2024-01-01', 100),
      ('MELI', '2024-01-01', 50000)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE instruments`);
  }
}