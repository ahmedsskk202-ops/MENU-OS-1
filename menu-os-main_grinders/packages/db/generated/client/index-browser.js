
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.TenantScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  plan: 'plan',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BrandScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  slug: 'slug',
  logoUrl: 'logoUrl',
  themeConfig: 'themeConfig',
  currency: 'currency',
  defaultLocale: 'defaultLocale',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BranchScalarFieldEnum = {
  id: 'id',
  brandId: 'brandId',
  name: 'name',
  slug: 'slug',
  address: 'address',
  city: 'city',
  phone: 'phone',
  timezone: 'timezone',
  isActive: 'isActive',
  taxRatePercent: 'taxRatePercent',
  serviceFeeRatePercent: 'serviceFeeRatePercent',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ZoneScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  name: 'name'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  email: 'email',
  passwordHash: 'passwordHash',
  phone: 'phone',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  isSystem: 'isSystem'
};

exports.Prisma.PermissionScalarFieldEnum = {
  id: 'id',
  key: 'key',
  description: 'description'
};

exports.Prisma.RolePermissionScalarFieldEnum = {
  roleId: 'roleId',
  permissionId: 'permissionId'
};

exports.Prisma.UserBranchRoleScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  roleId: 'roleId',
  branchId: 'branchId'
};

exports.Prisma.RestaurantTableScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  zoneId: 'zoneId',
  label: 'label',
  capacity: 'capacity',
  status: 'status'
};

exports.Prisma.QRCodeScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  type: 'type',
  tableId: 'tableId',
  label: 'label',
  token: 'token',
  isActive: 'isActive',
  scansCount: 'scansCount',
  createdAt: 'createdAt'
};

exports.Prisma.TableSessionScalarFieldEnum = {
  id: 'id',
  tableId: 'tableId',
  sessionNumber: 'sessionNumber',
  status: 'status',
  guestsCount: 'guestsCount',
  openedAt: 'openedAt',
  closedAt: 'closedAt'
};

exports.Prisma.CustomerSessionScalarFieldEnum = {
  id: 'id',
  tableSessionId: 'tableSessionId',
  branchId: 'branchId',
  displayName: 'displayName',
  deviceToken: 'deviceToken',
  joinedAt: 'joinedAt',
  leftAt: 'leftAt'
};

exports.Prisma.ReservationScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  tableId: 'tableId',
  guestName: 'guestName',
  guestPhone: 'guestPhone',
  partySize: 'partySize',
  reservedFor: 'reservedFor',
  durationMinutes: 'durationMinutes',
  status: 'status',
  notes: 'notes',
  cancelReason: 'cancelReason',
  confirmedAt: 'confirmedAt',
  seatedAt: 'seatedAt',
  cancelledAt: 'cancelledAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MenuScalarFieldEnum = {
  id: 'id',
  brandId: 'brandId',
  name: 'name',
  isActive: 'isActive'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  menuId: 'menuId',
  name: 'name',
  description: 'description',
  nameAr: 'nameAr',
  nameEn: 'nameEn',
  imageUrl: 'imageUrl',
  sortOrder: 'sortOrder',
  isActive: 'isActive'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  categoryId: 'categoryId',
  name: 'name',
  description: 'description',
  nameAr: 'nameAr',
  nameEn: 'nameEn',
  descriptionAr: 'descriptionAr',
  descriptionEn: 'descriptionEn',
  imageUrl: 'imageUrl',
  basePrice: 'basePrice',
  tags: 'tags',
  allergens: 'allergens',
  calories: 'calories',
  prepTimeMinutes: 'prepTimeMinutes',
  isFeatured: 'isFeatured',
  isPopular: 'isPopular',
  isNew: 'isNew',
  isSeasonal: 'isSeasonal',
  isActive: 'isActive',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ModifierGroupScalarFieldEnum = {
  id: 'id',
  brandId: 'brandId',
  name: 'name',
  nameAr: 'nameAr',
  nameEn: 'nameEn',
  isRequired: 'isRequired',
  minSelect: 'minSelect',
  maxSelect: 'maxSelect'
};

