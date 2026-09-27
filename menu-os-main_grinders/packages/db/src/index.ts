import { PrismaClient } from "../generated/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "../generated/client";

// ─────────────────────────────────────────────────────────────────────────
// TYPES FOR THE SQLITE-ENCODED COLUMNS
//
// SQLite has no enums, so the former Prisma enums are now String columns. These
// unions are the authoritative list of legal values for each one — every write
// site in the app is type-checked against them, and the Prisma `@default(...)`
// on each column uses the first member of the matching union. Adding a value
// here without adding it to the schema default is fine; adding a value the
// database rejects is not, so keep them in sync.
// ─────────────────────────────────────────────────────────────────────────

export type TenantPlan = "TRIAL" | "STARTER" | "GROWTH" | "ENTERPRISE";
export type TenantStatus = "ACTIVE" | "SUSPENDED" | "CANCELLED";

export type TableStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "ORDERING"
  | "WAITING"
  | "RESERVED"
  | "CLEANING";
export type QRCodeType = "TABLE" | "MENU" | "PICKUP" | "MARKETING";
export type TableSessionStatus = "ACTIVE" | "CLOSED";
export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SEATED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type StockStatus = "AVAILABLE" | "LOW_STOCK" | "SOLD_OUT";
export type AvailabilityStatus = "AVAILABLE" | "LOW_STOCK" | "SOLD_OUT" | "SCHEDULED";

export type OrderType = "DINE_IN" | "PICKUP" | "DELIVERY";
export type OrderStatus =
  | "CREATED"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "PAID"
  | "CLOSED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type KitchenOrderStatus = "NEW" | "PREPARING" | "READY" | "COMPLETED";

export type WaiterRequestType = "ASSISTANCE" | "WATER" | "ORDER" | "BILL" | "QUESTION" | "OTHER";
export type WaiterRequestStatus = "OPEN" | "ASSIGNED" | "COMPLETED";

export type PaymentMethod = "CASH" | "CARD" | "ONLINE" | "WALLET";
export type PaymentStatus = "PENDING" | "VERIFIED" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
export type RefundStatus = "PENDING" | "COMPLETED" | "REJECTED";

export type DiscountType = "PERCENTAGE" | "FIXED" | "FREE_ITEM" | "DISCOUNTED_ITEM" | "COMBO";
export type PromotionType =
  | "DISCOUNT"
  | "COUPON"
  | "HAPPY_HOUR"
  | "BUY_X_GET_Y"
  | "FREE_ITEM"
  | "WEEKEND_OFFER";
export type PromotionStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";
export type PromotionBenefitType = "PERCENTAGE_OFF" | "FIXED_OFF" | "FREE_ITEM" | "DISCOUNTED_ITEM";

export type DriverStatus = "OFFLINE" | "ONLINE";
export type DeliveryOrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "ASSIGNED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED";

export type GameSessionStatus = "LOBBY" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type GameRoundKind =
  | "TRIVIA"
  | "VOTE"
  | "REACTION"
  | "TAP"
  | "MEMORY"
  | "MCQ"
  | "IMPOSTOR_CLUE"
  | "IMPOSTOR_VOTE"
  | "CATEGORY_SPRINT";

export type ShiftStatus = "OPEN" | "CLOSED";
export type CashMovementType = "CASH_IN" | "CASH_OUT";

export type NotificationType =
  | "NEW_ORDER"
  | "ORDER_READY"
  | "WAITER_REQUEST"
  | "PAYMENT"
  | "DELAYED_ORDER"
  | "SOLD_OUT"
  | "LOW_STOCK"
  | "OUT_OF_STOCK"
  | "STOCK_EXPIRY"
  | "DELIVERY_UPDATE";

export type LoyaltyTier = "MEMBER" | "SILVER" | "GOLD";
export type LoyaltyTransactionType = "EARN" | "REDEEM" | "ADJUST";

export type CostingMethod = "FIFO" | "FEFO";
export type StockBatchStatus = "ACTIVE" | "DEPLETED" | "EXPIRED";
export type StockMovementType =
  | "RECEIVE"
  | "SALE"
  | "SALE_REVERSAL"
  | "WASTE"
  | "EXPIRED"
  | "ADJUSTMENT"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "ISSUE";

export type SalaryType = "MONTHLY" | "DAILY" | "HOURLY";
export type AttendanceSource = "KIOSK" | "MANUAL" | "IMPORT";
export type EmployeeNoteKind = "NOTE" | "PRAISE" | "WARNING" | "TASK";
export type PayrollAdjustmentType = "BONUS" | "DEDUCTION" | "ADVANCE";

export type OutboxSyncStatus = "PENDING" | "SYNCING" | "SYNCED" | "FAILED";

// ─────────────────────────────────────────────────────────────────────────
// ENCODING HELPERS
//
// The database holds these columns as text; the app should never hand-roll
// JSON.parse/JSON.stringify around a Prisma field, because a legacy or
// hand-edited row with malformed text would then crash the whole request. Every
// reader below degrades to a safe empty value instead. The implementations live
// in ./sqlite-codec, which is dependency-free so the Prisma seed can share them.
// ─────────────────────────────────────────────────────────────────────────

export { json, readJson, strArray, readStrArray, intArray, readIntArray } from "./sqlite-codec";

// ─────────────────────────────────────────────────────────────────────────
// PERMISSIONS AND ROLES
//
// Re-exported from ./rbac, which the Prisma seed also imports directly. See the
// note there: the app's gates and the rows the seed writes have to be the same
// list, or staff end up with permissions nothing in the UI honours.
// ─────────────────────────────────────────────────────────────────────────

export {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ALL_PERMISSIONS,
  hasPermission,
  unregisteredRolePermissions,
  type PermissionKey,
} from "./rbac";
