import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertAmountsToBigint1733827200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert wallet balance: multiply by 100 to convert from NGN to kobo
    await queryRunner.query(`
      ALTER TABLE wallet 
      ALTER COLUMN balance TYPE bigint 
      USING (balance * 100)::bigint
    `);

    // Convert transaction amount: multiply by 100 to convert from NGN to kobo
    await queryRunner.query(`
      ALTER TABLE transaction 
      ALTER COLUMN amount TYPE bigint 
      USING (amount * 100)::bigint
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert wallet balance: divide by 100 to convert from kobo to NGN
    await queryRunner.query(`
      ALTER TABLE wallet 
      ALTER COLUMN balance TYPE decimal(20,2) 
      USING (balance / 100.0)::decimal(20,2)
    `);

    // Revert transaction amount: divide by 100 to convert from kobo to NGN
    await queryRunner.query(`
      ALTER TABLE transaction 
      ALTER COLUMN amount TYPE decimal(20,2) 
      USING (amount / 100.0)::decimal(20,2)
    `);
  }
}