exports.Prisma.ModifierOptionScalarFieldEnum = {
  id: 'id',
  groupId: 'groupId',
  name: 'name',
  nameAr: 'nameAr',
  nameEn: 'nameEn',
  priceDelta: 'priceDelta',
  isDefault: 'isDefault',
  isActive: 'isActive',
  sortOrder: 'sortOrder',
  stockStatus: 'stockStatus'
};

exports.Prisma.ProductModifierGroupScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  groupId: 'groupId',
  sortOrder: 'sortOrder'
};

exports.Prisma.ProductAvailabilityScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  branchId: 'branchId',
  status: 'status',
  availableFrom: 'availableFrom',
  availableTo: 'availableTo',
  updatedAt: 'updatedAt',
  updatedById: 'updatedById',
  autoReason: 'autoReason'
};

exports.Prisma.IngredientScalarFieldEnum = {
  id: 'id',
  brandId: 'brandId',
  name: 'name',
  unit: 'unit',
  currentStock: 'currentStock',
  lowStockThreshold: 'lowStockThreshold',
  sku: 'sku',
  category: 'category',
  reorderQuantity: 'reorderQuantity',
  costingMethod: 'costingMethod',
  trackExpiry: 'trackExpiry',
  shelfLifeDays: 'shelfLifeDays',
  expiryAlertDays: 'expiryAlertDays',
  lastUnitCost: 'lastUnitCost',
  isActive: 'isActive'
};

exports.Prisma.StockBatchScalarFieldEnum = {
  id: 'id',
  ingredientId: 'ingredientId',
  branchId: 'branchId',
  batchCode: 'batchCode',
  supplier: 'supplier',
  quantityReceived: 'quantityReceived',
  quantityRemaining: 'quantityRemaining',
  unitCost: 'unitCost',
  receivedAt: 'receivedAt',
  expiresAt: 'expiresAt',
  status: 'status',
  notes: 'notes',
  receivedById: 'receivedById',
  createdAt: 'createdAt'
};

exports.Prisma.StockMovementScalarFieldEnum = {
  id: 'id',
  ingredientId: 'ingredientId',
  branchId: 'branchId',
  batchId: 'batchId',
  type: 'type',
  quantity: 'quantity',
  unitCost: 'unitCost',
  reason: 'reason',
  orderId: 'orderId',
  userId: 'userId',
  createdAt: 'createdAt'
};

exports.Prisma.RecipeScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  notes: 'notes'
};

exports.Prisma.RecipeIngredientScalarFieldEnum = {
  id: 'id',
  recipeId: 'recipeId',
  ingredientId: 'ingredientId',
  quantity: 'quantity',
  unit: 'unit',
  costPerUnitSnapshot: 'costPerUnitSnapshot'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  tableSessionId: 'tableSessionId',
  customerSessionId: 'customerSessionId',
  customerId: 'customerId',
  clientRequestId: 'clientRequestId',
  type: 'type',
  status: 'status',
  subtotal: 'subtotal',
  discountTotal: 'discountTotal',
  taxTotal: 'taxTotal',
  serviceFeeTotal: 'serviceFeeTotal',
  total: 'total',
  currency: 'currency',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  productId: 'productId',
  nameSnapshot: 'nameSnapshot',
  unitPriceSnapshot: 'unitPriceSnapshot',
  quantity: 'quantity',
  notes: 'notes',
  lineTotal: 'lineTotal'
};

exports.Prisma.OrderItemModifierScalarFieldEnum = {
  id: 'id',
  orderItemId: 'orderItemId',
  modifierOptionId: 'modifierOptionId',
  nameSnapshot: 'nameSnapshot',
  priceDeltaSnapshot: 'priceDeltaSnapshot'
};

