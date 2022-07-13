import {MigrationInterface, QueryRunner} from "typeorm";

export class ArticleEntityFix1657733376522 implements MigrationInterface {
    name = 'ArticleEntityFix1657733376522'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "favoriteCount"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ADD "favoriteCount" integer NOT NULL DEFAULT '0'`);
    }

}
