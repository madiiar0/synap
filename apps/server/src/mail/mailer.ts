import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

// apps/server/.mail-outbox — used whenever SMTP is not configured.
export const OUTBOX_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../.mail-outbox",
);

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;
  if (env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  } else {
    transporter = null;
  }
  return transporter;
}

function safeName(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, "-").slice(0, 60);
}

/**
 * Send an email, or (SMTP unset) write the rendered HTML to .mail-outbox.
 * Never throws — mail failures must not break the funnel.
 */
export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const transport = getTransporter();
  if (transport) {
    try {
      await transport.sendMail({ from: env.MAIL_FROM, to, subject, html });
      return;
    } catch (err) {
      logger.error({ err, to, subject }, "SMTP send failed; writing to outbox instead");
    }
  }
  try {
    fs.mkdirSync(OUTBOX_DIR, { recursive: true });
    const file = path.join(OUTBOX_DIR, `${Date.now()}-${safeName(subject)}-${safeName(to)}.html`);
    fs.writeFileSync(file, `<!-- to: ${to}\n     subject: ${subject} -->\n${html}`);
    logger.info({ file }, "email written to outbox");
  } catch (err) {
    logger.error({ err, to, subject }, "failed to write email to outbox");
  }
}