exports.Prisma.OrderStatusEventScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  fromStatus: 'fromStatus',
  toStatus: 'toStatus',
  changedById: 'changedById',
  note: 'note',
  changedAt: 'changedAt'
};

exports.Prisma.KitchenStationScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  name: 'name',
  sortOrder: 'sortOrder',
  isActive: 'isActive'
};

exports.Prisma.ProductStationScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  stationId: 'stationId'
};

exports.Prisma.KitchenOrderScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  stationId: 'stationId',
  status: 'status',
  createdAt: 'createdAt',
  startedAt: 'startedAt',
  readyAt: 'readyAt',
  completedAt: 'completedAt'
};

exports.Prisma.KitchenOrderItemScalarFieldEnum = {
  id: 'id',
  kitchenOrderId: 'kitchenOrderId',
  orderItemId: 'orderItemId',
  status: 'status'
};

exports.Prisma.WaiterRequestScalarFieldEnum = {
  id: 'id',
  tableSessionId: 'tableSessionId',
  type: 'type',
  status: 'status',
  assignedToId: 'assignedToId',
  note: 'note',
  createdAt: 'createdAt',
  assignedAt: 'assignedAt',
  completedAt: 'completedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  method: 'method',
  amount: 'amount',
  tipAmount: 'tipAmount',
  currency: 'currency',
  status: 'status',
  isPartial: 'isPartial',
  gatewayRef: 'gatewayRef',
  verifiedById: 'verifiedById',
  shiftId: 'shiftId',
  createdAt: 'createdAt',
  provider: 'provider',
  providerStatus: 'providerStatus',
  failureReason: 'failureReason',
  providerMeta: 'providerMeta',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentLockScalarFieldEnum = {
  key: 'key',
  owner: 'owner',
  expiresAt: 'expiresAt'
};

exports.Prisma.RefundScalarFieldEnum = {
  id: 'id',
  paymentId: 'paymentId',
  amount: 'amount',
  reason: 'reason',
  status: 'status',
  processedById: 'processedById',
  createdAt: 'createdAt'
};

exports.Prisma.DiscountScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  couponId: 'couponId',
  type: 'type',
  value: 'value',
  amountApplied: 'amountApplied',
  reason: 'reason',
  freeProductId: 'freeProductId',
  freeProductName: 'freeProductName',
  appliedByUserId: 'appliedByUserId',
  approvedByUserId: 'approvedByUserId',
  promotionId: 'promotionId',
  comboDealId: 'comboDealId',
  createdAt: 'createdAt'
};

exports.Prisma.CouponScalarFieldEnum = {
  id: 'id',
  brandId: 'brandId',
  code: 'code',
  promotionId: 'promotionId',
  discountType: 'discountType',
  value: 'value',
  minOrderAmount: 'minOrderAmount',
  maxDiscountAmount: 'maxDiscountAmount',
  applicableProductIds: 'applicableProductIds',
  applicableCategoryIds: 'applicableCategoryIds',
  branchIds: 'branchIds',
  startsAt: 'startsAt',
  expiresAt: 'expiresAt',
  maxUses: 'maxUses',
  usedCount: 'usedCount',
  isActive: 'isActive',
  createdById: 'createdById',
  createdAt: 'createdAt'
};

