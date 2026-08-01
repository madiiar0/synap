import type { Market } from "@synapai/shared";

/**
 * §1: business details typed before sign-in survive the auth redirect and
 * prefill onboarding, so nothing is ever retyped.
 */
export const PENDING_BUSINESS_KEY = "synapai:pendingBusiness";

export interface PendingBusiness {
  brandName: string;
  category: string;
  city: string;
  market: Market;
  competitors: string;
  /** #5: same identity fields as Settings. */
  website?: string;
  aliases?: string;
}

export function savePendingBusiness(value: PendingBusiness): void {
  try {
    sessionStorage.setItem(PENDING_BUSINESS_KEY, JSON.stringify(value));
  } catch {
    // Private mode or a full quota must never break the funnel.
  }
}

export function readPendingBusiness(): PendingBusiness | null {
  try {
    const raw = sessionStorage.getItem(PENDING_BUSINESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingBusiness>;
    if (typeof parsed.brandName !== "string") return null;
    return {
      brandName: parsed.brandName,
      category: typeof parsed.category === "string" ? parsed.category : "",
      city: typeof parsed.city === "string" ? parsed.city : "",
      market: (parsed.market ?? "kz") as Market,
      competitors: typeof parsed.competitors === "string" ? parsed.competitors : "",
      website: typeof parsed.website === "string" ? parsed.website : "",
      aliases: typeof parsed.aliases === "string" ? parsed.aliases : "",
    };
  } catch {
    return null;
  }
}

export function clearPendingBusiness(): void {
  try {
    sessionStorage.removeItem(PENDING_BUSINESS_KEY);
  } catch {
    // ignore
  }
}

/**
 * §3: "I'll do this later" must reach the dashboard empty state instead of
 * being bounced straight back into onboarding. The choice lasts this session.
 */
const SKIP_KEY = "synapai:skippedOnboarding";

export function skipOnboarding(): void {
  try {
    sessionStorage.setItem(SKIP_KEY, "1");
  } catch {
    // ignore
  }
}

export function onboardingSkipped(): boolean {
  try {
    return sessionStorage.getItem(SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * §3.2: which business the dashboard should select after a scan finishes, so
 * the user lands on the results they just waited for rather than on whichever
 * business happens to sort first.
 */
const PREFERRED_BRAND_KEY = "synapai:preferredBrand";

export function setPreferredBrand(brandId: string): void {
  try {
    sessionStorage.setItem(PREFERRED_BRAND_KEY, brandId);
  } catch {
    // ignore
  }
}

export function readPreferredBrand(): string | null {
  try {
    return sessionStorage.getItem(PREFERRED_BRAND_KEY);
  } catch {
    return null;
  }
}
