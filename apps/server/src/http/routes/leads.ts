import { Router } from "express";
import { bookCallLeadSchema } from "@synapai/shared";
import { logger } from "../../lib/logger.js";
import { sendLeadNotificationEmail } from "../../mail/emails.js";
import { Lead } from "../../models/Lead.js";

export const leadsRouter = Router();

/**
 * Book-a-call leads. Fired both when the modal is merely opened (`opened`,
 * Calendly may complete off-site) and when the fallback form is submitted.
 */
leadsRouter.post("/", async (req, res, next) => {
  try {
    const input = bookCallLeadSchema.parse(req.body);
    const lead = await Lead.create({
      type: "book_call",
      name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.opened && !input.message ? "(opened booking modal)" : input.message,
      brandName: input.brandName ?? "",
      scanId: input.scanId || undefined,
      source: input.source,
    });
    // Admin notification only for substantive submissions, not bare opens.
    if (!input.opened || input.phone || input.email) {
      sendLeadNotificationEmail(lead).catch((err) =>
        logger.error({ err }, "lead notification email failed"),
      );
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
