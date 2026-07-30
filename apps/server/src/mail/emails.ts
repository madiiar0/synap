import type { Locale } from "@synapai/shared";
import { env } from "../config/env.js";
import { t } from "../lib/i18n.js";
import type { LeadDoc } from "../models/Lead.js";
import { sendMail } from "./mailer.js";

function layout(title: string, body: string, button?: { label: string; url: string }): string {
  const buttonHtml = button
    ? `<p style="margin:28px 0"><a href="${button.url}" style="background:#0A0A0A;color:#F5F5F5;text-decoration:none;padding:12px 28px;border-radius:999px;display:inline-block;font-weight:600">${button.label}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#FAFAFA;font-family:Inter,Arial,sans-serif;color:#171717">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px">
    <p style="font-weight:700;letter-spacing:-0.02em">${env.BRAND_NAME}</p>
    <div style="background:#FFFFFF;border:1px solid #E7E7E7;border-radius:16px;padding:32px">
      <h1 style="font-size:22px;letter-spacing:-0.02em;margin:0 0 12px">${title}</h1>
      <p style="color:#737373;line-height:1.6;margin:0">${body}</p>
      ${buttonHtml}
    </div>
  </div>
</body></html>`;
}

export async function sendMagicLinkEmail(to: string, locale: Locale, link: string): Promise<void> {
  await sendMail(
    to,
    t(locale, "emails.magicLink.subject"),
    layout(
      t(locale, "emails.magicLink.title"),
      t(locale, "emails.magicLink.body", { brand: env.BRAND_NAME }),
      { label: t(locale, "emails.magicLink.button"), url: link },
    ),
  );
}

export async function sendScanReadyEmail(
  to: string,
  locale: Locale,
  brandName: string,
  score: number,
  link: string,
): Promise<void> {
  await sendMail(
    to,
    t(locale, "emails.scanReady.subject", { brand: brandName }),
    layout(
      t(locale, "emails.scanReady.title", { score }),
      t(locale, "emails.scanReady.body"),
      { label: t(locale, "emails.scanReady.button"), url: link },
    ),
  );
}

export async function sendLeadNotificationEmail(lead: LeadDoc): Promise<void> {
  const contact = [lead.email, lead.phone, lead.name].filter(Boolean).join(" / ") || "—";
  await sendMail(
    env.ADMIN_EMAIL,
    t("ru", "emails.leadNotification.subject", { type: lead.type }),
    layout(
      t("ru", "emails.leadNotification.title"),
      t("ru", "emails.leadNotification.body", {
        type: lead.type,
        brand: lead.brandName || "—",
        contact,
      }) + (lead.message ? `<br/><br/>«${lead.message}»` : ""),
    ),
  );
}

export async function sendBudgetPausedEmail(spendUsd: number, budgetUsd: number): Promise<void> {
  await sendMail(
    env.ADMIN_EMAIL,
    t("ru", "emails.budgetPaused.subject"),
    layout(
      t("ru", "emails.budgetPaused.title"),
      t("ru", "emails.budgetPaused.body", {
        spend: spendUsd.toFixed(2),
        budget: budgetUsd.toFixed(2),
      }),
    ),
  );
}
