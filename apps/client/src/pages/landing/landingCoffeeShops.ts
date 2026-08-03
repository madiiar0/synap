import { brandLogo } from "../../lib/brandLogos";

const SHOP_NAMES = ["Global Coffee", "Master Coffee", "Coffee Boom"] as const;

/** Shared sample businesses keep the mock answer and ranking preview aligned. */
export const LANDING_COFFEE_SHOPS = SHOP_NAMES.map((name) => ({
  name,
  logo: brandLogo(name),
}));