exports.Prisma.PromotionScalarFieldEnum = {
  id: 'id',
  brandId: 'brandId',
  name: 'name',
  type: 'type',
  config: 'config',
  status: 'status',
  priority: 'priority',
  eligibleProductIds: 'eligibleProductIds',
  eligibleCategoryIds: 'eligibleCategoryIds',
  eligibleMinQuantity: 'eligibleMinQuantity',
  minOrderAmount: 'minOrderAmount',
  branchIds: 'branchIds',
  daysOfWeek: 'daysOfWeek',
  startTimeMinutes: 'startTimeMinutes',
  endTimeMinutes: 'endTimeMinutes',
  firstOrderOnly: 'firstOrderOnly',
  requiresCouponCode: 'requiresCouponCode',
  benefitType: 'benefitType',
  benefitProductIds: 'benefitProductIds',
  benefitCategoryIds: 'benefitCategoryIds',
  benefitQuantity: 'benefitQuantity',
  benefitValue: 'benefitValue',
  maxDiscountAmount: 'maxDiscountAmount',
  allowMultiplePerOrder: 'allowMultiplePerOrder',
  startsAt: 'startsAt',
  endsAt: 'endsAt',
  maxUsesTotal: 'maxUsesTotal',
  maxUsesPerCustomer: 'maxUsesPerCustomer',
  isActive: 'isActive',
  viewsCount: 'viewsCount',
  usesCount: 'usesCount',
  revenueGenerated: 'revenueGenerated',
  discountCost: 'discountCost',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PromotionRedemptionScalarFieldEnum = {
  id: 'id',
  promotionId: 'promotionId',
  orderId: 'orderId',
  customerSessionId: 'customerSessionId',
  discountId: 'discountId',
  discountAmount: 'discountAmount',
  createdAt: 'createdAt'
};

exports.Prisma.ComboDealScalarFieldEnum = {
  id: 'id',
  brandId: 'brandId',
  name: 'name',
  description: 'description',
  status: 'status',
  fixedPrice: 'fixedPrice',
  priority: 'priority',
  allowMultiplePerOrder: 'allowMultiplePerOrder',
  branchIds: 'branchIds',
  daysOfWeek: 'daysOfWeek',
  startTimeMinutes: 'startTimeMinutes',
  endTimeMinutes: 'endTimeMinutes',
  startsAt: 'startsAt',
  endsAt: 'endsAt',
  maxUsesTotal: 'maxUsesTotal',
  maxUsesPerCustomer: 'maxUsesPerCustomer',
  usesCount: 'usesCount',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ComboSlotScalarFieldEnum = {
  id: 'id',
  comboDealId: 'comboDealId',
  label: 'label',
  productIds: 'productIds',
  categoryIds: 'categoryIds',
  quantity: 'quantity',
  sortOrder: 'sortOrder'
};

exports.Prisma.ComboRedemptionScalarFieldEnum = {
  id: 'id',
  comboDealId: 'comboDealId',
  orderId: 'orderId',
  customerSessionId: 'customerSessionId',
  discountId: 'discountId',
  savedAmount: 'savedAmount',
  setsApplied: 'setsApplied',
  createdAt: 'createdAt'
};

exports.Prisma.DeliveryZoneScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  name: 'name',
  feeAmount: 'feeAmount',
  minOrderAmount: 'minOrderAmount',
  estimatedMinutes: 'estimatedMinutes'
};

exports.Prisma.DriverScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  name: 'name',
  phone: 'phone',
  status: 'status'
};

exports.Prisma.DeliveryOrderScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  customerName: 'customerName',
  phone: 'phone',
  address: 'address',
  zoneId: 'zoneId',
  deliveryFee: 'deliveryFee',
  driverId: 'driverId',
  status: 'status',
  assignedAt: 'assignedAt',
  deliveredAt: 'deliveredAt'
};

exports.Prisma.GameScalarFieldEnum = {
  id: 'id',
  key: 'key',
  name: 'name',
  description: 'description',
  isActive: 'isActive',
  config: 'config'
};

exports.Prisma.GameSessionScalarFieldEnum = {
  id: 'id',
  tableSessionId: 'tableSessionId',
  gameId: 'gameId',
  status: 'status',
  createdAt: 'createdAt',
  startedAt: 'startedAt',
  endedAt: 'endedAt',
  roundPlan: 'roundPlan'
};

exports.Prisma.GamePlayerScalarFieldEnum = {
  id: 'id',
  gameSessionId: 'gameSessionId',
  customerSessionId: 'customerSessionId',
  displayName: 'displayName',
  score: 'score',
  isReady: 'isReady',
  joinedAt: 'joinedAt'
};

