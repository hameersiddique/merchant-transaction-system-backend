import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1771058153252 implements MigrationInterface {
    name = 'AutoMigration1771058153252'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transactions_status_enum" AS ENUM('PENDING', 'SUCCESS', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "merchant_id" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL, "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_transactions_merchant_id" ON "transactions" ("merchant_id") `);
        await queryRunner.query(`CREATE TABLE "merchants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "refresh_token" character varying(500), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7682193bcf281285d0a459c4b1e" UNIQUE ("email"), CONSTRAINT "PK_4fd312ef25f8e05ad47bfe7ed25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_merchant_created_at" ON "merchants" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "idx_merchant_refresh_token" ON "merchants" ("refresh_token") `);
        await queryRunner.query(`CREATE INDEX "idx_merchant_name" ON "merchants" ("name") `);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_e80829a78860eadca0d60c8e21f" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_e80829a78860eadca0d60c8e21f"`);
        await queryRunner.query(`DROP INDEX "public"."idx_merchant_name"`);
        await queryRunner.query(`DROP INDEX "public"."idx_merchant_refresh_token"`);
        await queryRunner.query(`DROP INDEX "public"."idx_merchant_created_at"`);
        await queryRunner.query(`DROP TABLE "merchants"`);
        await queryRunner.query(`DROP INDEX "public"."idx_transactions_merchant_id"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
    }

}
