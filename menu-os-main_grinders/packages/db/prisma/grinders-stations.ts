/**
 * Which kitchen station prepares a Grinders product.
 *
 * Decided per product, not per category. Several Grinders categories are mixed:
 * "Autumn Collection" holds both pumpkin lattes and cheesecake, "Light Drinks" holds
 * sugar-free frappes and lattes, "Pastries" holds mini pizzas, and "Our Products" is
 * merchandise. Routing by category sent every one of those to Bakery & Desserts, so a
 * barista filtering the board to their station never saw the drinks they had to make.
 *
 * The clearly single-purpose categories still route by category; only the mixed ones
 * look at the product name.
 */
export const GRINDERS_STATIONS = ["Coffee Bar", "Hot Drinks", "Iced & Cold Brew", "Frappe & Cream", "Kitchen", "Bakery & Desserts"] as const;
export type GrindersStation = (typeof GRINDERS_STATIONS)[number];

const has = (text: string, pattern: RegExp) => pattern.test(text.toLowerCase());

export function stationForGrindersProduct(categoryEn: string, productEn: string): GrindersStation {
  const category = categoryEn.toLowerCase().trim();
  const product = productEn ?? "";

  // Single-purpose categories.
  if (/^(frappe|cream|yogurt|mojito)$/.test(category)) return "Frappe & Cream";
  if (/^(iced drinks|iced tea)$/.test(category)) return "Iced & Cold Brew";
  if (category === "hot drinks") return "Hot Drinks";
  if (category === "sandwich") return "Kitchen";
  // Chilled juices and fruit coolers are poured at the cold bar.
  if (category === "chillers" || category === "refreshment") return "Iced & Cold Brew";
  // Merchandise and retail coffee are handed over at the counter.
  if (category === "our products") return "Coffee Bar";

  // Mixed categories: decide from the product itself. Order matters — an
  // "Iced ... Latte" is a cold drink, a "Caramel Cream" is a cream drink.
  if (has(product, /\b(frappe|cream)\b/)) return "Frappe & Cream";
  if (has(product, /\b(iced?|cold)\b/)) return "Iced & Cold Brew";
  if (has(product, /\b(latte|espresso|americano|cappuccino|macchiato|mocha|chai|matcha|coffee)\b/)) return "Hot Drinks";
  if (has(product, /\b(orange|lemon|juice|lemonade)\b/)) return "Iced & Cold Brew";
  if (has(product, /\b(pizza|sandwich|panini|toast)\b/)) return "Kitchen";
  return "Bakery & Desserts";
}
