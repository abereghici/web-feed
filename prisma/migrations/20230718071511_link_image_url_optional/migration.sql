-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Link" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sourceId" TEXT NOT NULL,
    CONSTRAINT "Link_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Link" ("createdAt", "id", "imageUrl", "sourceId", "updatedAt", "url") SELECT "createdAt", "id", "imageUrl", "sourceId", "updatedAt", "url" FROM "Link";
DROP TABLE "Link";
ALTER TABLE "new_Link" RENAME TO "Link";
CREATE UNIQUE INDEX "Link_id_key" ON "Link"("id");
CREATE UNIQUE INDEX "Link_url_key" ON "Link"("url");
CREATE UNIQUE INDEX "Link_imageUrl_key" ON "Link"("imageUrl");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
