import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const worldsTable = pgTable("worlds", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  emoji: text("emoji").notNull(),
  order: integer("order").notNull(),
  locked: boolean("locked").notNull().default(false),
});

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id")
    .notNull()
    .references(() => worldsTable.id),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  icon: text("icon").notNull(),
  free: boolean("free").notNull().default(false),
  xpReward: integer("xp_reward").notNull().default(20),
});

export const lessonStepsTable = pgTable("lesson_steps", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessonsTable.id),
  order: integer("order").notNull(),
  type: text("type").notNull(), // info | quiz | chart-quiz
  prompt: text("prompt").notNull(),
  body: text("body"),
  options: text("options").array(),
  correctIndex: integer("correct_index"),
  explanation: text("explanation"),
  chart: text("chart"),
});

export const playerProgressTable = pgTable("player_progress", {
  id: serial("id").primaryKey(),
  premium: boolean("premium").notNull().default(false),
  balance: doublePrecision("balance").notNull().default(10000),
  xp: integer("xp").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  hearts: integer("hearts").notNull().default(5),
  onboarded: boolean("onboarded").notNull().default(false),
  goal: text("goal"),
  experienceLevel: text("experience_level"),
  markets: text("markets").array(),
  style: text("style"),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
});

export const completedLessonsTable = pgTable("completed_lessons", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessonsTable.id),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const testimonialsTable = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  rating: integer("rating").notNull().default(5),
  text: text("text").notNull(),
});

export const insertWorldSchema = createInsertSchema(worldsTable).omit({
  id: true,
});
export type World = typeof worldsTable.$inferSelect;
export type Lesson = typeof lessonsTable.$inferSelect;
export type LessonStep = typeof lessonStepsTable.$inferSelect;
export type PlayerProgress = typeof playerProgressTable.$inferSelect;
export type CompletedLesson = typeof completedLessonsTable.$inferSelect;
export type Testimonial = typeof testimonialsTable.$inferSelect;
export type InsertWorld = z.infer<typeof insertWorldSchema>;
