/*
  Warnings:

  - The values [VEGETABLES,FRUITS,DAIRY,MEAT,EGGS,GRAINS] on the enum `ProductCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProductCategory_new" AS ENUM ('VEGETABLE', 'FRUIT', 'WHEAT', 'SUGAR_CANE', 'LENTILS', 'OTHER');
ALTER TABLE "Product" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "category" TYPE "ProductCategory_new" USING ("category"::text::"ProductCategory_new");
ALTER TYPE "ProductCategory" RENAME TO "ProductCategory_old";
ALTER TYPE "ProductCategory_new" RENAME TO "ProductCategory";
DROP TYPE "ProductCategory_old";
ALTER TABLE "Product" ALTER COLUMN "category" SET DEFAULT 'OTHER';
COMMIT;
