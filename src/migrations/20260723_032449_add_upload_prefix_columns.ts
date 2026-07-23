import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "library_documents" ADD COLUMN "prefix" varchar;
  ALTER TABLE "_library_documents_v" ADD COLUMN "version_prefix" varchar;
  ALTER TABLE "media" ADD COLUMN "prefix" varchar;
  ALTER TABLE "cv_uploads" ADD COLUMN "prefix" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "library_documents" DROP COLUMN "prefix";
  ALTER TABLE "_library_documents_v" DROP COLUMN "version_prefix";
  ALTER TABLE "media" DROP COLUMN "prefix";
  ALTER TABLE "cv_uploads" DROP COLUMN "prefix";`)
}