exports.Prisma.GameRoundScalarFieldEnum = {
  id: 'id',
  gameSessionId: 'gameSessionId',
  roundNumber: 'roundNumber',
  kind: 'kind',
  category: 'category',
  prompt: 'prompt',
  meta: 'meta',
  timeLimitSeconds: 'timeLimitSeconds',
  startedAt: 'startedAt',
  endedAt: 'endedAt'
};

exports.Prisma.GameResultScalarFieldEnum = {
  id: 'id',
  gameRoundId: 'gameRoundId',
  gamePlayerId: 'gamePlayerId',
  answer: 'answer',
  isCorrect: 'isCorrect',
  isTimeout: 'isTimeout',
  pointsAwarded: 'pointsAwarded',
  responseTimeMs: 'responseTimeMs',
  answeredAt: 'answeredAt'
};

exports.Prisma.GameRoundSecretScalarFieldEnum = {
  id: 'id',
  gameRoundId: 'gameRoundId',
  gamePlayerId: 'gamePlayerId',
  data: 'data'
};

exports.Prisma.ShiftScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  openedById: 'openedById',
  openedAt: 'openedAt',
  openingCash: 'openingCash',
  status: 'status',
  closedById: 'closedById',
  closedAt: 'closedAt',
  expectedCash: 'expectedCash',
  actualCash: 'actualCash',
  variance: 'variance',
  varianceReason: 'varianceReason'
};

exports.Prisma.CashMovementScalarFieldEnum = {
  id: 'id',
  shiftId: 'shiftId',
  branchId: 'branchId',
  type: 'type',
  amount: 'amount',
  reason: 'reason',
  recordedById: 'recordedById',
  createdAt: 'createdAt'
};

exports.Prisma.ExpenseScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  shiftId: 'shiftId',
  category: 'category',
  amount: 'amount',
  description: 'description',
  recordedById: 'recordedById',
  createdAt: 'createdAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  branchId: 'branchId',
  userId: 'userId',
  action: 'action',
  entityType: 'entityType',
  entityId: 'entityId',
  shiftId: 'shiftId',
  beforeJson: 'beforeJson',
  afterJson: 'afterJson',
  deviceInfo: 'deviceInfo',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  branchId: 'branchId',
  userId: 'userId',
  type: 'type',
  title: 'title',
  body: 'body',
  data: 'data',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.OutboxEventScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  aggregateType: 'aggregateType',
  aggregateId: 'aggregateId',
  eventType: 'eventType',
  payload: 'payload',
  occurredAt: 'occurredAt',
  syncStatus: 'syncStatus',
  attempts: 'attempts',
  lastError: 'lastError',
  nextAttemptAt: 'nextAttemptAt',
  syncedAt: 'syncedAt',
  createdAt: 'createdAt'
};

exports.Prisma.CustomerScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  phone: 'phone',
  createdAt: 'createdAt'
};

exports.Prisma.LoyaltyAccountScalarFieldEnum = {
  id: 'id',
  customerId: 'customerId',
  brandId: 'brandId',
  pointsBalance: 'pointsBalance',
  lifetimePoints: 'lifetimePoints',
  tier: 'tier',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LoyaltyTransactionScalarFieldEnum = {
  id: 'id',
  accountId: 'accountId',
  orderId: 'orderId',
  type: 'type',
  points: 'points',
  newBalance: 'newBalance',
  reason: 'reason',
  userId: 'userId',
  createdAt: 'createdAt'
};

exports.Prisma.EmployeeScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  branchId: 'branchId',
  userId: 'userId',
  name: 'name',
  phone: 'phone',
  jobTitle: 'jobTitle',
  code: 'code',
  salaryType: 'salaryType',
  salaryAmount: 'salaryAmount',
  hireDate: 'hireDate',
  isActive: 'isActive',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.AttendanceRecordScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  branchId: 'branchId',
  clockIn: 'clockIn',
  clockOut: 'clockOut',
  source: 'source',
  note: 'note',
  createdAt: 'createdAt'
};

