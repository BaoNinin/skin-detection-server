import { pgTable, serial, timestamp, text, integer, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
})

export const skinAnalysisHistory = pgTable("skin_analysis_history", {
	id: serial().notNull(),
	skinType: text("skin_type").notNull(),
	concerns: jsonb("concerns").notNull().default(sql`'[]'::jsonb`),
	moisture: integer("moisture").notNull(),
	oiliness: integer("oiliness").notNull(),
	sensitivity: integer("sensitivity").notNull(),
	recommendations: jsonb("recommendations").notNull().default(sql`'[]'::jsonb`),
	imageUrl: text("image_url"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
})
