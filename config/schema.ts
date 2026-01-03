import { integer, json, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits:integer().default(2)
});

export const projectsTable = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  projectId: varchar({ length: 255 }).notNull().unique(),
  createdBy: varchar().references(() => usersTable.email),
  createdAt: timestamp().defaultNow()
});

export const framesTable = pgTable("frames", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  frameId: varchar().notNull(),
  designCode: text(),
  projectId: varchar().notNull().references(() => projectsTable.projectId),
  createdAt: timestamp().defaultNow()
});

export const chatTable = pgTable("chats", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  chatMessage: json().notNull(),
  projectId: varchar().notNull().references(() => projectsTable.projectId),
  frameId:varchar().notNull(),
  createdBy: varchar().references(() => usersTable.email),
  createdAt: timestamp().defaultNow()
});



