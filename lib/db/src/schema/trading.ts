import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  doublePrecision,
} from "drizzle-orm/pg-core";

export const simScenariosTable = pgTable("sim_scenarios", {
  id: serial("id").primaryKey(),
  market: text("market").notNull(),
  timeframe: text("timeframe").notNull(),
  candles: text("candles").notNull(), // JSON array of all candles (visible + hidden future)
  visibleCount: integer("visible_count").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const simTradesTable = pgTable("sim_trades", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenario_id")
    .notNull()
    .references(() => simScenariosTable.id),
  strategyId: integer("strategy_id"),
  market: text("market").notNull(),
  direction: text("direction").notNull(), // buy | sell | wait
  entry: doublePrecision("entry"),
  stopLoss: doublePrecision("stop_loss"),
  takeProfit: doublePrecision("take_profit"),
  riskPercent: doublePrecision("risk_percent"),
  outcome: text("outcome").notNull(), // take-profit | stop-loss | expired | waited
  exitPrice: doublePrecision("exit_price"),
  pnl: doublePrecision("pnl").notNull().default(0),
  riskReward: doublePrecision("risk_reward"),
  emotion: text("emotion"),
  feedback: text("feedback").array(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const strategiesTable = pgTable("strategies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  market: text("market").notNull(),
  style: text("style").notNull(),
  timeframe: text("timeframe").notNull(),
  context: text("context").array().notNull(),
  entryRules: text("entry_rules").array().notNull(),
  stopLossRule: text("stop_loss_rule"),
  takeProfitRule: text("take_profit_rule"),
  riskPercent: doublePrecision("risk_percent").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const badgesTable = pgTable("badges", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  emoji: text("emoji").notNull(),
});

export const earnedBadgesTable = pgTable("earned_badges", {
  id: serial("id").primaryKey(),
  badgeId: integer("badge_id")
    .notNull()
    .unique()
    .references(() => badgesTable.id),
  earnedAt: timestamp("earned_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type SimScenario = typeof simScenariosTable.$inferSelect;
export type SimTrade = typeof simTradesTable.$inferSelect;
export type Strategy = typeof strategiesTable.$inferSelect;
export type Badge = typeof badgesTable.$inferSelect;
export type EarnedBadge = typeof earnedBadgesTable.$inferSelect;
