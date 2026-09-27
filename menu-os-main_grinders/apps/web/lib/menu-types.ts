export interface ModifierOptionDTO {
  id: string;
  name: string;
  nameAr: string | null;
  nameEn: string | null;
  priceDelta: number;
  isDefault: boolean;
  stockStatus: "AVAILABLE" | "LOW_STOCK" | "SOLD_OUT";
}

export interface ModifierGroupDTO {
  id: string;
  name: string;
  nameAr: string | null;
  nameEn: string | null;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  options: ModifierOptionDTO[];
}

export interface ProductPromoBadgeDTO {
  promotionId: string;
  promotionName: string;
  kind: "PERCENTAGE_OFF" | "FIXED_OFF" | "FREE_ITEM" | "DISCOUNTED_ITEM";
  value: number | null;
  buyQty: number;
  getQty: number;
  isHappyHour: boolean;
}

export interface WholeOrderPromoBadgeDTO {
  promotionId: string;
  promotionName: string;
  kind: "PERCENTAGE_OFF" | "FIXED_OFF";
  value: number;
  isHappyHour: boolean;
}

export interface ActiveComboDTO {
  comboDealId: string;
  name: string;
  description: string | null;
  fixedPrice: number;
  slots: { label: string; productIds: string[]; categoryIds: string[]; quantity: number }[];
}

export interface ProductDTO {
  id: string;
  categoryId: string;
  name: string;
  nameAr: string | null;
  nameEn: string | null;
  description: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  imageUrl: string | null;
  basePrice: number;
  tags: string[];
  allergens: string[];
  calories: number | null;
  prepTimeMinutes: number | null;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  isSeasonal: boolean;
  availabilityStatus: "AVAILABLE" | "LOW_STOCK" | "SOLD_OUT" | "SCHEDULED";
  promoBadge: ProductPromoBadgeDTO | null;
  modifierGroups: ModifierGroupDTO[];
}

export interface CategoryDTO {
  id: string;
  name: string;
  nameAr: string | null;
  nameEn: string | null;
  description: string | null;
  imageUrl: string | null;
  products: ProductDTO[];
}

export interface MenuResponse {
  brand: { id: string; name: string; logoUrl: string | null; currency: string; defaultLocale: string };
  branch: { id: string; name: string };
  menus: { id: string; name: string; categories: CategoryDTO[] }[];
  activePromotions: WholeOrderPromoBadgeDTO[];
  activeCombos: ActiveComboDTO[];
}
