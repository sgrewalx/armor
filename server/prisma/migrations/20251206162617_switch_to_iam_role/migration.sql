/*
  Warnings:

  - You are about to drop the column `accessKeyId` on the `CloudAccount` table. All the data in the column will be lost.
  - You are about to drop the column `secretAccessKey` on the `CloudAccount` table. All the data in the column will be lost.
  - Added the required column `roleArn` to the `CloudAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CloudAccount" DROP COLUMN "accessKeyId",
DROP COLUMN "secretAccessKey",
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "roleArn" TEXT NOT NULL;
