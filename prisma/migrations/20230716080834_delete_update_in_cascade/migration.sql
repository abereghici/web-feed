-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sourceCategoryId" TEXT,
    "imageId" TEXT,
    CONSTRAINT "Source_sourceCategoryId_fkey" FOREIGN KEY ("sourceCategoryId") REFERENCES "SourceCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Source_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("fileId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Source" ("createdAt", "id", "imageId", "name", "slug", "sourceCategoryId", "updatedAt", "url") SELECT "createdAt", "id", "imageId", "name", "slug", "sourceCategoryId", "updatedAt", "url" FROM "Source";
DROP TABLE "Source";
ALTER TABLE "new_Source" RENAME TO "Source";
CREATE UNIQUE INDEX "Source_id_key" ON "Source"("id");
CREATE UNIQUE INDEX "Source_url_key" ON "Source"("url");
CREATE UNIQUE INDEX "Source_slug_key" ON "Source"("slug");
CREATE UNIQUE INDEX "Source_imageId_key" ON "Source"("imageId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
