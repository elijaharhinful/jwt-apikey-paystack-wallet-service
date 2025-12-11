import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCurrencyToKobo1733915776000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update all existing wallets to use 'kobo' as currency instead of 'NGN'
    await queryRunner.query(`
      UPDATE wallet 
      SET currency = 'kobo' 
      WHERE currency = 'NGN'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert all wallets back to 'NGN' currency
    await queryRunner.query(`
      UPDATE wallet 
      SET currency = 'NGN' 
      WHERE currency = 'kobo'
    `);
  }
}
