import { env } from "../config/env.js";
import { BudgetExceededError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { ApiUsage } from "../models/ApiUsage.js";
import { getSettings } from "../models/Settings.js";

export function todayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export async function recordUsage(
  provider: string,
  usage: { tokensIn: number; tokensOut: number; costUsd: number },
): Promise<void> {
  await ApiUsage.updateOne(
    { date: todayKey(), provider },
    {
      $inc: {
        calls: 1,
        tokens: usage.tokensIn + usage.tokensOut,
        costUsd: usage.costUsd,
      },
    },
    { upsert: true },
  );
}

export async function getTodaySpend(): Promise<number> {
  const rows = await ApiUsage.aggregate<{ _id: null; total: number }>([
    { $match: { date: todayKey() } },
    { $group: { _id: null, total: { $sum: "$costUsd" } } },
  ]);
  return rows[0]?.total ?? 0;
}

/** Pure decision so the guard is unit-testable without a DB. */
export function isBudgetExceeded(
  spendUsd: number,
  budgetUsd: number,
  overriddenToday: boolean,
): boolean {
  if (overriddenToday) return false;
  if (budgetUsd <= 0) return false; // 0 = unlimited (dev convenience)
  return spendUsd >= budgetUsd;
}

type BudgetEmailSender = (spendUsd: number, budgetUsd: number) => Promise<void>;
let budgetEmailSender: BudgetEmailSender | null = null;
/** Wired from the mail module at startup to avoid a service<->mail import cycle. */
export function setBudgetEmailSender(sender: BudgetEmailSender): void {
  budgetEmailSender = sender;
}

/**
 * Hard stop: throws BudgetExceededError once today's LLM spend reaches the
 * daily cap. Emails the admin the first time it trips each day. An admin
 * "resume" (budgetOverrideDate = today) re-enables scans for the day.
 */
export async function assertBudget(): Promise<void> {
  const spend = await getTodaySpend();
  const settings = await getSettings();
  const today = todayKey();
  if (!isBudgetExceeded(spend, env.DAILY_LLM_BUDGET_USD, settings.budgetOverrideDate === today)) {
    return;
  }
  if (settings.budgetNotifiedDate !== today) {
    settings.budgetNotifiedDate = today;
    await settings.save();
    try {
      await budgetEmailSender?.(spend, env.DAILY_LLM_BUDGET_USD);
    } catch (err) {
      logger.error({ err }, "failed to send budget email");
    }
  }
  throw new BudgetExceededError();
}

export async function getBudgetState(): Promise<{
  todaySpendUsd: number;
  dailyBudgetUsd: number;
  paused: boolean;
}> {
  const spend = await getTodaySpend();
  const settings = await getSettings();
  return {
    todaySpendUsd: Math.round(spend * 10000) / 10000,
    dailyBudgetUsd: env.DAILY_LLM_BUDGET_USD,
    paused: isBudgetExceeded(
      spend,
      env.DAILY_LLM_BUDGET_USD,
      settings.budgetOverrideDate === todayKey(),
    ),
  };
}
