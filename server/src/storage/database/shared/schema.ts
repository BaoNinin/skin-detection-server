import { pgTable, serial, timestamp, text, integer, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
})

export const skinAnalysisHistory = pgTable("skin_analysis_history", {
	id: serial().notNull(),
	userId: integer("user_id").notNull(),
	skinType: text("skin_type").notNull(),
	concerns: jsonb("concerns").notNull().default(sql`'[]'::jsonb`),
	moisture: integer("moisture").notNull(),
	oiliness: integer("oiliness").notNull(),
	sensitivity: integer("sensitivity").notNull(),
	acne: integer("acne").notNull().default(0),
	wrinkles: integer("wrinkles").notNull().default(0),
	spots: integer("spots").notNull().default(0),
	pores: integer("pores").notNull().default(0),
	blackheads: integer("blackheads").notNull().default(0),
	recommendations: jsonb("recommendations").notNull().default(sql`'[]'::jsonb`),
	imageUrl: text("image_url"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
})

export const users = pgTable("users", {
	id: serial().notNull(),
	openid: text("openid"),
	phoneNumber: text("phone_number").unique(),
	nickname: text("nickname"),
	avatarUrl: text("avatar_url"),
	detectionCount: integer("detection_count").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
})
