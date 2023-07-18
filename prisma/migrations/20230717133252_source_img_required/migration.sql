/*
  Warnings:

  - You are about to drop the column `imageId` on the `User` table. All the data in the column will be lost.
  - Made the column `categoryId` on table `Source` required. This step will fail if there are existing NULL values in that column.
  - Made the column `imageId` on table `Source` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "updatedAt", "username") SELECT "createdAt", "email", "id", "name", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoryId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    CONSTRAINT "Source_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Source_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("fileId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Source" ("categoryId", "createdAt", "id", "imageId", "name", "slug", "updatedAt", "url") SELECT "categoryId", "createdAt", "id", "imageId", "name", "slug", "updatedAt", "url" FROM "Source";
DROP TABLE "Source";
ALTER TABLE "new_Source" RENAME TO "Source";
CREATE UNIQUE INDEX "Source_id_key" ON "Source"("id");
CREATE UNIQUE INDEX "Source_url_key" ON "Source"("url");
CREATE UNIQUE INDEX "Source_slug_key" ON "Source"("slug");
CREATE UNIQUE INDEX "Source_imageId_key" ON "Source"("imageId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
