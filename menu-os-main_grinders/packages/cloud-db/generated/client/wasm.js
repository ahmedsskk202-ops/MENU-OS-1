
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

exports.Prisma.CloudBranchScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  brandName: 'brandName',
  apiKeyHash: 'apiKeyHash',
  createdAt: 'createdAt'
};

exports.Prisma.SyncedEventScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  aggregateType: 'aggregateType',
  aggregateId: 'aggregateId',
  eventType: 'eventType',
  occurredAt: 'occurredAt',
  appliedAt: 'appliedAt'
};

exports.Prisma.CloudOrderScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  branchId: 'branchId',
  type: 'type',
  status: 'status',
  subtotal: 'subtotal',
  discountTotal: 'discountTotal',
  taxTotal: 'taxTotal',
  serviceFeeTotal: 'serviceFeeTotal',
  total: 'total',
  currency: 'currency',
  occurredAt: 'occurredAt',
  createdAt: 'createdAt'
};

exports.Prisma.CloudPaymentScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  branchId: 'branchId',
  method: 'method',
  amount: 'amount',
  tipAmount: 'tipAmount',
  currency: 'currency',
  status: 'status',
  occurredAt: 'occurredAt',
  shiftId: 'shiftId'
};

exports.Prisma.CloudWaiterRequestScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  type: 'type',
  status: 'status',
  createdAt: 'createdAt',
  completedAt: 'completedAt',
  occurredAt: 'occurredAt'
};

exports.Prisma.CloudProductAvailabilityScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  productId: 'productId',
  status: 'status',
  occurredAt: 'occurredAt'
};

exports.Prisma.CloudGameSessionScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  status: 'status',
  playerCount: 'playerCount',
  occurredAt: 'occurredAt'
};

exports.Prisma.CloudRefundScalarFieldEnum = {
  id: 'id',
  paymentId: 'paymentId',
  branchId: 'branchId',
  amount: 'amount',
  status: 'status',
  occurredAt: 'occurredAt'
};

exports.Prisma.CloudShiftScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  status: 'status',
  openedAt: 'openedAt',
  closedAt: 'closedAt',
  openingCash: 'openingCash',
  expectedCash: 'expectedCash',
  actualCash: 'actualCash',
  variance: 'variance',
  varianceReason: 'varianceReason',
  occurredAt: 'occurredAt'
};

exports.Prisma.CloudExpenseScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  shiftId: 'shiftId',
  category: 'category',
  amount: 'amount',
  occurredAt: 'occurredAt'
};

exports.Prisma.CloudCashMovementScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  shiftId: 'shiftId',
  type: 'type',
  amount: 'amount',
  occurredAt: 'occurredAt'
};

exports.Prisma.CloudDeliveryOrderScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  branchId: 'branchId',
  status: 'status',
  zoneId: 'zoneId',
  deliveryFee: 'deliveryFee',
  driverId: 'driverId',
  deliveredAt: 'deliveredAt',
  occurredAt: 'occurredAt'
};

exports.Prisma.CloudReservationScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  tableId: 'tableId',
  guestName: 'guestName',
  guestPhone: 'guestPhone',
  partySize: 'partySize',
  reservedFor: 'reservedFor',
  durationMinutes: 'durationMinutes',
  status: 'status',
  occurredAt: 'occurredAt'
};

exports.Prisma.CloudIngredientScalarFieldEnum = {
  id: 'id',
  brandId: 'brandId',
  name: 'name',
  unit: 'unit',
  currentStock: 'currentStock',
  lowStockThreshold: 'lowStockThreshold',
  occurredAt: 'occurredAt'
};

exports.Prisma.CloudRecipeLineScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  ingredientId: 'ingredientId',
  quantity: 'quantity',
  unit: 'unit',
  costPerUnitSnapshot: 'costPerUnitSnapshot',
  occurredAt: 'occurredAt'
};

exports.Prisma.CloudLoyaltyTransactionScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  brandId: 'brandId',
  accountId: 'accountId',
  customerId: 'customerId',
  orderId: 'orderId',
  type: 'type',
  points: 'points',
  newBalance: 'newBalance',
  occurredAt: 'occurredAt'
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
  CloudBranch: 'CloudBranch',
  SyncedEvent: 'SyncedEvent',
  CloudOrder: 'CloudOrder',
  CloudPayment: 'CloudPayment',
  CloudWaiterRequest: 'CloudWaiterRequest',
  CloudProductAvailability: 'CloudProductAvailability',
  CloudGameSession: 'CloudGameSession',
  CloudRefund: 'CloudRefund',
  CloudShift: 'CloudShift',
  CloudExpense: 'CloudExpense',
  CloudCashMovement: 'CloudCashMovement',
  CloudDeliveryOrder: 'CloudDeliveryOrder',
  CloudReservation: 'CloudReservation',
  CloudIngredient: 'CloudIngredient',
  CloudRecipeLine: 'CloudRecipeLine',
  CloudLoyaltyTransaction: 'CloudLoyaltyTransaction'
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
