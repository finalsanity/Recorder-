import {
  int,
  mysqlTable,
  timestamp,
  varchar,
  text,
  index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  microsoftId: varchar("microsoft_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const evidence = mysqlTable(
  "evidence",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 24 }).notNull(),
    durationSeconds: int("duration_seconds"),
    sizeBytes: int("size_bytes"),
    folderId: varchar("folder_id", { length: 255 }),
    oneDriveItemId: varchar("onedrive_item_id", { length: 255 }),
    oneDriveUrl: text("onedrive_url"),
    uploadStatus: varchar("upload_status", { length: 24 }).notNull(),
    metadataJson: text("metadata_json"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userCreatedIndex: index("evidence_user_created_idx").on(
      table.userId,
      table.createdAt,
    ),
  }),
);

export const folders = mysqlTable("folders", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  parentId: varchar("parent_id", { length: 255 }),
  oneDriveItemId: varchar("onedrive_item_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