exports.Prisma.WorkShiftScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  branchId: 'branchId',
  date: 'date',
  startTime: 'startTime',
  endTime: 'endTime',
  note: 'note'
};

exports.Prisma.EmployeeNoteScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  date: 'date',
  kind: 'kind',
  text: 'text',
  authorId: 'authorId',
  createdAt: 'createdAt'
};

exports.Prisma.PayrollAdjustmentScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  period: 'period',
  type: 'type',
  amount: 'amount',
  note: 'note',
  createdById: 'createdById',
  createdAt: 'createdAt'
};

exports.Prisma.PayrollPaymentScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  period: 'period',
  base: 'base',
  bonuses: 'bonuses',
  deductions: 'deductions',
  advances: 'advances',
  net: 'net',
  expenseId: 'expenseId',
  note: 'note',
  paidById: 'paidById',
  paidAt: 'paidAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Tenant: 'Tenant',
  Brand: 'Brand',
  Branch: 'Branch',
  Zone: 'Zone',
  User: 'User',
  Role: 'Role',
  Permission: 'Permission',
  RolePermission: 'RolePermission',
  UserBranchRole: 'UserBranchRole',
  RestaurantTable: 'RestaurantTable',
  QRCode: 'QRCode',
  TableSession: 'TableSession',
  CustomerSession: 'CustomerSession',
  Reservation: 'Reservation',
  Menu: 'Menu',
  Category: 'Category',
  Product: 'Product',
  ModifierGroup: 'ModifierGroup',
  ModifierOption: 'ModifierOption',
  ProductModifierGroup: 'ProductModifierGroup',
  ProductAvailability: 'ProductAvailability',
  Ingredient: 'Ingredient',
  StockBatch: 'StockBatch',
  StockMovement: 'StockMovement',
  Recipe: 'Recipe',
  RecipeIngredient: 'RecipeIngredient',
  Order: 'Order',
  OrderItem: 'OrderItem',
  OrderItemModifier: 'OrderItemModifier',
  OrderStatusEvent: 'OrderStatusEvent',
  KitchenStation: 'KitchenStation',
  ProductStation: 'ProductStation',
  KitchenOrder: 'KitchenOrder',
  KitchenOrderItem: 'KitchenOrderItem',
  WaiterRequest: 'WaiterRequest',
  Payment: 'Payment',
  PaymentLock: 'PaymentLock',
  Refund: 'Refund',
  Discount: 'Discount',
  Coupon: 'Coupon',
  Promotion: 'Promotion',
  PromotionRedemption: 'PromotionRedemption',
  ComboDeal: 'ComboDeal',
  ComboSlot: 'ComboSlot',
  ComboRedemption: 'ComboRedemption',
  DeliveryZone: 'DeliveryZone',
  Driver: 'Driver',
  DeliveryOrder: 'DeliveryOrder',
  Game: 'Game',
  GameSession: 'GameSession',
  GamePlayer: 'GamePlayer',
  GameRound: 'GameRound',
  GameResult: 'GameResult',
  GameRoundSecret: 'GameRoundSecret',
  Shift: 'Shift',
  CashMovement: 'CashMovement',
  Expense: 'Expense',
  AuditLog: 'AuditLog',
  Notification: 'Notification',
  OutboxEvent: 'OutboxEvent',
  Customer: 'Customer',
  LoyaltyAccount: 'LoyaltyAccount',
  LoyaltyTransaction: 'LoyaltyTransaction',
  Employee: 'Employee',
  AttendanceRecord: 'AttendanceRecord',
  WorkShift: 'WorkShift',
  EmployeeNote: 'EmployeeNote',
  PayrollAdjustment: 'PayrollAdjustment',
  PayrollPayment: 'PayrollPayment'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
