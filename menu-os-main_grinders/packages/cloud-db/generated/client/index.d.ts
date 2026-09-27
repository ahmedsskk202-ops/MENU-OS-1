
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model CloudBranch
 * 
 */
export type CloudBranch = $Result.DefaultSelection<Prisma.$CloudBranchPayload>
/**
 * Model SyncedEvent
 * 
 */
export type SyncedEvent = $Result.DefaultSelection<Prisma.$SyncedEventPayload>
/**
 * Model CloudOrder
 * 
 */
export type CloudOrder = $Result.DefaultSelection<Prisma.$CloudOrderPayload>
/**
 * Model CloudPayment
 * 
 */
export type CloudPayment = $Result.DefaultSelection<Prisma.$CloudPaymentPayload>
/**
 * Model CloudWaiterRequest
 * 
 */
export type CloudWaiterRequest = $Result.DefaultSelection<Prisma.$CloudWaiterRequestPayload>
/**
 * Model CloudProductAvailability
 * 
 */
export type CloudProductAvailability = $Result.DefaultSelection<Prisma.$CloudProductAvailabilityPayload>
/**
 * Model CloudGameSession
 * 
 */
export type CloudGameSession = $Result.DefaultSelection<Prisma.$CloudGameSessionPayload>
/**
 * Model CloudRefund
 * 
 */
export type CloudRefund = $Result.DefaultSelection<Prisma.$CloudRefundPayload>
/**
 * Model CloudShift
 * 
 */
export type CloudShift = $Result.DefaultSelection<Prisma.$CloudShiftPayload>
/**
 * Model CloudExpense
 * 
 */
export type CloudExpense = $Result.DefaultSelection<Prisma.$CloudExpensePayload>
/**
 * Model CloudCashMovement
 * 
 */
export type CloudCashMovement = $Result.DefaultSelection<Prisma.$CloudCashMovementPayload>
/**
 * Model CloudDeliveryOrder
 * 
 */
export type CloudDeliveryOrder = $Result.DefaultSelection<Prisma.$CloudDeliveryOrderPayload>
/**
 * Model CloudReservation
 * 
 */
export type CloudReservation = $Result.DefaultSelection<Prisma.$CloudReservationPayload>
/**
 * Model CloudIngredient
 * 
 */
export type CloudIngredient = $Result.DefaultSelection<Prisma.$CloudIngredientPayload>
/**
 * Model CloudRecipeLine
 * 
 */
export type CloudRecipeLine = $Result.DefaultSelection<Prisma.$CloudRecipeLinePayload>
/**
 * Model CloudLoyaltyTransaction
 * 
 */
export type CloudLoyaltyTransaction = $Result.DefaultSelection<Prisma.$CloudLoyaltyTransactionPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more CloudBranches
 * const cloudBranches = await prisma.cloudBranch.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more CloudBranches
   * const cloudBranches = await prisma.cloudBranch.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.cloudBranch`: Exposes CRUD operations for the **CloudBranch** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CloudBranches
    * const cloudBranches = await prisma.cloudBranch.findMany()
    * ```
    */
  get cloudBranch(): Prisma.CloudBranchDelegate<ExtArgs>;

  /**
   * `prisma.syncedEvent`: Exposes CRUD operations for the **SyncedEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SyncedEvents
    * const syncedEvents = await prisma.syncedEvent.findMany()
    * ```
    */
  get syncedEvent(): Prisma.SyncedEventDelegate<ExtArgs>;

  /**
   * `prisma.cloudOrder`: Exposes CRUD operations for the **CloudOrder** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CloudOrders
    * const cloudOrders = await prisma.cloudOrder.findMany()
    * ```
    */
  get cloudOrder(): Prisma.CloudOrderDelegate<ExtArgs>;

  /**
   * `prisma.cloudPayment`: Exposes CRUD operations for the **CloudPayment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CloudPayments
    * const cloudPayments = await prisma.cloudPayment.findMany()
    * ```
    */
  get cloudPayment(): Prisma.CloudPaymentDelegate<ExtArgs>;

  /**
   * `prisma.cloudWaiterRequest`: Exposes CRUD operations for the **CloudWaiterRequest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CloudWaiterRequests
    * const cloudWaiterRequests = await prisma.cloudWaiterRequest.findMany()
    * ```
    */
  get cloudWaiterRequest(): Prisma.CloudWaiterRequestDelegate<ExtArgs>;

  /**
   * `prisma.cloudProductAvailability`: Exposes CRUD operations for the **CloudProductAvailability** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CloudProductAvailabilities
    * const cloudProductAvailabilities = await prisma.cloudProductAvailability.findMany()
    * ```
    */
  get cloudProductAvailability(): Prisma.CloudProductAvailabilityDelegate<ExtArgs>;

  /**
   * `prisma.cloudGameSession`: Exposes CRUD operations for the **CloudGameSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CloudGameSessions
    * const cloudGameSessions = await prisma.cloudGameSession.findMany()
    * ```
    */
  get cloudGameSession(): Prisma.CloudGameSessionDelegate<ExtArgs>;

  /**
   * `prisma.cloudRefund`: Exposes CRUD operations for the **CloudRefund** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CloudRefunds
    * const cloudRefunds = await prisma.cloudRefund.findMany()
    * ```
    */
  get cloudRefund(): Prisma.CloudRefundDelegate<ExtArgs>;

  /**
   * `prisma.cloudShift`: Exposes CRUD operations for the **CloudShift** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CloudShifts
    * const cloudShifts = await prisma.cloudShift.findMany()
    * ```
    */
  get cloudShift(): Prisma.CloudShiftDelegate<ExtArgs>;

  /**
   * `prisma.cloudExpense`: Exposes CRUD operations for the **CloudExpense** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CloudExpenses
    * const cloudExpenses = await prisma.cloudExpense.findMany()
    * ```
    */
  get cloudExpense(): Prisma.CloudExpenseDelegate<ExtArgs>;

  /**
   * `prisma.cloudCashMovement`: Exposes CRUD operations for the **CloudCashMovement** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CloudCashMovements
    * const cloudCashMovements = await prisma.cloudCashMovement.findMany()
    * ```
    */
  get cloudCashMovement(): Prisma.CloudCashMovementDelegate<ExtArgs>;

  /**
   * `prisma.cloudDeliveryOrder`: Exposes CRUD operations for the **CloudDeliveryOrder** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CloudDeliveryOrders
    * const cloudDeliveryOrders = await prisma.cloudDeliveryOrder.findMany()
    * ```
    */
  get cloudDeliveryOrder(): Prisma.CloudDeliveryOrderDelegate<ExtArgs>;

  /**
   * `prisma.cloudReservation`: Exposes CRUD operations for the **CloudReservation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CloudReservations
    * const cloudReservations = await prisma.cloudReservation.findMany()
    * ```
    */
  get cloudReservation(): Prisma.CloudReservationDelegate<ExtArgs>;

  /**
   * `prisma.cloudIngredient`: Exposes CRUD operations for the **CloudIngredient** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CloudIngredients
    * const cloudIngredients = await prisma.cloudIngredient.findMany()
    * ```
    */
  get cloudIngredient(): Prisma.CloudIngredientDelegate<ExtArgs>;

  /**
   * `prisma.cloudRecipeLine`: Exposes CRUD operations for the **CloudRecipeLine** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CloudRecipeLines
    * const cloudRecipeLines = await prisma.cloudRecipeLine.findMany()
    * ```
    */
  get cloudRecipeLine(): Prisma.CloudRecipeLineDelegate<ExtArgs>;

  /**
   * `prisma.cloudLoyaltyTransaction`: Exposes CRUD operations for the **CloudLoyaltyTransaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CloudLoyaltyTransactions
    * const cloudLoyaltyTransactions = await prisma.cloudLoyaltyTransaction.findMany()
    * ```
    */
  get cloudLoyaltyTransaction(): Prisma.CloudLoyaltyTransactionDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
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

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "cloudBranch" | "syncedEvent" | "cloudOrder" | "cloudPayment" | "cloudWaiterRequest" | "cloudProductAvailability" | "cloudGameSession" | "cloudRefund" | "cloudShift" | "cloudExpense" | "cloudCashMovement" | "cloudDeliveryOrder" | "cloudReservation" | "cloudIngredient" | "cloudRecipeLine" | "cloudLoyaltyTransaction"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      CloudBranch: {
        payload: Prisma.$CloudBranchPayload<ExtArgs>
        fields: Prisma.CloudBranchFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CloudBranchFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudBranchPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CloudBranchFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudBranchPayload>
          }
          findFirst: {
            args: Prisma.CloudBranchFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudBranchPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CloudBranchFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudBranchPayload>
          }
          findMany: {
            args: Prisma.CloudBranchFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudBranchPayload>[]
          }
          create: {
            args: Prisma.CloudBranchCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudBranchPayload>
          }
          createMany: {
            args: Prisma.CloudBranchCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CloudBranchCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudBranchPayload>[]
          }
          delete: {
            args: Prisma.CloudBranchDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudBranchPayload>
          }
          update: {
            args: Prisma.CloudBranchUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudBranchPayload>
          }
          deleteMany: {
            args: Prisma.CloudBranchDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CloudBranchUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CloudBranchUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudBranchPayload>
          }
          aggregate: {
            args: Prisma.CloudBranchAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCloudBranch>
          }
          groupBy: {
            args: Prisma.CloudBranchGroupByArgs<ExtArgs>
            result: $Utils.Optional<CloudBranchGroupByOutputType>[]
          }
          count: {
            args: Prisma.CloudBranchCountArgs<ExtArgs>
            result: $Utils.Optional<CloudBranchCountAggregateOutputType> | number
          }
        }
      }
      SyncedEvent: {
        payload: Prisma.$SyncedEventPayload<ExtArgs>
        fields: Prisma.SyncedEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SyncedEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncedEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SyncedEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncedEventPayload>
          }
          findFirst: {
            args: Prisma.SyncedEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncedEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SyncedEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncedEventPayload>
          }
          findMany: {
            args: Prisma.SyncedEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncedEventPayload>[]
          }
          create: {
            args: Prisma.SyncedEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncedEventPayload>
          }
          createMany: {
            args: Prisma.SyncedEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SyncedEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncedEventPayload>[]
          }
          delete: {
            args: Prisma.SyncedEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncedEventPayload>
          }
          update: {
            args: Prisma.SyncedEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncedEventPayload>
          }
          deleteMany: {
            args: Prisma.SyncedEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SyncedEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SyncedEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncedEventPayload>
          }
          aggregate: {
            args: Prisma.SyncedEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSyncedEvent>
          }
          groupBy: {
            args: Prisma.SyncedEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<SyncedEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.SyncedEventCountArgs<ExtArgs>
            result: $Utils.Optional<SyncedEventCountAggregateOutputType> | number
          }
        }
      }
      CloudOrder: {
        payload: Prisma.$CloudOrderPayload<ExtArgs>
        fields: Prisma.CloudOrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CloudOrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudOrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CloudOrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudOrderPayload>
          }
          findFirst: {
            args: Prisma.CloudOrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudOrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CloudOrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudOrderPayload>
          }
          findMany: {
            args: Prisma.CloudOrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudOrderPayload>[]
          }
          create: {
            args: Prisma.CloudOrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudOrderPayload>
          }
          createMany: {
            args: Prisma.CloudOrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CloudOrderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudOrderPayload>[]
          }
          delete: {
            args: Prisma.CloudOrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudOrderPayload>
          }
          update: {
            args: Prisma.CloudOrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudOrderPayload>
          }
          deleteMany: {
            args: Prisma.CloudOrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CloudOrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CloudOrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudOrderPayload>
          }
          aggregate: {
            args: Prisma.CloudOrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCloudOrder>
          }
          groupBy: {
            args: Prisma.CloudOrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<CloudOrderGroupByOutputType>[]
          }
          count: {
            args: Prisma.CloudOrderCountArgs<ExtArgs>
            result: $Utils.Optional<CloudOrderCountAggregateOutputType> | number
          }
        }
      }
      CloudPayment: {
        payload: Prisma.$CloudPaymentPayload<ExtArgs>
        fields: Prisma.CloudPaymentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CloudPaymentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudPaymentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CloudPaymentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudPaymentPayload>
          }
          findFirst: {
            args: Prisma.CloudPaymentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudPaymentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CloudPaymentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudPaymentPayload>
          }
          findMany: {
            args: Prisma.CloudPaymentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudPaymentPayload>[]
          }
          create: {
            args: Prisma.CloudPaymentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudPaymentPayload>
          }
          createMany: {
            args: Prisma.CloudPaymentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CloudPaymentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudPaymentPayload>[]
          }
          delete: {
            args: Prisma.CloudPaymentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudPaymentPayload>
          }
          update: {
            args: Prisma.CloudPaymentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudPaymentPayload>
          }
          deleteMany: {
            args: Prisma.CloudPaymentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CloudPaymentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CloudPaymentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudPaymentPayload>
          }
          aggregate: {
            args: Prisma.CloudPaymentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCloudPayment>
          }
          groupBy: {
            args: Prisma.CloudPaymentGroupByArgs<ExtArgs>
            result: $Utils.Optional<CloudPaymentGroupByOutputType>[]
          }
          count: {
            args: Prisma.CloudPaymentCountArgs<ExtArgs>
            result: $Utils.Optional<CloudPaymentCountAggregateOutputType> | number
          }
        }
      }
      CloudWaiterRequest: {
        payload: Prisma.$CloudWaiterRequestPayload<ExtArgs>
        fields: Prisma.CloudWaiterRequestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CloudWaiterRequestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudWaiterRequestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CloudWaiterRequestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudWaiterRequestPayload>
          }
          findFirst: {
            args: Prisma.CloudWaiterRequestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudWaiterRequestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CloudWaiterRequestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudWaiterRequestPayload>
          }
          findMany: {
            args: Prisma.CloudWaiterRequestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudWaiterRequestPayload>[]
          }
          create: {
            args: Prisma.CloudWaiterRequestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudWaiterRequestPayload>
          }
          createMany: {
            args: Prisma.CloudWaiterRequestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CloudWaiterRequestCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudWaiterRequestPayload>[]
          }
          delete: {
            args: Prisma.CloudWaiterRequestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudWaiterRequestPayload>
          }
          update: {
            args: Prisma.CloudWaiterRequestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudWaiterRequestPayload>
          }
          deleteMany: {
            args: Prisma.CloudWaiterRequestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CloudWaiterRequestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CloudWaiterRequestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudWaiterRequestPayload>
          }
          aggregate: {
            args: Prisma.CloudWaiterRequestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCloudWaiterRequest>
          }
          groupBy: {
            args: Prisma.CloudWaiterRequestGroupByArgs<ExtArgs>
            result: $Utils.Optional<CloudWaiterRequestGroupByOutputType>[]
          }
          count: {
            args: Prisma.CloudWaiterRequestCountArgs<ExtArgs>
            result: $Utils.Optional<CloudWaiterRequestCountAggregateOutputType> | number
          }
        }
      }
      CloudProductAvailability: {
        payload: Prisma.$CloudProductAvailabilityPayload<ExtArgs>
        fields: Prisma.CloudProductAvailabilityFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CloudProductAvailabilityFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudProductAvailabilityPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CloudProductAvailabilityFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudProductAvailabilityPayload>
          }
          findFirst: {
            args: Prisma.CloudProductAvailabilityFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudProductAvailabilityPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CloudProductAvailabilityFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudProductAvailabilityPayload>
          }
          findMany: {
            args: Prisma.CloudProductAvailabilityFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudProductAvailabilityPayload>[]
          }
          create: {
            args: Prisma.CloudProductAvailabilityCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudProductAvailabilityPayload>
          }
          createMany: {
            args: Prisma.CloudProductAvailabilityCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CloudProductAvailabilityCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudProductAvailabilityPayload>[]
          }
          delete: {
            args: Prisma.CloudProductAvailabilityDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudProductAvailabilityPayload>
          }
          update: {
            args: Prisma.CloudProductAvailabilityUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudProductAvailabilityPayload>
          }
          deleteMany: {
            args: Prisma.CloudProductAvailabilityDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CloudProductAvailabilityUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CloudProductAvailabilityUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudProductAvailabilityPayload>
          }
          aggregate: {
            args: Prisma.CloudProductAvailabilityAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCloudProductAvailability>
          }
          groupBy: {
            args: Prisma.CloudProductAvailabilityGroupByArgs<ExtArgs>
            result: $Utils.Optional<CloudProductAvailabilityGroupByOutputType>[]
          }
          count: {
            args: Prisma.CloudProductAvailabilityCountArgs<ExtArgs>
            result: $Utils.Optional<CloudProductAvailabilityCountAggregateOutputType> | number
          }
        }
      }
      CloudGameSession: {
        payload: Prisma.$CloudGameSessionPayload<ExtArgs>
        fields: Prisma.CloudGameSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CloudGameSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudGameSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CloudGameSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudGameSessionPayload>
          }
          findFirst: {
            args: Prisma.CloudGameSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudGameSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CloudGameSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudGameSessionPayload>
          }
          findMany: {
            args: Prisma.CloudGameSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudGameSessionPayload>[]
          }
          create: {
            args: Prisma.CloudGameSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudGameSessionPayload>
          }
          createMany: {
            args: Prisma.CloudGameSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CloudGameSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudGameSessionPayload>[]
          }
          delete: {
            args: Prisma.CloudGameSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudGameSessionPayload>
          }
          update: {
            args: Prisma.CloudGameSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudGameSessionPayload>
          }
          deleteMany: {
            args: Prisma.CloudGameSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CloudGameSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CloudGameSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudGameSessionPayload>
          }
          aggregate: {
            args: Prisma.CloudGameSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCloudGameSession>
          }
          groupBy: {
            args: Prisma.CloudGameSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<CloudGameSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.CloudGameSessionCountArgs<ExtArgs>
            result: $Utils.Optional<CloudGameSessionCountAggregateOutputType> | number
          }
        }
      }
      CloudRefund: {
        payload: Prisma.$CloudRefundPayload<ExtArgs>
        fields: Prisma.CloudRefundFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CloudRefundFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRefundPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CloudRefundFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRefundPayload>
          }
          findFirst: {
            args: Prisma.CloudRefundFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRefundPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CloudRefundFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRefundPayload>
          }
          findMany: {
            args: Prisma.CloudRefundFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRefundPayload>[]
          }
          create: {
            args: Prisma.CloudRefundCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRefundPayload>
          }
          createMany: {
            args: Prisma.CloudRefundCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CloudRefundCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRefundPayload>[]
          }
          delete: {
            args: Prisma.CloudRefundDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRefundPayload>
          }
          update: {
            args: Prisma.CloudRefundUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRefundPayload>
          }
          deleteMany: {
            args: Prisma.CloudRefundDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CloudRefundUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CloudRefundUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRefundPayload>
          }
          aggregate: {
            args: Prisma.CloudRefundAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCloudRefund>
          }
          groupBy: {
            args: Prisma.CloudRefundGroupByArgs<ExtArgs>
            result: $Utils.Optional<CloudRefundGroupByOutputType>[]
          }
          count: {
            args: Prisma.CloudRefundCountArgs<ExtArgs>
            result: $Utils.Optional<CloudRefundCountAggregateOutputType> | number
          }
        }
      }
      CloudShift: {
        payload: Prisma.$CloudShiftPayload<ExtArgs>
        fields: Prisma.CloudShiftFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CloudShiftFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudShiftPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CloudShiftFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudShiftPayload>
          }
          findFirst: {
            args: Prisma.CloudShiftFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudShiftPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CloudShiftFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudShiftPayload>
          }
          findMany: {
            args: Prisma.CloudShiftFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudShiftPayload>[]
          }
          create: {
            args: Prisma.CloudShiftCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudShiftPayload>
          }
          createMany: {
            args: Prisma.CloudShiftCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CloudShiftCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudShiftPayload>[]
          }
          delete: {
            args: Prisma.CloudShiftDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudShiftPayload>
          }
          update: {
            args: Prisma.CloudShiftUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudShiftPayload>
          }
          deleteMany: {
            args: Prisma.CloudShiftDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CloudShiftUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CloudShiftUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudShiftPayload>
          }
          aggregate: {
            args: Prisma.CloudShiftAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCloudShift>
          }
          groupBy: {
            args: Prisma.CloudShiftGroupByArgs<ExtArgs>
            result: $Utils.Optional<CloudShiftGroupByOutputType>[]
          }
          count: {
            args: Prisma.CloudShiftCountArgs<ExtArgs>
            result: $Utils.Optional<CloudShiftCountAggregateOutputType> | number
          }
        }
      }
      CloudExpense: {
        payload: Prisma.$CloudExpensePayload<ExtArgs>
        fields: Prisma.CloudExpenseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CloudExpenseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudExpensePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CloudExpenseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudExpensePayload>
          }
          findFirst: {
            args: Prisma.CloudExpenseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudExpensePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CloudExpenseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudExpensePayload>
          }
          findMany: {
            args: Prisma.CloudExpenseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudExpensePayload>[]
          }
          create: {
            args: Prisma.CloudExpenseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudExpensePayload>
          }
          createMany: {
            args: Prisma.CloudExpenseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CloudExpenseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudExpensePayload>[]
          }
          delete: {
            args: Prisma.CloudExpenseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudExpensePayload>
          }
          update: {
            args: Prisma.CloudExpenseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudExpensePayload>
          }
          deleteMany: {
            args: Prisma.CloudExpenseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CloudExpenseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CloudExpenseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudExpensePayload>
          }
          aggregate: {
            args: Prisma.CloudExpenseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCloudExpense>
          }
          groupBy: {
            args: Prisma.CloudExpenseGroupByArgs<ExtArgs>
            result: $Utils.Optional<CloudExpenseGroupByOutputType>[]
          }
          count: {
            args: Prisma.CloudExpenseCountArgs<ExtArgs>
            result: $Utils.Optional<CloudExpenseCountAggregateOutputType> | number
          }
        }
      }
      CloudCashMovement: {
        payload: Prisma.$CloudCashMovementPayload<ExtArgs>
        fields: Prisma.CloudCashMovementFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CloudCashMovementFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudCashMovementPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CloudCashMovementFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudCashMovementPayload>
          }
          findFirst: {
            args: Prisma.CloudCashMovementFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudCashMovementPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CloudCashMovementFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudCashMovementPayload>
          }
          findMany: {
            args: Prisma.CloudCashMovementFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudCashMovementPayload>[]
          }
          create: {
            args: Prisma.CloudCashMovementCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudCashMovementPayload>
          }
          createMany: {
            args: Prisma.CloudCashMovementCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CloudCashMovementCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudCashMovementPayload>[]
          }
          delete: {
            args: Prisma.CloudCashMovementDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudCashMovementPayload>
          }
          update: {
            args: Prisma.CloudCashMovementUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudCashMovementPayload>
          }
          deleteMany: {
            args: Prisma.CloudCashMovementDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CloudCashMovementUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CloudCashMovementUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudCashMovementPayload>
          }
          aggregate: {
            args: Prisma.CloudCashMovementAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCloudCashMovement>
          }
          groupBy: {
            args: Prisma.CloudCashMovementGroupByArgs<ExtArgs>
            result: $Utils.Optional<CloudCashMovementGroupByOutputType>[]
          }
          count: {
            args: Prisma.CloudCashMovementCountArgs<ExtArgs>
            result: $Utils.Optional<CloudCashMovementCountAggregateOutputType> | number
          }
        }
      }
      CloudDeliveryOrder: {
        payload: Prisma.$CloudDeliveryOrderPayload<ExtArgs>
        fields: Prisma.CloudDeliveryOrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CloudDeliveryOrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudDeliveryOrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CloudDeliveryOrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudDeliveryOrderPayload>
          }
          findFirst: {
            args: Prisma.CloudDeliveryOrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudDeliveryOrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CloudDeliveryOrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudDeliveryOrderPayload>
          }
          findMany: {
            args: Prisma.CloudDeliveryOrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudDeliveryOrderPayload>[]
          }
          create: {
            args: Prisma.CloudDeliveryOrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudDeliveryOrderPayload>
          }
          createMany: {
            args: Prisma.CloudDeliveryOrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CloudDeliveryOrderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudDeliveryOrderPayload>[]
          }
          delete: {
            args: Prisma.CloudDeliveryOrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudDeliveryOrderPayload>
          }
          update: {
            args: Prisma.CloudDeliveryOrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudDeliveryOrderPayload>
          }
          deleteMany: {
            args: Prisma.CloudDeliveryOrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CloudDeliveryOrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CloudDeliveryOrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudDeliveryOrderPayload>
          }
          aggregate: {
            args: Prisma.CloudDeliveryOrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCloudDeliveryOrder>
          }
          groupBy: {
            args: Prisma.CloudDeliveryOrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<CloudDeliveryOrderGroupByOutputType>[]
          }
          count: {
            args: Prisma.CloudDeliveryOrderCountArgs<ExtArgs>
            result: $Utils.Optional<CloudDeliveryOrderCountAggregateOutputType> | number
          }
        }
      }
      CloudReservation: {
        payload: Prisma.$CloudReservationPayload<ExtArgs>
        fields: Prisma.CloudReservationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CloudReservationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudReservationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CloudReservationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudReservationPayload>
          }
          findFirst: {
            args: Prisma.CloudReservationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudReservationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CloudReservationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudReservationPayload>
          }
          findMany: {
            args: Prisma.CloudReservationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudReservationPayload>[]
          }
          create: {
            args: Prisma.CloudReservationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudReservationPayload>
          }
          createMany: {
            args: Prisma.CloudReservationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CloudReservationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudReservationPayload>[]
          }
          delete: {
            args: Prisma.CloudReservationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudReservationPayload>
          }
          update: {
            args: Prisma.CloudReservationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudReservationPayload>
          }
          deleteMany: {
            args: Prisma.CloudReservationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CloudReservationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CloudReservationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudReservationPayload>
          }
          aggregate: {
            args: Prisma.CloudReservationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCloudReservation>
          }
          groupBy: {
            args: Prisma.CloudReservationGroupByArgs<ExtArgs>
            result: $Utils.Optional<CloudReservationGroupByOutputType>[]
          }
          count: {
            args: Prisma.CloudReservationCountArgs<ExtArgs>
            result: $Utils.Optional<CloudReservationCountAggregateOutputType> | number
          }
        }
      }
      CloudIngredient: {
        payload: Prisma.$CloudIngredientPayload<ExtArgs>
        fields: Prisma.CloudIngredientFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CloudIngredientFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudIngredientPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CloudIngredientFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudIngredientPayload>
          }
          findFirst: {
            args: Prisma.CloudIngredientFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudIngredientPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CloudIngredientFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudIngredientPayload>
          }
          findMany: {
            args: Prisma.CloudIngredientFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudIngredientPayload>[]
          }
          create: {
            args: Prisma.CloudIngredientCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudIngredientPayload>
          }
          createMany: {
            args: Prisma.CloudIngredientCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CloudIngredientCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudIngredientPayload>[]
          }
          delete: {
            args: Prisma.CloudIngredientDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudIngredientPayload>
          }
          update: {
            args: Prisma.CloudIngredientUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudIngredientPayload>
          }
          deleteMany: {
            args: Prisma.CloudIngredientDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CloudIngredientUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CloudIngredientUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudIngredientPayload>
          }
          aggregate: {
            args: Prisma.CloudIngredientAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCloudIngredient>
          }
          groupBy: {
            args: Prisma.CloudIngredientGroupByArgs<ExtArgs>
            result: $Utils.Optional<CloudIngredientGroupByOutputType>[]
          }
          count: {
            args: Prisma.CloudIngredientCountArgs<ExtArgs>
            result: $Utils.Optional<CloudIngredientCountAggregateOutputType> | number
          }
        }
      }
      CloudRecipeLine: {
        payload: Prisma.$CloudRecipeLinePayload<ExtArgs>
        fields: Prisma.CloudRecipeLineFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CloudRecipeLineFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRecipeLinePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CloudRecipeLineFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRecipeLinePayload>
          }
          findFirst: {
            args: Prisma.CloudRecipeLineFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRecipeLinePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CloudRecipeLineFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRecipeLinePayload>
          }
          findMany: {
            args: Prisma.CloudRecipeLineFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRecipeLinePayload>[]
          }
          create: {
            args: Prisma.CloudRecipeLineCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRecipeLinePayload>
          }
          createMany: {
            args: Prisma.CloudRecipeLineCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CloudRecipeLineCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRecipeLinePayload>[]
          }
          delete: {
            args: Prisma.CloudRecipeLineDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRecipeLinePayload>
          }
          update: {
            args: Prisma.CloudRecipeLineUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRecipeLinePayload>
          }
          deleteMany: {
            args: Prisma.CloudRecipeLineDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CloudRecipeLineUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CloudRecipeLineUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudRecipeLinePayload>
          }
          aggregate: {
            args: Prisma.CloudRecipeLineAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCloudRecipeLine>
          }
          groupBy: {
            args: Prisma.CloudRecipeLineGroupByArgs<ExtArgs>
            result: $Utils.Optional<CloudRecipeLineGroupByOutputType>[]
          }
          count: {
            args: Prisma.CloudRecipeLineCountArgs<ExtArgs>
            result: $Utils.Optional<CloudRecipeLineCountAggregateOutputType> | number
          }
        }
      }
      CloudLoyaltyTransaction: {
        payload: Prisma.$CloudLoyaltyTransactionPayload<ExtArgs>
        fields: Prisma.CloudLoyaltyTransactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CloudLoyaltyTransactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudLoyaltyTransactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CloudLoyaltyTransactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudLoyaltyTransactionPayload>
          }
          findFirst: {
            args: Prisma.CloudLoyaltyTransactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudLoyaltyTransactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CloudLoyaltyTransactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudLoyaltyTransactionPayload>
          }
          findMany: {
            args: Prisma.CloudLoyaltyTransactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudLoyaltyTransactionPayload>[]
          }
          create: {
            args: Prisma.CloudLoyaltyTransactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudLoyaltyTransactionPayload>
          }
          createMany: {
            args: Prisma.CloudLoyaltyTransactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CloudLoyaltyTransactionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudLoyaltyTransactionPayload>[]
          }
          delete: {
            args: Prisma.CloudLoyaltyTransactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudLoyaltyTransactionPayload>
          }
          update: {
            args: Prisma.CloudLoyaltyTransactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudLoyaltyTransactionPayload>
          }
          deleteMany: {
            args: Prisma.CloudLoyaltyTransactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CloudLoyaltyTransactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CloudLoyaltyTransactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CloudLoyaltyTransactionPayload>
          }
          aggregate: {
            args: Prisma.CloudLoyaltyTransactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCloudLoyaltyTransaction>
          }
          groupBy: {
            args: Prisma.CloudLoyaltyTransactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<CloudLoyaltyTransactionGroupByOutputType>[]
          }
          count: {
            args: Prisma.CloudLoyaltyTransactionCountArgs<ExtArgs>
            result: $Utils.Optional<CloudLoyaltyTransactionCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model CloudBranch
   */

  export type AggregateCloudBranch = {
    _count: CloudBranchCountAggregateOutputType | null
    _min: CloudBranchMinAggregateOutputType | null
    _max: CloudBranchMaxAggregateOutputType | null
  }

  export type CloudBranchMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    brandName: string | null
    apiKeyHash: string | null
    createdAt: Date | null
  }

  export type CloudBranchMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    brandName: string | null
    apiKeyHash: string | null
    createdAt: Date | null
  }

  export type CloudBranchCountAggregateOutputType = {
    id: number
    tenantId: number
    name: number
    brandName: number
    apiKeyHash: number
    createdAt: number
    _all: number
  }


  export type CloudBranchMinAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    brandName?: true
    apiKeyHash?: true
    createdAt?: true
  }

  export type CloudBranchMaxAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    brandName?: true
    apiKeyHash?: true
    createdAt?: true
  }

  export type CloudBranchCountAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    brandName?: true
    apiKeyHash?: true
    createdAt?: true
    _all?: true
  }

  export type CloudBranchAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudBranch to aggregate.
     */
    where?: CloudBranchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudBranches to fetch.
     */
    orderBy?: CloudBranchOrderByWithRelationInput | CloudBranchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CloudBranchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudBranches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudBranches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CloudBranches
    **/
    _count?: true | CloudBranchCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CloudBranchMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CloudBranchMaxAggregateInputType
  }

  export type GetCloudBranchAggregateType<T extends CloudBranchAggregateArgs> = {
        [P in keyof T & keyof AggregateCloudBranch]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCloudBranch[P]>
      : GetScalarType<T[P], AggregateCloudBranch[P]>
  }




  export type CloudBranchGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CloudBranchWhereInput
    orderBy?: CloudBranchOrderByWithAggregationInput | CloudBranchOrderByWithAggregationInput[]
    by: CloudBranchScalarFieldEnum[] | CloudBranchScalarFieldEnum
    having?: CloudBranchScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CloudBranchCountAggregateInputType | true
    _min?: CloudBranchMinAggregateInputType
    _max?: CloudBranchMaxAggregateInputType
  }

  export type CloudBranchGroupByOutputType = {
    id: string
    tenantId: string
    name: string
    brandName: string
    apiKeyHash: string
    createdAt: Date
    _count: CloudBranchCountAggregateOutputType | null
    _min: CloudBranchMinAggregateOutputType | null
    _max: CloudBranchMaxAggregateOutputType | null
  }

  type GetCloudBranchGroupByPayload<T extends CloudBranchGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CloudBranchGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CloudBranchGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CloudBranchGroupByOutputType[P]>
            : GetScalarType<T[P], CloudBranchGroupByOutputType[P]>
        }
      >
    >


  export type CloudBranchSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    brandName?: boolean
    apiKeyHash?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["cloudBranch"]>

  export type CloudBranchSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    brandName?: boolean
    apiKeyHash?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["cloudBranch"]>

  export type CloudBranchSelectScalar = {
    id?: boolean
    tenantId?: boolean
    name?: boolean
    brandName?: boolean
    apiKeyHash?: boolean
    createdAt?: boolean
  }


  export type $CloudBranchPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CloudBranch"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      name: string
      brandName: string
      apiKeyHash: string
      createdAt: Date
    }, ExtArgs["result"]["cloudBranch"]>
    composites: {}
  }

  type CloudBranchGetPayload<S extends boolean | null | undefined | CloudBranchDefaultArgs> = $Result.GetResult<Prisma.$CloudBranchPayload, S>

  type CloudBranchCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CloudBranchFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CloudBranchCountAggregateInputType | true
    }

  export interface CloudBranchDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CloudBranch'], meta: { name: 'CloudBranch' } }
    /**
     * Find zero or one CloudBranch that matches the filter.
     * @param {CloudBranchFindUniqueArgs} args - Arguments to find a CloudBranch
     * @example
     * // Get one CloudBranch
     * const cloudBranch = await prisma.cloudBranch.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CloudBranchFindUniqueArgs>(args: SelectSubset<T, CloudBranchFindUniqueArgs<ExtArgs>>): Prisma__CloudBranchClient<$Result.GetResult<Prisma.$CloudBranchPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CloudBranch that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CloudBranchFindUniqueOrThrowArgs} args - Arguments to find a CloudBranch
     * @example
     * // Get one CloudBranch
     * const cloudBranch = await prisma.cloudBranch.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CloudBranchFindUniqueOrThrowArgs>(args: SelectSubset<T, CloudBranchFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CloudBranchClient<$Result.GetResult<Prisma.$CloudBranchPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CloudBranch that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudBranchFindFirstArgs} args - Arguments to find a CloudBranch
     * @example
     * // Get one CloudBranch
     * const cloudBranch = await prisma.cloudBranch.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CloudBranchFindFirstArgs>(args?: SelectSubset<T, CloudBranchFindFirstArgs<ExtArgs>>): Prisma__CloudBranchClient<$Result.GetResult<Prisma.$CloudBranchPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CloudBranch that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudBranchFindFirstOrThrowArgs} args - Arguments to find a CloudBranch
     * @example
     * // Get one CloudBranch
     * const cloudBranch = await prisma.cloudBranch.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CloudBranchFindFirstOrThrowArgs>(args?: SelectSubset<T, CloudBranchFindFirstOrThrowArgs<ExtArgs>>): Prisma__CloudBranchClient<$Result.GetResult<Prisma.$CloudBranchPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CloudBranches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudBranchFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CloudBranches
     * const cloudBranches = await prisma.cloudBranch.findMany()
     * 
     * // Get first 10 CloudBranches
     * const cloudBranches = await prisma.cloudBranch.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cloudBranchWithIdOnly = await prisma.cloudBranch.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CloudBranchFindManyArgs>(args?: SelectSubset<T, CloudBranchFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudBranchPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CloudBranch.
     * @param {CloudBranchCreateArgs} args - Arguments to create a CloudBranch.
     * @example
     * // Create one CloudBranch
     * const CloudBranch = await prisma.cloudBranch.create({
     *   data: {
     *     // ... data to create a CloudBranch
     *   }
     * })
     * 
     */
    create<T extends CloudBranchCreateArgs>(args: SelectSubset<T, CloudBranchCreateArgs<ExtArgs>>): Prisma__CloudBranchClient<$Result.GetResult<Prisma.$CloudBranchPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CloudBranches.
     * @param {CloudBranchCreateManyArgs} args - Arguments to create many CloudBranches.
     * @example
     * // Create many CloudBranches
     * const cloudBranch = await prisma.cloudBranch.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CloudBranchCreateManyArgs>(args?: SelectSubset<T, CloudBranchCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CloudBranches and returns the data saved in the database.
     * @param {CloudBranchCreateManyAndReturnArgs} args - Arguments to create many CloudBranches.
     * @example
     * // Create many CloudBranches
     * const cloudBranch = await prisma.cloudBranch.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CloudBranches and only return the `id`
     * const cloudBranchWithIdOnly = await prisma.cloudBranch.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CloudBranchCreateManyAndReturnArgs>(args?: SelectSubset<T, CloudBranchCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudBranchPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CloudBranch.
     * @param {CloudBranchDeleteArgs} args - Arguments to delete one CloudBranch.
     * @example
     * // Delete one CloudBranch
     * const CloudBranch = await prisma.cloudBranch.delete({
     *   where: {
     *     // ... filter to delete one CloudBranch
     *   }
     * })
     * 
     */
    delete<T extends CloudBranchDeleteArgs>(args: SelectSubset<T, CloudBranchDeleteArgs<ExtArgs>>): Prisma__CloudBranchClient<$Result.GetResult<Prisma.$CloudBranchPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CloudBranch.
     * @param {CloudBranchUpdateArgs} args - Arguments to update one CloudBranch.
     * @example
     * // Update one CloudBranch
     * const cloudBranch = await prisma.cloudBranch.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CloudBranchUpdateArgs>(args: SelectSubset<T, CloudBranchUpdateArgs<ExtArgs>>): Prisma__CloudBranchClient<$Result.GetResult<Prisma.$CloudBranchPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CloudBranches.
     * @param {CloudBranchDeleteManyArgs} args - Arguments to filter CloudBranches to delete.
     * @example
     * // Delete a few CloudBranches
     * const { count } = await prisma.cloudBranch.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CloudBranchDeleteManyArgs>(args?: SelectSubset<T, CloudBranchDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CloudBranches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudBranchUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CloudBranches
     * const cloudBranch = await prisma.cloudBranch.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CloudBranchUpdateManyArgs>(args: SelectSubset<T, CloudBranchUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CloudBranch.
     * @param {CloudBranchUpsertArgs} args - Arguments to update or create a CloudBranch.
     * @example
     * // Update or create a CloudBranch
     * const cloudBranch = await prisma.cloudBranch.upsert({
     *   create: {
     *     // ... data to create a CloudBranch
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CloudBranch we want to update
     *   }
     * })
     */
    upsert<T extends CloudBranchUpsertArgs>(args: SelectSubset<T, CloudBranchUpsertArgs<ExtArgs>>): Prisma__CloudBranchClient<$Result.GetResult<Prisma.$CloudBranchPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CloudBranches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudBranchCountArgs} args - Arguments to filter CloudBranches to count.
     * @example
     * // Count the number of CloudBranches
     * const count = await prisma.cloudBranch.count({
     *   where: {
     *     // ... the filter for the CloudBranches we want to count
     *   }
     * })
    **/
    count<T extends CloudBranchCountArgs>(
      args?: Subset<T, CloudBranchCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CloudBranchCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CloudBranch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudBranchAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CloudBranchAggregateArgs>(args: Subset<T, CloudBranchAggregateArgs>): Prisma.PrismaPromise<GetCloudBranchAggregateType<T>>

    /**
     * Group by CloudBranch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudBranchGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CloudBranchGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CloudBranchGroupByArgs['orderBy'] }
        : { orderBy?: CloudBranchGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CloudBranchGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCloudBranchGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CloudBranch model
   */
  readonly fields: CloudBranchFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CloudBranch.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CloudBranchClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CloudBranch model
   */ 
  interface CloudBranchFieldRefs {
    readonly id: FieldRef<"CloudBranch", 'String'>
    readonly tenantId: FieldRef<"CloudBranch", 'String'>
    readonly name: FieldRef<"CloudBranch", 'String'>
    readonly brandName: FieldRef<"CloudBranch", 'String'>
    readonly apiKeyHash: FieldRef<"CloudBranch", 'String'>
    readonly createdAt: FieldRef<"CloudBranch", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CloudBranch findUnique
   */
  export type CloudBranchFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudBranch
     */
    select?: CloudBranchSelect<ExtArgs> | null
    /**
     * Filter, which CloudBranch to fetch.
     */
    where: CloudBranchWhereUniqueInput
  }

  /**
   * CloudBranch findUniqueOrThrow
   */
  export type CloudBranchFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudBranch
     */
    select?: CloudBranchSelect<ExtArgs> | null
    /**
     * Filter, which CloudBranch to fetch.
     */
    where: CloudBranchWhereUniqueInput
  }

  /**
   * CloudBranch findFirst
   */
  export type CloudBranchFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudBranch
     */
    select?: CloudBranchSelect<ExtArgs> | null
    /**
     * Filter, which CloudBranch to fetch.
     */
    where?: CloudBranchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudBranches to fetch.
     */
    orderBy?: CloudBranchOrderByWithRelationInput | CloudBranchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudBranches.
     */
    cursor?: CloudBranchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudBranches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudBranches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudBranches.
     */
    distinct?: CloudBranchScalarFieldEnum | CloudBranchScalarFieldEnum[]
  }

  /**
   * CloudBranch findFirstOrThrow
   */
  export type CloudBranchFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudBranch
     */
    select?: CloudBranchSelect<ExtArgs> | null
    /**
     * Filter, which CloudBranch to fetch.
     */
    where?: CloudBranchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudBranches to fetch.
     */
    orderBy?: CloudBranchOrderByWithRelationInput | CloudBranchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudBranches.
     */
    cursor?: CloudBranchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudBranches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudBranches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudBranches.
     */
    distinct?: CloudBranchScalarFieldEnum | CloudBranchScalarFieldEnum[]
  }

  /**
   * CloudBranch findMany
   */
  export type CloudBranchFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudBranch
     */
    select?: CloudBranchSelect<ExtArgs> | null
    /**
     * Filter, which CloudBranches to fetch.
     */
    where?: CloudBranchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudBranches to fetch.
     */
    orderBy?: CloudBranchOrderByWithRelationInput | CloudBranchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CloudBranches.
     */
    cursor?: CloudBranchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudBranches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudBranches.
     */
    skip?: number
    distinct?: CloudBranchScalarFieldEnum | CloudBranchScalarFieldEnum[]
  }

  /**
   * CloudBranch create
   */
  export type CloudBranchCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudBranch
     */
    select?: CloudBranchSelect<ExtArgs> | null
    /**
     * The data needed to create a CloudBranch.
     */
    data: XOR<CloudBranchCreateInput, CloudBranchUncheckedCreateInput>
  }

  /**
   * CloudBranch createMany
   */
  export type CloudBranchCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CloudBranches.
     */
    data: CloudBranchCreateManyInput | CloudBranchCreateManyInput[]
  }

  /**
   * CloudBranch createManyAndReturn
   */
  export type CloudBranchCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudBranch
     */
    select?: CloudBranchSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CloudBranches.
     */
    data: CloudBranchCreateManyInput | CloudBranchCreateManyInput[]
  }

  /**
   * CloudBranch update
   */
  export type CloudBranchUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudBranch
     */
    select?: CloudBranchSelect<ExtArgs> | null
    /**
     * The data needed to update a CloudBranch.
     */
    data: XOR<CloudBranchUpdateInput, CloudBranchUncheckedUpdateInput>
    /**
     * Choose, which CloudBranch to update.
     */
    where: CloudBranchWhereUniqueInput
  }

  /**
   * CloudBranch updateMany
   */
  export type CloudBranchUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CloudBranches.
     */
    data: XOR<CloudBranchUpdateManyMutationInput, CloudBranchUncheckedUpdateManyInput>
    /**
     * Filter which CloudBranches to update
     */
    where?: CloudBranchWhereInput
  }

  /**
   * CloudBranch upsert
   */
  export type CloudBranchUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudBranch
     */
    select?: CloudBranchSelect<ExtArgs> | null
    /**
     * The filter to search for the CloudBranch to update in case it exists.
     */
    where: CloudBranchWhereUniqueInput
    /**
     * In case the CloudBranch found by the `where` argument doesn't exist, create a new CloudBranch with this data.
     */
    create: XOR<CloudBranchCreateInput, CloudBranchUncheckedCreateInput>
    /**
     * In case the CloudBranch was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CloudBranchUpdateInput, CloudBranchUncheckedUpdateInput>
  }

  /**
   * CloudBranch delete
   */
  export type CloudBranchDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudBranch
     */
    select?: CloudBranchSelect<ExtArgs> | null
    /**
     * Filter which CloudBranch to delete.
     */
    where: CloudBranchWhereUniqueInput
  }

  /**
   * CloudBranch deleteMany
   */
  export type CloudBranchDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudBranches to delete
     */
    where?: CloudBranchWhereInput
  }

  /**
   * CloudBranch without action
   */
  export type CloudBranchDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudBranch
     */
    select?: CloudBranchSelect<ExtArgs> | null
  }


  /**
   * Model SyncedEvent
   */

  export type AggregateSyncedEvent = {
    _count: SyncedEventCountAggregateOutputType | null
    _min: SyncedEventMinAggregateOutputType | null
    _max: SyncedEventMaxAggregateOutputType | null
  }

  export type SyncedEventMinAggregateOutputType = {
    id: string | null
    branchId: string | null
    aggregateType: string | null
    aggregateId: string | null
    eventType: string | null
    occurredAt: Date | null
    appliedAt: Date | null
  }

  export type SyncedEventMaxAggregateOutputType = {
    id: string | null
    branchId: string | null
    aggregateType: string | null
    aggregateId: string | null
    eventType: string | null
    occurredAt: Date | null
    appliedAt: Date | null
  }

  export type SyncedEventCountAggregateOutputType = {
    id: number
    branchId: number
    aggregateType: number
    aggregateId: number
    eventType: number
    occurredAt: number
    appliedAt: number
    _all: number
  }


  export type SyncedEventMinAggregateInputType = {
    id?: true
    branchId?: true
    aggregateType?: true
    aggregateId?: true
    eventType?: true
    occurredAt?: true
    appliedAt?: true
  }

  export type SyncedEventMaxAggregateInputType = {
    id?: true
    branchId?: true
    aggregateType?: true
    aggregateId?: true
    eventType?: true
    occurredAt?: true
    appliedAt?: true
  }

  export type SyncedEventCountAggregateInputType = {
    id?: true
    branchId?: true
    aggregateType?: true
    aggregateId?: true
    eventType?: true
    occurredAt?: true
    appliedAt?: true
    _all?: true
  }

  export type SyncedEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SyncedEvent to aggregate.
     */
    where?: SyncedEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SyncedEvents to fetch.
     */
    orderBy?: SyncedEventOrderByWithRelationInput | SyncedEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SyncedEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SyncedEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SyncedEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SyncedEvents
    **/
    _count?: true | SyncedEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SyncedEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SyncedEventMaxAggregateInputType
  }

  export type GetSyncedEventAggregateType<T extends SyncedEventAggregateArgs> = {
        [P in keyof T & keyof AggregateSyncedEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSyncedEvent[P]>
      : GetScalarType<T[P], AggregateSyncedEvent[P]>
  }




  export type SyncedEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SyncedEventWhereInput
    orderBy?: SyncedEventOrderByWithAggregationInput | SyncedEventOrderByWithAggregationInput[]
    by: SyncedEventScalarFieldEnum[] | SyncedEventScalarFieldEnum
    having?: SyncedEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SyncedEventCountAggregateInputType | true
    _min?: SyncedEventMinAggregateInputType
    _max?: SyncedEventMaxAggregateInputType
  }

  export type SyncedEventGroupByOutputType = {
    id: string
    branchId: string
    aggregateType: string
    aggregateId: string
    eventType: string
    occurredAt: Date
    appliedAt: Date
    _count: SyncedEventCountAggregateOutputType | null
    _min: SyncedEventMinAggregateOutputType | null
    _max: SyncedEventMaxAggregateOutputType | null
  }

  type GetSyncedEventGroupByPayload<T extends SyncedEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SyncedEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SyncedEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SyncedEventGroupByOutputType[P]>
            : GetScalarType<T[P], SyncedEventGroupByOutputType[P]>
        }
      >
    >


  export type SyncedEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    aggregateType?: boolean
    aggregateId?: boolean
    eventType?: boolean
    occurredAt?: boolean
    appliedAt?: boolean
  }, ExtArgs["result"]["syncedEvent"]>

  export type SyncedEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    aggregateType?: boolean
    aggregateId?: boolean
    eventType?: boolean
    occurredAt?: boolean
    appliedAt?: boolean
  }, ExtArgs["result"]["syncedEvent"]>

  export type SyncedEventSelectScalar = {
    id?: boolean
    branchId?: boolean
    aggregateType?: boolean
    aggregateId?: boolean
    eventType?: boolean
    occurredAt?: boolean
    appliedAt?: boolean
  }


  export type $SyncedEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SyncedEvent"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      branchId: string
      aggregateType: string
      aggregateId: string
      eventType: string
      occurredAt: Date
      appliedAt: Date
    }, ExtArgs["result"]["syncedEvent"]>
    composites: {}
  }

  type SyncedEventGetPayload<S extends boolean | null | undefined | SyncedEventDefaultArgs> = $Result.GetResult<Prisma.$SyncedEventPayload, S>

  type SyncedEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SyncedEventFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SyncedEventCountAggregateInputType | true
    }

  export interface SyncedEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SyncedEvent'], meta: { name: 'SyncedEvent' } }
    /**
     * Find zero or one SyncedEvent that matches the filter.
     * @param {SyncedEventFindUniqueArgs} args - Arguments to find a SyncedEvent
     * @example
     * // Get one SyncedEvent
     * const syncedEvent = await prisma.syncedEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SyncedEventFindUniqueArgs>(args: SelectSubset<T, SyncedEventFindUniqueArgs<ExtArgs>>): Prisma__SyncedEventClient<$Result.GetResult<Prisma.$SyncedEventPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SyncedEvent that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SyncedEventFindUniqueOrThrowArgs} args - Arguments to find a SyncedEvent
     * @example
     * // Get one SyncedEvent
     * const syncedEvent = await prisma.syncedEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SyncedEventFindUniqueOrThrowArgs>(args: SelectSubset<T, SyncedEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SyncedEventClient<$Result.GetResult<Prisma.$SyncedEventPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SyncedEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SyncedEventFindFirstArgs} args - Arguments to find a SyncedEvent
     * @example
     * // Get one SyncedEvent
     * const syncedEvent = await prisma.syncedEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SyncedEventFindFirstArgs>(args?: SelectSubset<T, SyncedEventFindFirstArgs<ExtArgs>>): Prisma__SyncedEventClient<$Result.GetResult<Prisma.$SyncedEventPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SyncedEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SyncedEventFindFirstOrThrowArgs} args - Arguments to find a SyncedEvent
     * @example
     * // Get one SyncedEvent
     * const syncedEvent = await prisma.syncedEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SyncedEventFindFirstOrThrowArgs>(args?: SelectSubset<T, SyncedEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__SyncedEventClient<$Result.GetResult<Prisma.$SyncedEventPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SyncedEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SyncedEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SyncedEvents
     * const syncedEvents = await prisma.syncedEvent.findMany()
     * 
     * // Get first 10 SyncedEvents
     * const syncedEvents = await prisma.syncedEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const syncedEventWithIdOnly = await prisma.syncedEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SyncedEventFindManyArgs>(args?: SelectSubset<T, SyncedEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SyncedEventPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SyncedEvent.
     * @param {SyncedEventCreateArgs} args - Arguments to create a SyncedEvent.
     * @example
     * // Create one SyncedEvent
     * const SyncedEvent = await prisma.syncedEvent.create({
     *   data: {
     *     // ... data to create a SyncedEvent
     *   }
     * })
     * 
     */
    create<T extends SyncedEventCreateArgs>(args: SelectSubset<T, SyncedEventCreateArgs<ExtArgs>>): Prisma__SyncedEventClient<$Result.GetResult<Prisma.$SyncedEventPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SyncedEvents.
     * @param {SyncedEventCreateManyArgs} args - Arguments to create many SyncedEvents.
     * @example
     * // Create many SyncedEvents
     * const syncedEvent = await prisma.syncedEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SyncedEventCreateManyArgs>(args?: SelectSubset<T, SyncedEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SyncedEvents and returns the data saved in the database.
     * @param {SyncedEventCreateManyAndReturnArgs} args - Arguments to create many SyncedEvents.
     * @example
     * // Create many SyncedEvents
     * const syncedEvent = await prisma.syncedEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SyncedEvents and only return the `id`
     * const syncedEventWithIdOnly = await prisma.syncedEvent.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SyncedEventCreateManyAndReturnArgs>(args?: SelectSubset<T, SyncedEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SyncedEventPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SyncedEvent.
     * @param {SyncedEventDeleteArgs} args - Arguments to delete one SyncedEvent.
     * @example
     * // Delete one SyncedEvent
     * const SyncedEvent = await prisma.syncedEvent.delete({
     *   where: {
     *     // ... filter to delete one SyncedEvent
     *   }
     * })
     * 
     */
    delete<T extends SyncedEventDeleteArgs>(args: SelectSubset<T, SyncedEventDeleteArgs<ExtArgs>>): Prisma__SyncedEventClient<$Result.GetResult<Prisma.$SyncedEventPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SyncedEvent.
     * @param {SyncedEventUpdateArgs} args - Arguments to update one SyncedEvent.
     * @example
     * // Update one SyncedEvent
     * const syncedEvent = await prisma.syncedEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SyncedEventUpdateArgs>(args: SelectSubset<T, SyncedEventUpdateArgs<ExtArgs>>): Prisma__SyncedEventClient<$Result.GetResult<Prisma.$SyncedEventPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SyncedEvents.
     * @param {SyncedEventDeleteManyArgs} args - Arguments to filter SyncedEvents to delete.
     * @example
     * // Delete a few SyncedEvents
     * const { count } = await prisma.syncedEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SyncedEventDeleteManyArgs>(args?: SelectSubset<T, SyncedEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SyncedEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SyncedEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SyncedEvents
     * const syncedEvent = await prisma.syncedEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SyncedEventUpdateManyArgs>(args: SelectSubset<T, SyncedEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SyncedEvent.
     * @param {SyncedEventUpsertArgs} args - Arguments to update or create a SyncedEvent.
     * @example
     * // Update or create a SyncedEvent
     * const syncedEvent = await prisma.syncedEvent.upsert({
     *   create: {
     *     // ... data to create a SyncedEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SyncedEvent we want to update
     *   }
     * })
     */
    upsert<T extends SyncedEventUpsertArgs>(args: SelectSubset<T, SyncedEventUpsertArgs<ExtArgs>>): Prisma__SyncedEventClient<$Result.GetResult<Prisma.$SyncedEventPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SyncedEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SyncedEventCountArgs} args - Arguments to filter SyncedEvents to count.
     * @example
     * // Count the number of SyncedEvents
     * const count = await prisma.syncedEvent.count({
     *   where: {
     *     // ... the filter for the SyncedEvents we want to count
     *   }
     * })
    **/
    count<T extends SyncedEventCountArgs>(
      args?: Subset<T, SyncedEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SyncedEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SyncedEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SyncedEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SyncedEventAggregateArgs>(args: Subset<T, SyncedEventAggregateArgs>): Prisma.PrismaPromise<GetSyncedEventAggregateType<T>>

    /**
     * Group by SyncedEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SyncedEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SyncedEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SyncedEventGroupByArgs['orderBy'] }
        : { orderBy?: SyncedEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SyncedEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSyncedEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SyncedEvent model
   */
  readonly fields: SyncedEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SyncedEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SyncedEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SyncedEvent model
   */ 
  interface SyncedEventFieldRefs {
    readonly id: FieldRef<"SyncedEvent", 'String'>
    readonly branchId: FieldRef<"SyncedEvent", 'String'>
    readonly aggregateType: FieldRef<"SyncedEvent", 'String'>
    readonly aggregateId: FieldRef<"SyncedEvent", 'String'>
    readonly eventType: FieldRef<"SyncedEvent", 'String'>
    readonly occurredAt: FieldRef<"SyncedEvent", 'DateTime'>
    readonly appliedAt: FieldRef<"SyncedEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SyncedEvent findUnique
   */
  export type SyncedEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncedEvent
     */
    select?: SyncedEventSelect<ExtArgs> | null
    /**
     * Filter, which SyncedEvent to fetch.
     */
    where: SyncedEventWhereUniqueInput
  }

  /**
   * SyncedEvent findUniqueOrThrow
   */
  export type SyncedEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncedEvent
     */
    select?: SyncedEventSelect<ExtArgs> | null
    /**
     * Filter, which SyncedEvent to fetch.
     */
    where: SyncedEventWhereUniqueInput
  }

  /**
   * SyncedEvent findFirst
   */
  export type SyncedEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncedEvent
     */
    select?: SyncedEventSelect<ExtArgs> | null
    /**
     * Filter, which SyncedEvent to fetch.
     */
    where?: SyncedEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SyncedEvents to fetch.
     */
    orderBy?: SyncedEventOrderByWithRelationInput | SyncedEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SyncedEvents.
     */
    cursor?: SyncedEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SyncedEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SyncedEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SyncedEvents.
     */
    distinct?: SyncedEventScalarFieldEnum | SyncedEventScalarFieldEnum[]
  }

  /**
   * SyncedEvent findFirstOrThrow
   */
  export type SyncedEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncedEvent
     */
    select?: SyncedEventSelect<ExtArgs> | null
    /**
     * Filter, which SyncedEvent to fetch.
     */
    where?: SyncedEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SyncedEvents to fetch.
     */
    orderBy?: SyncedEventOrderByWithRelationInput | SyncedEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SyncedEvents.
     */
    cursor?: SyncedEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SyncedEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SyncedEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SyncedEvents.
     */
    distinct?: SyncedEventScalarFieldEnum | SyncedEventScalarFieldEnum[]
  }

  /**
   * SyncedEvent findMany
   */
  export type SyncedEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncedEvent
     */
    select?: SyncedEventSelect<ExtArgs> | null
    /**
     * Filter, which SyncedEvents to fetch.
     */
    where?: SyncedEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SyncedEvents to fetch.
     */
    orderBy?: SyncedEventOrderByWithRelationInput | SyncedEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SyncedEvents.
     */
    cursor?: SyncedEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SyncedEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SyncedEvents.
     */
    skip?: number
    distinct?: SyncedEventScalarFieldEnum | SyncedEventScalarFieldEnum[]
  }

  /**
   * SyncedEvent create
   */
  export type SyncedEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncedEvent
     */
    select?: SyncedEventSelect<ExtArgs> | null
    /**
     * The data needed to create a SyncedEvent.
     */
    data: XOR<SyncedEventCreateInput, SyncedEventUncheckedCreateInput>
  }

  /**
   * SyncedEvent createMany
   */
  export type SyncedEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SyncedEvents.
     */
    data: SyncedEventCreateManyInput | SyncedEventCreateManyInput[]
  }

  /**
   * SyncedEvent createManyAndReturn
   */
  export type SyncedEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncedEvent
     */
    select?: SyncedEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SyncedEvents.
     */
    data: SyncedEventCreateManyInput | SyncedEventCreateManyInput[]
  }

  /**
   * SyncedEvent update
   */
  export type SyncedEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncedEvent
     */
    select?: SyncedEventSelect<ExtArgs> | null
    /**
     * The data needed to update a SyncedEvent.
     */
    data: XOR<SyncedEventUpdateInput, SyncedEventUncheckedUpdateInput>
    /**
     * Choose, which SyncedEvent to update.
     */
    where: SyncedEventWhereUniqueInput
  }

  /**
   * SyncedEvent updateMany
   */
  export type SyncedEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SyncedEvents.
     */
    data: XOR<SyncedEventUpdateManyMutationInput, SyncedEventUncheckedUpdateManyInput>
    /**
     * Filter which SyncedEvents to update
     */
    where?: SyncedEventWhereInput
  }

  /**
   * SyncedEvent upsert
   */
  export type SyncedEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncedEvent
     */
    select?: SyncedEventSelect<ExtArgs> | null
    /**
     * The filter to search for the SyncedEvent to update in case it exists.
     */
    where: SyncedEventWhereUniqueInput
    /**
     * In case the SyncedEvent found by the `where` argument doesn't exist, create a new SyncedEvent with this data.
     */
    create: XOR<SyncedEventCreateInput, SyncedEventUncheckedCreateInput>
    /**
     * In case the SyncedEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SyncedEventUpdateInput, SyncedEventUncheckedUpdateInput>
  }

  /**
   * SyncedEvent delete
   */
  export type SyncedEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncedEvent
     */
    select?: SyncedEventSelect<ExtArgs> | null
    /**
     * Filter which SyncedEvent to delete.
     */
    where: SyncedEventWhereUniqueInput
  }

  /**
   * SyncedEvent deleteMany
   */
  export type SyncedEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SyncedEvents to delete
     */
    where?: SyncedEventWhereInput
  }

  /**
   * SyncedEvent without action
   */
  export type SyncedEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncedEvent
     */
    select?: SyncedEventSelect<ExtArgs> | null
  }


  /**
   * Model CloudOrder
   */

  export type AggregateCloudOrder = {
    _count: CloudOrderCountAggregateOutputType | null
    _avg: CloudOrderAvgAggregateOutputType | null
    _sum: CloudOrderSumAggregateOutputType | null
    _min: CloudOrderMinAggregateOutputType | null
    _max: CloudOrderMaxAggregateOutputType | null
  }

  export type CloudOrderAvgAggregateOutputType = {
    subtotal: Decimal | null
    discountTotal: Decimal | null
    taxTotal: Decimal | null
    serviceFeeTotal: Decimal | null
    total: Decimal | null
  }

  export type CloudOrderSumAggregateOutputType = {
    subtotal: Decimal | null
    discountTotal: Decimal | null
    taxTotal: Decimal | null
    serviceFeeTotal: Decimal | null
    total: Decimal | null
  }

  export type CloudOrderMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    branchId: string | null
    type: string | null
    status: string | null
    subtotal: Decimal | null
    discountTotal: Decimal | null
    taxTotal: Decimal | null
    serviceFeeTotal: Decimal | null
    total: Decimal | null
    currency: string | null
    occurredAt: Date | null
    createdAt: Date | null
  }

  export type CloudOrderMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    branchId: string | null
    type: string | null
    status: string | null
    subtotal: Decimal | null
    discountTotal: Decimal | null
    taxTotal: Decimal | null
    serviceFeeTotal: Decimal | null
    total: Decimal | null
    currency: string | null
    occurredAt: Date | null
    createdAt: Date | null
  }

  export type CloudOrderCountAggregateOutputType = {
    id: number
    tenantId: number
    branchId: number
    type: number
    status: number
    subtotal: number
    discountTotal: number
    taxTotal: number
    serviceFeeTotal: number
    total: number
    currency: number
    occurredAt: number
    createdAt: number
    _all: number
  }


  export type CloudOrderAvgAggregateInputType = {
    subtotal?: true
    discountTotal?: true
    taxTotal?: true
    serviceFeeTotal?: true
    total?: true
  }

  export type CloudOrderSumAggregateInputType = {
    subtotal?: true
    discountTotal?: true
    taxTotal?: true
    serviceFeeTotal?: true
    total?: true
  }

  export type CloudOrderMinAggregateInputType = {
    id?: true
    tenantId?: true
    branchId?: true
    type?: true
    status?: true
    subtotal?: true
    discountTotal?: true
    taxTotal?: true
    serviceFeeTotal?: true
    total?: true
    currency?: true
    occurredAt?: true
    createdAt?: true
  }

  export type CloudOrderMaxAggregateInputType = {
    id?: true
    tenantId?: true
    branchId?: true
    type?: true
    status?: true
    subtotal?: true
    discountTotal?: true
    taxTotal?: true
    serviceFeeTotal?: true
    total?: true
    currency?: true
    occurredAt?: true
    createdAt?: true
  }

  export type CloudOrderCountAggregateInputType = {
    id?: true
    tenantId?: true
    branchId?: true
    type?: true
    status?: true
    subtotal?: true
    discountTotal?: true
    taxTotal?: true
    serviceFeeTotal?: true
    total?: true
    currency?: true
    occurredAt?: true
    createdAt?: true
    _all?: true
  }

  export type CloudOrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudOrder to aggregate.
     */
    where?: CloudOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudOrders to fetch.
     */
    orderBy?: CloudOrderOrderByWithRelationInput | CloudOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CloudOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CloudOrders
    **/
    _count?: true | CloudOrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CloudOrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CloudOrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CloudOrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CloudOrderMaxAggregateInputType
  }

  export type GetCloudOrderAggregateType<T extends CloudOrderAggregateArgs> = {
        [P in keyof T & keyof AggregateCloudOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCloudOrder[P]>
      : GetScalarType<T[P], AggregateCloudOrder[P]>
  }




  export type CloudOrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CloudOrderWhereInput
    orderBy?: CloudOrderOrderByWithAggregationInput | CloudOrderOrderByWithAggregationInput[]
    by: CloudOrderScalarFieldEnum[] | CloudOrderScalarFieldEnum
    having?: CloudOrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CloudOrderCountAggregateInputType | true
    _avg?: CloudOrderAvgAggregateInputType
    _sum?: CloudOrderSumAggregateInputType
    _min?: CloudOrderMinAggregateInputType
    _max?: CloudOrderMaxAggregateInputType
  }

  export type CloudOrderGroupByOutputType = {
    id: string
    tenantId: string
    branchId: string
    type: string
    status: string
    subtotal: Decimal
    discountTotal: Decimal
    taxTotal: Decimal
    serviceFeeTotal: Decimal
    total: Decimal
    currency: string
    occurredAt: Date
    createdAt: Date
    _count: CloudOrderCountAggregateOutputType | null
    _avg: CloudOrderAvgAggregateOutputType | null
    _sum: CloudOrderSumAggregateOutputType | null
    _min: CloudOrderMinAggregateOutputType | null
    _max: CloudOrderMaxAggregateOutputType | null
  }

  type GetCloudOrderGroupByPayload<T extends CloudOrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CloudOrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CloudOrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CloudOrderGroupByOutputType[P]>
            : GetScalarType<T[P], CloudOrderGroupByOutputType[P]>
        }
      >
    >


  export type CloudOrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    branchId?: boolean
    type?: boolean
    status?: boolean
    subtotal?: boolean
    discountTotal?: boolean
    taxTotal?: boolean
    serviceFeeTotal?: boolean
    total?: boolean
    currency?: boolean
    occurredAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["cloudOrder"]>

  export type CloudOrderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    branchId?: boolean
    type?: boolean
    status?: boolean
    subtotal?: boolean
    discountTotal?: boolean
    taxTotal?: boolean
    serviceFeeTotal?: boolean
    total?: boolean
    currency?: boolean
    occurredAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["cloudOrder"]>

  export type CloudOrderSelectScalar = {
    id?: boolean
    tenantId?: boolean
    branchId?: boolean
    type?: boolean
    status?: boolean
    subtotal?: boolean
    discountTotal?: boolean
    taxTotal?: boolean
    serviceFeeTotal?: boolean
    total?: boolean
    currency?: boolean
    occurredAt?: boolean
    createdAt?: boolean
  }


  export type $CloudOrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CloudOrder"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      branchId: string
      type: string
      status: string
      subtotal: Prisma.Decimal
      discountTotal: Prisma.Decimal
      taxTotal: Prisma.Decimal
      serviceFeeTotal: Prisma.Decimal
      total: Prisma.Decimal
      currency: string
      occurredAt: Date
      createdAt: Date
    }, ExtArgs["result"]["cloudOrder"]>
    composites: {}
  }

  type CloudOrderGetPayload<S extends boolean | null | undefined | CloudOrderDefaultArgs> = $Result.GetResult<Prisma.$CloudOrderPayload, S>

  type CloudOrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CloudOrderFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CloudOrderCountAggregateInputType | true
    }

  export interface CloudOrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CloudOrder'], meta: { name: 'CloudOrder' } }
    /**
     * Find zero or one CloudOrder that matches the filter.
     * @param {CloudOrderFindUniqueArgs} args - Arguments to find a CloudOrder
     * @example
     * // Get one CloudOrder
     * const cloudOrder = await prisma.cloudOrder.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CloudOrderFindUniqueArgs>(args: SelectSubset<T, CloudOrderFindUniqueArgs<ExtArgs>>): Prisma__CloudOrderClient<$Result.GetResult<Prisma.$CloudOrderPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CloudOrder that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CloudOrderFindUniqueOrThrowArgs} args - Arguments to find a CloudOrder
     * @example
     * // Get one CloudOrder
     * const cloudOrder = await prisma.cloudOrder.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CloudOrderFindUniqueOrThrowArgs>(args: SelectSubset<T, CloudOrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CloudOrderClient<$Result.GetResult<Prisma.$CloudOrderPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CloudOrder that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudOrderFindFirstArgs} args - Arguments to find a CloudOrder
     * @example
     * // Get one CloudOrder
     * const cloudOrder = await prisma.cloudOrder.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CloudOrderFindFirstArgs>(args?: SelectSubset<T, CloudOrderFindFirstArgs<ExtArgs>>): Prisma__CloudOrderClient<$Result.GetResult<Prisma.$CloudOrderPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CloudOrder that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudOrderFindFirstOrThrowArgs} args - Arguments to find a CloudOrder
     * @example
     * // Get one CloudOrder
     * const cloudOrder = await prisma.cloudOrder.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CloudOrderFindFirstOrThrowArgs>(args?: SelectSubset<T, CloudOrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__CloudOrderClient<$Result.GetResult<Prisma.$CloudOrderPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CloudOrders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudOrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CloudOrders
     * const cloudOrders = await prisma.cloudOrder.findMany()
     * 
     * // Get first 10 CloudOrders
     * const cloudOrders = await prisma.cloudOrder.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cloudOrderWithIdOnly = await prisma.cloudOrder.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CloudOrderFindManyArgs>(args?: SelectSubset<T, CloudOrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudOrderPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CloudOrder.
     * @param {CloudOrderCreateArgs} args - Arguments to create a CloudOrder.
     * @example
     * // Create one CloudOrder
     * const CloudOrder = await prisma.cloudOrder.create({
     *   data: {
     *     // ... data to create a CloudOrder
     *   }
     * })
     * 
     */
    create<T extends CloudOrderCreateArgs>(args: SelectSubset<T, CloudOrderCreateArgs<ExtArgs>>): Prisma__CloudOrderClient<$Result.GetResult<Prisma.$CloudOrderPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CloudOrders.
     * @param {CloudOrderCreateManyArgs} args - Arguments to create many CloudOrders.
     * @example
     * // Create many CloudOrders
     * const cloudOrder = await prisma.cloudOrder.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CloudOrderCreateManyArgs>(args?: SelectSubset<T, CloudOrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CloudOrders and returns the data saved in the database.
     * @param {CloudOrderCreateManyAndReturnArgs} args - Arguments to create many CloudOrders.
     * @example
     * // Create many CloudOrders
     * const cloudOrder = await prisma.cloudOrder.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CloudOrders and only return the `id`
     * const cloudOrderWithIdOnly = await prisma.cloudOrder.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CloudOrderCreateManyAndReturnArgs>(args?: SelectSubset<T, CloudOrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudOrderPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CloudOrder.
     * @param {CloudOrderDeleteArgs} args - Arguments to delete one CloudOrder.
     * @example
     * // Delete one CloudOrder
     * const CloudOrder = await prisma.cloudOrder.delete({
     *   where: {
     *     // ... filter to delete one CloudOrder
     *   }
     * })
     * 
     */
    delete<T extends CloudOrderDeleteArgs>(args: SelectSubset<T, CloudOrderDeleteArgs<ExtArgs>>): Prisma__CloudOrderClient<$Result.GetResult<Prisma.$CloudOrderPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CloudOrder.
     * @param {CloudOrderUpdateArgs} args - Arguments to update one CloudOrder.
     * @example
     * // Update one CloudOrder
     * const cloudOrder = await prisma.cloudOrder.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CloudOrderUpdateArgs>(args: SelectSubset<T, CloudOrderUpdateArgs<ExtArgs>>): Prisma__CloudOrderClient<$Result.GetResult<Prisma.$CloudOrderPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CloudOrders.
     * @param {CloudOrderDeleteManyArgs} args - Arguments to filter CloudOrders to delete.
     * @example
     * // Delete a few CloudOrders
     * const { count } = await prisma.cloudOrder.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CloudOrderDeleteManyArgs>(args?: SelectSubset<T, CloudOrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CloudOrders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudOrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CloudOrders
     * const cloudOrder = await prisma.cloudOrder.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CloudOrderUpdateManyArgs>(args: SelectSubset<T, CloudOrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CloudOrder.
     * @param {CloudOrderUpsertArgs} args - Arguments to update or create a CloudOrder.
     * @example
     * // Update or create a CloudOrder
     * const cloudOrder = await prisma.cloudOrder.upsert({
     *   create: {
     *     // ... data to create a CloudOrder
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CloudOrder we want to update
     *   }
     * })
     */
    upsert<T extends CloudOrderUpsertArgs>(args: SelectSubset<T, CloudOrderUpsertArgs<ExtArgs>>): Prisma__CloudOrderClient<$Result.GetResult<Prisma.$CloudOrderPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CloudOrders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudOrderCountArgs} args - Arguments to filter CloudOrders to count.
     * @example
     * // Count the number of CloudOrders
     * const count = await prisma.cloudOrder.count({
     *   where: {
     *     // ... the filter for the CloudOrders we want to count
     *   }
     * })
    **/
    count<T extends CloudOrderCountArgs>(
      args?: Subset<T, CloudOrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CloudOrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CloudOrder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudOrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CloudOrderAggregateArgs>(args: Subset<T, CloudOrderAggregateArgs>): Prisma.PrismaPromise<GetCloudOrderAggregateType<T>>

    /**
     * Group by CloudOrder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudOrderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CloudOrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CloudOrderGroupByArgs['orderBy'] }
        : { orderBy?: CloudOrderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CloudOrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCloudOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CloudOrder model
   */
  readonly fields: CloudOrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CloudOrder.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CloudOrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CloudOrder model
   */ 
  interface CloudOrderFieldRefs {
    readonly id: FieldRef<"CloudOrder", 'String'>
    readonly tenantId: FieldRef<"CloudOrder", 'String'>
    readonly branchId: FieldRef<"CloudOrder", 'String'>
    readonly type: FieldRef<"CloudOrder", 'String'>
    readonly status: FieldRef<"CloudOrder", 'String'>
    readonly subtotal: FieldRef<"CloudOrder", 'Decimal'>
    readonly discountTotal: FieldRef<"CloudOrder", 'Decimal'>
    readonly taxTotal: FieldRef<"CloudOrder", 'Decimal'>
    readonly serviceFeeTotal: FieldRef<"CloudOrder", 'Decimal'>
    readonly total: FieldRef<"CloudOrder", 'Decimal'>
    readonly currency: FieldRef<"CloudOrder", 'String'>
    readonly occurredAt: FieldRef<"CloudOrder", 'DateTime'>
    readonly createdAt: FieldRef<"CloudOrder", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CloudOrder findUnique
   */
  export type CloudOrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudOrder
     */
    select?: CloudOrderSelect<ExtArgs> | null
    /**
     * Filter, which CloudOrder to fetch.
     */
    where: CloudOrderWhereUniqueInput
  }

  /**
   * CloudOrder findUniqueOrThrow
   */
  export type CloudOrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudOrder
     */
    select?: CloudOrderSelect<ExtArgs> | null
    /**
     * Filter, which CloudOrder to fetch.
     */
    where: CloudOrderWhereUniqueInput
  }

  /**
   * CloudOrder findFirst
   */
  export type CloudOrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudOrder
     */
    select?: CloudOrderSelect<ExtArgs> | null
    /**
     * Filter, which CloudOrder to fetch.
     */
    where?: CloudOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudOrders to fetch.
     */
    orderBy?: CloudOrderOrderByWithRelationInput | CloudOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudOrders.
     */
    cursor?: CloudOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudOrders.
     */
    distinct?: CloudOrderScalarFieldEnum | CloudOrderScalarFieldEnum[]
  }

  /**
   * CloudOrder findFirstOrThrow
   */
  export type CloudOrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudOrder
     */
    select?: CloudOrderSelect<ExtArgs> | null
    /**
     * Filter, which CloudOrder to fetch.
     */
    where?: CloudOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudOrders to fetch.
     */
    orderBy?: CloudOrderOrderByWithRelationInput | CloudOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudOrders.
     */
    cursor?: CloudOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudOrders.
     */
    distinct?: CloudOrderScalarFieldEnum | CloudOrderScalarFieldEnum[]
  }

  /**
   * CloudOrder findMany
   */
  export type CloudOrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudOrder
     */
    select?: CloudOrderSelect<ExtArgs> | null
    /**
     * Filter, which CloudOrders to fetch.
     */
    where?: CloudOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudOrders to fetch.
     */
    orderBy?: CloudOrderOrderByWithRelationInput | CloudOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CloudOrders.
     */
    cursor?: CloudOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudOrders.
     */
    skip?: number
    distinct?: CloudOrderScalarFieldEnum | CloudOrderScalarFieldEnum[]
  }

  /**
   * CloudOrder create
   */
  export type CloudOrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudOrder
     */
    select?: CloudOrderSelect<ExtArgs> | null
    /**
     * The data needed to create a CloudOrder.
     */
    data: XOR<CloudOrderCreateInput, CloudOrderUncheckedCreateInput>
  }

  /**
   * CloudOrder createMany
   */
  export type CloudOrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CloudOrders.
     */
    data: CloudOrderCreateManyInput | CloudOrderCreateManyInput[]
  }

  /**
   * CloudOrder createManyAndReturn
   */
  export type CloudOrderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudOrder
     */
    select?: CloudOrderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CloudOrders.
     */
    data: CloudOrderCreateManyInput | CloudOrderCreateManyInput[]
  }

  /**
   * CloudOrder update
   */
  export type CloudOrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudOrder
     */
    select?: CloudOrderSelect<ExtArgs> | null
    /**
     * The data needed to update a CloudOrder.
     */
    data: XOR<CloudOrderUpdateInput, CloudOrderUncheckedUpdateInput>
    /**
     * Choose, which CloudOrder to update.
     */
    where: CloudOrderWhereUniqueInput
  }

  /**
   * CloudOrder updateMany
   */
  export type CloudOrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CloudOrders.
     */
    data: XOR<CloudOrderUpdateManyMutationInput, CloudOrderUncheckedUpdateManyInput>
    /**
     * Filter which CloudOrders to update
     */
    where?: CloudOrderWhereInput
  }

  /**
   * CloudOrder upsert
   */
  export type CloudOrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudOrder
     */
    select?: CloudOrderSelect<ExtArgs> | null
    /**
     * The filter to search for the CloudOrder to update in case it exists.
     */
    where: CloudOrderWhereUniqueInput
    /**
     * In case the CloudOrder found by the `where` argument doesn't exist, create a new CloudOrder with this data.
     */
    create: XOR<CloudOrderCreateInput, CloudOrderUncheckedCreateInput>
    /**
     * In case the CloudOrder was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CloudOrderUpdateInput, CloudOrderUncheckedUpdateInput>
  }

  /**
   * CloudOrder delete
   */
  export type CloudOrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudOrder
     */
    select?: CloudOrderSelect<ExtArgs> | null
    /**
     * Filter which CloudOrder to delete.
     */
    where: CloudOrderWhereUniqueInput
  }

  /**
   * CloudOrder deleteMany
   */
  export type CloudOrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudOrders to delete
     */
    where?: CloudOrderWhereInput
  }

  /**
   * CloudOrder without action
   */
  export type CloudOrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudOrder
     */
    select?: CloudOrderSelect<ExtArgs> | null
  }


  /**
   * Model CloudPayment
   */

  export type AggregateCloudPayment = {
    _count: CloudPaymentCountAggregateOutputType | null
    _avg: CloudPaymentAvgAggregateOutputType | null
    _sum: CloudPaymentSumAggregateOutputType | null
    _min: CloudPaymentMinAggregateOutputType | null
    _max: CloudPaymentMaxAggregateOutputType | null
  }

  export type CloudPaymentAvgAggregateOutputType = {
    amount: Decimal | null
    tipAmount: Decimal | null
  }

  export type CloudPaymentSumAggregateOutputType = {
    amount: Decimal | null
    tipAmount: Decimal | null
  }

  export type CloudPaymentMinAggregateOutputType = {
    id: string | null
    orderId: string | null
    branchId: string | null
    method: string | null
    amount: Decimal | null
    tipAmount: Decimal | null
    currency: string | null
    status: string | null
    occurredAt: Date | null
    shiftId: string | null
  }

  export type CloudPaymentMaxAggregateOutputType = {
    id: string | null
    orderId: string | null
    branchId: string | null
    method: string | null
    amount: Decimal | null
    tipAmount: Decimal | null
    currency: string | null
    status: string | null
    occurredAt: Date | null
    shiftId: string | null
  }

  export type CloudPaymentCountAggregateOutputType = {
    id: number
    orderId: number
    branchId: number
    method: number
    amount: number
    tipAmount: number
    currency: number
    status: number
    occurredAt: number
    shiftId: number
    _all: number
  }


  export type CloudPaymentAvgAggregateInputType = {
    amount?: true
    tipAmount?: true
  }

  export type CloudPaymentSumAggregateInputType = {
    amount?: true
    tipAmount?: true
  }

  export type CloudPaymentMinAggregateInputType = {
    id?: true
    orderId?: true
    branchId?: true
    method?: true
    amount?: true
    tipAmount?: true
    currency?: true
    status?: true
    occurredAt?: true
    shiftId?: true
  }

  export type CloudPaymentMaxAggregateInputType = {
    id?: true
    orderId?: true
    branchId?: true
    method?: true
    amount?: true
    tipAmount?: true
    currency?: true
    status?: true
    occurredAt?: true
    shiftId?: true
  }

  export type CloudPaymentCountAggregateInputType = {
    id?: true
    orderId?: true
    branchId?: true
    method?: true
    amount?: true
    tipAmount?: true
    currency?: true
    status?: true
    occurredAt?: true
    shiftId?: true
    _all?: true
  }

  export type CloudPaymentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudPayment to aggregate.
     */
    where?: CloudPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudPayments to fetch.
     */
    orderBy?: CloudPaymentOrderByWithRelationInput | CloudPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CloudPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudPayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CloudPayments
    **/
    _count?: true | CloudPaymentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CloudPaymentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CloudPaymentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CloudPaymentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CloudPaymentMaxAggregateInputType
  }

  export type GetCloudPaymentAggregateType<T extends CloudPaymentAggregateArgs> = {
        [P in keyof T & keyof AggregateCloudPayment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCloudPayment[P]>
      : GetScalarType<T[P], AggregateCloudPayment[P]>
  }




  export type CloudPaymentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CloudPaymentWhereInput
    orderBy?: CloudPaymentOrderByWithAggregationInput | CloudPaymentOrderByWithAggregationInput[]
    by: CloudPaymentScalarFieldEnum[] | CloudPaymentScalarFieldEnum
    having?: CloudPaymentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CloudPaymentCountAggregateInputType | true
    _avg?: CloudPaymentAvgAggregateInputType
    _sum?: CloudPaymentSumAggregateInputType
    _min?: CloudPaymentMinAggregateInputType
    _max?: CloudPaymentMaxAggregateInputType
  }

  export type CloudPaymentGroupByOutputType = {
    id: string
    orderId: string
    branchId: string
    method: string
    amount: Decimal
    tipAmount: Decimal
    currency: string
    status: string
    occurredAt: Date
    shiftId: string | null
    _count: CloudPaymentCountAggregateOutputType | null
    _avg: CloudPaymentAvgAggregateOutputType | null
    _sum: CloudPaymentSumAggregateOutputType | null
    _min: CloudPaymentMinAggregateOutputType | null
    _max: CloudPaymentMaxAggregateOutputType | null
  }

  type GetCloudPaymentGroupByPayload<T extends CloudPaymentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CloudPaymentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CloudPaymentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CloudPaymentGroupByOutputType[P]>
            : GetScalarType<T[P], CloudPaymentGroupByOutputType[P]>
        }
      >
    >


  export type CloudPaymentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    branchId?: boolean
    method?: boolean
    amount?: boolean
    tipAmount?: boolean
    currency?: boolean
    status?: boolean
    occurredAt?: boolean
    shiftId?: boolean
  }, ExtArgs["result"]["cloudPayment"]>

  export type CloudPaymentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    branchId?: boolean
    method?: boolean
    amount?: boolean
    tipAmount?: boolean
    currency?: boolean
    status?: boolean
    occurredAt?: boolean
    shiftId?: boolean
  }, ExtArgs["result"]["cloudPayment"]>

  export type CloudPaymentSelectScalar = {
    id?: boolean
    orderId?: boolean
    branchId?: boolean
    method?: boolean
    amount?: boolean
    tipAmount?: boolean
    currency?: boolean
    status?: boolean
    occurredAt?: boolean
    shiftId?: boolean
  }


  export type $CloudPaymentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CloudPayment"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderId: string
      branchId: string
      method: string
      amount: Prisma.Decimal
      tipAmount: Prisma.Decimal
      currency: string
      status: string
      occurredAt: Date
      shiftId: string | null
    }, ExtArgs["result"]["cloudPayment"]>
    composites: {}
  }

  type CloudPaymentGetPayload<S extends boolean | null | undefined | CloudPaymentDefaultArgs> = $Result.GetResult<Prisma.$CloudPaymentPayload, S>

  type CloudPaymentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CloudPaymentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CloudPaymentCountAggregateInputType | true
    }

  export interface CloudPaymentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CloudPayment'], meta: { name: 'CloudPayment' } }
    /**
     * Find zero or one CloudPayment that matches the filter.
     * @param {CloudPaymentFindUniqueArgs} args - Arguments to find a CloudPayment
     * @example
     * // Get one CloudPayment
     * const cloudPayment = await prisma.cloudPayment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CloudPaymentFindUniqueArgs>(args: SelectSubset<T, CloudPaymentFindUniqueArgs<ExtArgs>>): Prisma__CloudPaymentClient<$Result.GetResult<Prisma.$CloudPaymentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CloudPayment that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CloudPaymentFindUniqueOrThrowArgs} args - Arguments to find a CloudPayment
     * @example
     * // Get one CloudPayment
     * const cloudPayment = await prisma.cloudPayment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CloudPaymentFindUniqueOrThrowArgs>(args: SelectSubset<T, CloudPaymentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CloudPaymentClient<$Result.GetResult<Prisma.$CloudPaymentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CloudPayment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudPaymentFindFirstArgs} args - Arguments to find a CloudPayment
     * @example
     * // Get one CloudPayment
     * const cloudPayment = await prisma.cloudPayment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CloudPaymentFindFirstArgs>(args?: SelectSubset<T, CloudPaymentFindFirstArgs<ExtArgs>>): Prisma__CloudPaymentClient<$Result.GetResult<Prisma.$CloudPaymentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CloudPayment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudPaymentFindFirstOrThrowArgs} args - Arguments to find a CloudPayment
     * @example
     * // Get one CloudPayment
     * const cloudPayment = await prisma.cloudPayment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CloudPaymentFindFirstOrThrowArgs>(args?: SelectSubset<T, CloudPaymentFindFirstOrThrowArgs<ExtArgs>>): Prisma__CloudPaymentClient<$Result.GetResult<Prisma.$CloudPaymentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CloudPayments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudPaymentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CloudPayments
     * const cloudPayments = await prisma.cloudPayment.findMany()
     * 
     * // Get first 10 CloudPayments
     * const cloudPayments = await prisma.cloudPayment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cloudPaymentWithIdOnly = await prisma.cloudPayment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CloudPaymentFindManyArgs>(args?: SelectSubset<T, CloudPaymentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudPaymentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CloudPayment.
     * @param {CloudPaymentCreateArgs} args - Arguments to create a CloudPayment.
     * @example
     * // Create one CloudPayment
     * const CloudPayment = await prisma.cloudPayment.create({
     *   data: {
     *     // ... data to create a CloudPayment
     *   }
     * })
     * 
     */
    create<T extends CloudPaymentCreateArgs>(args: SelectSubset<T, CloudPaymentCreateArgs<ExtArgs>>): Prisma__CloudPaymentClient<$Result.GetResult<Prisma.$CloudPaymentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CloudPayments.
     * @param {CloudPaymentCreateManyArgs} args - Arguments to create many CloudPayments.
     * @example
     * // Create many CloudPayments
     * const cloudPayment = await prisma.cloudPayment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CloudPaymentCreateManyArgs>(args?: SelectSubset<T, CloudPaymentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CloudPayments and returns the data saved in the database.
     * @param {CloudPaymentCreateManyAndReturnArgs} args - Arguments to create many CloudPayments.
     * @example
     * // Create many CloudPayments
     * const cloudPayment = await prisma.cloudPayment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CloudPayments and only return the `id`
     * const cloudPaymentWithIdOnly = await prisma.cloudPayment.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CloudPaymentCreateManyAndReturnArgs>(args?: SelectSubset<T, CloudPaymentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudPaymentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CloudPayment.
     * @param {CloudPaymentDeleteArgs} args - Arguments to delete one CloudPayment.
     * @example
     * // Delete one CloudPayment
     * const CloudPayment = await prisma.cloudPayment.delete({
     *   where: {
     *     // ... filter to delete one CloudPayment
     *   }
     * })
     * 
     */
    delete<T extends CloudPaymentDeleteArgs>(args: SelectSubset<T, CloudPaymentDeleteArgs<ExtArgs>>): Prisma__CloudPaymentClient<$Result.GetResult<Prisma.$CloudPaymentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CloudPayment.
     * @param {CloudPaymentUpdateArgs} args - Arguments to update one CloudPayment.
     * @example
     * // Update one CloudPayment
     * const cloudPayment = await prisma.cloudPayment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CloudPaymentUpdateArgs>(args: SelectSubset<T, CloudPaymentUpdateArgs<ExtArgs>>): Prisma__CloudPaymentClient<$Result.GetResult<Prisma.$CloudPaymentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CloudPayments.
     * @param {CloudPaymentDeleteManyArgs} args - Arguments to filter CloudPayments to delete.
     * @example
     * // Delete a few CloudPayments
     * const { count } = await prisma.cloudPayment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CloudPaymentDeleteManyArgs>(args?: SelectSubset<T, CloudPaymentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CloudPayments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudPaymentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CloudPayments
     * const cloudPayment = await prisma.cloudPayment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CloudPaymentUpdateManyArgs>(args: SelectSubset<T, CloudPaymentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CloudPayment.
     * @param {CloudPaymentUpsertArgs} args - Arguments to update or create a CloudPayment.
     * @example
     * // Update or create a CloudPayment
     * const cloudPayment = await prisma.cloudPayment.upsert({
     *   create: {
     *     // ... data to create a CloudPayment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CloudPayment we want to update
     *   }
     * })
     */
    upsert<T extends CloudPaymentUpsertArgs>(args: SelectSubset<T, CloudPaymentUpsertArgs<ExtArgs>>): Prisma__CloudPaymentClient<$Result.GetResult<Prisma.$CloudPaymentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CloudPayments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudPaymentCountArgs} args - Arguments to filter CloudPayments to count.
     * @example
     * // Count the number of CloudPayments
     * const count = await prisma.cloudPayment.count({
     *   where: {
     *     // ... the filter for the CloudPayments we want to count
     *   }
     * })
    **/
    count<T extends CloudPaymentCountArgs>(
      args?: Subset<T, CloudPaymentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CloudPaymentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CloudPayment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudPaymentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CloudPaymentAggregateArgs>(args: Subset<T, CloudPaymentAggregateArgs>): Prisma.PrismaPromise<GetCloudPaymentAggregateType<T>>

    /**
     * Group by CloudPayment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudPaymentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CloudPaymentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CloudPaymentGroupByArgs['orderBy'] }
        : { orderBy?: CloudPaymentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CloudPaymentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCloudPaymentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CloudPayment model
   */
  readonly fields: CloudPaymentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CloudPayment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CloudPaymentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CloudPayment model
   */ 
  interface CloudPaymentFieldRefs {
    readonly id: FieldRef<"CloudPayment", 'String'>
    readonly orderId: FieldRef<"CloudPayment", 'String'>
    readonly branchId: FieldRef<"CloudPayment", 'String'>
    readonly method: FieldRef<"CloudPayment", 'String'>
    readonly amount: FieldRef<"CloudPayment", 'Decimal'>
    readonly tipAmount: FieldRef<"CloudPayment", 'Decimal'>
    readonly currency: FieldRef<"CloudPayment", 'String'>
    readonly status: FieldRef<"CloudPayment", 'String'>
    readonly occurredAt: FieldRef<"CloudPayment", 'DateTime'>
    readonly shiftId: FieldRef<"CloudPayment", 'String'>
  }
    

  // Custom InputTypes
  /**
   * CloudPayment findUnique
   */
  export type CloudPaymentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudPayment
     */
    select?: CloudPaymentSelect<ExtArgs> | null
    /**
     * Filter, which CloudPayment to fetch.
     */
    where: CloudPaymentWhereUniqueInput
  }

  /**
   * CloudPayment findUniqueOrThrow
   */
  export type CloudPaymentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudPayment
     */
    select?: CloudPaymentSelect<ExtArgs> | null
    /**
     * Filter, which CloudPayment to fetch.
     */
    where: CloudPaymentWhereUniqueInput
  }

  /**
   * CloudPayment findFirst
   */
  export type CloudPaymentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudPayment
     */
    select?: CloudPaymentSelect<ExtArgs> | null
    /**
     * Filter, which CloudPayment to fetch.
     */
    where?: CloudPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudPayments to fetch.
     */
    orderBy?: CloudPaymentOrderByWithRelationInput | CloudPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudPayments.
     */
    cursor?: CloudPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudPayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudPayments.
     */
    distinct?: CloudPaymentScalarFieldEnum | CloudPaymentScalarFieldEnum[]
  }

  /**
   * CloudPayment findFirstOrThrow
   */
  export type CloudPaymentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudPayment
     */
    select?: CloudPaymentSelect<ExtArgs> | null
    /**
     * Filter, which CloudPayment to fetch.
     */
    where?: CloudPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudPayments to fetch.
     */
    orderBy?: CloudPaymentOrderByWithRelationInput | CloudPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudPayments.
     */
    cursor?: CloudPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudPayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudPayments.
     */
    distinct?: CloudPaymentScalarFieldEnum | CloudPaymentScalarFieldEnum[]
  }

  /**
   * CloudPayment findMany
   */
  export type CloudPaymentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudPayment
     */
    select?: CloudPaymentSelect<ExtArgs> | null
    /**
     * Filter, which CloudPayments to fetch.
     */
    where?: CloudPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudPayments to fetch.
     */
    orderBy?: CloudPaymentOrderByWithRelationInput | CloudPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CloudPayments.
     */
    cursor?: CloudPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudPayments.
     */
    skip?: number
    distinct?: CloudPaymentScalarFieldEnum | CloudPaymentScalarFieldEnum[]
  }

  /**
   * CloudPayment create
   */
  export type CloudPaymentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudPayment
     */
    select?: CloudPaymentSelect<ExtArgs> | null
    /**
     * The data needed to create a CloudPayment.
     */
    data: XOR<CloudPaymentCreateInput, CloudPaymentUncheckedCreateInput>
  }

  /**
   * CloudPayment createMany
   */
  export type CloudPaymentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CloudPayments.
     */
    data: CloudPaymentCreateManyInput | CloudPaymentCreateManyInput[]
  }

  /**
   * CloudPayment createManyAndReturn
   */
  export type CloudPaymentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudPayment
     */
    select?: CloudPaymentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CloudPayments.
     */
    data: CloudPaymentCreateManyInput | CloudPaymentCreateManyInput[]
  }

  /**
   * CloudPayment update
   */
  export type CloudPaymentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudPayment
     */
    select?: CloudPaymentSelect<ExtArgs> | null
    /**
     * The data needed to update a CloudPayment.
     */
    data: XOR<CloudPaymentUpdateInput, CloudPaymentUncheckedUpdateInput>
    /**
     * Choose, which CloudPayment to update.
     */
    where: CloudPaymentWhereUniqueInput
  }

  /**
   * CloudPayment updateMany
   */
  export type CloudPaymentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CloudPayments.
     */
    data: XOR<CloudPaymentUpdateManyMutationInput, CloudPaymentUncheckedUpdateManyInput>
    /**
     * Filter which CloudPayments to update
     */
    where?: CloudPaymentWhereInput
  }

  /**
   * CloudPayment upsert
   */
  export type CloudPaymentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudPayment
     */
    select?: CloudPaymentSelect<ExtArgs> | null
    /**
     * The filter to search for the CloudPayment to update in case it exists.
     */
    where: CloudPaymentWhereUniqueInput
    /**
     * In case the CloudPayment found by the `where` argument doesn't exist, create a new CloudPayment with this data.
     */
    create: XOR<CloudPaymentCreateInput, CloudPaymentUncheckedCreateInput>
    /**
     * In case the CloudPayment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CloudPaymentUpdateInput, CloudPaymentUncheckedUpdateInput>
  }

  /**
   * CloudPayment delete
   */
  export type CloudPaymentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudPayment
     */
    select?: CloudPaymentSelect<ExtArgs> | null
    /**
     * Filter which CloudPayment to delete.
     */
    where: CloudPaymentWhereUniqueInput
  }

  /**
   * CloudPayment deleteMany
   */
  export type CloudPaymentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudPayments to delete
     */
    where?: CloudPaymentWhereInput
  }

  /**
   * CloudPayment without action
   */
  export type CloudPaymentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudPayment
     */
    select?: CloudPaymentSelect<ExtArgs> | null
  }


  /**
   * Model CloudWaiterRequest
   */

  export type AggregateCloudWaiterRequest = {
    _count: CloudWaiterRequestCountAggregateOutputType | null
    _min: CloudWaiterRequestMinAggregateOutputType | null
    _max: CloudWaiterRequestMaxAggregateOutputType | null
  }

  export type CloudWaiterRequestMinAggregateOutputType = {
    id: string | null
    branchId: string | null
    type: string | null
    status: string | null
    createdAt: Date | null
    completedAt: Date | null
    occurredAt: Date | null
  }

  export type CloudWaiterRequestMaxAggregateOutputType = {
    id: string | null
    branchId: string | null
    type: string | null
    status: string | null
    createdAt: Date | null
    completedAt: Date | null
    occurredAt: Date | null
  }

  export type CloudWaiterRequestCountAggregateOutputType = {
    id: number
    branchId: number
    type: number
    status: number
    createdAt: number
    completedAt: number
    occurredAt: number
    _all: number
  }


  export type CloudWaiterRequestMinAggregateInputType = {
    id?: true
    branchId?: true
    type?: true
    status?: true
    createdAt?: true
    completedAt?: true
    occurredAt?: true
  }

  export type CloudWaiterRequestMaxAggregateInputType = {
    id?: true
    branchId?: true
    type?: true
    status?: true
    createdAt?: true
    completedAt?: true
    occurredAt?: true
  }

  export type CloudWaiterRequestCountAggregateInputType = {
    id?: true
    branchId?: true
    type?: true
    status?: true
    createdAt?: true
    completedAt?: true
    occurredAt?: true
    _all?: true
  }

  export type CloudWaiterRequestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudWaiterRequest to aggregate.
     */
    where?: CloudWaiterRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudWaiterRequests to fetch.
     */
    orderBy?: CloudWaiterRequestOrderByWithRelationInput | CloudWaiterRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CloudWaiterRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudWaiterRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudWaiterRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CloudWaiterRequests
    **/
    _count?: true | CloudWaiterRequestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CloudWaiterRequestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CloudWaiterRequestMaxAggregateInputType
  }

  export type GetCloudWaiterRequestAggregateType<T extends CloudWaiterRequestAggregateArgs> = {
        [P in keyof T & keyof AggregateCloudWaiterRequest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCloudWaiterRequest[P]>
      : GetScalarType<T[P], AggregateCloudWaiterRequest[P]>
  }




  export type CloudWaiterRequestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CloudWaiterRequestWhereInput
    orderBy?: CloudWaiterRequestOrderByWithAggregationInput | CloudWaiterRequestOrderByWithAggregationInput[]
    by: CloudWaiterRequestScalarFieldEnum[] | CloudWaiterRequestScalarFieldEnum
    having?: CloudWaiterRequestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CloudWaiterRequestCountAggregateInputType | true
    _min?: CloudWaiterRequestMinAggregateInputType
    _max?: CloudWaiterRequestMaxAggregateInputType
  }

  export type CloudWaiterRequestGroupByOutputType = {
    id: string
    branchId: string
    type: string
    status: string
    createdAt: Date
    completedAt: Date | null
    occurredAt: Date
    _count: CloudWaiterRequestCountAggregateOutputType | null
    _min: CloudWaiterRequestMinAggregateOutputType | null
    _max: CloudWaiterRequestMaxAggregateOutputType | null
  }

  type GetCloudWaiterRequestGroupByPayload<T extends CloudWaiterRequestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CloudWaiterRequestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CloudWaiterRequestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CloudWaiterRequestGroupByOutputType[P]>
            : GetScalarType<T[P], CloudWaiterRequestGroupByOutputType[P]>
        }
      >
    >


  export type CloudWaiterRequestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    type?: boolean
    status?: boolean
    createdAt?: boolean
    completedAt?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudWaiterRequest"]>

  export type CloudWaiterRequestSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    type?: boolean
    status?: boolean
    createdAt?: boolean
    completedAt?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudWaiterRequest"]>

  export type CloudWaiterRequestSelectScalar = {
    id?: boolean
    branchId?: boolean
    type?: boolean
    status?: boolean
    createdAt?: boolean
    completedAt?: boolean
    occurredAt?: boolean
  }


  export type $CloudWaiterRequestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CloudWaiterRequest"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      branchId: string
      type: string
      status: string
      createdAt: Date
      completedAt: Date | null
      occurredAt: Date
    }, ExtArgs["result"]["cloudWaiterRequest"]>
    composites: {}
  }

  type CloudWaiterRequestGetPayload<S extends boolean | null | undefined | CloudWaiterRequestDefaultArgs> = $Result.GetResult<Prisma.$CloudWaiterRequestPayload, S>

  type CloudWaiterRequestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CloudWaiterRequestFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CloudWaiterRequestCountAggregateInputType | true
    }

  export interface CloudWaiterRequestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CloudWaiterRequest'], meta: { name: 'CloudWaiterRequest' } }
    /**
     * Find zero or one CloudWaiterRequest that matches the filter.
     * @param {CloudWaiterRequestFindUniqueArgs} args - Arguments to find a CloudWaiterRequest
     * @example
     * // Get one CloudWaiterRequest
     * const cloudWaiterRequest = await prisma.cloudWaiterRequest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CloudWaiterRequestFindUniqueArgs>(args: SelectSubset<T, CloudWaiterRequestFindUniqueArgs<ExtArgs>>): Prisma__CloudWaiterRequestClient<$Result.GetResult<Prisma.$CloudWaiterRequestPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CloudWaiterRequest that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CloudWaiterRequestFindUniqueOrThrowArgs} args - Arguments to find a CloudWaiterRequest
     * @example
     * // Get one CloudWaiterRequest
     * const cloudWaiterRequest = await prisma.cloudWaiterRequest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CloudWaiterRequestFindUniqueOrThrowArgs>(args: SelectSubset<T, CloudWaiterRequestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CloudWaiterRequestClient<$Result.GetResult<Prisma.$CloudWaiterRequestPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CloudWaiterRequest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudWaiterRequestFindFirstArgs} args - Arguments to find a CloudWaiterRequest
     * @example
     * // Get one CloudWaiterRequest
     * const cloudWaiterRequest = await prisma.cloudWaiterRequest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CloudWaiterRequestFindFirstArgs>(args?: SelectSubset<T, CloudWaiterRequestFindFirstArgs<ExtArgs>>): Prisma__CloudWaiterRequestClient<$Result.GetResult<Prisma.$CloudWaiterRequestPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CloudWaiterRequest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudWaiterRequestFindFirstOrThrowArgs} args - Arguments to find a CloudWaiterRequest
     * @example
     * // Get one CloudWaiterRequest
     * const cloudWaiterRequest = await prisma.cloudWaiterRequest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CloudWaiterRequestFindFirstOrThrowArgs>(args?: SelectSubset<T, CloudWaiterRequestFindFirstOrThrowArgs<ExtArgs>>): Prisma__CloudWaiterRequestClient<$Result.GetResult<Prisma.$CloudWaiterRequestPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CloudWaiterRequests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudWaiterRequestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CloudWaiterRequests
     * const cloudWaiterRequests = await prisma.cloudWaiterRequest.findMany()
     * 
     * // Get first 10 CloudWaiterRequests
     * const cloudWaiterRequests = await prisma.cloudWaiterRequest.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cloudWaiterRequestWithIdOnly = await prisma.cloudWaiterRequest.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CloudWaiterRequestFindManyArgs>(args?: SelectSubset<T, CloudWaiterRequestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudWaiterRequestPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CloudWaiterRequest.
     * @param {CloudWaiterRequestCreateArgs} args - Arguments to create a CloudWaiterRequest.
     * @example
     * // Create one CloudWaiterRequest
     * const CloudWaiterRequest = await prisma.cloudWaiterRequest.create({
     *   data: {
     *     // ... data to create a CloudWaiterRequest
     *   }
     * })
     * 
     */
    create<T extends CloudWaiterRequestCreateArgs>(args: SelectSubset<T, CloudWaiterRequestCreateArgs<ExtArgs>>): Prisma__CloudWaiterRequestClient<$Result.GetResult<Prisma.$CloudWaiterRequestPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CloudWaiterRequests.
     * @param {CloudWaiterRequestCreateManyArgs} args - Arguments to create many CloudWaiterRequests.
     * @example
     * // Create many CloudWaiterRequests
     * const cloudWaiterRequest = await prisma.cloudWaiterRequest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CloudWaiterRequestCreateManyArgs>(args?: SelectSubset<T, CloudWaiterRequestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CloudWaiterRequests and returns the data saved in the database.
     * @param {CloudWaiterRequestCreateManyAndReturnArgs} args - Arguments to create many CloudWaiterRequests.
     * @example
     * // Create many CloudWaiterRequests
     * const cloudWaiterRequest = await prisma.cloudWaiterRequest.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CloudWaiterRequests and only return the `id`
     * const cloudWaiterRequestWithIdOnly = await prisma.cloudWaiterRequest.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CloudWaiterRequestCreateManyAndReturnArgs>(args?: SelectSubset<T, CloudWaiterRequestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudWaiterRequestPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CloudWaiterRequest.
     * @param {CloudWaiterRequestDeleteArgs} args - Arguments to delete one CloudWaiterRequest.
     * @example
     * // Delete one CloudWaiterRequest
     * const CloudWaiterRequest = await prisma.cloudWaiterRequest.delete({
     *   where: {
     *     // ... filter to delete one CloudWaiterRequest
     *   }
     * })
     * 
     */
    delete<T extends CloudWaiterRequestDeleteArgs>(args: SelectSubset<T, CloudWaiterRequestDeleteArgs<ExtArgs>>): Prisma__CloudWaiterRequestClient<$Result.GetResult<Prisma.$CloudWaiterRequestPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CloudWaiterRequest.
     * @param {CloudWaiterRequestUpdateArgs} args - Arguments to update one CloudWaiterRequest.
     * @example
     * // Update one CloudWaiterRequest
     * const cloudWaiterRequest = await prisma.cloudWaiterRequest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CloudWaiterRequestUpdateArgs>(args: SelectSubset<T, CloudWaiterRequestUpdateArgs<ExtArgs>>): Prisma__CloudWaiterRequestClient<$Result.GetResult<Prisma.$CloudWaiterRequestPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CloudWaiterRequests.
     * @param {CloudWaiterRequestDeleteManyArgs} args - Arguments to filter CloudWaiterRequests to delete.
     * @example
     * // Delete a few CloudWaiterRequests
     * const { count } = await prisma.cloudWaiterRequest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CloudWaiterRequestDeleteManyArgs>(args?: SelectSubset<T, CloudWaiterRequestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CloudWaiterRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudWaiterRequestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CloudWaiterRequests
     * const cloudWaiterRequest = await prisma.cloudWaiterRequest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CloudWaiterRequestUpdateManyArgs>(args: SelectSubset<T, CloudWaiterRequestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CloudWaiterRequest.
     * @param {CloudWaiterRequestUpsertArgs} args - Arguments to update or create a CloudWaiterRequest.
     * @example
     * // Update or create a CloudWaiterRequest
     * const cloudWaiterRequest = await prisma.cloudWaiterRequest.upsert({
     *   create: {
     *     // ... data to create a CloudWaiterRequest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CloudWaiterRequest we want to update
     *   }
     * })
     */
    upsert<T extends CloudWaiterRequestUpsertArgs>(args: SelectSubset<T, CloudWaiterRequestUpsertArgs<ExtArgs>>): Prisma__CloudWaiterRequestClient<$Result.GetResult<Prisma.$CloudWaiterRequestPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CloudWaiterRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudWaiterRequestCountArgs} args - Arguments to filter CloudWaiterRequests to count.
     * @example
     * // Count the number of CloudWaiterRequests
     * const count = await prisma.cloudWaiterRequest.count({
     *   where: {
     *     // ... the filter for the CloudWaiterRequests we want to count
     *   }
     * })
    **/
    count<T extends CloudWaiterRequestCountArgs>(
      args?: Subset<T, CloudWaiterRequestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CloudWaiterRequestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CloudWaiterRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudWaiterRequestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CloudWaiterRequestAggregateArgs>(args: Subset<T, CloudWaiterRequestAggregateArgs>): Prisma.PrismaPromise<GetCloudWaiterRequestAggregateType<T>>

    /**
     * Group by CloudWaiterRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudWaiterRequestGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CloudWaiterRequestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CloudWaiterRequestGroupByArgs['orderBy'] }
        : { orderBy?: CloudWaiterRequestGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CloudWaiterRequestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCloudWaiterRequestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CloudWaiterRequest model
   */
  readonly fields: CloudWaiterRequestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CloudWaiterRequest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CloudWaiterRequestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CloudWaiterRequest model
   */ 
  interface CloudWaiterRequestFieldRefs {
    readonly id: FieldRef<"CloudWaiterRequest", 'String'>
    readonly branchId: FieldRef<"CloudWaiterRequest", 'String'>
    readonly type: FieldRef<"CloudWaiterRequest", 'String'>
    readonly status: FieldRef<"CloudWaiterRequest", 'String'>
    readonly createdAt: FieldRef<"CloudWaiterRequest", 'DateTime'>
    readonly completedAt: FieldRef<"CloudWaiterRequest", 'DateTime'>
    readonly occurredAt: FieldRef<"CloudWaiterRequest", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CloudWaiterRequest findUnique
   */
  export type CloudWaiterRequestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudWaiterRequest
     */
    select?: CloudWaiterRequestSelect<ExtArgs> | null
    /**
     * Filter, which CloudWaiterRequest to fetch.
     */
    where: CloudWaiterRequestWhereUniqueInput
  }

  /**
   * CloudWaiterRequest findUniqueOrThrow
   */
  export type CloudWaiterRequestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudWaiterRequest
     */
    select?: CloudWaiterRequestSelect<ExtArgs> | null
    /**
     * Filter, which CloudWaiterRequest to fetch.
     */
    where: CloudWaiterRequestWhereUniqueInput
  }

  /**
   * CloudWaiterRequest findFirst
   */
  export type CloudWaiterRequestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudWaiterRequest
     */
    select?: CloudWaiterRequestSelect<ExtArgs> | null
    /**
     * Filter, which CloudWaiterRequest to fetch.
     */
    where?: CloudWaiterRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudWaiterRequests to fetch.
     */
    orderBy?: CloudWaiterRequestOrderByWithRelationInput | CloudWaiterRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudWaiterRequests.
     */
    cursor?: CloudWaiterRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudWaiterRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudWaiterRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudWaiterRequests.
     */
    distinct?: CloudWaiterRequestScalarFieldEnum | CloudWaiterRequestScalarFieldEnum[]
  }

  /**
   * CloudWaiterRequest findFirstOrThrow
   */
  export type CloudWaiterRequestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudWaiterRequest
     */
    select?: CloudWaiterRequestSelect<ExtArgs> | null
    /**
     * Filter, which CloudWaiterRequest to fetch.
     */
    where?: CloudWaiterRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudWaiterRequests to fetch.
     */
    orderBy?: CloudWaiterRequestOrderByWithRelationInput | CloudWaiterRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudWaiterRequests.
     */
    cursor?: CloudWaiterRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudWaiterRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudWaiterRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudWaiterRequests.
     */
    distinct?: CloudWaiterRequestScalarFieldEnum | CloudWaiterRequestScalarFieldEnum[]
  }

  /**
   * CloudWaiterRequest findMany
   */
  export type CloudWaiterRequestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudWaiterRequest
     */
    select?: CloudWaiterRequestSelect<ExtArgs> | null
    /**
     * Filter, which CloudWaiterRequests to fetch.
     */
    where?: CloudWaiterRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudWaiterRequests to fetch.
     */
    orderBy?: CloudWaiterRequestOrderByWithRelationInput | CloudWaiterRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CloudWaiterRequests.
     */
    cursor?: CloudWaiterRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudWaiterRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudWaiterRequests.
     */
    skip?: number
    distinct?: CloudWaiterRequestScalarFieldEnum | CloudWaiterRequestScalarFieldEnum[]
  }

  /**
   * CloudWaiterRequest create
   */
  export type CloudWaiterRequestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudWaiterRequest
     */
    select?: CloudWaiterRequestSelect<ExtArgs> | null
    /**
     * The data needed to create a CloudWaiterRequest.
     */
    data: XOR<CloudWaiterRequestCreateInput, CloudWaiterRequestUncheckedCreateInput>
  }

  /**
   * CloudWaiterRequest createMany
   */
  export type CloudWaiterRequestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CloudWaiterRequests.
     */
    data: CloudWaiterRequestCreateManyInput | CloudWaiterRequestCreateManyInput[]
  }

  /**
   * CloudWaiterRequest createManyAndReturn
   */
  export type CloudWaiterRequestCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudWaiterRequest
     */
    select?: CloudWaiterRequestSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CloudWaiterRequests.
     */
    data: CloudWaiterRequestCreateManyInput | CloudWaiterRequestCreateManyInput[]
  }

  /**
   * CloudWaiterRequest update
   */
  export type CloudWaiterRequestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudWaiterRequest
     */
    select?: CloudWaiterRequestSelect<ExtArgs> | null
    /**
     * The data needed to update a CloudWaiterRequest.
     */
    data: XOR<CloudWaiterRequestUpdateInput, CloudWaiterRequestUncheckedUpdateInput>
    /**
     * Choose, which CloudWaiterRequest to update.
     */
    where: CloudWaiterRequestWhereUniqueInput
  }

  /**
   * CloudWaiterRequest updateMany
   */
  export type CloudWaiterRequestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CloudWaiterRequests.
     */
    data: XOR<CloudWaiterRequestUpdateManyMutationInput, CloudWaiterRequestUncheckedUpdateManyInput>
    /**
     * Filter which CloudWaiterRequests to update
     */
    where?: CloudWaiterRequestWhereInput
  }

  /**
   * CloudWaiterRequest upsert
   */
  export type CloudWaiterRequestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudWaiterRequest
     */
    select?: CloudWaiterRequestSelect<ExtArgs> | null
    /**
     * The filter to search for the CloudWaiterRequest to update in case it exists.
     */
    where: CloudWaiterRequestWhereUniqueInput
    /**
     * In case the CloudWaiterRequest found by the `where` argument doesn't exist, create a new CloudWaiterRequest with this data.
     */
    create: XOR<CloudWaiterRequestCreateInput, CloudWaiterRequestUncheckedCreateInput>
    /**
     * In case the CloudWaiterRequest was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CloudWaiterRequestUpdateInput, CloudWaiterRequestUncheckedUpdateInput>
  }

  /**
   * CloudWaiterRequest delete
   */
  export type CloudWaiterRequestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudWaiterRequest
     */
    select?: CloudWaiterRequestSelect<ExtArgs> | null
    /**
     * Filter which CloudWaiterRequest to delete.
     */
    where: CloudWaiterRequestWhereUniqueInput
  }

  /**
   * CloudWaiterRequest deleteMany
   */
  export type CloudWaiterRequestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudWaiterRequests to delete
     */
    where?: CloudWaiterRequestWhereInput
  }

  /**
   * CloudWaiterRequest without action
   */
  export type CloudWaiterRequestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudWaiterRequest
     */
    select?: CloudWaiterRequestSelect<ExtArgs> | null
  }


  /**
   * Model CloudProductAvailability
   */

  export type AggregateCloudProductAvailability = {
    _count: CloudProductAvailabilityCountAggregateOutputType | null
    _min: CloudProductAvailabilityMinAggregateOutputType | null
    _max: CloudProductAvailabilityMaxAggregateOutputType | null
  }

  export type CloudProductAvailabilityMinAggregateOutputType = {
    id: string | null
    branchId: string | null
    productId: string | null
    status: string | null
    occurredAt: Date | null
  }

  export type CloudProductAvailabilityMaxAggregateOutputType = {
    id: string | null
    branchId: string | null
    productId: string | null
    status: string | null
    occurredAt: Date | null
  }

  export type CloudProductAvailabilityCountAggregateOutputType = {
    id: number
    branchId: number
    productId: number
    status: number
    occurredAt: number
    _all: number
  }


  export type CloudProductAvailabilityMinAggregateInputType = {
    id?: true
    branchId?: true
    productId?: true
    status?: true
    occurredAt?: true
  }

  export type CloudProductAvailabilityMaxAggregateInputType = {
    id?: true
    branchId?: true
    productId?: true
    status?: true
    occurredAt?: true
  }

  export type CloudProductAvailabilityCountAggregateInputType = {
    id?: true
    branchId?: true
    productId?: true
    status?: true
    occurredAt?: true
    _all?: true
  }

  export type CloudProductAvailabilityAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudProductAvailability to aggregate.
     */
    where?: CloudProductAvailabilityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudProductAvailabilities to fetch.
     */
    orderBy?: CloudProductAvailabilityOrderByWithRelationInput | CloudProductAvailabilityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CloudProductAvailabilityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudProductAvailabilities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudProductAvailabilities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CloudProductAvailabilities
    **/
    _count?: true | CloudProductAvailabilityCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CloudProductAvailabilityMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CloudProductAvailabilityMaxAggregateInputType
  }

  export type GetCloudProductAvailabilityAggregateType<T extends CloudProductAvailabilityAggregateArgs> = {
        [P in keyof T & keyof AggregateCloudProductAvailability]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCloudProductAvailability[P]>
      : GetScalarType<T[P], AggregateCloudProductAvailability[P]>
  }




  export type CloudProductAvailabilityGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CloudProductAvailabilityWhereInput
    orderBy?: CloudProductAvailabilityOrderByWithAggregationInput | CloudProductAvailabilityOrderByWithAggregationInput[]
    by: CloudProductAvailabilityScalarFieldEnum[] | CloudProductAvailabilityScalarFieldEnum
    having?: CloudProductAvailabilityScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CloudProductAvailabilityCountAggregateInputType | true
    _min?: CloudProductAvailabilityMinAggregateInputType
    _max?: CloudProductAvailabilityMaxAggregateInputType
  }

  export type CloudProductAvailabilityGroupByOutputType = {
    id: string
    branchId: string
    productId: string
    status: string
    occurredAt: Date
    _count: CloudProductAvailabilityCountAggregateOutputType | null
    _min: CloudProductAvailabilityMinAggregateOutputType | null
    _max: CloudProductAvailabilityMaxAggregateOutputType | null
  }

  type GetCloudProductAvailabilityGroupByPayload<T extends CloudProductAvailabilityGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CloudProductAvailabilityGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CloudProductAvailabilityGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CloudProductAvailabilityGroupByOutputType[P]>
            : GetScalarType<T[P], CloudProductAvailabilityGroupByOutputType[P]>
        }
      >
    >


  export type CloudProductAvailabilitySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    productId?: boolean
    status?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudProductAvailability"]>

  export type CloudProductAvailabilitySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    productId?: boolean
    status?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudProductAvailability"]>

  export type CloudProductAvailabilitySelectScalar = {
    id?: boolean
    branchId?: boolean
    productId?: boolean
    status?: boolean
    occurredAt?: boolean
  }


  export type $CloudProductAvailabilityPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CloudProductAvailability"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      branchId: string
      productId: string
      status: string
      occurredAt: Date
    }, ExtArgs["result"]["cloudProductAvailability"]>
    composites: {}
  }

  type CloudProductAvailabilityGetPayload<S extends boolean | null | undefined | CloudProductAvailabilityDefaultArgs> = $Result.GetResult<Prisma.$CloudProductAvailabilityPayload, S>

  type CloudProductAvailabilityCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CloudProductAvailabilityFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CloudProductAvailabilityCountAggregateInputType | true
    }

  export interface CloudProductAvailabilityDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CloudProductAvailability'], meta: { name: 'CloudProductAvailability' } }
    /**
     * Find zero or one CloudProductAvailability that matches the filter.
     * @param {CloudProductAvailabilityFindUniqueArgs} args - Arguments to find a CloudProductAvailability
     * @example
     * // Get one CloudProductAvailability
     * const cloudProductAvailability = await prisma.cloudProductAvailability.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CloudProductAvailabilityFindUniqueArgs>(args: SelectSubset<T, CloudProductAvailabilityFindUniqueArgs<ExtArgs>>): Prisma__CloudProductAvailabilityClient<$Result.GetResult<Prisma.$CloudProductAvailabilityPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CloudProductAvailability that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CloudProductAvailabilityFindUniqueOrThrowArgs} args - Arguments to find a CloudProductAvailability
     * @example
     * // Get one CloudProductAvailability
     * const cloudProductAvailability = await prisma.cloudProductAvailability.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CloudProductAvailabilityFindUniqueOrThrowArgs>(args: SelectSubset<T, CloudProductAvailabilityFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CloudProductAvailabilityClient<$Result.GetResult<Prisma.$CloudProductAvailabilityPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CloudProductAvailability that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudProductAvailabilityFindFirstArgs} args - Arguments to find a CloudProductAvailability
     * @example
     * // Get one CloudProductAvailability
     * const cloudProductAvailability = await prisma.cloudProductAvailability.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CloudProductAvailabilityFindFirstArgs>(args?: SelectSubset<T, CloudProductAvailabilityFindFirstArgs<ExtArgs>>): Prisma__CloudProductAvailabilityClient<$Result.GetResult<Prisma.$CloudProductAvailabilityPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CloudProductAvailability that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudProductAvailabilityFindFirstOrThrowArgs} args - Arguments to find a CloudProductAvailability
     * @example
     * // Get one CloudProductAvailability
     * const cloudProductAvailability = await prisma.cloudProductAvailability.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CloudProductAvailabilityFindFirstOrThrowArgs>(args?: SelectSubset<T, CloudProductAvailabilityFindFirstOrThrowArgs<ExtArgs>>): Prisma__CloudProductAvailabilityClient<$Result.GetResult<Prisma.$CloudProductAvailabilityPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CloudProductAvailabilities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudProductAvailabilityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CloudProductAvailabilities
     * const cloudProductAvailabilities = await prisma.cloudProductAvailability.findMany()
     * 
     * // Get first 10 CloudProductAvailabilities
     * const cloudProductAvailabilities = await prisma.cloudProductAvailability.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cloudProductAvailabilityWithIdOnly = await prisma.cloudProductAvailability.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CloudProductAvailabilityFindManyArgs>(args?: SelectSubset<T, CloudProductAvailabilityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudProductAvailabilityPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CloudProductAvailability.
     * @param {CloudProductAvailabilityCreateArgs} args - Arguments to create a CloudProductAvailability.
     * @example
     * // Create one CloudProductAvailability
     * const CloudProductAvailability = await prisma.cloudProductAvailability.create({
     *   data: {
     *     // ... data to create a CloudProductAvailability
     *   }
     * })
     * 
     */
    create<T extends CloudProductAvailabilityCreateArgs>(args: SelectSubset<T, CloudProductAvailabilityCreateArgs<ExtArgs>>): Prisma__CloudProductAvailabilityClient<$Result.GetResult<Prisma.$CloudProductAvailabilityPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CloudProductAvailabilities.
     * @param {CloudProductAvailabilityCreateManyArgs} args - Arguments to create many CloudProductAvailabilities.
     * @example
     * // Create many CloudProductAvailabilities
     * const cloudProductAvailability = await prisma.cloudProductAvailability.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CloudProductAvailabilityCreateManyArgs>(args?: SelectSubset<T, CloudProductAvailabilityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CloudProductAvailabilities and returns the data saved in the database.
     * @param {CloudProductAvailabilityCreateManyAndReturnArgs} args - Arguments to create many CloudProductAvailabilities.
     * @example
     * // Create many CloudProductAvailabilities
     * const cloudProductAvailability = await prisma.cloudProductAvailability.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CloudProductAvailabilities and only return the `id`
     * const cloudProductAvailabilityWithIdOnly = await prisma.cloudProductAvailability.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CloudProductAvailabilityCreateManyAndReturnArgs>(args?: SelectSubset<T, CloudProductAvailabilityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudProductAvailabilityPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CloudProductAvailability.
     * @param {CloudProductAvailabilityDeleteArgs} args - Arguments to delete one CloudProductAvailability.
     * @example
     * // Delete one CloudProductAvailability
     * const CloudProductAvailability = await prisma.cloudProductAvailability.delete({
     *   where: {
     *     // ... filter to delete one CloudProductAvailability
     *   }
     * })
     * 
     */
    delete<T extends CloudProductAvailabilityDeleteArgs>(args: SelectSubset<T, CloudProductAvailabilityDeleteArgs<ExtArgs>>): Prisma__CloudProductAvailabilityClient<$Result.GetResult<Prisma.$CloudProductAvailabilityPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CloudProductAvailability.
     * @param {CloudProductAvailabilityUpdateArgs} args - Arguments to update one CloudProductAvailability.
     * @example
     * // Update one CloudProductAvailability
     * const cloudProductAvailability = await prisma.cloudProductAvailability.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CloudProductAvailabilityUpdateArgs>(args: SelectSubset<T, CloudProductAvailabilityUpdateArgs<ExtArgs>>): Prisma__CloudProductAvailabilityClient<$Result.GetResult<Prisma.$CloudProductAvailabilityPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CloudProductAvailabilities.
     * @param {CloudProductAvailabilityDeleteManyArgs} args - Arguments to filter CloudProductAvailabilities to delete.
     * @example
     * // Delete a few CloudProductAvailabilities
     * const { count } = await prisma.cloudProductAvailability.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CloudProductAvailabilityDeleteManyArgs>(args?: SelectSubset<T, CloudProductAvailabilityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CloudProductAvailabilities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudProductAvailabilityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CloudProductAvailabilities
     * const cloudProductAvailability = await prisma.cloudProductAvailability.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CloudProductAvailabilityUpdateManyArgs>(args: SelectSubset<T, CloudProductAvailabilityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CloudProductAvailability.
     * @param {CloudProductAvailabilityUpsertArgs} args - Arguments to update or create a CloudProductAvailability.
     * @example
     * // Update or create a CloudProductAvailability
     * const cloudProductAvailability = await prisma.cloudProductAvailability.upsert({
     *   create: {
     *     // ... data to create a CloudProductAvailability
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CloudProductAvailability we want to update
     *   }
     * })
     */
    upsert<T extends CloudProductAvailabilityUpsertArgs>(args: SelectSubset<T, CloudProductAvailabilityUpsertArgs<ExtArgs>>): Prisma__CloudProductAvailabilityClient<$Result.GetResult<Prisma.$CloudProductAvailabilityPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CloudProductAvailabilities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudProductAvailabilityCountArgs} args - Arguments to filter CloudProductAvailabilities to count.
     * @example
     * // Count the number of CloudProductAvailabilities
     * const count = await prisma.cloudProductAvailability.count({
     *   where: {
     *     // ... the filter for the CloudProductAvailabilities we want to count
     *   }
     * })
    **/
    count<T extends CloudProductAvailabilityCountArgs>(
      args?: Subset<T, CloudProductAvailabilityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CloudProductAvailabilityCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CloudProductAvailability.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudProductAvailabilityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CloudProductAvailabilityAggregateArgs>(args: Subset<T, CloudProductAvailabilityAggregateArgs>): Prisma.PrismaPromise<GetCloudProductAvailabilityAggregateType<T>>

    /**
     * Group by CloudProductAvailability.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudProductAvailabilityGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CloudProductAvailabilityGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CloudProductAvailabilityGroupByArgs['orderBy'] }
        : { orderBy?: CloudProductAvailabilityGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CloudProductAvailabilityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCloudProductAvailabilityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CloudProductAvailability model
   */
  readonly fields: CloudProductAvailabilityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CloudProductAvailability.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CloudProductAvailabilityClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CloudProductAvailability model
   */ 
  interface CloudProductAvailabilityFieldRefs {
    readonly id: FieldRef<"CloudProductAvailability", 'String'>
    readonly branchId: FieldRef<"CloudProductAvailability", 'String'>
    readonly productId: FieldRef<"CloudProductAvailability", 'String'>
    readonly status: FieldRef<"CloudProductAvailability", 'String'>
    readonly occurredAt: FieldRef<"CloudProductAvailability", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CloudProductAvailability findUnique
   */
  export type CloudProductAvailabilityFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudProductAvailability
     */
    select?: CloudProductAvailabilitySelect<ExtArgs> | null
    /**
     * Filter, which CloudProductAvailability to fetch.
     */
    where: CloudProductAvailabilityWhereUniqueInput
  }

  /**
   * CloudProductAvailability findUniqueOrThrow
   */
  export type CloudProductAvailabilityFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudProductAvailability
     */
    select?: CloudProductAvailabilitySelect<ExtArgs> | null
    /**
     * Filter, which CloudProductAvailability to fetch.
     */
    where: CloudProductAvailabilityWhereUniqueInput
  }

  /**
   * CloudProductAvailability findFirst
   */
  export type CloudProductAvailabilityFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudProductAvailability
     */
    select?: CloudProductAvailabilitySelect<ExtArgs> | null
    /**
     * Filter, which CloudProductAvailability to fetch.
     */
    where?: CloudProductAvailabilityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudProductAvailabilities to fetch.
     */
    orderBy?: CloudProductAvailabilityOrderByWithRelationInput | CloudProductAvailabilityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudProductAvailabilities.
     */
    cursor?: CloudProductAvailabilityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudProductAvailabilities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudProductAvailabilities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudProductAvailabilities.
     */
    distinct?: CloudProductAvailabilityScalarFieldEnum | CloudProductAvailabilityScalarFieldEnum[]
  }

  /**
   * CloudProductAvailability findFirstOrThrow
   */
  export type CloudProductAvailabilityFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudProductAvailability
     */
    select?: CloudProductAvailabilitySelect<ExtArgs> | null
    /**
     * Filter, which CloudProductAvailability to fetch.
     */
    where?: CloudProductAvailabilityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudProductAvailabilities to fetch.
     */
    orderBy?: CloudProductAvailabilityOrderByWithRelationInput | CloudProductAvailabilityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudProductAvailabilities.
     */
    cursor?: CloudProductAvailabilityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudProductAvailabilities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudProductAvailabilities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudProductAvailabilities.
     */
    distinct?: CloudProductAvailabilityScalarFieldEnum | CloudProductAvailabilityScalarFieldEnum[]
  }

  /**
   * CloudProductAvailability findMany
   */
  export type CloudProductAvailabilityFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudProductAvailability
     */
    select?: CloudProductAvailabilitySelect<ExtArgs> | null
    /**
     * Filter, which CloudProductAvailabilities to fetch.
     */
    where?: CloudProductAvailabilityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudProductAvailabilities to fetch.
     */
    orderBy?: CloudProductAvailabilityOrderByWithRelationInput | CloudProductAvailabilityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CloudProductAvailabilities.
     */
    cursor?: CloudProductAvailabilityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudProductAvailabilities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudProductAvailabilities.
     */
    skip?: number
    distinct?: CloudProductAvailabilityScalarFieldEnum | CloudProductAvailabilityScalarFieldEnum[]
  }

  /**
   * CloudProductAvailability create
   */
  export type CloudProductAvailabilityCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudProductAvailability
     */
    select?: CloudProductAvailabilitySelect<ExtArgs> | null
    /**
     * The data needed to create a CloudProductAvailability.
     */
    data: XOR<CloudProductAvailabilityCreateInput, CloudProductAvailabilityUncheckedCreateInput>
  }

  /**
   * CloudProductAvailability createMany
   */
  export type CloudProductAvailabilityCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CloudProductAvailabilities.
     */
    data: CloudProductAvailabilityCreateManyInput | CloudProductAvailabilityCreateManyInput[]
  }

  /**
   * CloudProductAvailability createManyAndReturn
   */
  export type CloudProductAvailabilityCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudProductAvailability
     */
    select?: CloudProductAvailabilitySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CloudProductAvailabilities.
     */
    data: CloudProductAvailabilityCreateManyInput | CloudProductAvailabilityCreateManyInput[]
  }

  /**
   * CloudProductAvailability update
   */
  export type CloudProductAvailabilityUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudProductAvailability
     */
    select?: CloudProductAvailabilitySelect<ExtArgs> | null
    /**
     * The data needed to update a CloudProductAvailability.
     */
    data: XOR<CloudProductAvailabilityUpdateInput, CloudProductAvailabilityUncheckedUpdateInput>
    /**
     * Choose, which CloudProductAvailability to update.
     */
    where: CloudProductAvailabilityWhereUniqueInput
  }

  /**
   * CloudProductAvailability updateMany
   */
  export type CloudProductAvailabilityUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CloudProductAvailabilities.
     */
    data: XOR<CloudProductAvailabilityUpdateManyMutationInput, CloudProductAvailabilityUncheckedUpdateManyInput>
    /**
     * Filter which CloudProductAvailabilities to update
     */
    where?: CloudProductAvailabilityWhereInput
  }

  /**
   * CloudProductAvailability upsert
   */
  export type CloudProductAvailabilityUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudProductAvailability
     */
    select?: CloudProductAvailabilitySelect<ExtArgs> | null
    /**
     * The filter to search for the CloudProductAvailability to update in case it exists.
     */
    where: CloudProductAvailabilityWhereUniqueInput
    /**
     * In case the CloudProductAvailability found by the `where` argument doesn't exist, create a new CloudProductAvailability with this data.
     */
    create: XOR<CloudProductAvailabilityCreateInput, CloudProductAvailabilityUncheckedCreateInput>
    /**
     * In case the CloudProductAvailability was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CloudProductAvailabilityUpdateInput, CloudProductAvailabilityUncheckedUpdateInput>
  }

  /**
   * CloudProductAvailability delete
   */
  export type CloudProductAvailabilityDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudProductAvailability
     */
    select?: CloudProductAvailabilitySelect<ExtArgs> | null
    /**
     * Filter which CloudProductAvailability to delete.
     */
    where: CloudProductAvailabilityWhereUniqueInput
  }

  /**
   * CloudProductAvailability deleteMany
   */
  export type CloudProductAvailabilityDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudProductAvailabilities to delete
     */
    where?: CloudProductAvailabilityWhereInput
  }

  /**
   * CloudProductAvailability without action
   */
  export type CloudProductAvailabilityDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudProductAvailability
     */
    select?: CloudProductAvailabilitySelect<ExtArgs> | null
  }


  /**
   * Model CloudGameSession
   */

  export type AggregateCloudGameSession = {
    _count: CloudGameSessionCountAggregateOutputType | null
    _avg: CloudGameSessionAvgAggregateOutputType | null
    _sum: CloudGameSessionSumAggregateOutputType | null
    _min: CloudGameSessionMinAggregateOutputType | null
    _max: CloudGameSessionMaxAggregateOutputType | null
  }

  export type CloudGameSessionAvgAggregateOutputType = {
    playerCount: number | null
  }

  export type CloudGameSessionSumAggregateOutputType = {
    playerCount: number | null
  }

  export type CloudGameSessionMinAggregateOutputType = {
    id: string | null
    branchId: string | null
    status: string | null
    playerCount: number | null
    occurredAt: Date | null
  }

  export type CloudGameSessionMaxAggregateOutputType = {
    id: string | null
    branchId: string | null
    status: string | null
    playerCount: number | null
    occurredAt: Date | null
  }

  export type CloudGameSessionCountAggregateOutputType = {
    id: number
    branchId: number
    status: number
    playerCount: number
    occurredAt: number
    _all: number
  }


  export type CloudGameSessionAvgAggregateInputType = {
    playerCount?: true
  }

  export type CloudGameSessionSumAggregateInputType = {
    playerCount?: true
  }

  export type CloudGameSessionMinAggregateInputType = {
    id?: true
    branchId?: true
    status?: true
    playerCount?: true
    occurredAt?: true
  }

  export type CloudGameSessionMaxAggregateInputType = {
    id?: true
    branchId?: true
    status?: true
    playerCount?: true
    occurredAt?: true
  }

  export type CloudGameSessionCountAggregateInputType = {
    id?: true
    branchId?: true
    status?: true
    playerCount?: true
    occurredAt?: true
    _all?: true
  }

  export type CloudGameSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudGameSession to aggregate.
     */
    where?: CloudGameSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudGameSessions to fetch.
     */
    orderBy?: CloudGameSessionOrderByWithRelationInput | CloudGameSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CloudGameSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudGameSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudGameSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CloudGameSessions
    **/
    _count?: true | CloudGameSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CloudGameSessionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CloudGameSessionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CloudGameSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CloudGameSessionMaxAggregateInputType
  }

  export type GetCloudGameSessionAggregateType<T extends CloudGameSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateCloudGameSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCloudGameSession[P]>
      : GetScalarType<T[P], AggregateCloudGameSession[P]>
  }




  export type CloudGameSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CloudGameSessionWhereInput
    orderBy?: CloudGameSessionOrderByWithAggregationInput | CloudGameSessionOrderByWithAggregationInput[]
    by: CloudGameSessionScalarFieldEnum[] | CloudGameSessionScalarFieldEnum
    having?: CloudGameSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CloudGameSessionCountAggregateInputType | true
    _avg?: CloudGameSessionAvgAggregateInputType
    _sum?: CloudGameSessionSumAggregateInputType
    _min?: CloudGameSessionMinAggregateInputType
    _max?: CloudGameSessionMaxAggregateInputType
  }

  export type CloudGameSessionGroupByOutputType = {
    id: string
    branchId: string
    status: string
    playerCount: number
    occurredAt: Date
    _count: CloudGameSessionCountAggregateOutputType | null
    _avg: CloudGameSessionAvgAggregateOutputType | null
    _sum: CloudGameSessionSumAggregateOutputType | null
    _min: CloudGameSessionMinAggregateOutputType | null
    _max: CloudGameSessionMaxAggregateOutputType | null
  }

  type GetCloudGameSessionGroupByPayload<T extends CloudGameSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CloudGameSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CloudGameSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CloudGameSessionGroupByOutputType[P]>
            : GetScalarType<T[P], CloudGameSessionGroupByOutputType[P]>
        }
      >
    >


  export type CloudGameSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    status?: boolean
    playerCount?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudGameSession"]>

  export type CloudGameSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    status?: boolean
    playerCount?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudGameSession"]>

  export type CloudGameSessionSelectScalar = {
    id?: boolean
    branchId?: boolean
    status?: boolean
    playerCount?: boolean
    occurredAt?: boolean
  }


  export type $CloudGameSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CloudGameSession"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      branchId: string
      status: string
      playerCount: number
      occurredAt: Date
    }, ExtArgs["result"]["cloudGameSession"]>
    composites: {}
  }

  type CloudGameSessionGetPayload<S extends boolean | null | undefined | CloudGameSessionDefaultArgs> = $Result.GetResult<Prisma.$CloudGameSessionPayload, S>

  type CloudGameSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CloudGameSessionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CloudGameSessionCountAggregateInputType | true
    }

  export interface CloudGameSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CloudGameSession'], meta: { name: 'CloudGameSession' } }
    /**
     * Find zero or one CloudGameSession that matches the filter.
     * @param {CloudGameSessionFindUniqueArgs} args - Arguments to find a CloudGameSession
     * @example
     * // Get one CloudGameSession
     * const cloudGameSession = await prisma.cloudGameSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CloudGameSessionFindUniqueArgs>(args: SelectSubset<T, CloudGameSessionFindUniqueArgs<ExtArgs>>): Prisma__CloudGameSessionClient<$Result.GetResult<Prisma.$CloudGameSessionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CloudGameSession that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CloudGameSessionFindUniqueOrThrowArgs} args - Arguments to find a CloudGameSession
     * @example
     * // Get one CloudGameSession
     * const cloudGameSession = await prisma.cloudGameSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CloudGameSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, CloudGameSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CloudGameSessionClient<$Result.GetResult<Prisma.$CloudGameSessionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CloudGameSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudGameSessionFindFirstArgs} args - Arguments to find a CloudGameSession
     * @example
     * // Get one CloudGameSession
     * const cloudGameSession = await prisma.cloudGameSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CloudGameSessionFindFirstArgs>(args?: SelectSubset<T, CloudGameSessionFindFirstArgs<ExtArgs>>): Prisma__CloudGameSessionClient<$Result.GetResult<Prisma.$CloudGameSessionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CloudGameSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudGameSessionFindFirstOrThrowArgs} args - Arguments to find a CloudGameSession
     * @example
     * // Get one CloudGameSession
     * const cloudGameSession = await prisma.cloudGameSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CloudGameSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, CloudGameSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__CloudGameSessionClient<$Result.GetResult<Prisma.$CloudGameSessionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CloudGameSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudGameSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CloudGameSessions
     * const cloudGameSessions = await prisma.cloudGameSession.findMany()
     * 
     * // Get first 10 CloudGameSessions
     * const cloudGameSessions = await prisma.cloudGameSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cloudGameSessionWithIdOnly = await prisma.cloudGameSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CloudGameSessionFindManyArgs>(args?: SelectSubset<T, CloudGameSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudGameSessionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CloudGameSession.
     * @param {CloudGameSessionCreateArgs} args - Arguments to create a CloudGameSession.
     * @example
     * // Create one CloudGameSession
     * const CloudGameSession = await prisma.cloudGameSession.create({
     *   data: {
     *     // ... data to create a CloudGameSession
     *   }
     * })
     * 
     */
    create<T extends CloudGameSessionCreateArgs>(args: SelectSubset<T, CloudGameSessionCreateArgs<ExtArgs>>): Prisma__CloudGameSessionClient<$Result.GetResult<Prisma.$CloudGameSessionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CloudGameSessions.
     * @param {CloudGameSessionCreateManyArgs} args - Arguments to create many CloudGameSessions.
     * @example
     * // Create many CloudGameSessions
     * const cloudGameSession = await prisma.cloudGameSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CloudGameSessionCreateManyArgs>(args?: SelectSubset<T, CloudGameSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CloudGameSessions and returns the data saved in the database.
     * @param {CloudGameSessionCreateManyAndReturnArgs} args - Arguments to create many CloudGameSessions.
     * @example
     * // Create many CloudGameSessions
     * const cloudGameSession = await prisma.cloudGameSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CloudGameSessions and only return the `id`
     * const cloudGameSessionWithIdOnly = await prisma.cloudGameSession.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CloudGameSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, CloudGameSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudGameSessionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CloudGameSession.
     * @param {CloudGameSessionDeleteArgs} args - Arguments to delete one CloudGameSession.
     * @example
     * // Delete one CloudGameSession
     * const CloudGameSession = await prisma.cloudGameSession.delete({
     *   where: {
     *     // ... filter to delete one CloudGameSession
     *   }
     * })
     * 
     */
    delete<T extends CloudGameSessionDeleteArgs>(args: SelectSubset<T, CloudGameSessionDeleteArgs<ExtArgs>>): Prisma__CloudGameSessionClient<$Result.GetResult<Prisma.$CloudGameSessionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CloudGameSession.
     * @param {CloudGameSessionUpdateArgs} args - Arguments to update one CloudGameSession.
     * @example
     * // Update one CloudGameSession
     * const cloudGameSession = await prisma.cloudGameSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CloudGameSessionUpdateArgs>(args: SelectSubset<T, CloudGameSessionUpdateArgs<ExtArgs>>): Prisma__CloudGameSessionClient<$Result.GetResult<Prisma.$CloudGameSessionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CloudGameSessions.
     * @param {CloudGameSessionDeleteManyArgs} args - Arguments to filter CloudGameSessions to delete.
     * @example
     * // Delete a few CloudGameSessions
     * const { count } = await prisma.cloudGameSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CloudGameSessionDeleteManyArgs>(args?: SelectSubset<T, CloudGameSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CloudGameSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudGameSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CloudGameSessions
     * const cloudGameSession = await prisma.cloudGameSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CloudGameSessionUpdateManyArgs>(args: SelectSubset<T, CloudGameSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CloudGameSession.
     * @param {CloudGameSessionUpsertArgs} args - Arguments to update or create a CloudGameSession.
     * @example
     * // Update or create a CloudGameSession
     * const cloudGameSession = await prisma.cloudGameSession.upsert({
     *   create: {
     *     // ... data to create a CloudGameSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CloudGameSession we want to update
     *   }
     * })
     */
    upsert<T extends CloudGameSessionUpsertArgs>(args: SelectSubset<T, CloudGameSessionUpsertArgs<ExtArgs>>): Prisma__CloudGameSessionClient<$Result.GetResult<Prisma.$CloudGameSessionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CloudGameSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudGameSessionCountArgs} args - Arguments to filter CloudGameSessions to count.
     * @example
     * // Count the number of CloudGameSessions
     * const count = await prisma.cloudGameSession.count({
     *   where: {
     *     // ... the filter for the CloudGameSessions we want to count
     *   }
     * })
    **/
    count<T extends CloudGameSessionCountArgs>(
      args?: Subset<T, CloudGameSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CloudGameSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CloudGameSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudGameSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CloudGameSessionAggregateArgs>(args: Subset<T, CloudGameSessionAggregateArgs>): Prisma.PrismaPromise<GetCloudGameSessionAggregateType<T>>

    /**
     * Group by CloudGameSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudGameSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CloudGameSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CloudGameSessionGroupByArgs['orderBy'] }
        : { orderBy?: CloudGameSessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CloudGameSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCloudGameSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CloudGameSession model
   */
  readonly fields: CloudGameSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CloudGameSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CloudGameSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CloudGameSession model
   */ 
  interface CloudGameSessionFieldRefs {
    readonly id: FieldRef<"CloudGameSession", 'String'>
    readonly branchId: FieldRef<"CloudGameSession", 'String'>
    readonly status: FieldRef<"CloudGameSession", 'String'>
    readonly playerCount: FieldRef<"CloudGameSession", 'Int'>
    readonly occurredAt: FieldRef<"CloudGameSession", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CloudGameSession findUnique
   */
  export type CloudGameSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudGameSession
     */
    select?: CloudGameSessionSelect<ExtArgs> | null
    /**
     * Filter, which CloudGameSession to fetch.
     */
    where: CloudGameSessionWhereUniqueInput
  }

  /**
   * CloudGameSession findUniqueOrThrow
   */
  export type CloudGameSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudGameSession
     */
    select?: CloudGameSessionSelect<ExtArgs> | null
    /**
     * Filter, which CloudGameSession to fetch.
     */
    where: CloudGameSessionWhereUniqueInput
  }

  /**
   * CloudGameSession findFirst
   */
  export type CloudGameSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudGameSession
     */
    select?: CloudGameSessionSelect<ExtArgs> | null
    /**
     * Filter, which CloudGameSession to fetch.
     */
    where?: CloudGameSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudGameSessions to fetch.
     */
    orderBy?: CloudGameSessionOrderByWithRelationInput | CloudGameSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudGameSessions.
     */
    cursor?: CloudGameSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudGameSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudGameSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudGameSessions.
     */
    distinct?: CloudGameSessionScalarFieldEnum | CloudGameSessionScalarFieldEnum[]
  }

  /**
   * CloudGameSession findFirstOrThrow
   */
  export type CloudGameSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudGameSession
     */
    select?: CloudGameSessionSelect<ExtArgs> | null
    /**
     * Filter, which CloudGameSession to fetch.
     */
    where?: CloudGameSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudGameSessions to fetch.
     */
    orderBy?: CloudGameSessionOrderByWithRelationInput | CloudGameSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudGameSessions.
     */
    cursor?: CloudGameSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudGameSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudGameSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudGameSessions.
     */
    distinct?: CloudGameSessionScalarFieldEnum | CloudGameSessionScalarFieldEnum[]
  }

  /**
   * CloudGameSession findMany
   */
  export type CloudGameSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudGameSession
     */
    select?: CloudGameSessionSelect<ExtArgs> | null
    /**
     * Filter, which CloudGameSessions to fetch.
     */
    where?: CloudGameSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudGameSessions to fetch.
     */
    orderBy?: CloudGameSessionOrderByWithRelationInput | CloudGameSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CloudGameSessions.
     */
    cursor?: CloudGameSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudGameSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudGameSessions.
     */
    skip?: number
    distinct?: CloudGameSessionScalarFieldEnum | CloudGameSessionScalarFieldEnum[]
  }

  /**
   * CloudGameSession create
   */
  export type CloudGameSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudGameSession
     */
    select?: CloudGameSessionSelect<ExtArgs> | null
    /**
     * The data needed to create a CloudGameSession.
     */
    data: XOR<CloudGameSessionCreateInput, CloudGameSessionUncheckedCreateInput>
  }

  /**
   * CloudGameSession createMany
   */
  export type CloudGameSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CloudGameSessions.
     */
    data: CloudGameSessionCreateManyInput | CloudGameSessionCreateManyInput[]
  }

  /**
   * CloudGameSession createManyAndReturn
   */
  export type CloudGameSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudGameSession
     */
    select?: CloudGameSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CloudGameSessions.
     */
    data: CloudGameSessionCreateManyInput | CloudGameSessionCreateManyInput[]
  }

  /**
   * CloudGameSession update
   */
  export type CloudGameSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudGameSession
     */
    select?: CloudGameSessionSelect<ExtArgs> | null
    /**
     * The data needed to update a CloudGameSession.
     */
    data: XOR<CloudGameSessionUpdateInput, CloudGameSessionUncheckedUpdateInput>
    /**
     * Choose, which CloudGameSession to update.
     */
    where: CloudGameSessionWhereUniqueInput
  }

  /**
   * CloudGameSession updateMany
   */
  export type CloudGameSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CloudGameSessions.
     */
    data: XOR<CloudGameSessionUpdateManyMutationInput, CloudGameSessionUncheckedUpdateManyInput>
    /**
     * Filter which CloudGameSessions to update
     */
    where?: CloudGameSessionWhereInput
  }

  /**
   * CloudGameSession upsert
   */
  export type CloudGameSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudGameSession
     */
    select?: CloudGameSessionSelect<ExtArgs> | null
    /**
     * The filter to search for the CloudGameSession to update in case it exists.
     */
    where: CloudGameSessionWhereUniqueInput
    /**
     * In case the CloudGameSession found by the `where` argument doesn't exist, create a new CloudGameSession with this data.
     */
    create: XOR<CloudGameSessionCreateInput, CloudGameSessionUncheckedCreateInput>
    /**
     * In case the CloudGameSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CloudGameSessionUpdateInput, CloudGameSessionUncheckedUpdateInput>
  }

  /**
   * CloudGameSession delete
   */
  export type CloudGameSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudGameSession
     */
    select?: CloudGameSessionSelect<ExtArgs> | null
    /**
     * Filter which CloudGameSession to delete.
     */
    where: CloudGameSessionWhereUniqueInput
  }

  /**
   * CloudGameSession deleteMany
   */
  export type CloudGameSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudGameSessions to delete
     */
    where?: CloudGameSessionWhereInput
  }

  /**
   * CloudGameSession without action
   */
  export type CloudGameSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudGameSession
     */
    select?: CloudGameSessionSelect<ExtArgs> | null
  }


  /**
   * Model CloudRefund
   */

  export type AggregateCloudRefund = {
    _count: CloudRefundCountAggregateOutputType | null
    _avg: CloudRefundAvgAggregateOutputType | null
    _sum: CloudRefundSumAggregateOutputType | null
    _min: CloudRefundMinAggregateOutputType | null
    _max: CloudRefundMaxAggregateOutputType | null
  }

  export type CloudRefundAvgAggregateOutputType = {
    amount: Decimal | null
  }

  export type CloudRefundSumAggregateOutputType = {
    amount: Decimal | null
  }

  export type CloudRefundMinAggregateOutputType = {
    id: string | null
    paymentId: string | null
    branchId: string | null
    amount: Decimal | null
    status: string | null
    occurredAt: Date | null
  }

  export type CloudRefundMaxAggregateOutputType = {
    id: string | null
    paymentId: string | null
    branchId: string | null
    amount: Decimal | null
    status: string | null
    occurredAt: Date | null
  }

  export type CloudRefundCountAggregateOutputType = {
    id: number
    paymentId: number
    branchId: number
    amount: number
    status: number
    occurredAt: number
    _all: number
  }


  export type CloudRefundAvgAggregateInputType = {
    amount?: true
  }

  export type CloudRefundSumAggregateInputType = {
    amount?: true
  }

  export type CloudRefundMinAggregateInputType = {
    id?: true
    paymentId?: true
    branchId?: true
    amount?: true
    status?: true
    occurredAt?: true
  }

  export type CloudRefundMaxAggregateInputType = {
    id?: true
    paymentId?: true
    branchId?: true
    amount?: true
    status?: true
    occurredAt?: true
  }

  export type CloudRefundCountAggregateInputType = {
    id?: true
    paymentId?: true
    branchId?: true
    amount?: true
    status?: true
    occurredAt?: true
    _all?: true
  }

  export type CloudRefundAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudRefund to aggregate.
     */
    where?: CloudRefundWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudRefunds to fetch.
     */
    orderBy?: CloudRefundOrderByWithRelationInput | CloudRefundOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CloudRefundWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudRefunds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudRefunds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CloudRefunds
    **/
    _count?: true | CloudRefundCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CloudRefundAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CloudRefundSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CloudRefundMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CloudRefundMaxAggregateInputType
  }

  export type GetCloudRefundAggregateType<T extends CloudRefundAggregateArgs> = {
        [P in keyof T & keyof AggregateCloudRefund]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCloudRefund[P]>
      : GetScalarType<T[P], AggregateCloudRefund[P]>
  }




  export type CloudRefundGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CloudRefundWhereInput
    orderBy?: CloudRefundOrderByWithAggregationInput | CloudRefundOrderByWithAggregationInput[]
    by: CloudRefundScalarFieldEnum[] | CloudRefundScalarFieldEnum
    having?: CloudRefundScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CloudRefundCountAggregateInputType | true
    _avg?: CloudRefundAvgAggregateInputType
    _sum?: CloudRefundSumAggregateInputType
    _min?: CloudRefundMinAggregateInputType
    _max?: CloudRefundMaxAggregateInputType
  }

  export type CloudRefundGroupByOutputType = {
    id: string
    paymentId: string
    branchId: string
    amount: Decimal
    status: string
    occurredAt: Date
    _count: CloudRefundCountAggregateOutputType | null
    _avg: CloudRefundAvgAggregateOutputType | null
    _sum: CloudRefundSumAggregateOutputType | null
    _min: CloudRefundMinAggregateOutputType | null
    _max: CloudRefundMaxAggregateOutputType | null
  }

  type GetCloudRefundGroupByPayload<T extends CloudRefundGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CloudRefundGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CloudRefundGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CloudRefundGroupByOutputType[P]>
            : GetScalarType<T[P], CloudRefundGroupByOutputType[P]>
        }
      >
    >


  export type CloudRefundSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    paymentId?: boolean
    branchId?: boolean
    amount?: boolean
    status?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudRefund"]>

  export type CloudRefundSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    paymentId?: boolean
    branchId?: boolean
    amount?: boolean
    status?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudRefund"]>

  export type CloudRefundSelectScalar = {
    id?: boolean
    paymentId?: boolean
    branchId?: boolean
    amount?: boolean
    status?: boolean
    occurredAt?: boolean
  }


  export type $CloudRefundPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CloudRefund"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      paymentId: string
      branchId: string
      amount: Prisma.Decimal
      status: string
      occurredAt: Date
    }, ExtArgs["result"]["cloudRefund"]>
    composites: {}
  }

  type CloudRefundGetPayload<S extends boolean | null | undefined | CloudRefundDefaultArgs> = $Result.GetResult<Prisma.$CloudRefundPayload, S>

  type CloudRefundCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CloudRefundFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CloudRefundCountAggregateInputType | true
    }

  export interface CloudRefundDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CloudRefund'], meta: { name: 'CloudRefund' } }
    /**
     * Find zero or one CloudRefund that matches the filter.
     * @param {CloudRefundFindUniqueArgs} args - Arguments to find a CloudRefund
     * @example
     * // Get one CloudRefund
     * const cloudRefund = await prisma.cloudRefund.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CloudRefundFindUniqueArgs>(args: SelectSubset<T, CloudRefundFindUniqueArgs<ExtArgs>>): Prisma__CloudRefundClient<$Result.GetResult<Prisma.$CloudRefundPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CloudRefund that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CloudRefundFindUniqueOrThrowArgs} args - Arguments to find a CloudRefund
     * @example
     * // Get one CloudRefund
     * const cloudRefund = await prisma.cloudRefund.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CloudRefundFindUniqueOrThrowArgs>(args: SelectSubset<T, CloudRefundFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CloudRefundClient<$Result.GetResult<Prisma.$CloudRefundPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CloudRefund that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudRefundFindFirstArgs} args - Arguments to find a CloudRefund
     * @example
     * // Get one CloudRefund
     * const cloudRefund = await prisma.cloudRefund.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CloudRefundFindFirstArgs>(args?: SelectSubset<T, CloudRefundFindFirstArgs<ExtArgs>>): Prisma__CloudRefundClient<$Result.GetResult<Prisma.$CloudRefundPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CloudRefund that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudRefundFindFirstOrThrowArgs} args - Arguments to find a CloudRefund
     * @example
     * // Get one CloudRefund
     * const cloudRefund = await prisma.cloudRefund.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CloudRefundFindFirstOrThrowArgs>(args?: SelectSubset<T, CloudRefundFindFirstOrThrowArgs<ExtArgs>>): Prisma__CloudRefundClient<$Result.GetResult<Prisma.$CloudRefundPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CloudRefunds that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudRefundFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CloudRefunds
     * const cloudRefunds = await prisma.cloudRefund.findMany()
     * 
     * // Get first 10 CloudRefunds
     * const cloudRefunds = await prisma.cloudRefund.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cloudRefundWithIdOnly = await prisma.cloudRefund.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CloudRefundFindManyArgs>(args?: SelectSubset<T, CloudRefundFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudRefundPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CloudRefund.
     * @param {CloudRefundCreateArgs} args - Arguments to create a CloudRefund.
     * @example
     * // Create one CloudRefund
     * const CloudRefund = await prisma.cloudRefund.create({
     *   data: {
     *     // ... data to create a CloudRefund
     *   }
     * })
     * 
     */
    create<T extends CloudRefundCreateArgs>(args: SelectSubset<T, CloudRefundCreateArgs<ExtArgs>>): Prisma__CloudRefundClient<$Result.GetResult<Prisma.$CloudRefundPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CloudRefunds.
     * @param {CloudRefundCreateManyArgs} args - Arguments to create many CloudRefunds.
     * @example
     * // Create many CloudRefunds
     * const cloudRefund = await prisma.cloudRefund.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CloudRefundCreateManyArgs>(args?: SelectSubset<T, CloudRefundCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CloudRefunds and returns the data saved in the database.
     * @param {CloudRefundCreateManyAndReturnArgs} args - Arguments to create many CloudRefunds.
     * @example
     * // Create many CloudRefunds
     * const cloudRefund = await prisma.cloudRefund.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CloudRefunds and only return the `id`
     * const cloudRefundWithIdOnly = await prisma.cloudRefund.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CloudRefundCreateManyAndReturnArgs>(args?: SelectSubset<T, CloudRefundCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudRefundPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CloudRefund.
     * @param {CloudRefundDeleteArgs} args - Arguments to delete one CloudRefund.
     * @example
     * // Delete one CloudRefund
     * const CloudRefund = await prisma.cloudRefund.delete({
     *   where: {
     *     // ... filter to delete one CloudRefund
     *   }
     * })
     * 
     */
    delete<T extends CloudRefundDeleteArgs>(args: SelectSubset<T, CloudRefundDeleteArgs<ExtArgs>>): Prisma__CloudRefundClient<$Result.GetResult<Prisma.$CloudRefundPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CloudRefund.
     * @param {CloudRefundUpdateArgs} args - Arguments to update one CloudRefund.
     * @example
     * // Update one CloudRefund
     * const cloudRefund = await prisma.cloudRefund.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CloudRefundUpdateArgs>(args: SelectSubset<T, CloudRefundUpdateArgs<ExtArgs>>): Prisma__CloudRefundClient<$Result.GetResult<Prisma.$CloudRefundPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CloudRefunds.
     * @param {CloudRefundDeleteManyArgs} args - Arguments to filter CloudRefunds to delete.
     * @example
     * // Delete a few CloudRefunds
     * const { count } = await prisma.cloudRefund.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CloudRefundDeleteManyArgs>(args?: SelectSubset<T, CloudRefundDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CloudRefunds.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudRefundUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CloudRefunds
     * const cloudRefund = await prisma.cloudRefund.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CloudRefundUpdateManyArgs>(args: SelectSubset<T, CloudRefundUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CloudRefund.
     * @param {CloudRefundUpsertArgs} args - Arguments to update or create a CloudRefund.
     * @example
     * // Update or create a CloudRefund
     * const cloudRefund = await prisma.cloudRefund.upsert({
     *   create: {
     *     // ... data to create a CloudRefund
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CloudRefund we want to update
     *   }
     * })
     */
    upsert<T extends CloudRefundUpsertArgs>(args: SelectSubset<T, CloudRefundUpsertArgs<ExtArgs>>): Prisma__CloudRefundClient<$Result.GetResult<Prisma.$CloudRefundPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CloudRefunds.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudRefundCountArgs} args - Arguments to filter CloudRefunds to count.
     * @example
     * // Count the number of CloudRefunds
     * const count = await prisma.cloudRefund.count({
     *   where: {
     *     // ... the filter for the CloudRefunds we want to count
     *   }
     * })
    **/
    count<T extends CloudRefundCountArgs>(
      args?: Subset<T, CloudRefundCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CloudRefundCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CloudRefund.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudRefundAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CloudRefundAggregateArgs>(args: Subset<T, CloudRefundAggregateArgs>): Prisma.PrismaPromise<GetCloudRefundAggregateType<T>>

    /**
     * Group by CloudRefund.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudRefundGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CloudRefundGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CloudRefundGroupByArgs['orderBy'] }
        : { orderBy?: CloudRefundGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CloudRefundGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCloudRefundGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CloudRefund model
   */
  readonly fields: CloudRefundFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CloudRefund.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CloudRefundClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CloudRefund model
   */ 
  interface CloudRefundFieldRefs {
    readonly id: FieldRef<"CloudRefund", 'String'>
    readonly paymentId: FieldRef<"CloudRefund", 'String'>
    readonly branchId: FieldRef<"CloudRefund", 'String'>
    readonly amount: FieldRef<"CloudRefund", 'Decimal'>
    readonly status: FieldRef<"CloudRefund", 'String'>
    readonly occurredAt: FieldRef<"CloudRefund", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CloudRefund findUnique
   */
  export type CloudRefundFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRefund
     */
    select?: CloudRefundSelect<ExtArgs> | null
    /**
     * Filter, which CloudRefund to fetch.
     */
    where: CloudRefundWhereUniqueInput
  }

  /**
   * CloudRefund findUniqueOrThrow
   */
  export type CloudRefundFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRefund
     */
    select?: CloudRefundSelect<ExtArgs> | null
    /**
     * Filter, which CloudRefund to fetch.
     */
    where: CloudRefundWhereUniqueInput
  }

  /**
   * CloudRefund findFirst
   */
  export type CloudRefundFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRefund
     */
    select?: CloudRefundSelect<ExtArgs> | null
    /**
     * Filter, which CloudRefund to fetch.
     */
    where?: CloudRefundWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudRefunds to fetch.
     */
    orderBy?: CloudRefundOrderByWithRelationInput | CloudRefundOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudRefunds.
     */
    cursor?: CloudRefundWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudRefunds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudRefunds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudRefunds.
     */
    distinct?: CloudRefundScalarFieldEnum | CloudRefundScalarFieldEnum[]
  }

  /**
   * CloudRefund findFirstOrThrow
   */
  export type CloudRefundFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRefund
     */
    select?: CloudRefundSelect<ExtArgs> | null
    /**
     * Filter, which CloudRefund to fetch.
     */
    where?: CloudRefundWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudRefunds to fetch.
     */
    orderBy?: CloudRefundOrderByWithRelationInput | CloudRefundOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudRefunds.
     */
    cursor?: CloudRefundWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudRefunds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudRefunds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudRefunds.
     */
    distinct?: CloudRefundScalarFieldEnum | CloudRefundScalarFieldEnum[]
  }

  /**
   * CloudRefund findMany
   */
  export type CloudRefundFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRefund
     */
    select?: CloudRefundSelect<ExtArgs> | null
    /**
     * Filter, which CloudRefunds to fetch.
     */
    where?: CloudRefundWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudRefunds to fetch.
     */
    orderBy?: CloudRefundOrderByWithRelationInput | CloudRefundOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CloudRefunds.
     */
    cursor?: CloudRefundWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudRefunds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudRefunds.
     */
    skip?: number
    distinct?: CloudRefundScalarFieldEnum | CloudRefundScalarFieldEnum[]
  }

  /**
   * CloudRefund create
   */
  export type CloudRefundCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRefund
     */
    select?: CloudRefundSelect<ExtArgs> | null
    /**
     * The data needed to create a CloudRefund.
     */
    data: XOR<CloudRefundCreateInput, CloudRefundUncheckedCreateInput>
  }

  /**
   * CloudRefund createMany
   */
  export type CloudRefundCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CloudRefunds.
     */
    data: CloudRefundCreateManyInput | CloudRefundCreateManyInput[]
  }

  /**
   * CloudRefund createManyAndReturn
   */
  export type CloudRefundCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRefund
     */
    select?: CloudRefundSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CloudRefunds.
     */
    data: CloudRefundCreateManyInput | CloudRefundCreateManyInput[]
  }

  /**
   * CloudRefund update
   */
  export type CloudRefundUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRefund
     */
    select?: CloudRefundSelect<ExtArgs> | null
    /**
     * The data needed to update a CloudRefund.
     */
    data: XOR<CloudRefundUpdateInput, CloudRefundUncheckedUpdateInput>
    /**
     * Choose, which CloudRefund to update.
     */
    where: CloudRefundWhereUniqueInput
  }

  /**
   * CloudRefund updateMany
   */
  export type CloudRefundUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CloudRefunds.
     */
    data: XOR<CloudRefundUpdateManyMutationInput, CloudRefundUncheckedUpdateManyInput>
    /**
     * Filter which CloudRefunds to update
     */
    where?: CloudRefundWhereInput
  }

  /**
   * CloudRefund upsert
   */
  export type CloudRefundUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRefund
     */
    select?: CloudRefundSelect<ExtArgs> | null
    /**
     * The filter to search for the CloudRefund to update in case it exists.
     */
    where: CloudRefundWhereUniqueInput
    /**
     * In case the CloudRefund found by the `where` argument doesn't exist, create a new CloudRefund with this data.
     */
    create: XOR<CloudRefundCreateInput, CloudRefundUncheckedCreateInput>
    /**
     * In case the CloudRefund was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CloudRefundUpdateInput, CloudRefundUncheckedUpdateInput>
  }

  /**
   * CloudRefund delete
   */
  export type CloudRefundDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRefund
     */
    select?: CloudRefundSelect<ExtArgs> | null
    /**
     * Filter which CloudRefund to delete.
     */
    where: CloudRefundWhereUniqueInput
  }

  /**
   * CloudRefund deleteMany
   */
  export type CloudRefundDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudRefunds to delete
     */
    where?: CloudRefundWhereInput
  }

  /**
   * CloudRefund without action
   */
  export type CloudRefundDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRefund
     */
    select?: CloudRefundSelect<ExtArgs> | null
  }


  /**
   * Model CloudShift
   */

  export type AggregateCloudShift = {
    _count: CloudShiftCountAggregateOutputType | null
    _avg: CloudShiftAvgAggregateOutputType | null
    _sum: CloudShiftSumAggregateOutputType | null
    _min: CloudShiftMinAggregateOutputType | null
    _max: CloudShiftMaxAggregateOutputType | null
  }

  export type CloudShiftAvgAggregateOutputType = {
    openingCash: Decimal | null
    expectedCash: Decimal | null
    actualCash: Decimal | null
    variance: Decimal | null
  }

  export type CloudShiftSumAggregateOutputType = {
    openingCash: Decimal | null
    expectedCash: Decimal | null
    actualCash: Decimal | null
    variance: Decimal | null
  }

  export type CloudShiftMinAggregateOutputType = {
    id: string | null
    branchId: string | null
    status: string | null
    openedAt: Date | null
    closedAt: Date | null
    openingCash: Decimal | null
    expectedCash: Decimal | null
    actualCash: Decimal | null
    variance: Decimal | null
    varianceReason: string | null
    occurredAt: Date | null
  }

  export type CloudShiftMaxAggregateOutputType = {
    id: string | null
    branchId: string | null
    status: string | null
    openedAt: Date | null
    closedAt: Date | null
    openingCash: Decimal | null
    expectedCash: Decimal | null
    actualCash: Decimal | null
    variance: Decimal | null
    varianceReason: string | null
    occurredAt: Date | null
  }

  export type CloudShiftCountAggregateOutputType = {
    id: number
    branchId: number
    status: number
    openedAt: number
    closedAt: number
    openingCash: number
    expectedCash: number
    actualCash: number
    variance: number
    varianceReason: number
    occurredAt: number
    _all: number
  }


  export type CloudShiftAvgAggregateInputType = {
    openingCash?: true
    expectedCash?: true
    actualCash?: true
    variance?: true
  }

  export type CloudShiftSumAggregateInputType = {
    openingCash?: true
    expectedCash?: true
    actualCash?: true
    variance?: true
  }

  export type CloudShiftMinAggregateInputType = {
    id?: true
    branchId?: true
    status?: true
    openedAt?: true
    closedAt?: true
    openingCash?: true
    expectedCash?: true
    actualCash?: true
    variance?: true
    varianceReason?: true
    occurredAt?: true
  }

  export type CloudShiftMaxAggregateInputType = {
    id?: true
    branchId?: true
    status?: true
    openedAt?: true
    closedAt?: true
    openingCash?: true
    expectedCash?: true
    actualCash?: true
    variance?: true
    varianceReason?: true
    occurredAt?: true
  }

  export type CloudShiftCountAggregateInputType = {
    id?: true
    branchId?: true
    status?: true
    openedAt?: true
    closedAt?: true
    openingCash?: true
    expectedCash?: true
    actualCash?: true
    variance?: true
    varianceReason?: true
    occurredAt?: true
    _all?: true
  }

  export type CloudShiftAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudShift to aggregate.
     */
    where?: CloudShiftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudShifts to fetch.
     */
    orderBy?: CloudShiftOrderByWithRelationInput | CloudShiftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CloudShiftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudShifts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudShifts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CloudShifts
    **/
    _count?: true | CloudShiftCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CloudShiftAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CloudShiftSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CloudShiftMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CloudShiftMaxAggregateInputType
  }

  export type GetCloudShiftAggregateType<T extends CloudShiftAggregateArgs> = {
        [P in keyof T & keyof AggregateCloudShift]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCloudShift[P]>
      : GetScalarType<T[P], AggregateCloudShift[P]>
  }




  export type CloudShiftGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CloudShiftWhereInput
    orderBy?: CloudShiftOrderByWithAggregationInput | CloudShiftOrderByWithAggregationInput[]
    by: CloudShiftScalarFieldEnum[] | CloudShiftScalarFieldEnum
    having?: CloudShiftScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CloudShiftCountAggregateInputType | true
    _avg?: CloudShiftAvgAggregateInputType
    _sum?: CloudShiftSumAggregateInputType
    _min?: CloudShiftMinAggregateInputType
    _max?: CloudShiftMaxAggregateInputType
  }

  export type CloudShiftGroupByOutputType = {
    id: string
    branchId: string
    status: string
    openedAt: Date
    closedAt: Date | null
    openingCash: Decimal
    expectedCash: Decimal | null
    actualCash: Decimal | null
    variance: Decimal | null
    varianceReason: string | null
    occurredAt: Date
    _count: CloudShiftCountAggregateOutputType | null
    _avg: CloudShiftAvgAggregateOutputType | null
    _sum: CloudShiftSumAggregateOutputType | null
    _min: CloudShiftMinAggregateOutputType | null
    _max: CloudShiftMaxAggregateOutputType | null
  }

  type GetCloudShiftGroupByPayload<T extends CloudShiftGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CloudShiftGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CloudShiftGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CloudShiftGroupByOutputType[P]>
            : GetScalarType<T[P], CloudShiftGroupByOutputType[P]>
        }
      >
    >


  export type CloudShiftSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    status?: boolean
    openedAt?: boolean
    closedAt?: boolean
    openingCash?: boolean
    expectedCash?: boolean
    actualCash?: boolean
    variance?: boolean
    varianceReason?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudShift"]>

  export type CloudShiftSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    status?: boolean
    openedAt?: boolean
    closedAt?: boolean
    openingCash?: boolean
    expectedCash?: boolean
    actualCash?: boolean
    variance?: boolean
    varianceReason?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudShift"]>

  export type CloudShiftSelectScalar = {
    id?: boolean
    branchId?: boolean
    status?: boolean
    openedAt?: boolean
    closedAt?: boolean
    openingCash?: boolean
    expectedCash?: boolean
    actualCash?: boolean
    variance?: boolean
    varianceReason?: boolean
    occurredAt?: boolean
  }


  export type $CloudShiftPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CloudShift"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      branchId: string
      status: string
      openedAt: Date
      closedAt: Date | null
      openingCash: Prisma.Decimal
      expectedCash: Prisma.Decimal | null
      actualCash: Prisma.Decimal | null
      variance: Prisma.Decimal | null
      varianceReason: string | null
      occurredAt: Date
    }, ExtArgs["result"]["cloudShift"]>
    composites: {}
  }

  type CloudShiftGetPayload<S extends boolean | null | undefined | CloudShiftDefaultArgs> = $Result.GetResult<Prisma.$CloudShiftPayload, S>

  type CloudShiftCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CloudShiftFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CloudShiftCountAggregateInputType | true
    }

  export interface CloudShiftDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CloudShift'], meta: { name: 'CloudShift' } }
    /**
     * Find zero or one CloudShift that matches the filter.
     * @param {CloudShiftFindUniqueArgs} args - Arguments to find a CloudShift
     * @example
     * // Get one CloudShift
     * const cloudShift = await prisma.cloudShift.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CloudShiftFindUniqueArgs>(args: SelectSubset<T, CloudShiftFindUniqueArgs<ExtArgs>>): Prisma__CloudShiftClient<$Result.GetResult<Prisma.$CloudShiftPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CloudShift that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CloudShiftFindUniqueOrThrowArgs} args - Arguments to find a CloudShift
     * @example
     * // Get one CloudShift
     * const cloudShift = await prisma.cloudShift.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CloudShiftFindUniqueOrThrowArgs>(args: SelectSubset<T, CloudShiftFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CloudShiftClient<$Result.GetResult<Prisma.$CloudShiftPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CloudShift that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudShiftFindFirstArgs} args - Arguments to find a CloudShift
     * @example
     * // Get one CloudShift
     * const cloudShift = await prisma.cloudShift.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CloudShiftFindFirstArgs>(args?: SelectSubset<T, CloudShiftFindFirstArgs<ExtArgs>>): Prisma__CloudShiftClient<$Result.GetResult<Prisma.$CloudShiftPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CloudShift that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudShiftFindFirstOrThrowArgs} args - Arguments to find a CloudShift
     * @example
     * // Get one CloudShift
     * const cloudShift = await prisma.cloudShift.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CloudShiftFindFirstOrThrowArgs>(args?: SelectSubset<T, CloudShiftFindFirstOrThrowArgs<ExtArgs>>): Prisma__CloudShiftClient<$Result.GetResult<Prisma.$CloudShiftPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CloudShifts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudShiftFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CloudShifts
     * const cloudShifts = await prisma.cloudShift.findMany()
     * 
     * // Get first 10 CloudShifts
     * const cloudShifts = await prisma.cloudShift.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cloudShiftWithIdOnly = await prisma.cloudShift.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CloudShiftFindManyArgs>(args?: SelectSubset<T, CloudShiftFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudShiftPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CloudShift.
     * @param {CloudShiftCreateArgs} args - Arguments to create a CloudShift.
     * @example
     * // Create one CloudShift
     * const CloudShift = await prisma.cloudShift.create({
     *   data: {
     *     // ... data to create a CloudShift
     *   }
     * })
     * 
     */
    create<T extends CloudShiftCreateArgs>(args: SelectSubset<T, CloudShiftCreateArgs<ExtArgs>>): Prisma__CloudShiftClient<$Result.GetResult<Prisma.$CloudShiftPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CloudShifts.
     * @param {CloudShiftCreateManyArgs} args - Arguments to create many CloudShifts.
     * @example
     * // Create many CloudShifts
     * const cloudShift = await prisma.cloudShift.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CloudShiftCreateManyArgs>(args?: SelectSubset<T, CloudShiftCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CloudShifts and returns the data saved in the database.
     * @param {CloudShiftCreateManyAndReturnArgs} args - Arguments to create many CloudShifts.
     * @example
     * // Create many CloudShifts
     * const cloudShift = await prisma.cloudShift.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CloudShifts and only return the `id`
     * const cloudShiftWithIdOnly = await prisma.cloudShift.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CloudShiftCreateManyAndReturnArgs>(args?: SelectSubset<T, CloudShiftCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudShiftPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CloudShift.
     * @param {CloudShiftDeleteArgs} args - Arguments to delete one CloudShift.
     * @example
     * // Delete one CloudShift
     * const CloudShift = await prisma.cloudShift.delete({
     *   where: {
     *     // ... filter to delete one CloudShift
     *   }
     * })
     * 
     */
    delete<T extends CloudShiftDeleteArgs>(args: SelectSubset<T, CloudShiftDeleteArgs<ExtArgs>>): Prisma__CloudShiftClient<$Result.GetResult<Prisma.$CloudShiftPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CloudShift.
     * @param {CloudShiftUpdateArgs} args - Arguments to update one CloudShift.
     * @example
     * // Update one CloudShift
     * const cloudShift = await prisma.cloudShift.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CloudShiftUpdateArgs>(args: SelectSubset<T, CloudShiftUpdateArgs<ExtArgs>>): Prisma__CloudShiftClient<$Result.GetResult<Prisma.$CloudShiftPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CloudShifts.
     * @param {CloudShiftDeleteManyArgs} args - Arguments to filter CloudShifts to delete.
     * @example
     * // Delete a few CloudShifts
     * const { count } = await prisma.cloudShift.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CloudShiftDeleteManyArgs>(args?: SelectSubset<T, CloudShiftDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CloudShifts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudShiftUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CloudShifts
     * const cloudShift = await prisma.cloudShift.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CloudShiftUpdateManyArgs>(args: SelectSubset<T, CloudShiftUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CloudShift.
     * @param {CloudShiftUpsertArgs} args - Arguments to update or create a CloudShift.
     * @example
     * // Update or create a CloudShift
     * const cloudShift = await prisma.cloudShift.upsert({
     *   create: {
     *     // ... data to create a CloudShift
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CloudShift we want to update
     *   }
     * })
     */
    upsert<T extends CloudShiftUpsertArgs>(args: SelectSubset<T, CloudShiftUpsertArgs<ExtArgs>>): Prisma__CloudShiftClient<$Result.GetResult<Prisma.$CloudShiftPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CloudShifts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudShiftCountArgs} args - Arguments to filter CloudShifts to count.
     * @example
     * // Count the number of CloudShifts
     * const count = await prisma.cloudShift.count({
     *   where: {
     *     // ... the filter for the CloudShifts we want to count
     *   }
     * })
    **/
    count<T extends CloudShiftCountArgs>(
      args?: Subset<T, CloudShiftCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CloudShiftCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CloudShift.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudShiftAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CloudShiftAggregateArgs>(args: Subset<T, CloudShiftAggregateArgs>): Prisma.PrismaPromise<GetCloudShiftAggregateType<T>>

    /**
     * Group by CloudShift.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudShiftGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CloudShiftGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CloudShiftGroupByArgs['orderBy'] }
        : { orderBy?: CloudShiftGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CloudShiftGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCloudShiftGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CloudShift model
   */
  readonly fields: CloudShiftFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CloudShift.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CloudShiftClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CloudShift model
   */ 
  interface CloudShiftFieldRefs {
    readonly id: FieldRef<"CloudShift", 'String'>
    readonly branchId: FieldRef<"CloudShift", 'String'>
    readonly status: FieldRef<"CloudShift", 'String'>
    readonly openedAt: FieldRef<"CloudShift", 'DateTime'>
    readonly closedAt: FieldRef<"CloudShift", 'DateTime'>
    readonly openingCash: FieldRef<"CloudShift", 'Decimal'>
    readonly expectedCash: FieldRef<"CloudShift", 'Decimal'>
    readonly actualCash: FieldRef<"CloudShift", 'Decimal'>
    readonly variance: FieldRef<"CloudShift", 'Decimal'>
    readonly varianceReason: FieldRef<"CloudShift", 'String'>
    readonly occurredAt: FieldRef<"CloudShift", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CloudShift findUnique
   */
  export type CloudShiftFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudShift
     */
    select?: CloudShiftSelect<ExtArgs> | null
    /**
     * Filter, which CloudShift to fetch.
     */
    where: CloudShiftWhereUniqueInput
  }

  /**
   * CloudShift findUniqueOrThrow
   */
  export type CloudShiftFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudShift
     */
    select?: CloudShiftSelect<ExtArgs> | null
    /**
     * Filter, which CloudShift to fetch.
     */
    where: CloudShiftWhereUniqueInput
  }

  /**
   * CloudShift findFirst
   */
  export type CloudShiftFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudShift
     */
    select?: CloudShiftSelect<ExtArgs> | null
    /**
     * Filter, which CloudShift to fetch.
     */
    where?: CloudShiftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudShifts to fetch.
     */
    orderBy?: CloudShiftOrderByWithRelationInput | CloudShiftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudShifts.
     */
    cursor?: CloudShiftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudShifts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudShifts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudShifts.
     */
    distinct?: CloudShiftScalarFieldEnum | CloudShiftScalarFieldEnum[]
  }

  /**
   * CloudShift findFirstOrThrow
   */
  export type CloudShiftFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudShift
     */
    select?: CloudShiftSelect<ExtArgs> | null
    /**
     * Filter, which CloudShift to fetch.
     */
    where?: CloudShiftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudShifts to fetch.
     */
    orderBy?: CloudShiftOrderByWithRelationInput | CloudShiftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudShifts.
     */
    cursor?: CloudShiftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudShifts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudShifts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudShifts.
     */
    distinct?: CloudShiftScalarFieldEnum | CloudShiftScalarFieldEnum[]
  }

  /**
   * CloudShift findMany
   */
  export type CloudShiftFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudShift
     */
    select?: CloudShiftSelect<ExtArgs> | null
    /**
     * Filter, which CloudShifts to fetch.
     */
    where?: CloudShiftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudShifts to fetch.
     */
    orderBy?: CloudShiftOrderByWithRelationInput | CloudShiftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CloudShifts.
     */
    cursor?: CloudShiftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudShifts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudShifts.
     */
    skip?: number
    distinct?: CloudShiftScalarFieldEnum | CloudShiftScalarFieldEnum[]
  }

  /**
   * CloudShift create
   */
  export type CloudShiftCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudShift
     */
    select?: CloudShiftSelect<ExtArgs> | null
    /**
     * The data needed to create a CloudShift.
     */
    data: XOR<CloudShiftCreateInput, CloudShiftUncheckedCreateInput>
  }

  /**
   * CloudShift createMany
   */
  export type CloudShiftCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CloudShifts.
     */
    data: CloudShiftCreateManyInput | CloudShiftCreateManyInput[]
  }

  /**
   * CloudShift createManyAndReturn
   */
  export type CloudShiftCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudShift
     */
    select?: CloudShiftSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CloudShifts.
     */
    data: CloudShiftCreateManyInput | CloudShiftCreateManyInput[]
  }

  /**
   * CloudShift update
   */
  export type CloudShiftUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudShift
     */
    select?: CloudShiftSelect<ExtArgs> | null
    /**
     * The data needed to update a CloudShift.
     */
    data: XOR<CloudShiftUpdateInput, CloudShiftUncheckedUpdateInput>
    /**
     * Choose, which CloudShift to update.
     */
    where: CloudShiftWhereUniqueInput
  }

  /**
   * CloudShift updateMany
   */
  export type CloudShiftUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CloudShifts.
     */
    data: XOR<CloudShiftUpdateManyMutationInput, CloudShiftUncheckedUpdateManyInput>
    /**
     * Filter which CloudShifts to update
     */
    where?: CloudShiftWhereInput
  }

  /**
   * CloudShift upsert
   */
  export type CloudShiftUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudShift
     */
    select?: CloudShiftSelect<ExtArgs> | null
    /**
     * The filter to search for the CloudShift to update in case it exists.
     */
    where: CloudShiftWhereUniqueInput
    /**
     * In case the CloudShift found by the `where` argument doesn't exist, create a new CloudShift with this data.
     */
    create: XOR<CloudShiftCreateInput, CloudShiftUncheckedCreateInput>
    /**
     * In case the CloudShift was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CloudShiftUpdateInput, CloudShiftUncheckedUpdateInput>
  }

  /**
   * CloudShift delete
   */
  export type CloudShiftDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudShift
     */
    select?: CloudShiftSelect<ExtArgs> | null
    /**
     * Filter which CloudShift to delete.
     */
    where: CloudShiftWhereUniqueInput
  }

  /**
   * CloudShift deleteMany
   */
  export type CloudShiftDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudShifts to delete
     */
    where?: CloudShiftWhereInput
  }

  /**
   * CloudShift without action
   */
  export type CloudShiftDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudShift
     */
    select?: CloudShiftSelect<ExtArgs> | null
  }


  /**
   * Model CloudExpense
   */

  export type AggregateCloudExpense = {
    _count: CloudExpenseCountAggregateOutputType | null
    _avg: CloudExpenseAvgAggregateOutputType | null
    _sum: CloudExpenseSumAggregateOutputType | null
    _min: CloudExpenseMinAggregateOutputType | null
    _max: CloudExpenseMaxAggregateOutputType | null
  }

  export type CloudExpenseAvgAggregateOutputType = {
    amount: Decimal | null
  }

  export type CloudExpenseSumAggregateOutputType = {
    amount: Decimal | null
  }

  export type CloudExpenseMinAggregateOutputType = {
    id: string | null
    branchId: string | null
    shiftId: string | null
    category: string | null
    amount: Decimal | null
    occurredAt: Date | null
  }

  export type CloudExpenseMaxAggregateOutputType = {
    id: string | null
    branchId: string | null
    shiftId: string | null
    category: string | null
    amount: Decimal | null
    occurredAt: Date | null
  }

  export type CloudExpenseCountAggregateOutputType = {
    id: number
    branchId: number
    shiftId: number
    category: number
    amount: number
    occurredAt: number
    _all: number
  }


  export type CloudExpenseAvgAggregateInputType = {
    amount?: true
  }

  export type CloudExpenseSumAggregateInputType = {
    amount?: true
  }

  export type CloudExpenseMinAggregateInputType = {
    id?: true
    branchId?: true
    shiftId?: true
    category?: true
    amount?: true
    occurredAt?: true
  }

  export type CloudExpenseMaxAggregateInputType = {
    id?: true
    branchId?: true
    shiftId?: true
    category?: true
    amount?: true
    occurredAt?: true
  }

  export type CloudExpenseCountAggregateInputType = {
    id?: true
    branchId?: true
    shiftId?: true
    category?: true
    amount?: true
    occurredAt?: true
    _all?: true
  }

  export type CloudExpenseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudExpense to aggregate.
     */
    where?: CloudExpenseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudExpenses to fetch.
     */
    orderBy?: CloudExpenseOrderByWithRelationInput | CloudExpenseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CloudExpenseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudExpenses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudExpenses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CloudExpenses
    **/
    _count?: true | CloudExpenseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CloudExpenseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CloudExpenseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CloudExpenseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CloudExpenseMaxAggregateInputType
  }

  export type GetCloudExpenseAggregateType<T extends CloudExpenseAggregateArgs> = {
        [P in keyof T & keyof AggregateCloudExpense]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCloudExpense[P]>
      : GetScalarType<T[P], AggregateCloudExpense[P]>
  }




  export type CloudExpenseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CloudExpenseWhereInput
    orderBy?: CloudExpenseOrderByWithAggregationInput | CloudExpenseOrderByWithAggregationInput[]
    by: CloudExpenseScalarFieldEnum[] | CloudExpenseScalarFieldEnum
    having?: CloudExpenseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CloudExpenseCountAggregateInputType | true
    _avg?: CloudExpenseAvgAggregateInputType
    _sum?: CloudExpenseSumAggregateInputType
    _min?: CloudExpenseMinAggregateInputType
    _max?: CloudExpenseMaxAggregateInputType
  }

  export type CloudExpenseGroupByOutputType = {
    id: string
    branchId: string
    shiftId: string | null
    category: string
    amount: Decimal
    occurredAt: Date
    _count: CloudExpenseCountAggregateOutputType | null
    _avg: CloudExpenseAvgAggregateOutputType | null
    _sum: CloudExpenseSumAggregateOutputType | null
    _min: CloudExpenseMinAggregateOutputType | null
    _max: CloudExpenseMaxAggregateOutputType | null
  }

  type GetCloudExpenseGroupByPayload<T extends CloudExpenseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CloudExpenseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CloudExpenseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CloudExpenseGroupByOutputType[P]>
            : GetScalarType<T[P], CloudExpenseGroupByOutputType[P]>
        }
      >
    >


  export type CloudExpenseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    shiftId?: boolean
    category?: boolean
    amount?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudExpense"]>

  export type CloudExpenseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    shiftId?: boolean
    category?: boolean
    amount?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudExpense"]>

  export type CloudExpenseSelectScalar = {
    id?: boolean
    branchId?: boolean
    shiftId?: boolean
    category?: boolean
    amount?: boolean
    occurredAt?: boolean
  }


  export type $CloudExpensePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CloudExpense"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      branchId: string
      shiftId: string | null
      category: string
      amount: Prisma.Decimal
      occurredAt: Date
    }, ExtArgs["result"]["cloudExpense"]>
    composites: {}
  }

  type CloudExpenseGetPayload<S extends boolean | null | undefined | CloudExpenseDefaultArgs> = $Result.GetResult<Prisma.$CloudExpensePayload, S>

  type CloudExpenseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CloudExpenseFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CloudExpenseCountAggregateInputType | true
    }

  export interface CloudExpenseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CloudExpense'], meta: { name: 'CloudExpense' } }
    /**
     * Find zero or one CloudExpense that matches the filter.
     * @param {CloudExpenseFindUniqueArgs} args - Arguments to find a CloudExpense
     * @example
     * // Get one CloudExpense
     * const cloudExpense = await prisma.cloudExpense.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CloudExpenseFindUniqueArgs>(args: SelectSubset<T, CloudExpenseFindUniqueArgs<ExtArgs>>): Prisma__CloudExpenseClient<$Result.GetResult<Prisma.$CloudExpensePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CloudExpense that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CloudExpenseFindUniqueOrThrowArgs} args - Arguments to find a CloudExpense
     * @example
     * // Get one CloudExpense
     * const cloudExpense = await prisma.cloudExpense.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CloudExpenseFindUniqueOrThrowArgs>(args: SelectSubset<T, CloudExpenseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CloudExpenseClient<$Result.GetResult<Prisma.$CloudExpensePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CloudExpense that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudExpenseFindFirstArgs} args - Arguments to find a CloudExpense
     * @example
     * // Get one CloudExpense
     * const cloudExpense = await prisma.cloudExpense.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CloudExpenseFindFirstArgs>(args?: SelectSubset<T, CloudExpenseFindFirstArgs<ExtArgs>>): Prisma__CloudExpenseClient<$Result.GetResult<Prisma.$CloudExpensePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CloudExpense that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudExpenseFindFirstOrThrowArgs} args - Arguments to find a CloudExpense
     * @example
     * // Get one CloudExpense
     * const cloudExpense = await prisma.cloudExpense.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CloudExpenseFindFirstOrThrowArgs>(args?: SelectSubset<T, CloudExpenseFindFirstOrThrowArgs<ExtArgs>>): Prisma__CloudExpenseClient<$Result.GetResult<Prisma.$CloudExpensePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CloudExpenses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudExpenseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CloudExpenses
     * const cloudExpenses = await prisma.cloudExpense.findMany()
     * 
     * // Get first 10 CloudExpenses
     * const cloudExpenses = await prisma.cloudExpense.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cloudExpenseWithIdOnly = await prisma.cloudExpense.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CloudExpenseFindManyArgs>(args?: SelectSubset<T, CloudExpenseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudExpensePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CloudExpense.
     * @param {CloudExpenseCreateArgs} args - Arguments to create a CloudExpense.
     * @example
     * // Create one CloudExpense
     * const CloudExpense = await prisma.cloudExpense.create({
     *   data: {
     *     // ... data to create a CloudExpense
     *   }
     * })
     * 
     */
    create<T extends CloudExpenseCreateArgs>(args: SelectSubset<T, CloudExpenseCreateArgs<ExtArgs>>): Prisma__CloudExpenseClient<$Result.GetResult<Prisma.$CloudExpensePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CloudExpenses.
     * @param {CloudExpenseCreateManyArgs} args - Arguments to create many CloudExpenses.
     * @example
     * // Create many CloudExpenses
     * const cloudExpense = await prisma.cloudExpense.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CloudExpenseCreateManyArgs>(args?: SelectSubset<T, CloudExpenseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CloudExpenses and returns the data saved in the database.
     * @param {CloudExpenseCreateManyAndReturnArgs} args - Arguments to create many CloudExpenses.
     * @example
     * // Create many CloudExpenses
     * const cloudExpense = await prisma.cloudExpense.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CloudExpenses and only return the `id`
     * const cloudExpenseWithIdOnly = await prisma.cloudExpense.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CloudExpenseCreateManyAndReturnArgs>(args?: SelectSubset<T, CloudExpenseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudExpensePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CloudExpense.
     * @param {CloudExpenseDeleteArgs} args - Arguments to delete one CloudExpense.
     * @example
     * // Delete one CloudExpense
     * const CloudExpense = await prisma.cloudExpense.delete({
     *   where: {
     *     // ... filter to delete one CloudExpense
     *   }
     * })
     * 
     */
    delete<T extends CloudExpenseDeleteArgs>(args: SelectSubset<T, CloudExpenseDeleteArgs<ExtArgs>>): Prisma__CloudExpenseClient<$Result.GetResult<Prisma.$CloudExpensePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CloudExpense.
     * @param {CloudExpenseUpdateArgs} args - Arguments to update one CloudExpense.
     * @example
     * // Update one CloudExpense
     * const cloudExpense = await prisma.cloudExpense.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CloudExpenseUpdateArgs>(args: SelectSubset<T, CloudExpenseUpdateArgs<ExtArgs>>): Prisma__CloudExpenseClient<$Result.GetResult<Prisma.$CloudExpensePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CloudExpenses.
     * @param {CloudExpenseDeleteManyArgs} args - Arguments to filter CloudExpenses to delete.
     * @example
     * // Delete a few CloudExpenses
     * const { count } = await prisma.cloudExpense.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CloudExpenseDeleteManyArgs>(args?: SelectSubset<T, CloudExpenseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CloudExpenses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudExpenseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CloudExpenses
     * const cloudExpense = await prisma.cloudExpense.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CloudExpenseUpdateManyArgs>(args: SelectSubset<T, CloudExpenseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CloudExpense.
     * @param {CloudExpenseUpsertArgs} args - Arguments to update or create a CloudExpense.
     * @example
     * // Update or create a CloudExpense
     * const cloudExpense = await prisma.cloudExpense.upsert({
     *   create: {
     *     // ... data to create a CloudExpense
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CloudExpense we want to update
     *   }
     * })
     */
    upsert<T extends CloudExpenseUpsertArgs>(args: SelectSubset<T, CloudExpenseUpsertArgs<ExtArgs>>): Prisma__CloudExpenseClient<$Result.GetResult<Prisma.$CloudExpensePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CloudExpenses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudExpenseCountArgs} args - Arguments to filter CloudExpenses to count.
     * @example
     * // Count the number of CloudExpenses
     * const count = await prisma.cloudExpense.count({
     *   where: {
     *     // ... the filter for the CloudExpenses we want to count
     *   }
     * })
    **/
    count<T extends CloudExpenseCountArgs>(
      args?: Subset<T, CloudExpenseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CloudExpenseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CloudExpense.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudExpenseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CloudExpenseAggregateArgs>(args: Subset<T, CloudExpenseAggregateArgs>): Prisma.PrismaPromise<GetCloudExpenseAggregateType<T>>

    /**
     * Group by CloudExpense.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudExpenseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CloudExpenseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CloudExpenseGroupByArgs['orderBy'] }
        : { orderBy?: CloudExpenseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CloudExpenseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCloudExpenseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CloudExpense model
   */
  readonly fields: CloudExpenseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CloudExpense.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CloudExpenseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CloudExpense model
   */ 
  interface CloudExpenseFieldRefs {
    readonly id: FieldRef<"CloudExpense", 'String'>
    readonly branchId: FieldRef<"CloudExpense", 'String'>
    readonly shiftId: FieldRef<"CloudExpense", 'String'>
    readonly category: FieldRef<"CloudExpense", 'String'>
    readonly amount: FieldRef<"CloudExpense", 'Decimal'>
    readonly occurredAt: FieldRef<"CloudExpense", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CloudExpense findUnique
   */
  export type CloudExpenseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudExpense
     */
    select?: CloudExpenseSelect<ExtArgs> | null
    /**
     * Filter, which CloudExpense to fetch.
     */
    where: CloudExpenseWhereUniqueInput
  }

  /**
   * CloudExpense findUniqueOrThrow
   */
  export type CloudExpenseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudExpense
     */
    select?: CloudExpenseSelect<ExtArgs> | null
    /**
     * Filter, which CloudExpense to fetch.
     */
    where: CloudExpenseWhereUniqueInput
  }

  /**
   * CloudExpense findFirst
   */
  export type CloudExpenseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudExpense
     */
    select?: CloudExpenseSelect<ExtArgs> | null
    /**
     * Filter, which CloudExpense to fetch.
     */
    where?: CloudExpenseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudExpenses to fetch.
     */
    orderBy?: CloudExpenseOrderByWithRelationInput | CloudExpenseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudExpenses.
     */
    cursor?: CloudExpenseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudExpenses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudExpenses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudExpenses.
     */
    distinct?: CloudExpenseScalarFieldEnum | CloudExpenseScalarFieldEnum[]
  }

  /**
   * CloudExpense findFirstOrThrow
   */
  export type CloudExpenseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudExpense
     */
    select?: CloudExpenseSelect<ExtArgs> | null
    /**
     * Filter, which CloudExpense to fetch.
     */
    where?: CloudExpenseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudExpenses to fetch.
     */
    orderBy?: CloudExpenseOrderByWithRelationInput | CloudExpenseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudExpenses.
     */
    cursor?: CloudExpenseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudExpenses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudExpenses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudExpenses.
     */
    distinct?: CloudExpenseScalarFieldEnum | CloudExpenseScalarFieldEnum[]
  }

  /**
   * CloudExpense findMany
   */
  export type CloudExpenseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudExpense
     */
    select?: CloudExpenseSelect<ExtArgs> | null
    /**
     * Filter, which CloudExpenses to fetch.
     */
    where?: CloudExpenseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudExpenses to fetch.
     */
    orderBy?: CloudExpenseOrderByWithRelationInput | CloudExpenseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CloudExpenses.
     */
    cursor?: CloudExpenseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudExpenses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudExpenses.
     */
    skip?: number
    distinct?: CloudExpenseScalarFieldEnum | CloudExpenseScalarFieldEnum[]
  }

  /**
   * CloudExpense create
   */
  export type CloudExpenseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudExpense
     */
    select?: CloudExpenseSelect<ExtArgs> | null
    /**
     * The data needed to create a CloudExpense.
     */
    data: XOR<CloudExpenseCreateInput, CloudExpenseUncheckedCreateInput>
  }

  /**
   * CloudExpense createMany
   */
  export type CloudExpenseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CloudExpenses.
     */
    data: CloudExpenseCreateManyInput | CloudExpenseCreateManyInput[]
  }

  /**
   * CloudExpense createManyAndReturn
   */
  export type CloudExpenseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudExpense
     */
    select?: CloudExpenseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CloudExpenses.
     */
    data: CloudExpenseCreateManyInput | CloudExpenseCreateManyInput[]
  }

  /**
   * CloudExpense update
   */
  export type CloudExpenseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudExpense
     */
    select?: CloudExpenseSelect<ExtArgs> | null
    /**
     * The data needed to update a CloudExpense.
     */
    data: XOR<CloudExpenseUpdateInput, CloudExpenseUncheckedUpdateInput>
    /**
     * Choose, which CloudExpense to update.
     */
    where: CloudExpenseWhereUniqueInput
  }

  /**
   * CloudExpense updateMany
   */
  export type CloudExpenseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CloudExpenses.
     */
    data: XOR<CloudExpenseUpdateManyMutationInput, CloudExpenseUncheckedUpdateManyInput>
    /**
     * Filter which CloudExpenses to update
     */
    where?: CloudExpenseWhereInput
  }

  /**
   * CloudExpense upsert
   */
  export type CloudExpenseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudExpense
     */
    select?: CloudExpenseSelect<ExtArgs> | null
    /**
     * The filter to search for the CloudExpense to update in case it exists.
     */
    where: CloudExpenseWhereUniqueInput
    /**
     * In case the CloudExpense found by the `where` argument doesn't exist, create a new CloudExpense with this data.
     */
    create: XOR<CloudExpenseCreateInput, CloudExpenseUncheckedCreateInput>
    /**
     * In case the CloudExpense was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CloudExpenseUpdateInput, CloudExpenseUncheckedUpdateInput>
  }

  /**
   * CloudExpense delete
   */
  export type CloudExpenseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudExpense
     */
    select?: CloudExpenseSelect<ExtArgs> | null
    /**
     * Filter which CloudExpense to delete.
     */
    where: CloudExpenseWhereUniqueInput
  }

  /**
   * CloudExpense deleteMany
   */
  export type CloudExpenseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudExpenses to delete
     */
    where?: CloudExpenseWhereInput
  }

  /**
   * CloudExpense without action
   */
  export type CloudExpenseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudExpense
     */
    select?: CloudExpenseSelect<ExtArgs> | null
  }


  /**
   * Model CloudCashMovement
   */

  export type AggregateCloudCashMovement = {
    _count: CloudCashMovementCountAggregateOutputType | null
    _avg: CloudCashMovementAvgAggregateOutputType | null
    _sum: CloudCashMovementSumAggregateOutputType | null
    _min: CloudCashMovementMinAggregateOutputType | null
    _max: CloudCashMovementMaxAggregateOutputType | null
  }

  export type CloudCashMovementAvgAggregateOutputType = {
    amount: Decimal | null
  }

  export type CloudCashMovementSumAggregateOutputType = {
    amount: Decimal | null
  }

  export type CloudCashMovementMinAggregateOutputType = {
    id: string | null
    branchId: string | null
    shiftId: string | null
    type: string | null
    amount: Decimal | null
    occurredAt: Date | null
  }

  export type CloudCashMovementMaxAggregateOutputType = {
    id: string | null
    branchId: string | null
    shiftId: string | null
    type: string | null
    amount: Decimal | null
    occurredAt: Date | null
  }

  export type CloudCashMovementCountAggregateOutputType = {
    id: number
    branchId: number
    shiftId: number
    type: number
    amount: number
    occurredAt: number
    _all: number
  }


  export type CloudCashMovementAvgAggregateInputType = {
    amount?: true
  }

  export type CloudCashMovementSumAggregateInputType = {
    amount?: true
  }

  export type CloudCashMovementMinAggregateInputType = {
    id?: true
    branchId?: true
    shiftId?: true
    type?: true
    amount?: true
    occurredAt?: true
  }

  export type CloudCashMovementMaxAggregateInputType = {
    id?: true
    branchId?: true
    shiftId?: true
    type?: true
    amount?: true
    occurredAt?: true
  }

  export type CloudCashMovementCountAggregateInputType = {
    id?: true
    branchId?: true
    shiftId?: true
    type?: true
    amount?: true
    occurredAt?: true
    _all?: true
  }

  export type CloudCashMovementAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudCashMovement to aggregate.
     */
    where?: CloudCashMovementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudCashMovements to fetch.
     */
    orderBy?: CloudCashMovementOrderByWithRelationInput | CloudCashMovementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CloudCashMovementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudCashMovements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudCashMovements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CloudCashMovements
    **/
    _count?: true | CloudCashMovementCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CloudCashMovementAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CloudCashMovementSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CloudCashMovementMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CloudCashMovementMaxAggregateInputType
  }

  export type GetCloudCashMovementAggregateType<T extends CloudCashMovementAggregateArgs> = {
        [P in keyof T & keyof AggregateCloudCashMovement]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCloudCashMovement[P]>
      : GetScalarType<T[P], AggregateCloudCashMovement[P]>
  }




  export type CloudCashMovementGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CloudCashMovementWhereInput
    orderBy?: CloudCashMovementOrderByWithAggregationInput | CloudCashMovementOrderByWithAggregationInput[]
    by: CloudCashMovementScalarFieldEnum[] | CloudCashMovementScalarFieldEnum
    having?: CloudCashMovementScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CloudCashMovementCountAggregateInputType | true
    _avg?: CloudCashMovementAvgAggregateInputType
    _sum?: CloudCashMovementSumAggregateInputType
    _min?: CloudCashMovementMinAggregateInputType
    _max?: CloudCashMovementMaxAggregateInputType
  }

  export type CloudCashMovementGroupByOutputType = {
    id: string
    branchId: string
    shiftId: string
    type: string
    amount: Decimal
    occurredAt: Date
    _count: CloudCashMovementCountAggregateOutputType | null
    _avg: CloudCashMovementAvgAggregateOutputType | null
    _sum: CloudCashMovementSumAggregateOutputType | null
    _min: CloudCashMovementMinAggregateOutputType | null
    _max: CloudCashMovementMaxAggregateOutputType | null
  }

  type GetCloudCashMovementGroupByPayload<T extends CloudCashMovementGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CloudCashMovementGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CloudCashMovementGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CloudCashMovementGroupByOutputType[P]>
            : GetScalarType<T[P], CloudCashMovementGroupByOutputType[P]>
        }
      >
    >


  export type CloudCashMovementSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    shiftId?: boolean
    type?: boolean
    amount?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudCashMovement"]>

  export type CloudCashMovementSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    shiftId?: boolean
    type?: boolean
    amount?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudCashMovement"]>

  export type CloudCashMovementSelectScalar = {
    id?: boolean
    branchId?: boolean
    shiftId?: boolean
    type?: boolean
    amount?: boolean
    occurredAt?: boolean
  }


  export type $CloudCashMovementPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CloudCashMovement"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      branchId: string
      shiftId: string
      type: string
      amount: Prisma.Decimal
      occurredAt: Date
    }, ExtArgs["result"]["cloudCashMovement"]>
    composites: {}
  }

  type CloudCashMovementGetPayload<S extends boolean | null | undefined | CloudCashMovementDefaultArgs> = $Result.GetResult<Prisma.$CloudCashMovementPayload, S>

  type CloudCashMovementCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CloudCashMovementFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CloudCashMovementCountAggregateInputType | true
    }

  export interface CloudCashMovementDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CloudCashMovement'], meta: { name: 'CloudCashMovement' } }
    /**
     * Find zero or one CloudCashMovement that matches the filter.
     * @param {CloudCashMovementFindUniqueArgs} args - Arguments to find a CloudCashMovement
     * @example
     * // Get one CloudCashMovement
     * const cloudCashMovement = await prisma.cloudCashMovement.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CloudCashMovementFindUniqueArgs>(args: SelectSubset<T, CloudCashMovementFindUniqueArgs<ExtArgs>>): Prisma__CloudCashMovementClient<$Result.GetResult<Prisma.$CloudCashMovementPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CloudCashMovement that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CloudCashMovementFindUniqueOrThrowArgs} args - Arguments to find a CloudCashMovement
     * @example
     * // Get one CloudCashMovement
     * const cloudCashMovement = await prisma.cloudCashMovement.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CloudCashMovementFindUniqueOrThrowArgs>(args: SelectSubset<T, CloudCashMovementFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CloudCashMovementClient<$Result.GetResult<Prisma.$CloudCashMovementPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CloudCashMovement that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudCashMovementFindFirstArgs} args - Arguments to find a CloudCashMovement
     * @example
     * // Get one CloudCashMovement
     * const cloudCashMovement = await prisma.cloudCashMovement.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CloudCashMovementFindFirstArgs>(args?: SelectSubset<T, CloudCashMovementFindFirstArgs<ExtArgs>>): Prisma__CloudCashMovementClient<$Result.GetResult<Prisma.$CloudCashMovementPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CloudCashMovement that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudCashMovementFindFirstOrThrowArgs} args - Arguments to find a CloudCashMovement
     * @example
     * // Get one CloudCashMovement
     * const cloudCashMovement = await prisma.cloudCashMovement.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CloudCashMovementFindFirstOrThrowArgs>(args?: SelectSubset<T, CloudCashMovementFindFirstOrThrowArgs<ExtArgs>>): Prisma__CloudCashMovementClient<$Result.GetResult<Prisma.$CloudCashMovementPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CloudCashMovements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudCashMovementFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CloudCashMovements
     * const cloudCashMovements = await prisma.cloudCashMovement.findMany()
     * 
     * // Get first 10 CloudCashMovements
     * const cloudCashMovements = await prisma.cloudCashMovement.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cloudCashMovementWithIdOnly = await prisma.cloudCashMovement.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CloudCashMovementFindManyArgs>(args?: SelectSubset<T, CloudCashMovementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudCashMovementPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CloudCashMovement.
     * @param {CloudCashMovementCreateArgs} args - Arguments to create a CloudCashMovement.
     * @example
     * // Create one CloudCashMovement
     * const CloudCashMovement = await prisma.cloudCashMovement.create({
     *   data: {
     *     // ... data to create a CloudCashMovement
     *   }
     * })
     * 
     */
    create<T extends CloudCashMovementCreateArgs>(args: SelectSubset<T, CloudCashMovementCreateArgs<ExtArgs>>): Prisma__CloudCashMovementClient<$Result.GetResult<Prisma.$CloudCashMovementPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CloudCashMovements.
     * @param {CloudCashMovementCreateManyArgs} args - Arguments to create many CloudCashMovements.
     * @example
     * // Create many CloudCashMovements
     * const cloudCashMovement = await prisma.cloudCashMovement.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CloudCashMovementCreateManyArgs>(args?: SelectSubset<T, CloudCashMovementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CloudCashMovements and returns the data saved in the database.
     * @param {CloudCashMovementCreateManyAndReturnArgs} args - Arguments to create many CloudCashMovements.
     * @example
     * // Create many CloudCashMovements
     * const cloudCashMovement = await prisma.cloudCashMovement.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CloudCashMovements and only return the `id`
     * const cloudCashMovementWithIdOnly = await prisma.cloudCashMovement.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CloudCashMovementCreateManyAndReturnArgs>(args?: SelectSubset<T, CloudCashMovementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudCashMovementPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CloudCashMovement.
     * @param {CloudCashMovementDeleteArgs} args - Arguments to delete one CloudCashMovement.
     * @example
     * // Delete one CloudCashMovement
     * const CloudCashMovement = await prisma.cloudCashMovement.delete({
     *   where: {
     *     // ... filter to delete one CloudCashMovement
     *   }
     * })
     * 
     */
    delete<T extends CloudCashMovementDeleteArgs>(args: SelectSubset<T, CloudCashMovementDeleteArgs<ExtArgs>>): Prisma__CloudCashMovementClient<$Result.GetResult<Prisma.$CloudCashMovementPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CloudCashMovement.
     * @param {CloudCashMovementUpdateArgs} args - Arguments to update one CloudCashMovement.
     * @example
     * // Update one CloudCashMovement
     * const cloudCashMovement = await prisma.cloudCashMovement.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CloudCashMovementUpdateArgs>(args: SelectSubset<T, CloudCashMovementUpdateArgs<ExtArgs>>): Prisma__CloudCashMovementClient<$Result.GetResult<Prisma.$CloudCashMovementPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CloudCashMovements.
     * @param {CloudCashMovementDeleteManyArgs} args - Arguments to filter CloudCashMovements to delete.
     * @example
     * // Delete a few CloudCashMovements
     * const { count } = await prisma.cloudCashMovement.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CloudCashMovementDeleteManyArgs>(args?: SelectSubset<T, CloudCashMovementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CloudCashMovements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudCashMovementUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CloudCashMovements
     * const cloudCashMovement = await prisma.cloudCashMovement.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CloudCashMovementUpdateManyArgs>(args: SelectSubset<T, CloudCashMovementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CloudCashMovement.
     * @param {CloudCashMovementUpsertArgs} args - Arguments to update or create a CloudCashMovement.
     * @example
     * // Update or create a CloudCashMovement
     * const cloudCashMovement = await prisma.cloudCashMovement.upsert({
     *   create: {
     *     // ... data to create a CloudCashMovement
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CloudCashMovement we want to update
     *   }
     * })
     */
    upsert<T extends CloudCashMovementUpsertArgs>(args: SelectSubset<T, CloudCashMovementUpsertArgs<ExtArgs>>): Prisma__CloudCashMovementClient<$Result.GetResult<Prisma.$CloudCashMovementPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CloudCashMovements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudCashMovementCountArgs} args - Arguments to filter CloudCashMovements to count.
     * @example
     * // Count the number of CloudCashMovements
     * const count = await prisma.cloudCashMovement.count({
     *   where: {
     *     // ... the filter for the CloudCashMovements we want to count
     *   }
     * })
    **/
    count<T extends CloudCashMovementCountArgs>(
      args?: Subset<T, CloudCashMovementCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CloudCashMovementCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CloudCashMovement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudCashMovementAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CloudCashMovementAggregateArgs>(args: Subset<T, CloudCashMovementAggregateArgs>): Prisma.PrismaPromise<GetCloudCashMovementAggregateType<T>>

    /**
     * Group by CloudCashMovement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudCashMovementGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CloudCashMovementGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CloudCashMovementGroupByArgs['orderBy'] }
        : { orderBy?: CloudCashMovementGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CloudCashMovementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCloudCashMovementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CloudCashMovement model
   */
  readonly fields: CloudCashMovementFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CloudCashMovement.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CloudCashMovementClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CloudCashMovement model
   */ 
  interface CloudCashMovementFieldRefs {
    readonly id: FieldRef<"CloudCashMovement", 'String'>
    readonly branchId: FieldRef<"CloudCashMovement", 'String'>
    readonly shiftId: FieldRef<"CloudCashMovement", 'String'>
    readonly type: FieldRef<"CloudCashMovement", 'String'>
    readonly amount: FieldRef<"CloudCashMovement", 'Decimal'>
    readonly occurredAt: FieldRef<"CloudCashMovement", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CloudCashMovement findUnique
   */
  export type CloudCashMovementFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudCashMovement
     */
    select?: CloudCashMovementSelect<ExtArgs> | null
    /**
     * Filter, which CloudCashMovement to fetch.
     */
    where: CloudCashMovementWhereUniqueInput
  }

  /**
   * CloudCashMovement findUniqueOrThrow
   */
  export type CloudCashMovementFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudCashMovement
     */
    select?: CloudCashMovementSelect<ExtArgs> | null
    /**
     * Filter, which CloudCashMovement to fetch.
     */
    where: CloudCashMovementWhereUniqueInput
  }

  /**
   * CloudCashMovement findFirst
   */
  export type CloudCashMovementFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudCashMovement
     */
    select?: CloudCashMovementSelect<ExtArgs> | null
    /**
     * Filter, which CloudCashMovement to fetch.
     */
    where?: CloudCashMovementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudCashMovements to fetch.
     */
    orderBy?: CloudCashMovementOrderByWithRelationInput | CloudCashMovementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudCashMovements.
     */
    cursor?: CloudCashMovementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudCashMovements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudCashMovements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudCashMovements.
     */
    distinct?: CloudCashMovementScalarFieldEnum | CloudCashMovementScalarFieldEnum[]
  }

  /**
   * CloudCashMovement findFirstOrThrow
   */
  export type CloudCashMovementFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudCashMovement
     */
    select?: CloudCashMovementSelect<ExtArgs> | null
    /**
     * Filter, which CloudCashMovement to fetch.
     */
    where?: CloudCashMovementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudCashMovements to fetch.
     */
    orderBy?: CloudCashMovementOrderByWithRelationInput | CloudCashMovementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudCashMovements.
     */
    cursor?: CloudCashMovementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudCashMovements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudCashMovements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudCashMovements.
     */
    distinct?: CloudCashMovementScalarFieldEnum | CloudCashMovementScalarFieldEnum[]
  }

  /**
   * CloudCashMovement findMany
   */
  export type CloudCashMovementFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudCashMovement
     */
    select?: CloudCashMovementSelect<ExtArgs> | null
    /**
     * Filter, which CloudCashMovements to fetch.
     */
    where?: CloudCashMovementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudCashMovements to fetch.
     */
    orderBy?: CloudCashMovementOrderByWithRelationInput | CloudCashMovementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CloudCashMovements.
     */
    cursor?: CloudCashMovementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudCashMovements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudCashMovements.
     */
    skip?: number
    distinct?: CloudCashMovementScalarFieldEnum | CloudCashMovementScalarFieldEnum[]
  }

  /**
   * CloudCashMovement create
   */
  export type CloudCashMovementCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudCashMovement
     */
    select?: CloudCashMovementSelect<ExtArgs> | null
    /**
     * The data needed to create a CloudCashMovement.
     */
    data: XOR<CloudCashMovementCreateInput, CloudCashMovementUncheckedCreateInput>
  }

  /**
   * CloudCashMovement createMany
   */
  export type CloudCashMovementCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CloudCashMovements.
     */
    data: CloudCashMovementCreateManyInput | CloudCashMovementCreateManyInput[]
  }

  /**
   * CloudCashMovement createManyAndReturn
   */
  export type CloudCashMovementCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudCashMovement
     */
    select?: CloudCashMovementSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CloudCashMovements.
     */
    data: CloudCashMovementCreateManyInput | CloudCashMovementCreateManyInput[]
  }

  /**
   * CloudCashMovement update
   */
  export type CloudCashMovementUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudCashMovement
     */
    select?: CloudCashMovementSelect<ExtArgs> | null
    /**
     * The data needed to update a CloudCashMovement.
     */
    data: XOR<CloudCashMovementUpdateInput, CloudCashMovementUncheckedUpdateInput>
    /**
     * Choose, which CloudCashMovement to update.
     */
    where: CloudCashMovementWhereUniqueInput
  }

  /**
   * CloudCashMovement updateMany
   */
  export type CloudCashMovementUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CloudCashMovements.
     */
    data: XOR<CloudCashMovementUpdateManyMutationInput, CloudCashMovementUncheckedUpdateManyInput>
    /**
     * Filter which CloudCashMovements to update
     */
    where?: CloudCashMovementWhereInput
  }

  /**
   * CloudCashMovement upsert
   */
  export type CloudCashMovementUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudCashMovement
     */
    select?: CloudCashMovementSelect<ExtArgs> | null
    /**
     * The filter to search for the CloudCashMovement to update in case it exists.
     */
    where: CloudCashMovementWhereUniqueInput
    /**
     * In case the CloudCashMovement found by the `where` argument doesn't exist, create a new CloudCashMovement with this data.
     */
    create: XOR<CloudCashMovementCreateInput, CloudCashMovementUncheckedCreateInput>
    /**
     * In case the CloudCashMovement was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CloudCashMovementUpdateInput, CloudCashMovementUncheckedUpdateInput>
  }

  /**
   * CloudCashMovement delete
   */
  export type CloudCashMovementDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudCashMovement
     */
    select?: CloudCashMovementSelect<ExtArgs> | null
    /**
     * Filter which CloudCashMovement to delete.
     */
    where: CloudCashMovementWhereUniqueInput
  }

  /**
   * CloudCashMovement deleteMany
   */
  export type CloudCashMovementDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudCashMovements to delete
     */
    where?: CloudCashMovementWhereInput
  }

  /**
   * CloudCashMovement without action
   */
  export type CloudCashMovementDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudCashMovement
     */
    select?: CloudCashMovementSelect<ExtArgs> | null
  }


  /**
   * Model CloudDeliveryOrder
   */

  export type AggregateCloudDeliveryOrder = {
    _count: CloudDeliveryOrderCountAggregateOutputType | null
    _avg: CloudDeliveryOrderAvgAggregateOutputType | null
    _sum: CloudDeliveryOrderSumAggregateOutputType | null
    _min: CloudDeliveryOrderMinAggregateOutputType | null
    _max: CloudDeliveryOrderMaxAggregateOutputType | null
  }

  export type CloudDeliveryOrderAvgAggregateOutputType = {
    deliveryFee: Decimal | null
  }

  export type CloudDeliveryOrderSumAggregateOutputType = {
    deliveryFee: Decimal | null
  }

  export type CloudDeliveryOrderMinAggregateOutputType = {
    id: string | null
    orderId: string | null
    branchId: string | null
    status: string | null
    zoneId: string | null
    deliveryFee: Decimal | null
    driverId: string | null
    deliveredAt: Date | null
    occurredAt: Date | null
  }

  export type CloudDeliveryOrderMaxAggregateOutputType = {
    id: string | null
    orderId: string | null
    branchId: string | null
    status: string | null
    zoneId: string | null
    deliveryFee: Decimal | null
    driverId: string | null
    deliveredAt: Date | null
    occurredAt: Date | null
  }

  export type CloudDeliveryOrderCountAggregateOutputType = {
    id: number
    orderId: number
    branchId: number
    status: number
    zoneId: number
    deliveryFee: number
    driverId: number
    deliveredAt: number
    occurredAt: number
    _all: number
  }


  export type CloudDeliveryOrderAvgAggregateInputType = {
    deliveryFee?: true
  }

  export type CloudDeliveryOrderSumAggregateInputType = {
    deliveryFee?: true
  }

  export type CloudDeliveryOrderMinAggregateInputType = {
    id?: true
    orderId?: true
    branchId?: true
    status?: true
    zoneId?: true
    deliveryFee?: true
    driverId?: true
    deliveredAt?: true
    occurredAt?: true
  }

  export type CloudDeliveryOrderMaxAggregateInputType = {
    id?: true
    orderId?: true
    branchId?: true
    status?: true
    zoneId?: true
    deliveryFee?: true
    driverId?: true
    deliveredAt?: true
    occurredAt?: true
  }

  export type CloudDeliveryOrderCountAggregateInputType = {
    id?: true
    orderId?: true
    branchId?: true
    status?: true
    zoneId?: true
    deliveryFee?: true
    driverId?: true
    deliveredAt?: true
    occurredAt?: true
    _all?: true
  }

  export type CloudDeliveryOrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudDeliveryOrder to aggregate.
     */
    where?: CloudDeliveryOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudDeliveryOrders to fetch.
     */
    orderBy?: CloudDeliveryOrderOrderByWithRelationInput | CloudDeliveryOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CloudDeliveryOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudDeliveryOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudDeliveryOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CloudDeliveryOrders
    **/
    _count?: true | CloudDeliveryOrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CloudDeliveryOrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CloudDeliveryOrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CloudDeliveryOrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CloudDeliveryOrderMaxAggregateInputType
  }

  export type GetCloudDeliveryOrderAggregateType<T extends CloudDeliveryOrderAggregateArgs> = {
        [P in keyof T & keyof AggregateCloudDeliveryOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCloudDeliveryOrder[P]>
      : GetScalarType<T[P], AggregateCloudDeliveryOrder[P]>
  }




  export type CloudDeliveryOrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CloudDeliveryOrderWhereInput
    orderBy?: CloudDeliveryOrderOrderByWithAggregationInput | CloudDeliveryOrderOrderByWithAggregationInput[]
    by: CloudDeliveryOrderScalarFieldEnum[] | CloudDeliveryOrderScalarFieldEnum
    having?: CloudDeliveryOrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CloudDeliveryOrderCountAggregateInputType | true
    _avg?: CloudDeliveryOrderAvgAggregateInputType
    _sum?: CloudDeliveryOrderSumAggregateInputType
    _min?: CloudDeliveryOrderMinAggregateInputType
    _max?: CloudDeliveryOrderMaxAggregateInputType
  }

  export type CloudDeliveryOrderGroupByOutputType = {
    id: string
    orderId: string
    branchId: string
    status: string
    zoneId: string | null
    deliveryFee: Decimal
    driverId: string | null
    deliveredAt: Date | null
    occurredAt: Date
    _count: CloudDeliveryOrderCountAggregateOutputType | null
    _avg: CloudDeliveryOrderAvgAggregateOutputType | null
    _sum: CloudDeliveryOrderSumAggregateOutputType | null
    _min: CloudDeliveryOrderMinAggregateOutputType | null
    _max: CloudDeliveryOrderMaxAggregateOutputType | null
  }

  type GetCloudDeliveryOrderGroupByPayload<T extends CloudDeliveryOrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CloudDeliveryOrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CloudDeliveryOrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CloudDeliveryOrderGroupByOutputType[P]>
            : GetScalarType<T[P], CloudDeliveryOrderGroupByOutputType[P]>
        }
      >
    >


  export type CloudDeliveryOrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    branchId?: boolean
    status?: boolean
    zoneId?: boolean
    deliveryFee?: boolean
    driverId?: boolean
    deliveredAt?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudDeliveryOrder"]>

  export type CloudDeliveryOrderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    branchId?: boolean
    status?: boolean
    zoneId?: boolean
    deliveryFee?: boolean
    driverId?: boolean
    deliveredAt?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudDeliveryOrder"]>

  export type CloudDeliveryOrderSelectScalar = {
    id?: boolean
    orderId?: boolean
    branchId?: boolean
    status?: boolean
    zoneId?: boolean
    deliveryFee?: boolean
    driverId?: boolean
    deliveredAt?: boolean
    occurredAt?: boolean
  }


  export type $CloudDeliveryOrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CloudDeliveryOrder"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderId: string
      branchId: string
      status: string
      zoneId: string | null
      deliveryFee: Prisma.Decimal
      driverId: string | null
      deliveredAt: Date | null
      occurredAt: Date
    }, ExtArgs["result"]["cloudDeliveryOrder"]>
    composites: {}
  }

  type CloudDeliveryOrderGetPayload<S extends boolean | null | undefined | CloudDeliveryOrderDefaultArgs> = $Result.GetResult<Prisma.$CloudDeliveryOrderPayload, S>

  type CloudDeliveryOrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CloudDeliveryOrderFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CloudDeliveryOrderCountAggregateInputType | true
    }

  export interface CloudDeliveryOrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CloudDeliveryOrder'], meta: { name: 'CloudDeliveryOrder' } }
    /**
     * Find zero or one CloudDeliveryOrder that matches the filter.
     * @param {CloudDeliveryOrderFindUniqueArgs} args - Arguments to find a CloudDeliveryOrder
     * @example
     * // Get one CloudDeliveryOrder
     * const cloudDeliveryOrder = await prisma.cloudDeliveryOrder.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CloudDeliveryOrderFindUniqueArgs>(args: SelectSubset<T, CloudDeliveryOrderFindUniqueArgs<ExtArgs>>): Prisma__CloudDeliveryOrderClient<$Result.GetResult<Prisma.$CloudDeliveryOrderPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CloudDeliveryOrder that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CloudDeliveryOrderFindUniqueOrThrowArgs} args - Arguments to find a CloudDeliveryOrder
     * @example
     * // Get one CloudDeliveryOrder
     * const cloudDeliveryOrder = await prisma.cloudDeliveryOrder.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CloudDeliveryOrderFindUniqueOrThrowArgs>(args: SelectSubset<T, CloudDeliveryOrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CloudDeliveryOrderClient<$Result.GetResult<Prisma.$CloudDeliveryOrderPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CloudDeliveryOrder that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudDeliveryOrderFindFirstArgs} args - Arguments to find a CloudDeliveryOrder
     * @example
     * // Get one CloudDeliveryOrder
     * const cloudDeliveryOrder = await prisma.cloudDeliveryOrder.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CloudDeliveryOrderFindFirstArgs>(args?: SelectSubset<T, CloudDeliveryOrderFindFirstArgs<ExtArgs>>): Prisma__CloudDeliveryOrderClient<$Result.GetResult<Prisma.$CloudDeliveryOrderPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CloudDeliveryOrder that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudDeliveryOrderFindFirstOrThrowArgs} args - Arguments to find a CloudDeliveryOrder
     * @example
     * // Get one CloudDeliveryOrder
     * const cloudDeliveryOrder = await prisma.cloudDeliveryOrder.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CloudDeliveryOrderFindFirstOrThrowArgs>(args?: SelectSubset<T, CloudDeliveryOrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__CloudDeliveryOrderClient<$Result.GetResult<Prisma.$CloudDeliveryOrderPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CloudDeliveryOrders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudDeliveryOrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CloudDeliveryOrders
     * const cloudDeliveryOrders = await prisma.cloudDeliveryOrder.findMany()
     * 
     * // Get first 10 CloudDeliveryOrders
     * const cloudDeliveryOrders = await prisma.cloudDeliveryOrder.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cloudDeliveryOrderWithIdOnly = await prisma.cloudDeliveryOrder.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CloudDeliveryOrderFindManyArgs>(args?: SelectSubset<T, CloudDeliveryOrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudDeliveryOrderPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CloudDeliveryOrder.
     * @param {CloudDeliveryOrderCreateArgs} args - Arguments to create a CloudDeliveryOrder.
     * @example
     * // Create one CloudDeliveryOrder
     * const CloudDeliveryOrder = await prisma.cloudDeliveryOrder.create({
     *   data: {
     *     // ... data to create a CloudDeliveryOrder
     *   }
     * })
     * 
     */
    create<T extends CloudDeliveryOrderCreateArgs>(args: SelectSubset<T, CloudDeliveryOrderCreateArgs<ExtArgs>>): Prisma__CloudDeliveryOrderClient<$Result.GetResult<Prisma.$CloudDeliveryOrderPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CloudDeliveryOrders.
     * @param {CloudDeliveryOrderCreateManyArgs} args - Arguments to create many CloudDeliveryOrders.
     * @example
     * // Create many CloudDeliveryOrders
     * const cloudDeliveryOrder = await prisma.cloudDeliveryOrder.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CloudDeliveryOrderCreateManyArgs>(args?: SelectSubset<T, CloudDeliveryOrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CloudDeliveryOrders and returns the data saved in the database.
     * @param {CloudDeliveryOrderCreateManyAndReturnArgs} args - Arguments to create many CloudDeliveryOrders.
     * @example
     * // Create many CloudDeliveryOrders
     * const cloudDeliveryOrder = await prisma.cloudDeliveryOrder.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CloudDeliveryOrders and only return the `id`
     * const cloudDeliveryOrderWithIdOnly = await prisma.cloudDeliveryOrder.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CloudDeliveryOrderCreateManyAndReturnArgs>(args?: SelectSubset<T, CloudDeliveryOrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudDeliveryOrderPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CloudDeliveryOrder.
     * @param {CloudDeliveryOrderDeleteArgs} args - Arguments to delete one CloudDeliveryOrder.
     * @example
     * // Delete one CloudDeliveryOrder
     * const CloudDeliveryOrder = await prisma.cloudDeliveryOrder.delete({
     *   where: {
     *     // ... filter to delete one CloudDeliveryOrder
     *   }
     * })
     * 
     */
    delete<T extends CloudDeliveryOrderDeleteArgs>(args: SelectSubset<T, CloudDeliveryOrderDeleteArgs<ExtArgs>>): Prisma__CloudDeliveryOrderClient<$Result.GetResult<Prisma.$CloudDeliveryOrderPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CloudDeliveryOrder.
     * @param {CloudDeliveryOrderUpdateArgs} args - Arguments to update one CloudDeliveryOrder.
     * @example
     * // Update one CloudDeliveryOrder
     * const cloudDeliveryOrder = await prisma.cloudDeliveryOrder.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CloudDeliveryOrderUpdateArgs>(args: SelectSubset<T, CloudDeliveryOrderUpdateArgs<ExtArgs>>): Prisma__CloudDeliveryOrderClient<$Result.GetResult<Prisma.$CloudDeliveryOrderPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CloudDeliveryOrders.
     * @param {CloudDeliveryOrderDeleteManyArgs} args - Arguments to filter CloudDeliveryOrders to delete.
     * @example
     * // Delete a few CloudDeliveryOrders
     * const { count } = await prisma.cloudDeliveryOrder.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CloudDeliveryOrderDeleteManyArgs>(args?: SelectSubset<T, CloudDeliveryOrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CloudDeliveryOrders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudDeliveryOrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CloudDeliveryOrders
     * const cloudDeliveryOrder = await prisma.cloudDeliveryOrder.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CloudDeliveryOrderUpdateManyArgs>(args: SelectSubset<T, CloudDeliveryOrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CloudDeliveryOrder.
     * @param {CloudDeliveryOrderUpsertArgs} args - Arguments to update or create a CloudDeliveryOrder.
     * @example
     * // Update or create a CloudDeliveryOrder
     * const cloudDeliveryOrder = await prisma.cloudDeliveryOrder.upsert({
     *   create: {
     *     // ... data to create a CloudDeliveryOrder
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CloudDeliveryOrder we want to update
     *   }
     * })
     */
    upsert<T extends CloudDeliveryOrderUpsertArgs>(args: SelectSubset<T, CloudDeliveryOrderUpsertArgs<ExtArgs>>): Prisma__CloudDeliveryOrderClient<$Result.GetResult<Prisma.$CloudDeliveryOrderPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CloudDeliveryOrders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudDeliveryOrderCountArgs} args - Arguments to filter CloudDeliveryOrders to count.
     * @example
     * // Count the number of CloudDeliveryOrders
     * const count = await prisma.cloudDeliveryOrder.count({
     *   where: {
     *     // ... the filter for the CloudDeliveryOrders we want to count
     *   }
     * })
    **/
    count<T extends CloudDeliveryOrderCountArgs>(
      args?: Subset<T, CloudDeliveryOrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CloudDeliveryOrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CloudDeliveryOrder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudDeliveryOrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CloudDeliveryOrderAggregateArgs>(args: Subset<T, CloudDeliveryOrderAggregateArgs>): Prisma.PrismaPromise<GetCloudDeliveryOrderAggregateType<T>>

    /**
     * Group by CloudDeliveryOrder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudDeliveryOrderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CloudDeliveryOrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CloudDeliveryOrderGroupByArgs['orderBy'] }
        : { orderBy?: CloudDeliveryOrderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CloudDeliveryOrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCloudDeliveryOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CloudDeliveryOrder model
   */
  readonly fields: CloudDeliveryOrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CloudDeliveryOrder.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CloudDeliveryOrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CloudDeliveryOrder model
   */ 
  interface CloudDeliveryOrderFieldRefs {
    readonly id: FieldRef<"CloudDeliveryOrder", 'String'>
    readonly orderId: FieldRef<"CloudDeliveryOrder", 'String'>
    readonly branchId: FieldRef<"CloudDeliveryOrder", 'String'>
    readonly status: FieldRef<"CloudDeliveryOrder", 'String'>
    readonly zoneId: FieldRef<"CloudDeliveryOrder", 'String'>
    readonly deliveryFee: FieldRef<"CloudDeliveryOrder", 'Decimal'>
    readonly driverId: FieldRef<"CloudDeliveryOrder", 'String'>
    readonly deliveredAt: FieldRef<"CloudDeliveryOrder", 'DateTime'>
    readonly occurredAt: FieldRef<"CloudDeliveryOrder", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CloudDeliveryOrder findUnique
   */
  export type CloudDeliveryOrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudDeliveryOrder
     */
    select?: CloudDeliveryOrderSelect<ExtArgs> | null
    /**
     * Filter, which CloudDeliveryOrder to fetch.
     */
    where: CloudDeliveryOrderWhereUniqueInput
  }

  /**
   * CloudDeliveryOrder findUniqueOrThrow
   */
  export type CloudDeliveryOrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudDeliveryOrder
     */
    select?: CloudDeliveryOrderSelect<ExtArgs> | null
    /**
     * Filter, which CloudDeliveryOrder to fetch.
     */
    where: CloudDeliveryOrderWhereUniqueInput
  }

  /**
   * CloudDeliveryOrder findFirst
   */
  export type CloudDeliveryOrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudDeliveryOrder
     */
    select?: CloudDeliveryOrderSelect<ExtArgs> | null
    /**
     * Filter, which CloudDeliveryOrder to fetch.
     */
    where?: CloudDeliveryOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudDeliveryOrders to fetch.
     */
    orderBy?: CloudDeliveryOrderOrderByWithRelationInput | CloudDeliveryOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudDeliveryOrders.
     */
    cursor?: CloudDeliveryOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudDeliveryOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudDeliveryOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudDeliveryOrders.
     */
    distinct?: CloudDeliveryOrderScalarFieldEnum | CloudDeliveryOrderScalarFieldEnum[]
  }

  /**
   * CloudDeliveryOrder findFirstOrThrow
   */
  export type CloudDeliveryOrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudDeliveryOrder
     */
    select?: CloudDeliveryOrderSelect<ExtArgs> | null
    /**
     * Filter, which CloudDeliveryOrder to fetch.
     */
    where?: CloudDeliveryOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudDeliveryOrders to fetch.
     */
    orderBy?: CloudDeliveryOrderOrderByWithRelationInput | CloudDeliveryOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudDeliveryOrders.
     */
    cursor?: CloudDeliveryOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudDeliveryOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudDeliveryOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudDeliveryOrders.
     */
    distinct?: CloudDeliveryOrderScalarFieldEnum | CloudDeliveryOrderScalarFieldEnum[]
  }

  /**
   * CloudDeliveryOrder findMany
   */
  export type CloudDeliveryOrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudDeliveryOrder
     */
    select?: CloudDeliveryOrderSelect<ExtArgs> | null
    /**
     * Filter, which CloudDeliveryOrders to fetch.
     */
    where?: CloudDeliveryOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudDeliveryOrders to fetch.
     */
    orderBy?: CloudDeliveryOrderOrderByWithRelationInput | CloudDeliveryOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CloudDeliveryOrders.
     */
    cursor?: CloudDeliveryOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudDeliveryOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudDeliveryOrders.
     */
    skip?: number
    distinct?: CloudDeliveryOrderScalarFieldEnum | CloudDeliveryOrderScalarFieldEnum[]
  }

  /**
   * CloudDeliveryOrder create
   */
  export type CloudDeliveryOrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudDeliveryOrder
     */
    select?: CloudDeliveryOrderSelect<ExtArgs> | null
    /**
     * The data needed to create a CloudDeliveryOrder.
     */
    data: XOR<CloudDeliveryOrderCreateInput, CloudDeliveryOrderUncheckedCreateInput>
  }

  /**
   * CloudDeliveryOrder createMany
   */
  export type CloudDeliveryOrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CloudDeliveryOrders.
     */
    data: CloudDeliveryOrderCreateManyInput | CloudDeliveryOrderCreateManyInput[]
  }

  /**
   * CloudDeliveryOrder createManyAndReturn
   */
  export type CloudDeliveryOrderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudDeliveryOrder
     */
    select?: CloudDeliveryOrderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CloudDeliveryOrders.
     */
    data: CloudDeliveryOrderCreateManyInput | CloudDeliveryOrderCreateManyInput[]
  }

  /**
   * CloudDeliveryOrder update
   */
  export type CloudDeliveryOrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudDeliveryOrder
     */
    select?: CloudDeliveryOrderSelect<ExtArgs> | null
    /**
     * The data needed to update a CloudDeliveryOrder.
     */
    data: XOR<CloudDeliveryOrderUpdateInput, CloudDeliveryOrderUncheckedUpdateInput>
    /**
     * Choose, which CloudDeliveryOrder to update.
     */
    where: CloudDeliveryOrderWhereUniqueInput
  }

  /**
   * CloudDeliveryOrder updateMany
   */
  export type CloudDeliveryOrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CloudDeliveryOrders.
     */
    data: XOR<CloudDeliveryOrderUpdateManyMutationInput, CloudDeliveryOrderUncheckedUpdateManyInput>
    /**
     * Filter which CloudDeliveryOrders to update
     */
    where?: CloudDeliveryOrderWhereInput
  }

  /**
   * CloudDeliveryOrder upsert
   */
  export type CloudDeliveryOrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudDeliveryOrder
     */
    select?: CloudDeliveryOrderSelect<ExtArgs> | null
    /**
     * The filter to search for the CloudDeliveryOrder to update in case it exists.
     */
    where: CloudDeliveryOrderWhereUniqueInput
    /**
     * In case the CloudDeliveryOrder found by the `where` argument doesn't exist, create a new CloudDeliveryOrder with this data.
     */
    create: XOR<CloudDeliveryOrderCreateInput, CloudDeliveryOrderUncheckedCreateInput>
    /**
     * In case the CloudDeliveryOrder was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CloudDeliveryOrderUpdateInput, CloudDeliveryOrderUncheckedUpdateInput>
  }

  /**
   * CloudDeliveryOrder delete
   */
  export type CloudDeliveryOrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudDeliveryOrder
     */
    select?: CloudDeliveryOrderSelect<ExtArgs> | null
    /**
     * Filter which CloudDeliveryOrder to delete.
     */
    where: CloudDeliveryOrderWhereUniqueInput
  }

  /**
   * CloudDeliveryOrder deleteMany
   */
  export type CloudDeliveryOrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudDeliveryOrders to delete
     */
    where?: CloudDeliveryOrderWhereInput
  }

  /**
   * CloudDeliveryOrder without action
   */
  export type CloudDeliveryOrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudDeliveryOrder
     */
    select?: CloudDeliveryOrderSelect<ExtArgs> | null
  }


  /**
   * Model CloudReservation
   */

  export type AggregateCloudReservation = {
    _count: CloudReservationCountAggregateOutputType | null
    _avg: CloudReservationAvgAggregateOutputType | null
    _sum: CloudReservationSumAggregateOutputType | null
    _min: CloudReservationMinAggregateOutputType | null
    _max: CloudReservationMaxAggregateOutputType | null
  }

  export type CloudReservationAvgAggregateOutputType = {
    partySize: number | null
    durationMinutes: number | null
  }

  export type CloudReservationSumAggregateOutputType = {
    partySize: number | null
    durationMinutes: number | null
  }

  export type CloudReservationMinAggregateOutputType = {
    id: string | null
    branchId: string | null
    tableId: string | null
    guestName: string | null
    guestPhone: string | null
    partySize: number | null
    reservedFor: Date | null
    durationMinutes: number | null
    status: string | null
    occurredAt: Date | null
  }

  export type CloudReservationMaxAggregateOutputType = {
    id: string | null
    branchId: string | null
    tableId: string | null
    guestName: string | null
    guestPhone: string | null
    partySize: number | null
    reservedFor: Date | null
    durationMinutes: number | null
    status: string | null
    occurredAt: Date | null
  }

  export type CloudReservationCountAggregateOutputType = {
    id: number
    branchId: number
    tableId: number
    guestName: number
    guestPhone: number
    partySize: number
    reservedFor: number
    durationMinutes: number
    status: number
    occurredAt: number
    _all: number
  }


  export type CloudReservationAvgAggregateInputType = {
    partySize?: true
    durationMinutes?: true
  }

  export type CloudReservationSumAggregateInputType = {
    partySize?: true
    durationMinutes?: true
  }

  export type CloudReservationMinAggregateInputType = {
    id?: true
    branchId?: true
    tableId?: true
    guestName?: true
    guestPhone?: true
    partySize?: true
    reservedFor?: true
    durationMinutes?: true
    status?: true
    occurredAt?: true
  }

  export type CloudReservationMaxAggregateInputType = {
    id?: true
    branchId?: true
    tableId?: true
    guestName?: true
    guestPhone?: true
    partySize?: true
    reservedFor?: true
    durationMinutes?: true
    status?: true
    occurredAt?: true
  }

  export type CloudReservationCountAggregateInputType = {
    id?: true
    branchId?: true
    tableId?: true
    guestName?: true
    guestPhone?: true
    partySize?: true
    reservedFor?: true
    durationMinutes?: true
    status?: true
    occurredAt?: true
    _all?: true
  }

  export type CloudReservationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudReservation to aggregate.
     */
    where?: CloudReservationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudReservations to fetch.
     */
    orderBy?: CloudReservationOrderByWithRelationInput | CloudReservationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CloudReservationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudReservations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudReservations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CloudReservations
    **/
    _count?: true | CloudReservationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CloudReservationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CloudReservationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CloudReservationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CloudReservationMaxAggregateInputType
  }

  export type GetCloudReservationAggregateType<T extends CloudReservationAggregateArgs> = {
        [P in keyof T & keyof AggregateCloudReservation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCloudReservation[P]>
      : GetScalarType<T[P], AggregateCloudReservation[P]>
  }




  export type CloudReservationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CloudReservationWhereInput
    orderBy?: CloudReservationOrderByWithAggregationInput | CloudReservationOrderByWithAggregationInput[]
    by: CloudReservationScalarFieldEnum[] | CloudReservationScalarFieldEnum
    having?: CloudReservationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CloudReservationCountAggregateInputType | true
    _avg?: CloudReservationAvgAggregateInputType
    _sum?: CloudReservationSumAggregateInputType
    _min?: CloudReservationMinAggregateInputType
    _max?: CloudReservationMaxAggregateInputType
  }

  export type CloudReservationGroupByOutputType = {
    id: string
    branchId: string
    tableId: string | null
    guestName: string
    guestPhone: string
    partySize: number
    reservedFor: Date
    durationMinutes: number
    status: string
    occurredAt: Date
    _count: CloudReservationCountAggregateOutputType | null
    _avg: CloudReservationAvgAggregateOutputType | null
    _sum: CloudReservationSumAggregateOutputType | null
    _min: CloudReservationMinAggregateOutputType | null
    _max: CloudReservationMaxAggregateOutputType | null
  }

  type GetCloudReservationGroupByPayload<T extends CloudReservationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CloudReservationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CloudReservationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CloudReservationGroupByOutputType[P]>
            : GetScalarType<T[P], CloudReservationGroupByOutputType[P]>
        }
      >
    >


  export type CloudReservationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    tableId?: boolean
    guestName?: boolean
    guestPhone?: boolean
    partySize?: boolean
    reservedFor?: boolean
    durationMinutes?: boolean
    status?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudReservation"]>

  export type CloudReservationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    tableId?: boolean
    guestName?: boolean
    guestPhone?: boolean
    partySize?: boolean
    reservedFor?: boolean
    durationMinutes?: boolean
    status?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudReservation"]>

  export type CloudReservationSelectScalar = {
    id?: boolean
    branchId?: boolean
    tableId?: boolean
    guestName?: boolean
    guestPhone?: boolean
    partySize?: boolean
    reservedFor?: boolean
    durationMinutes?: boolean
    status?: boolean
    occurredAt?: boolean
  }


  export type $CloudReservationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CloudReservation"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      branchId: string
      tableId: string | null
      guestName: string
      guestPhone: string
      partySize: number
      reservedFor: Date
      durationMinutes: number
      status: string
      occurredAt: Date
    }, ExtArgs["result"]["cloudReservation"]>
    composites: {}
  }

  type CloudReservationGetPayload<S extends boolean | null | undefined | CloudReservationDefaultArgs> = $Result.GetResult<Prisma.$CloudReservationPayload, S>

  type CloudReservationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CloudReservationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CloudReservationCountAggregateInputType | true
    }

  export interface CloudReservationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CloudReservation'], meta: { name: 'CloudReservation' } }
    /**
     * Find zero or one CloudReservation that matches the filter.
     * @param {CloudReservationFindUniqueArgs} args - Arguments to find a CloudReservation
     * @example
     * // Get one CloudReservation
     * const cloudReservation = await prisma.cloudReservation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CloudReservationFindUniqueArgs>(args: SelectSubset<T, CloudReservationFindUniqueArgs<ExtArgs>>): Prisma__CloudReservationClient<$Result.GetResult<Prisma.$CloudReservationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CloudReservation that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CloudReservationFindUniqueOrThrowArgs} args - Arguments to find a CloudReservation
     * @example
     * // Get one CloudReservation
     * const cloudReservation = await prisma.cloudReservation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CloudReservationFindUniqueOrThrowArgs>(args: SelectSubset<T, CloudReservationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CloudReservationClient<$Result.GetResult<Prisma.$CloudReservationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CloudReservation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudReservationFindFirstArgs} args - Arguments to find a CloudReservation
     * @example
     * // Get one CloudReservation
     * const cloudReservation = await prisma.cloudReservation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CloudReservationFindFirstArgs>(args?: SelectSubset<T, CloudReservationFindFirstArgs<ExtArgs>>): Prisma__CloudReservationClient<$Result.GetResult<Prisma.$CloudReservationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CloudReservation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudReservationFindFirstOrThrowArgs} args - Arguments to find a CloudReservation
     * @example
     * // Get one CloudReservation
     * const cloudReservation = await prisma.cloudReservation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CloudReservationFindFirstOrThrowArgs>(args?: SelectSubset<T, CloudReservationFindFirstOrThrowArgs<ExtArgs>>): Prisma__CloudReservationClient<$Result.GetResult<Prisma.$CloudReservationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CloudReservations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudReservationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CloudReservations
     * const cloudReservations = await prisma.cloudReservation.findMany()
     * 
     * // Get first 10 CloudReservations
     * const cloudReservations = await prisma.cloudReservation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cloudReservationWithIdOnly = await prisma.cloudReservation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CloudReservationFindManyArgs>(args?: SelectSubset<T, CloudReservationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudReservationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CloudReservation.
     * @param {CloudReservationCreateArgs} args - Arguments to create a CloudReservation.
     * @example
     * // Create one CloudReservation
     * const CloudReservation = await prisma.cloudReservation.create({
     *   data: {
     *     // ... data to create a CloudReservation
     *   }
     * })
     * 
     */
    create<T extends CloudReservationCreateArgs>(args: SelectSubset<T, CloudReservationCreateArgs<ExtArgs>>): Prisma__CloudReservationClient<$Result.GetResult<Prisma.$CloudReservationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CloudReservations.
     * @param {CloudReservationCreateManyArgs} args - Arguments to create many CloudReservations.
     * @example
     * // Create many CloudReservations
     * const cloudReservation = await prisma.cloudReservation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CloudReservationCreateManyArgs>(args?: SelectSubset<T, CloudReservationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CloudReservations and returns the data saved in the database.
     * @param {CloudReservationCreateManyAndReturnArgs} args - Arguments to create many CloudReservations.
     * @example
     * // Create many CloudReservations
     * const cloudReservation = await prisma.cloudReservation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CloudReservations and only return the `id`
     * const cloudReservationWithIdOnly = await prisma.cloudReservation.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CloudReservationCreateManyAndReturnArgs>(args?: SelectSubset<T, CloudReservationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudReservationPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CloudReservation.
     * @param {CloudReservationDeleteArgs} args - Arguments to delete one CloudReservation.
     * @example
     * // Delete one CloudReservation
     * const CloudReservation = await prisma.cloudReservation.delete({
     *   where: {
     *     // ... filter to delete one CloudReservation
     *   }
     * })
     * 
     */
    delete<T extends CloudReservationDeleteArgs>(args: SelectSubset<T, CloudReservationDeleteArgs<ExtArgs>>): Prisma__CloudReservationClient<$Result.GetResult<Prisma.$CloudReservationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CloudReservation.
     * @param {CloudReservationUpdateArgs} args - Arguments to update one CloudReservation.
     * @example
     * // Update one CloudReservation
     * const cloudReservation = await prisma.cloudReservation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CloudReservationUpdateArgs>(args: SelectSubset<T, CloudReservationUpdateArgs<ExtArgs>>): Prisma__CloudReservationClient<$Result.GetResult<Prisma.$CloudReservationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CloudReservations.
     * @param {CloudReservationDeleteManyArgs} args - Arguments to filter CloudReservations to delete.
     * @example
     * // Delete a few CloudReservations
     * const { count } = await prisma.cloudReservation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CloudReservationDeleteManyArgs>(args?: SelectSubset<T, CloudReservationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CloudReservations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudReservationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CloudReservations
     * const cloudReservation = await prisma.cloudReservation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CloudReservationUpdateManyArgs>(args: SelectSubset<T, CloudReservationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CloudReservation.
     * @param {CloudReservationUpsertArgs} args - Arguments to update or create a CloudReservation.
     * @example
     * // Update or create a CloudReservation
     * const cloudReservation = await prisma.cloudReservation.upsert({
     *   create: {
     *     // ... data to create a CloudReservation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CloudReservation we want to update
     *   }
     * })
     */
    upsert<T extends CloudReservationUpsertArgs>(args: SelectSubset<T, CloudReservationUpsertArgs<ExtArgs>>): Prisma__CloudReservationClient<$Result.GetResult<Prisma.$CloudReservationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CloudReservations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudReservationCountArgs} args - Arguments to filter CloudReservations to count.
     * @example
     * // Count the number of CloudReservations
     * const count = await prisma.cloudReservation.count({
     *   where: {
     *     // ... the filter for the CloudReservations we want to count
     *   }
     * })
    **/
    count<T extends CloudReservationCountArgs>(
      args?: Subset<T, CloudReservationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CloudReservationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CloudReservation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudReservationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CloudReservationAggregateArgs>(args: Subset<T, CloudReservationAggregateArgs>): Prisma.PrismaPromise<GetCloudReservationAggregateType<T>>

    /**
     * Group by CloudReservation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudReservationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CloudReservationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CloudReservationGroupByArgs['orderBy'] }
        : { orderBy?: CloudReservationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CloudReservationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCloudReservationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CloudReservation model
   */
  readonly fields: CloudReservationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CloudReservation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CloudReservationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CloudReservation model
   */ 
  interface CloudReservationFieldRefs {
    readonly id: FieldRef<"CloudReservation", 'String'>
    readonly branchId: FieldRef<"CloudReservation", 'String'>
    readonly tableId: FieldRef<"CloudReservation", 'String'>
    readonly guestName: FieldRef<"CloudReservation", 'String'>
    readonly guestPhone: FieldRef<"CloudReservation", 'String'>
    readonly partySize: FieldRef<"CloudReservation", 'Int'>
    readonly reservedFor: FieldRef<"CloudReservation", 'DateTime'>
    readonly durationMinutes: FieldRef<"CloudReservation", 'Int'>
    readonly status: FieldRef<"CloudReservation", 'String'>
    readonly occurredAt: FieldRef<"CloudReservation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CloudReservation findUnique
   */
  export type CloudReservationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudReservation
     */
    select?: CloudReservationSelect<ExtArgs> | null
    /**
     * Filter, which CloudReservation to fetch.
     */
    where: CloudReservationWhereUniqueInput
  }

  /**
   * CloudReservation findUniqueOrThrow
   */
  export type CloudReservationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudReservation
     */
    select?: CloudReservationSelect<ExtArgs> | null
    /**
     * Filter, which CloudReservation to fetch.
     */
    where: CloudReservationWhereUniqueInput
  }

  /**
   * CloudReservation findFirst
   */
  export type CloudReservationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudReservation
     */
    select?: CloudReservationSelect<ExtArgs> | null
    /**
     * Filter, which CloudReservation to fetch.
     */
    where?: CloudReservationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudReservations to fetch.
     */
    orderBy?: CloudReservationOrderByWithRelationInput | CloudReservationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudReservations.
     */
    cursor?: CloudReservationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudReservations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudReservations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudReservations.
     */
    distinct?: CloudReservationScalarFieldEnum | CloudReservationScalarFieldEnum[]
  }

  /**
   * CloudReservation findFirstOrThrow
   */
  export type CloudReservationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudReservation
     */
    select?: CloudReservationSelect<ExtArgs> | null
    /**
     * Filter, which CloudReservation to fetch.
     */
    where?: CloudReservationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudReservations to fetch.
     */
    orderBy?: CloudReservationOrderByWithRelationInput | CloudReservationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudReservations.
     */
    cursor?: CloudReservationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudReservations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudReservations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudReservations.
     */
    distinct?: CloudReservationScalarFieldEnum | CloudReservationScalarFieldEnum[]
  }

  /**
   * CloudReservation findMany
   */
  export type CloudReservationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudReservation
     */
    select?: CloudReservationSelect<ExtArgs> | null
    /**
     * Filter, which CloudReservations to fetch.
     */
    where?: CloudReservationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudReservations to fetch.
     */
    orderBy?: CloudReservationOrderByWithRelationInput | CloudReservationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CloudReservations.
     */
    cursor?: CloudReservationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudReservations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudReservations.
     */
    skip?: number
    distinct?: CloudReservationScalarFieldEnum | CloudReservationScalarFieldEnum[]
  }

  /**
   * CloudReservation create
   */
  export type CloudReservationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudReservation
     */
    select?: CloudReservationSelect<ExtArgs> | null
    /**
     * The data needed to create a CloudReservation.
     */
    data: XOR<CloudReservationCreateInput, CloudReservationUncheckedCreateInput>
  }

  /**
   * CloudReservation createMany
   */
  export type CloudReservationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CloudReservations.
     */
    data: CloudReservationCreateManyInput | CloudReservationCreateManyInput[]
  }

  /**
   * CloudReservation createManyAndReturn
   */
  export type CloudReservationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudReservation
     */
    select?: CloudReservationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CloudReservations.
     */
    data: CloudReservationCreateManyInput | CloudReservationCreateManyInput[]
  }

  /**
   * CloudReservation update
   */
  export type CloudReservationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudReservation
     */
    select?: CloudReservationSelect<ExtArgs> | null
    /**
     * The data needed to update a CloudReservation.
     */
    data: XOR<CloudReservationUpdateInput, CloudReservationUncheckedUpdateInput>
    /**
     * Choose, which CloudReservation to update.
     */
    where: CloudReservationWhereUniqueInput
  }

  /**
   * CloudReservation updateMany
   */
  export type CloudReservationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CloudReservations.
     */
    data: XOR<CloudReservationUpdateManyMutationInput, CloudReservationUncheckedUpdateManyInput>
    /**
     * Filter which CloudReservations to update
     */
    where?: CloudReservationWhereInput
  }

  /**
   * CloudReservation upsert
   */
  export type CloudReservationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudReservation
     */
    select?: CloudReservationSelect<ExtArgs> | null
    /**
     * The filter to search for the CloudReservation to update in case it exists.
     */
    where: CloudReservationWhereUniqueInput
    /**
     * In case the CloudReservation found by the `where` argument doesn't exist, create a new CloudReservation with this data.
     */
    create: XOR<CloudReservationCreateInput, CloudReservationUncheckedCreateInput>
    /**
     * In case the CloudReservation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CloudReservationUpdateInput, CloudReservationUncheckedUpdateInput>
  }

  /**
   * CloudReservation delete
   */
  export type CloudReservationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudReservation
     */
    select?: CloudReservationSelect<ExtArgs> | null
    /**
     * Filter which CloudReservation to delete.
     */
    where: CloudReservationWhereUniqueInput
  }

  /**
   * CloudReservation deleteMany
   */
  export type CloudReservationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudReservations to delete
     */
    where?: CloudReservationWhereInput
  }

  /**
   * CloudReservation without action
   */
  export type CloudReservationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudReservation
     */
    select?: CloudReservationSelect<ExtArgs> | null
  }


  /**
   * Model CloudIngredient
   */

  export type AggregateCloudIngredient = {
    _count: CloudIngredientCountAggregateOutputType | null
    _avg: CloudIngredientAvgAggregateOutputType | null
    _sum: CloudIngredientSumAggregateOutputType | null
    _min: CloudIngredientMinAggregateOutputType | null
    _max: CloudIngredientMaxAggregateOutputType | null
  }

  export type CloudIngredientAvgAggregateOutputType = {
    currentStock: Decimal | null
    lowStockThreshold: Decimal | null
  }

  export type CloudIngredientSumAggregateOutputType = {
    currentStock: Decimal | null
    lowStockThreshold: Decimal | null
  }

  export type CloudIngredientMinAggregateOutputType = {
    id: string | null
    brandId: string | null
    name: string | null
    unit: string | null
    currentStock: Decimal | null
    lowStockThreshold: Decimal | null
    occurredAt: Date | null
  }

  export type CloudIngredientMaxAggregateOutputType = {
    id: string | null
    brandId: string | null
    name: string | null
    unit: string | null
    currentStock: Decimal | null
    lowStockThreshold: Decimal | null
    occurredAt: Date | null
  }

  export type CloudIngredientCountAggregateOutputType = {
    id: number
    brandId: number
    name: number
    unit: number
    currentStock: number
    lowStockThreshold: number
    occurredAt: number
    _all: number
  }


  export type CloudIngredientAvgAggregateInputType = {
    currentStock?: true
    lowStockThreshold?: true
  }

  export type CloudIngredientSumAggregateInputType = {
    currentStock?: true
    lowStockThreshold?: true
  }

  export type CloudIngredientMinAggregateInputType = {
    id?: true
    brandId?: true
    name?: true
    unit?: true
    currentStock?: true
    lowStockThreshold?: true
    occurredAt?: true
  }

  export type CloudIngredientMaxAggregateInputType = {
    id?: true
    brandId?: true
    name?: true
    unit?: true
    currentStock?: true
    lowStockThreshold?: true
    occurredAt?: true
  }

  export type CloudIngredientCountAggregateInputType = {
    id?: true
    brandId?: true
    name?: true
    unit?: true
    currentStock?: true
    lowStockThreshold?: true
    occurredAt?: true
    _all?: true
  }

  export type CloudIngredientAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudIngredient to aggregate.
     */
    where?: CloudIngredientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudIngredients to fetch.
     */
    orderBy?: CloudIngredientOrderByWithRelationInput | CloudIngredientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CloudIngredientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudIngredients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudIngredients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CloudIngredients
    **/
    _count?: true | CloudIngredientCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CloudIngredientAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CloudIngredientSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CloudIngredientMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CloudIngredientMaxAggregateInputType
  }

  export type GetCloudIngredientAggregateType<T extends CloudIngredientAggregateArgs> = {
        [P in keyof T & keyof AggregateCloudIngredient]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCloudIngredient[P]>
      : GetScalarType<T[P], AggregateCloudIngredient[P]>
  }




  export type CloudIngredientGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CloudIngredientWhereInput
    orderBy?: CloudIngredientOrderByWithAggregationInput | CloudIngredientOrderByWithAggregationInput[]
    by: CloudIngredientScalarFieldEnum[] | CloudIngredientScalarFieldEnum
    having?: CloudIngredientScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CloudIngredientCountAggregateInputType | true
    _avg?: CloudIngredientAvgAggregateInputType
    _sum?: CloudIngredientSumAggregateInputType
    _min?: CloudIngredientMinAggregateInputType
    _max?: CloudIngredientMaxAggregateInputType
  }

  export type CloudIngredientGroupByOutputType = {
    id: string
    brandId: string
    name: string
    unit: string
    currentStock: Decimal | null
    lowStockThreshold: Decimal | null
    occurredAt: Date
    _count: CloudIngredientCountAggregateOutputType | null
    _avg: CloudIngredientAvgAggregateOutputType | null
    _sum: CloudIngredientSumAggregateOutputType | null
    _min: CloudIngredientMinAggregateOutputType | null
    _max: CloudIngredientMaxAggregateOutputType | null
  }

  type GetCloudIngredientGroupByPayload<T extends CloudIngredientGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CloudIngredientGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CloudIngredientGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CloudIngredientGroupByOutputType[P]>
            : GetScalarType<T[P], CloudIngredientGroupByOutputType[P]>
        }
      >
    >


  export type CloudIngredientSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    brandId?: boolean
    name?: boolean
    unit?: boolean
    currentStock?: boolean
    lowStockThreshold?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudIngredient"]>

  export type CloudIngredientSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    brandId?: boolean
    name?: boolean
    unit?: boolean
    currentStock?: boolean
    lowStockThreshold?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudIngredient"]>

  export type CloudIngredientSelectScalar = {
    id?: boolean
    brandId?: boolean
    name?: boolean
    unit?: boolean
    currentStock?: boolean
    lowStockThreshold?: boolean
    occurredAt?: boolean
  }


  export type $CloudIngredientPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CloudIngredient"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      brandId: string
      name: string
      unit: string
      currentStock: Prisma.Decimal | null
      lowStockThreshold: Prisma.Decimal | null
      occurredAt: Date
    }, ExtArgs["result"]["cloudIngredient"]>
    composites: {}
  }

  type CloudIngredientGetPayload<S extends boolean | null | undefined | CloudIngredientDefaultArgs> = $Result.GetResult<Prisma.$CloudIngredientPayload, S>

  type CloudIngredientCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CloudIngredientFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CloudIngredientCountAggregateInputType | true
    }

  export interface CloudIngredientDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CloudIngredient'], meta: { name: 'CloudIngredient' } }
    /**
     * Find zero or one CloudIngredient that matches the filter.
     * @param {CloudIngredientFindUniqueArgs} args - Arguments to find a CloudIngredient
     * @example
     * // Get one CloudIngredient
     * const cloudIngredient = await prisma.cloudIngredient.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CloudIngredientFindUniqueArgs>(args: SelectSubset<T, CloudIngredientFindUniqueArgs<ExtArgs>>): Prisma__CloudIngredientClient<$Result.GetResult<Prisma.$CloudIngredientPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CloudIngredient that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CloudIngredientFindUniqueOrThrowArgs} args - Arguments to find a CloudIngredient
     * @example
     * // Get one CloudIngredient
     * const cloudIngredient = await prisma.cloudIngredient.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CloudIngredientFindUniqueOrThrowArgs>(args: SelectSubset<T, CloudIngredientFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CloudIngredientClient<$Result.GetResult<Prisma.$CloudIngredientPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CloudIngredient that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudIngredientFindFirstArgs} args - Arguments to find a CloudIngredient
     * @example
     * // Get one CloudIngredient
     * const cloudIngredient = await prisma.cloudIngredient.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CloudIngredientFindFirstArgs>(args?: SelectSubset<T, CloudIngredientFindFirstArgs<ExtArgs>>): Prisma__CloudIngredientClient<$Result.GetResult<Prisma.$CloudIngredientPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CloudIngredient that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudIngredientFindFirstOrThrowArgs} args - Arguments to find a CloudIngredient
     * @example
     * // Get one CloudIngredient
     * const cloudIngredient = await prisma.cloudIngredient.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CloudIngredientFindFirstOrThrowArgs>(args?: SelectSubset<T, CloudIngredientFindFirstOrThrowArgs<ExtArgs>>): Prisma__CloudIngredientClient<$Result.GetResult<Prisma.$CloudIngredientPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CloudIngredients that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudIngredientFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CloudIngredients
     * const cloudIngredients = await prisma.cloudIngredient.findMany()
     * 
     * // Get first 10 CloudIngredients
     * const cloudIngredients = await prisma.cloudIngredient.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cloudIngredientWithIdOnly = await prisma.cloudIngredient.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CloudIngredientFindManyArgs>(args?: SelectSubset<T, CloudIngredientFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudIngredientPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CloudIngredient.
     * @param {CloudIngredientCreateArgs} args - Arguments to create a CloudIngredient.
     * @example
     * // Create one CloudIngredient
     * const CloudIngredient = await prisma.cloudIngredient.create({
     *   data: {
     *     // ... data to create a CloudIngredient
     *   }
     * })
     * 
     */
    create<T extends CloudIngredientCreateArgs>(args: SelectSubset<T, CloudIngredientCreateArgs<ExtArgs>>): Prisma__CloudIngredientClient<$Result.GetResult<Prisma.$CloudIngredientPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CloudIngredients.
     * @param {CloudIngredientCreateManyArgs} args - Arguments to create many CloudIngredients.
     * @example
     * // Create many CloudIngredients
     * const cloudIngredient = await prisma.cloudIngredient.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CloudIngredientCreateManyArgs>(args?: SelectSubset<T, CloudIngredientCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CloudIngredients and returns the data saved in the database.
     * @param {CloudIngredientCreateManyAndReturnArgs} args - Arguments to create many CloudIngredients.
     * @example
     * // Create many CloudIngredients
     * const cloudIngredient = await prisma.cloudIngredient.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CloudIngredients and only return the `id`
     * const cloudIngredientWithIdOnly = await prisma.cloudIngredient.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CloudIngredientCreateManyAndReturnArgs>(args?: SelectSubset<T, CloudIngredientCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudIngredientPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CloudIngredient.
     * @param {CloudIngredientDeleteArgs} args - Arguments to delete one CloudIngredient.
     * @example
     * // Delete one CloudIngredient
     * const CloudIngredient = await prisma.cloudIngredient.delete({
     *   where: {
     *     // ... filter to delete one CloudIngredient
     *   }
     * })
     * 
     */
    delete<T extends CloudIngredientDeleteArgs>(args: SelectSubset<T, CloudIngredientDeleteArgs<ExtArgs>>): Prisma__CloudIngredientClient<$Result.GetResult<Prisma.$CloudIngredientPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CloudIngredient.
     * @param {CloudIngredientUpdateArgs} args - Arguments to update one CloudIngredient.
     * @example
     * // Update one CloudIngredient
     * const cloudIngredient = await prisma.cloudIngredient.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CloudIngredientUpdateArgs>(args: SelectSubset<T, CloudIngredientUpdateArgs<ExtArgs>>): Prisma__CloudIngredientClient<$Result.GetResult<Prisma.$CloudIngredientPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CloudIngredients.
     * @param {CloudIngredientDeleteManyArgs} args - Arguments to filter CloudIngredients to delete.
     * @example
     * // Delete a few CloudIngredients
     * const { count } = await prisma.cloudIngredient.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CloudIngredientDeleteManyArgs>(args?: SelectSubset<T, CloudIngredientDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CloudIngredients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudIngredientUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CloudIngredients
     * const cloudIngredient = await prisma.cloudIngredient.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CloudIngredientUpdateManyArgs>(args: SelectSubset<T, CloudIngredientUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CloudIngredient.
     * @param {CloudIngredientUpsertArgs} args - Arguments to update or create a CloudIngredient.
     * @example
     * // Update or create a CloudIngredient
     * const cloudIngredient = await prisma.cloudIngredient.upsert({
     *   create: {
     *     // ... data to create a CloudIngredient
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CloudIngredient we want to update
     *   }
     * })
     */
    upsert<T extends CloudIngredientUpsertArgs>(args: SelectSubset<T, CloudIngredientUpsertArgs<ExtArgs>>): Prisma__CloudIngredientClient<$Result.GetResult<Prisma.$CloudIngredientPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CloudIngredients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudIngredientCountArgs} args - Arguments to filter CloudIngredients to count.
     * @example
     * // Count the number of CloudIngredients
     * const count = await prisma.cloudIngredient.count({
     *   where: {
     *     // ... the filter for the CloudIngredients we want to count
     *   }
     * })
    **/
    count<T extends CloudIngredientCountArgs>(
      args?: Subset<T, CloudIngredientCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CloudIngredientCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CloudIngredient.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudIngredientAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CloudIngredientAggregateArgs>(args: Subset<T, CloudIngredientAggregateArgs>): Prisma.PrismaPromise<GetCloudIngredientAggregateType<T>>

    /**
     * Group by CloudIngredient.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudIngredientGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CloudIngredientGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CloudIngredientGroupByArgs['orderBy'] }
        : { orderBy?: CloudIngredientGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CloudIngredientGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCloudIngredientGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CloudIngredient model
   */
  readonly fields: CloudIngredientFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CloudIngredient.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CloudIngredientClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CloudIngredient model
   */ 
  interface CloudIngredientFieldRefs {
    readonly id: FieldRef<"CloudIngredient", 'String'>
    readonly brandId: FieldRef<"CloudIngredient", 'String'>
    readonly name: FieldRef<"CloudIngredient", 'String'>
    readonly unit: FieldRef<"CloudIngredient", 'String'>
    readonly currentStock: FieldRef<"CloudIngredient", 'Decimal'>
    readonly lowStockThreshold: FieldRef<"CloudIngredient", 'Decimal'>
    readonly occurredAt: FieldRef<"CloudIngredient", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CloudIngredient findUnique
   */
  export type CloudIngredientFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudIngredient
     */
    select?: CloudIngredientSelect<ExtArgs> | null
    /**
     * Filter, which CloudIngredient to fetch.
     */
    where: CloudIngredientWhereUniqueInput
  }

  /**
   * CloudIngredient findUniqueOrThrow
   */
  export type CloudIngredientFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudIngredient
     */
    select?: CloudIngredientSelect<ExtArgs> | null
    /**
     * Filter, which CloudIngredient to fetch.
     */
    where: CloudIngredientWhereUniqueInput
  }

  /**
   * CloudIngredient findFirst
   */
  export type CloudIngredientFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudIngredient
     */
    select?: CloudIngredientSelect<ExtArgs> | null
    /**
     * Filter, which CloudIngredient to fetch.
     */
    where?: CloudIngredientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudIngredients to fetch.
     */
    orderBy?: CloudIngredientOrderByWithRelationInput | CloudIngredientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudIngredients.
     */
    cursor?: CloudIngredientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudIngredients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudIngredients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudIngredients.
     */
    distinct?: CloudIngredientScalarFieldEnum | CloudIngredientScalarFieldEnum[]
  }

  /**
   * CloudIngredient findFirstOrThrow
   */
  export type CloudIngredientFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudIngredient
     */
    select?: CloudIngredientSelect<ExtArgs> | null
    /**
     * Filter, which CloudIngredient to fetch.
     */
    where?: CloudIngredientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudIngredients to fetch.
     */
    orderBy?: CloudIngredientOrderByWithRelationInput | CloudIngredientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudIngredients.
     */
    cursor?: CloudIngredientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudIngredients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudIngredients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudIngredients.
     */
    distinct?: CloudIngredientScalarFieldEnum | CloudIngredientScalarFieldEnum[]
  }

  /**
   * CloudIngredient findMany
   */
  export type CloudIngredientFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudIngredient
     */
    select?: CloudIngredientSelect<ExtArgs> | null
    /**
     * Filter, which CloudIngredients to fetch.
     */
    where?: CloudIngredientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudIngredients to fetch.
     */
    orderBy?: CloudIngredientOrderByWithRelationInput | CloudIngredientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CloudIngredients.
     */
    cursor?: CloudIngredientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudIngredients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudIngredients.
     */
    skip?: number
    distinct?: CloudIngredientScalarFieldEnum | CloudIngredientScalarFieldEnum[]
  }

  /**
   * CloudIngredient create
   */
  export type CloudIngredientCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudIngredient
     */
    select?: CloudIngredientSelect<ExtArgs> | null
    /**
     * The data needed to create a CloudIngredient.
     */
    data: XOR<CloudIngredientCreateInput, CloudIngredientUncheckedCreateInput>
  }

  /**
   * CloudIngredient createMany
   */
  export type CloudIngredientCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CloudIngredients.
     */
    data: CloudIngredientCreateManyInput | CloudIngredientCreateManyInput[]
  }

  /**
   * CloudIngredient createManyAndReturn
   */
  export type CloudIngredientCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudIngredient
     */
    select?: CloudIngredientSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CloudIngredients.
     */
    data: CloudIngredientCreateManyInput | CloudIngredientCreateManyInput[]
  }

  /**
   * CloudIngredient update
   */
  export type CloudIngredientUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudIngredient
     */
    select?: CloudIngredientSelect<ExtArgs> | null
    /**
     * The data needed to update a CloudIngredient.
     */
    data: XOR<CloudIngredientUpdateInput, CloudIngredientUncheckedUpdateInput>
    /**
     * Choose, which CloudIngredient to update.
     */
    where: CloudIngredientWhereUniqueInput
  }

  /**
   * CloudIngredient updateMany
   */
  export type CloudIngredientUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CloudIngredients.
     */
    data: XOR<CloudIngredientUpdateManyMutationInput, CloudIngredientUncheckedUpdateManyInput>
    /**
     * Filter which CloudIngredients to update
     */
    where?: CloudIngredientWhereInput
  }

  /**
   * CloudIngredient upsert
   */
  export type CloudIngredientUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudIngredient
     */
    select?: CloudIngredientSelect<ExtArgs> | null
    /**
     * The filter to search for the CloudIngredient to update in case it exists.
     */
    where: CloudIngredientWhereUniqueInput
    /**
     * In case the CloudIngredient found by the `where` argument doesn't exist, create a new CloudIngredient with this data.
     */
    create: XOR<CloudIngredientCreateInput, CloudIngredientUncheckedCreateInput>
    /**
     * In case the CloudIngredient was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CloudIngredientUpdateInput, CloudIngredientUncheckedUpdateInput>
  }

  /**
   * CloudIngredient delete
   */
  export type CloudIngredientDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudIngredient
     */
    select?: CloudIngredientSelect<ExtArgs> | null
    /**
     * Filter which CloudIngredient to delete.
     */
    where: CloudIngredientWhereUniqueInput
  }

  /**
   * CloudIngredient deleteMany
   */
  export type CloudIngredientDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudIngredients to delete
     */
    where?: CloudIngredientWhereInput
  }

  /**
   * CloudIngredient without action
   */
  export type CloudIngredientDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudIngredient
     */
    select?: CloudIngredientSelect<ExtArgs> | null
  }


  /**
   * Model CloudRecipeLine
   */

  export type AggregateCloudRecipeLine = {
    _count: CloudRecipeLineCountAggregateOutputType | null
    _avg: CloudRecipeLineAvgAggregateOutputType | null
    _sum: CloudRecipeLineSumAggregateOutputType | null
    _min: CloudRecipeLineMinAggregateOutputType | null
    _max: CloudRecipeLineMaxAggregateOutputType | null
  }

  export type CloudRecipeLineAvgAggregateOutputType = {
    quantity: Decimal | null
    costPerUnitSnapshot: Decimal | null
  }

  export type CloudRecipeLineSumAggregateOutputType = {
    quantity: Decimal | null
    costPerUnitSnapshot: Decimal | null
  }

  export type CloudRecipeLineMinAggregateOutputType = {
    id: string | null
    productId: string | null
    ingredientId: string | null
    quantity: Decimal | null
    unit: string | null
    costPerUnitSnapshot: Decimal | null
    occurredAt: Date | null
  }

  export type CloudRecipeLineMaxAggregateOutputType = {
    id: string | null
    productId: string | null
    ingredientId: string | null
    quantity: Decimal | null
    unit: string | null
    costPerUnitSnapshot: Decimal | null
    occurredAt: Date | null
  }

  export type CloudRecipeLineCountAggregateOutputType = {
    id: number
    productId: number
    ingredientId: number
    quantity: number
    unit: number
    costPerUnitSnapshot: number
    occurredAt: number
    _all: number
  }


  export type CloudRecipeLineAvgAggregateInputType = {
    quantity?: true
    costPerUnitSnapshot?: true
  }

  export type CloudRecipeLineSumAggregateInputType = {
    quantity?: true
    costPerUnitSnapshot?: true
  }

  export type CloudRecipeLineMinAggregateInputType = {
    id?: true
    productId?: true
    ingredientId?: true
    quantity?: true
    unit?: true
    costPerUnitSnapshot?: true
    occurredAt?: true
  }

  export type CloudRecipeLineMaxAggregateInputType = {
    id?: true
    productId?: true
    ingredientId?: true
    quantity?: true
    unit?: true
    costPerUnitSnapshot?: true
    occurredAt?: true
  }

  export type CloudRecipeLineCountAggregateInputType = {
    id?: true
    productId?: true
    ingredientId?: true
    quantity?: true
    unit?: true
    costPerUnitSnapshot?: true
    occurredAt?: true
    _all?: true
  }

  export type CloudRecipeLineAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudRecipeLine to aggregate.
     */
    where?: CloudRecipeLineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudRecipeLines to fetch.
     */
    orderBy?: CloudRecipeLineOrderByWithRelationInput | CloudRecipeLineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CloudRecipeLineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudRecipeLines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudRecipeLines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CloudRecipeLines
    **/
    _count?: true | CloudRecipeLineCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CloudRecipeLineAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CloudRecipeLineSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CloudRecipeLineMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CloudRecipeLineMaxAggregateInputType
  }

  export type GetCloudRecipeLineAggregateType<T extends CloudRecipeLineAggregateArgs> = {
        [P in keyof T & keyof AggregateCloudRecipeLine]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCloudRecipeLine[P]>
      : GetScalarType<T[P], AggregateCloudRecipeLine[P]>
  }




  export type CloudRecipeLineGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CloudRecipeLineWhereInput
    orderBy?: CloudRecipeLineOrderByWithAggregationInput | CloudRecipeLineOrderByWithAggregationInput[]
    by: CloudRecipeLineScalarFieldEnum[] | CloudRecipeLineScalarFieldEnum
    having?: CloudRecipeLineScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CloudRecipeLineCountAggregateInputType | true
    _avg?: CloudRecipeLineAvgAggregateInputType
    _sum?: CloudRecipeLineSumAggregateInputType
    _min?: CloudRecipeLineMinAggregateInputType
    _max?: CloudRecipeLineMaxAggregateInputType
  }

  export type CloudRecipeLineGroupByOutputType = {
    id: string
    productId: string
    ingredientId: string
    quantity: Decimal
    unit: string
    costPerUnitSnapshot: Decimal | null
    occurredAt: Date
    _count: CloudRecipeLineCountAggregateOutputType | null
    _avg: CloudRecipeLineAvgAggregateOutputType | null
    _sum: CloudRecipeLineSumAggregateOutputType | null
    _min: CloudRecipeLineMinAggregateOutputType | null
    _max: CloudRecipeLineMaxAggregateOutputType | null
  }

  type GetCloudRecipeLineGroupByPayload<T extends CloudRecipeLineGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CloudRecipeLineGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CloudRecipeLineGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CloudRecipeLineGroupByOutputType[P]>
            : GetScalarType<T[P], CloudRecipeLineGroupByOutputType[P]>
        }
      >
    >


  export type CloudRecipeLineSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    ingredientId?: boolean
    quantity?: boolean
    unit?: boolean
    costPerUnitSnapshot?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudRecipeLine"]>

  export type CloudRecipeLineSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    ingredientId?: boolean
    quantity?: boolean
    unit?: boolean
    costPerUnitSnapshot?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudRecipeLine"]>

  export type CloudRecipeLineSelectScalar = {
    id?: boolean
    productId?: boolean
    ingredientId?: boolean
    quantity?: boolean
    unit?: boolean
    costPerUnitSnapshot?: boolean
    occurredAt?: boolean
  }


  export type $CloudRecipeLinePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CloudRecipeLine"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      productId: string
      ingredientId: string
      quantity: Prisma.Decimal
      unit: string
      costPerUnitSnapshot: Prisma.Decimal | null
      occurredAt: Date
    }, ExtArgs["result"]["cloudRecipeLine"]>
    composites: {}
  }

  type CloudRecipeLineGetPayload<S extends boolean | null | undefined | CloudRecipeLineDefaultArgs> = $Result.GetResult<Prisma.$CloudRecipeLinePayload, S>

  type CloudRecipeLineCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CloudRecipeLineFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CloudRecipeLineCountAggregateInputType | true
    }

  export interface CloudRecipeLineDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CloudRecipeLine'], meta: { name: 'CloudRecipeLine' } }
    /**
     * Find zero or one CloudRecipeLine that matches the filter.
     * @param {CloudRecipeLineFindUniqueArgs} args - Arguments to find a CloudRecipeLine
     * @example
     * // Get one CloudRecipeLine
     * const cloudRecipeLine = await prisma.cloudRecipeLine.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CloudRecipeLineFindUniqueArgs>(args: SelectSubset<T, CloudRecipeLineFindUniqueArgs<ExtArgs>>): Prisma__CloudRecipeLineClient<$Result.GetResult<Prisma.$CloudRecipeLinePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CloudRecipeLine that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CloudRecipeLineFindUniqueOrThrowArgs} args - Arguments to find a CloudRecipeLine
     * @example
     * // Get one CloudRecipeLine
     * const cloudRecipeLine = await prisma.cloudRecipeLine.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CloudRecipeLineFindUniqueOrThrowArgs>(args: SelectSubset<T, CloudRecipeLineFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CloudRecipeLineClient<$Result.GetResult<Prisma.$CloudRecipeLinePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CloudRecipeLine that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudRecipeLineFindFirstArgs} args - Arguments to find a CloudRecipeLine
     * @example
     * // Get one CloudRecipeLine
     * const cloudRecipeLine = await prisma.cloudRecipeLine.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CloudRecipeLineFindFirstArgs>(args?: SelectSubset<T, CloudRecipeLineFindFirstArgs<ExtArgs>>): Prisma__CloudRecipeLineClient<$Result.GetResult<Prisma.$CloudRecipeLinePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CloudRecipeLine that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudRecipeLineFindFirstOrThrowArgs} args - Arguments to find a CloudRecipeLine
     * @example
     * // Get one CloudRecipeLine
     * const cloudRecipeLine = await prisma.cloudRecipeLine.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CloudRecipeLineFindFirstOrThrowArgs>(args?: SelectSubset<T, CloudRecipeLineFindFirstOrThrowArgs<ExtArgs>>): Prisma__CloudRecipeLineClient<$Result.GetResult<Prisma.$CloudRecipeLinePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CloudRecipeLines that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudRecipeLineFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CloudRecipeLines
     * const cloudRecipeLines = await prisma.cloudRecipeLine.findMany()
     * 
     * // Get first 10 CloudRecipeLines
     * const cloudRecipeLines = await prisma.cloudRecipeLine.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cloudRecipeLineWithIdOnly = await prisma.cloudRecipeLine.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CloudRecipeLineFindManyArgs>(args?: SelectSubset<T, CloudRecipeLineFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudRecipeLinePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CloudRecipeLine.
     * @param {CloudRecipeLineCreateArgs} args - Arguments to create a CloudRecipeLine.
     * @example
     * // Create one CloudRecipeLine
     * const CloudRecipeLine = await prisma.cloudRecipeLine.create({
     *   data: {
     *     // ... data to create a CloudRecipeLine
     *   }
     * })
     * 
     */
    create<T extends CloudRecipeLineCreateArgs>(args: SelectSubset<T, CloudRecipeLineCreateArgs<ExtArgs>>): Prisma__CloudRecipeLineClient<$Result.GetResult<Prisma.$CloudRecipeLinePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CloudRecipeLines.
     * @param {CloudRecipeLineCreateManyArgs} args - Arguments to create many CloudRecipeLines.
     * @example
     * // Create many CloudRecipeLines
     * const cloudRecipeLine = await prisma.cloudRecipeLine.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CloudRecipeLineCreateManyArgs>(args?: SelectSubset<T, CloudRecipeLineCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CloudRecipeLines and returns the data saved in the database.
     * @param {CloudRecipeLineCreateManyAndReturnArgs} args - Arguments to create many CloudRecipeLines.
     * @example
     * // Create many CloudRecipeLines
     * const cloudRecipeLine = await prisma.cloudRecipeLine.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CloudRecipeLines and only return the `id`
     * const cloudRecipeLineWithIdOnly = await prisma.cloudRecipeLine.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CloudRecipeLineCreateManyAndReturnArgs>(args?: SelectSubset<T, CloudRecipeLineCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudRecipeLinePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CloudRecipeLine.
     * @param {CloudRecipeLineDeleteArgs} args - Arguments to delete one CloudRecipeLine.
     * @example
     * // Delete one CloudRecipeLine
     * const CloudRecipeLine = await prisma.cloudRecipeLine.delete({
     *   where: {
     *     // ... filter to delete one CloudRecipeLine
     *   }
     * })
     * 
     */
    delete<T extends CloudRecipeLineDeleteArgs>(args: SelectSubset<T, CloudRecipeLineDeleteArgs<ExtArgs>>): Prisma__CloudRecipeLineClient<$Result.GetResult<Prisma.$CloudRecipeLinePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CloudRecipeLine.
     * @param {CloudRecipeLineUpdateArgs} args - Arguments to update one CloudRecipeLine.
     * @example
     * // Update one CloudRecipeLine
     * const cloudRecipeLine = await prisma.cloudRecipeLine.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CloudRecipeLineUpdateArgs>(args: SelectSubset<T, CloudRecipeLineUpdateArgs<ExtArgs>>): Prisma__CloudRecipeLineClient<$Result.GetResult<Prisma.$CloudRecipeLinePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CloudRecipeLines.
     * @param {CloudRecipeLineDeleteManyArgs} args - Arguments to filter CloudRecipeLines to delete.
     * @example
     * // Delete a few CloudRecipeLines
     * const { count } = await prisma.cloudRecipeLine.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CloudRecipeLineDeleteManyArgs>(args?: SelectSubset<T, CloudRecipeLineDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CloudRecipeLines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudRecipeLineUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CloudRecipeLines
     * const cloudRecipeLine = await prisma.cloudRecipeLine.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CloudRecipeLineUpdateManyArgs>(args: SelectSubset<T, CloudRecipeLineUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CloudRecipeLine.
     * @param {CloudRecipeLineUpsertArgs} args - Arguments to update or create a CloudRecipeLine.
     * @example
     * // Update or create a CloudRecipeLine
     * const cloudRecipeLine = await prisma.cloudRecipeLine.upsert({
     *   create: {
     *     // ... data to create a CloudRecipeLine
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CloudRecipeLine we want to update
     *   }
     * })
     */
    upsert<T extends CloudRecipeLineUpsertArgs>(args: SelectSubset<T, CloudRecipeLineUpsertArgs<ExtArgs>>): Prisma__CloudRecipeLineClient<$Result.GetResult<Prisma.$CloudRecipeLinePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CloudRecipeLines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudRecipeLineCountArgs} args - Arguments to filter CloudRecipeLines to count.
     * @example
     * // Count the number of CloudRecipeLines
     * const count = await prisma.cloudRecipeLine.count({
     *   where: {
     *     // ... the filter for the CloudRecipeLines we want to count
     *   }
     * })
    **/
    count<T extends CloudRecipeLineCountArgs>(
      args?: Subset<T, CloudRecipeLineCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CloudRecipeLineCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CloudRecipeLine.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudRecipeLineAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CloudRecipeLineAggregateArgs>(args: Subset<T, CloudRecipeLineAggregateArgs>): Prisma.PrismaPromise<GetCloudRecipeLineAggregateType<T>>

    /**
     * Group by CloudRecipeLine.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudRecipeLineGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CloudRecipeLineGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CloudRecipeLineGroupByArgs['orderBy'] }
        : { orderBy?: CloudRecipeLineGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CloudRecipeLineGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCloudRecipeLineGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CloudRecipeLine model
   */
  readonly fields: CloudRecipeLineFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CloudRecipeLine.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CloudRecipeLineClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CloudRecipeLine model
   */ 
  interface CloudRecipeLineFieldRefs {
    readonly id: FieldRef<"CloudRecipeLine", 'String'>
    readonly productId: FieldRef<"CloudRecipeLine", 'String'>
    readonly ingredientId: FieldRef<"CloudRecipeLine", 'String'>
    readonly quantity: FieldRef<"CloudRecipeLine", 'Decimal'>
    readonly unit: FieldRef<"CloudRecipeLine", 'String'>
    readonly costPerUnitSnapshot: FieldRef<"CloudRecipeLine", 'Decimal'>
    readonly occurredAt: FieldRef<"CloudRecipeLine", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CloudRecipeLine findUnique
   */
  export type CloudRecipeLineFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRecipeLine
     */
    select?: CloudRecipeLineSelect<ExtArgs> | null
    /**
     * Filter, which CloudRecipeLine to fetch.
     */
    where: CloudRecipeLineWhereUniqueInput
  }

  /**
   * CloudRecipeLine findUniqueOrThrow
   */
  export type CloudRecipeLineFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRecipeLine
     */
    select?: CloudRecipeLineSelect<ExtArgs> | null
    /**
     * Filter, which CloudRecipeLine to fetch.
     */
    where: CloudRecipeLineWhereUniqueInput
  }

  /**
   * CloudRecipeLine findFirst
   */
  export type CloudRecipeLineFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRecipeLine
     */
    select?: CloudRecipeLineSelect<ExtArgs> | null
    /**
     * Filter, which CloudRecipeLine to fetch.
     */
    where?: CloudRecipeLineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudRecipeLines to fetch.
     */
    orderBy?: CloudRecipeLineOrderByWithRelationInput | CloudRecipeLineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudRecipeLines.
     */
    cursor?: CloudRecipeLineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudRecipeLines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudRecipeLines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudRecipeLines.
     */
    distinct?: CloudRecipeLineScalarFieldEnum | CloudRecipeLineScalarFieldEnum[]
  }

  /**
   * CloudRecipeLine findFirstOrThrow
   */
  export type CloudRecipeLineFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRecipeLine
     */
    select?: CloudRecipeLineSelect<ExtArgs> | null
    /**
     * Filter, which CloudRecipeLine to fetch.
     */
    where?: CloudRecipeLineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudRecipeLines to fetch.
     */
    orderBy?: CloudRecipeLineOrderByWithRelationInput | CloudRecipeLineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudRecipeLines.
     */
    cursor?: CloudRecipeLineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudRecipeLines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudRecipeLines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudRecipeLines.
     */
    distinct?: CloudRecipeLineScalarFieldEnum | CloudRecipeLineScalarFieldEnum[]
  }

  /**
   * CloudRecipeLine findMany
   */
  export type CloudRecipeLineFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRecipeLine
     */
    select?: CloudRecipeLineSelect<ExtArgs> | null
    /**
     * Filter, which CloudRecipeLines to fetch.
     */
    where?: CloudRecipeLineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudRecipeLines to fetch.
     */
    orderBy?: CloudRecipeLineOrderByWithRelationInput | CloudRecipeLineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CloudRecipeLines.
     */
    cursor?: CloudRecipeLineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudRecipeLines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudRecipeLines.
     */
    skip?: number
    distinct?: CloudRecipeLineScalarFieldEnum | CloudRecipeLineScalarFieldEnum[]
  }

  /**
   * CloudRecipeLine create
   */
  export type CloudRecipeLineCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRecipeLine
     */
    select?: CloudRecipeLineSelect<ExtArgs> | null
    /**
     * The data needed to create a CloudRecipeLine.
     */
    data: XOR<CloudRecipeLineCreateInput, CloudRecipeLineUncheckedCreateInput>
  }

  /**
   * CloudRecipeLine createMany
   */
  export type CloudRecipeLineCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CloudRecipeLines.
     */
    data: CloudRecipeLineCreateManyInput | CloudRecipeLineCreateManyInput[]
  }

  /**
   * CloudRecipeLine createManyAndReturn
   */
  export type CloudRecipeLineCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRecipeLine
     */
    select?: CloudRecipeLineSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CloudRecipeLines.
     */
    data: CloudRecipeLineCreateManyInput | CloudRecipeLineCreateManyInput[]
  }

  /**
   * CloudRecipeLine update
   */
  export type CloudRecipeLineUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRecipeLine
     */
    select?: CloudRecipeLineSelect<ExtArgs> | null
    /**
     * The data needed to update a CloudRecipeLine.
     */
    data: XOR<CloudRecipeLineUpdateInput, CloudRecipeLineUncheckedUpdateInput>
    /**
     * Choose, which CloudRecipeLine to update.
     */
    where: CloudRecipeLineWhereUniqueInput
  }

  /**
   * CloudRecipeLine updateMany
   */
  export type CloudRecipeLineUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CloudRecipeLines.
     */
    data: XOR<CloudRecipeLineUpdateManyMutationInput, CloudRecipeLineUncheckedUpdateManyInput>
    /**
     * Filter which CloudRecipeLines to update
     */
    where?: CloudRecipeLineWhereInput
  }

  /**
   * CloudRecipeLine upsert
   */
  export type CloudRecipeLineUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRecipeLine
     */
    select?: CloudRecipeLineSelect<ExtArgs> | null
    /**
     * The filter to search for the CloudRecipeLine to update in case it exists.
     */
    where: CloudRecipeLineWhereUniqueInput
    /**
     * In case the CloudRecipeLine found by the `where` argument doesn't exist, create a new CloudRecipeLine with this data.
     */
    create: XOR<CloudRecipeLineCreateInput, CloudRecipeLineUncheckedCreateInput>
    /**
     * In case the CloudRecipeLine was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CloudRecipeLineUpdateInput, CloudRecipeLineUncheckedUpdateInput>
  }

  /**
   * CloudRecipeLine delete
   */
  export type CloudRecipeLineDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRecipeLine
     */
    select?: CloudRecipeLineSelect<ExtArgs> | null
    /**
     * Filter which CloudRecipeLine to delete.
     */
    where: CloudRecipeLineWhereUniqueInput
  }

  /**
   * CloudRecipeLine deleteMany
   */
  export type CloudRecipeLineDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudRecipeLines to delete
     */
    where?: CloudRecipeLineWhereInput
  }

  /**
   * CloudRecipeLine without action
   */
  export type CloudRecipeLineDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudRecipeLine
     */
    select?: CloudRecipeLineSelect<ExtArgs> | null
  }


  /**
   * Model CloudLoyaltyTransaction
   */

  export type AggregateCloudLoyaltyTransaction = {
    _count: CloudLoyaltyTransactionCountAggregateOutputType | null
    _avg: CloudLoyaltyTransactionAvgAggregateOutputType | null
    _sum: CloudLoyaltyTransactionSumAggregateOutputType | null
    _min: CloudLoyaltyTransactionMinAggregateOutputType | null
    _max: CloudLoyaltyTransactionMaxAggregateOutputType | null
  }

  export type CloudLoyaltyTransactionAvgAggregateOutputType = {
    points: number | null
    newBalance: number | null
  }

  export type CloudLoyaltyTransactionSumAggregateOutputType = {
    points: number | null
    newBalance: number | null
  }

  export type CloudLoyaltyTransactionMinAggregateOutputType = {
    id: string | null
    branchId: string | null
    brandId: string | null
    accountId: string | null
    customerId: string | null
    orderId: string | null
    type: string | null
    points: number | null
    newBalance: number | null
    occurredAt: Date | null
  }

  export type CloudLoyaltyTransactionMaxAggregateOutputType = {
    id: string | null
    branchId: string | null
    brandId: string | null
    accountId: string | null
    customerId: string | null
    orderId: string | null
    type: string | null
    points: number | null
    newBalance: number | null
    occurredAt: Date | null
  }

  export type CloudLoyaltyTransactionCountAggregateOutputType = {
    id: number
    branchId: number
    brandId: number
    accountId: number
    customerId: number
    orderId: number
    type: number
    points: number
    newBalance: number
    occurredAt: number
    _all: number
  }


  export type CloudLoyaltyTransactionAvgAggregateInputType = {
    points?: true
    newBalance?: true
  }

  export type CloudLoyaltyTransactionSumAggregateInputType = {
    points?: true
    newBalance?: true
  }

  export type CloudLoyaltyTransactionMinAggregateInputType = {
    id?: true
    branchId?: true
    brandId?: true
    accountId?: true
    customerId?: true
    orderId?: true
    type?: true
    points?: true
    newBalance?: true
    occurredAt?: true
  }

  export type CloudLoyaltyTransactionMaxAggregateInputType = {
    id?: true
    branchId?: true
    brandId?: true
    accountId?: true
    customerId?: true
    orderId?: true
    type?: true
    points?: true
    newBalance?: true
    occurredAt?: true
  }

  export type CloudLoyaltyTransactionCountAggregateInputType = {
    id?: true
    branchId?: true
    brandId?: true
    accountId?: true
    customerId?: true
    orderId?: true
    type?: true
    points?: true
    newBalance?: true
    occurredAt?: true
    _all?: true
  }

  export type CloudLoyaltyTransactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudLoyaltyTransaction to aggregate.
     */
    where?: CloudLoyaltyTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudLoyaltyTransactions to fetch.
     */
    orderBy?: CloudLoyaltyTransactionOrderByWithRelationInput | CloudLoyaltyTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CloudLoyaltyTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudLoyaltyTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudLoyaltyTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CloudLoyaltyTransactions
    **/
    _count?: true | CloudLoyaltyTransactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CloudLoyaltyTransactionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CloudLoyaltyTransactionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CloudLoyaltyTransactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CloudLoyaltyTransactionMaxAggregateInputType
  }

  export type GetCloudLoyaltyTransactionAggregateType<T extends CloudLoyaltyTransactionAggregateArgs> = {
        [P in keyof T & keyof AggregateCloudLoyaltyTransaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCloudLoyaltyTransaction[P]>
      : GetScalarType<T[P], AggregateCloudLoyaltyTransaction[P]>
  }




  export type CloudLoyaltyTransactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CloudLoyaltyTransactionWhereInput
    orderBy?: CloudLoyaltyTransactionOrderByWithAggregationInput | CloudLoyaltyTransactionOrderByWithAggregationInput[]
    by: CloudLoyaltyTransactionScalarFieldEnum[] | CloudLoyaltyTransactionScalarFieldEnum
    having?: CloudLoyaltyTransactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CloudLoyaltyTransactionCountAggregateInputType | true
    _avg?: CloudLoyaltyTransactionAvgAggregateInputType
    _sum?: CloudLoyaltyTransactionSumAggregateInputType
    _min?: CloudLoyaltyTransactionMinAggregateInputType
    _max?: CloudLoyaltyTransactionMaxAggregateInputType
  }

  export type CloudLoyaltyTransactionGroupByOutputType = {
    id: string
    branchId: string
    brandId: string
    accountId: string
    customerId: string
    orderId: string | null
    type: string
    points: number
    newBalance: number
    occurredAt: Date
    _count: CloudLoyaltyTransactionCountAggregateOutputType | null
    _avg: CloudLoyaltyTransactionAvgAggregateOutputType | null
    _sum: CloudLoyaltyTransactionSumAggregateOutputType | null
    _min: CloudLoyaltyTransactionMinAggregateOutputType | null
    _max: CloudLoyaltyTransactionMaxAggregateOutputType | null
  }

  type GetCloudLoyaltyTransactionGroupByPayload<T extends CloudLoyaltyTransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CloudLoyaltyTransactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CloudLoyaltyTransactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CloudLoyaltyTransactionGroupByOutputType[P]>
            : GetScalarType<T[P], CloudLoyaltyTransactionGroupByOutputType[P]>
        }
      >
    >


  export type CloudLoyaltyTransactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    brandId?: boolean
    accountId?: boolean
    customerId?: boolean
    orderId?: boolean
    type?: boolean
    points?: boolean
    newBalance?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudLoyaltyTransaction"]>

  export type CloudLoyaltyTransactionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    branchId?: boolean
    brandId?: boolean
    accountId?: boolean
    customerId?: boolean
    orderId?: boolean
    type?: boolean
    points?: boolean
    newBalance?: boolean
    occurredAt?: boolean
  }, ExtArgs["result"]["cloudLoyaltyTransaction"]>

  export type CloudLoyaltyTransactionSelectScalar = {
    id?: boolean
    branchId?: boolean
    brandId?: boolean
    accountId?: boolean
    customerId?: boolean
    orderId?: boolean
    type?: boolean
    points?: boolean
    newBalance?: boolean
    occurredAt?: boolean
  }


  export type $CloudLoyaltyTransactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CloudLoyaltyTransaction"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      branchId: string
      brandId: string
      accountId: string
      customerId: string
      orderId: string | null
      type: string
      points: number
      newBalance: number
      occurredAt: Date
    }, ExtArgs["result"]["cloudLoyaltyTransaction"]>
    composites: {}
  }

  type CloudLoyaltyTransactionGetPayload<S extends boolean | null | undefined | CloudLoyaltyTransactionDefaultArgs> = $Result.GetResult<Prisma.$CloudLoyaltyTransactionPayload, S>

  type CloudLoyaltyTransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CloudLoyaltyTransactionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CloudLoyaltyTransactionCountAggregateInputType | true
    }

  export interface CloudLoyaltyTransactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CloudLoyaltyTransaction'], meta: { name: 'CloudLoyaltyTransaction' } }
    /**
     * Find zero or one CloudLoyaltyTransaction that matches the filter.
     * @param {CloudLoyaltyTransactionFindUniqueArgs} args - Arguments to find a CloudLoyaltyTransaction
     * @example
     * // Get one CloudLoyaltyTransaction
     * const cloudLoyaltyTransaction = await prisma.cloudLoyaltyTransaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CloudLoyaltyTransactionFindUniqueArgs>(args: SelectSubset<T, CloudLoyaltyTransactionFindUniqueArgs<ExtArgs>>): Prisma__CloudLoyaltyTransactionClient<$Result.GetResult<Prisma.$CloudLoyaltyTransactionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CloudLoyaltyTransaction that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CloudLoyaltyTransactionFindUniqueOrThrowArgs} args - Arguments to find a CloudLoyaltyTransaction
     * @example
     * // Get one CloudLoyaltyTransaction
     * const cloudLoyaltyTransaction = await prisma.cloudLoyaltyTransaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CloudLoyaltyTransactionFindUniqueOrThrowArgs>(args: SelectSubset<T, CloudLoyaltyTransactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CloudLoyaltyTransactionClient<$Result.GetResult<Prisma.$CloudLoyaltyTransactionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CloudLoyaltyTransaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudLoyaltyTransactionFindFirstArgs} args - Arguments to find a CloudLoyaltyTransaction
     * @example
     * // Get one CloudLoyaltyTransaction
     * const cloudLoyaltyTransaction = await prisma.cloudLoyaltyTransaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CloudLoyaltyTransactionFindFirstArgs>(args?: SelectSubset<T, CloudLoyaltyTransactionFindFirstArgs<ExtArgs>>): Prisma__CloudLoyaltyTransactionClient<$Result.GetResult<Prisma.$CloudLoyaltyTransactionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CloudLoyaltyTransaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudLoyaltyTransactionFindFirstOrThrowArgs} args - Arguments to find a CloudLoyaltyTransaction
     * @example
     * // Get one CloudLoyaltyTransaction
     * const cloudLoyaltyTransaction = await prisma.cloudLoyaltyTransaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CloudLoyaltyTransactionFindFirstOrThrowArgs>(args?: SelectSubset<T, CloudLoyaltyTransactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__CloudLoyaltyTransactionClient<$Result.GetResult<Prisma.$CloudLoyaltyTransactionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CloudLoyaltyTransactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudLoyaltyTransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CloudLoyaltyTransactions
     * const cloudLoyaltyTransactions = await prisma.cloudLoyaltyTransaction.findMany()
     * 
     * // Get first 10 CloudLoyaltyTransactions
     * const cloudLoyaltyTransactions = await prisma.cloudLoyaltyTransaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cloudLoyaltyTransactionWithIdOnly = await prisma.cloudLoyaltyTransaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CloudLoyaltyTransactionFindManyArgs>(args?: SelectSubset<T, CloudLoyaltyTransactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudLoyaltyTransactionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CloudLoyaltyTransaction.
     * @param {CloudLoyaltyTransactionCreateArgs} args - Arguments to create a CloudLoyaltyTransaction.
     * @example
     * // Create one CloudLoyaltyTransaction
     * const CloudLoyaltyTransaction = await prisma.cloudLoyaltyTransaction.create({
     *   data: {
     *     // ... data to create a CloudLoyaltyTransaction
     *   }
     * })
     * 
     */
    create<T extends CloudLoyaltyTransactionCreateArgs>(args: SelectSubset<T, CloudLoyaltyTransactionCreateArgs<ExtArgs>>): Prisma__CloudLoyaltyTransactionClient<$Result.GetResult<Prisma.$CloudLoyaltyTransactionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CloudLoyaltyTransactions.
     * @param {CloudLoyaltyTransactionCreateManyArgs} args - Arguments to create many CloudLoyaltyTransactions.
     * @example
     * // Create many CloudLoyaltyTransactions
     * const cloudLoyaltyTransaction = await prisma.cloudLoyaltyTransaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CloudLoyaltyTransactionCreateManyArgs>(args?: SelectSubset<T, CloudLoyaltyTransactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CloudLoyaltyTransactions and returns the data saved in the database.
     * @param {CloudLoyaltyTransactionCreateManyAndReturnArgs} args - Arguments to create many CloudLoyaltyTransactions.
     * @example
     * // Create many CloudLoyaltyTransactions
     * const cloudLoyaltyTransaction = await prisma.cloudLoyaltyTransaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CloudLoyaltyTransactions and only return the `id`
     * const cloudLoyaltyTransactionWithIdOnly = await prisma.cloudLoyaltyTransaction.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CloudLoyaltyTransactionCreateManyAndReturnArgs>(args?: SelectSubset<T, CloudLoyaltyTransactionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CloudLoyaltyTransactionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CloudLoyaltyTransaction.
     * @param {CloudLoyaltyTransactionDeleteArgs} args - Arguments to delete one CloudLoyaltyTransaction.
     * @example
     * // Delete one CloudLoyaltyTransaction
     * const CloudLoyaltyTransaction = await prisma.cloudLoyaltyTransaction.delete({
     *   where: {
     *     // ... filter to delete one CloudLoyaltyTransaction
     *   }
     * })
     * 
     */
    delete<T extends CloudLoyaltyTransactionDeleteArgs>(args: SelectSubset<T, CloudLoyaltyTransactionDeleteArgs<ExtArgs>>): Prisma__CloudLoyaltyTransactionClient<$Result.GetResult<Prisma.$CloudLoyaltyTransactionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CloudLoyaltyTransaction.
     * @param {CloudLoyaltyTransactionUpdateArgs} args - Arguments to update one CloudLoyaltyTransaction.
     * @example
     * // Update one CloudLoyaltyTransaction
     * const cloudLoyaltyTransaction = await prisma.cloudLoyaltyTransaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CloudLoyaltyTransactionUpdateArgs>(args: SelectSubset<T, CloudLoyaltyTransactionUpdateArgs<ExtArgs>>): Prisma__CloudLoyaltyTransactionClient<$Result.GetResult<Prisma.$CloudLoyaltyTransactionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CloudLoyaltyTransactions.
     * @param {CloudLoyaltyTransactionDeleteManyArgs} args - Arguments to filter CloudLoyaltyTransactions to delete.
     * @example
     * // Delete a few CloudLoyaltyTransactions
     * const { count } = await prisma.cloudLoyaltyTransaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CloudLoyaltyTransactionDeleteManyArgs>(args?: SelectSubset<T, CloudLoyaltyTransactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CloudLoyaltyTransactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudLoyaltyTransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CloudLoyaltyTransactions
     * const cloudLoyaltyTransaction = await prisma.cloudLoyaltyTransaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CloudLoyaltyTransactionUpdateManyArgs>(args: SelectSubset<T, CloudLoyaltyTransactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CloudLoyaltyTransaction.
     * @param {CloudLoyaltyTransactionUpsertArgs} args - Arguments to update or create a CloudLoyaltyTransaction.
     * @example
     * // Update or create a CloudLoyaltyTransaction
     * const cloudLoyaltyTransaction = await prisma.cloudLoyaltyTransaction.upsert({
     *   create: {
     *     // ... data to create a CloudLoyaltyTransaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CloudLoyaltyTransaction we want to update
     *   }
     * })
     */
    upsert<T extends CloudLoyaltyTransactionUpsertArgs>(args: SelectSubset<T, CloudLoyaltyTransactionUpsertArgs<ExtArgs>>): Prisma__CloudLoyaltyTransactionClient<$Result.GetResult<Prisma.$CloudLoyaltyTransactionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CloudLoyaltyTransactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudLoyaltyTransactionCountArgs} args - Arguments to filter CloudLoyaltyTransactions to count.
     * @example
     * // Count the number of CloudLoyaltyTransactions
     * const count = await prisma.cloudLoyaltyTransaction.count({
     *   where: {
     *     // ... the filter for the CloudLoyaltyTransactions we want to count
     *   }
     * })
    **/
    count<T extends CloudLoyaltyTransactionCountArgs>(
      args?: Subset<T, CloudLoyaltyTransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CloudLoyaltyTransactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CloudLoyaltyTransaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudLoyaltyTransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CloudLoyaltyTransactionAggregateArgs>(args: Subset<T, CloudLoyaltyTransactionAggregateArgs>): Prisma.PrismaPromise<GetCloudLoyaltyTransactionAggregateType<T>>

    /**
     * Group by CloudLoyaltyTransaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CloudLoyaltyTransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CloudLoyaltyTransactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CloudLoyaltyTransactionGroupByArgs['orderBy'] }
        : { orderBy?: CloudLoyaltyTransactionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CloudLoyaltyTransactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCloudLoyaltyTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CloudLoyaltyTransaction model
   */
  readonly fields: CloudLoyaltyTransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CloudLoyaltyTransaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CloudLoyaltyTransactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CloudLoyaltyTransaction model
   */ 
  interface CloudLoyaltyTransactionFieldRefs {
    readonly id: FieldRef<"CloudLoyaltyTransaction", 'String'>
    readonly branchId: FieldRef<"CloudLoyaltyTransaction", 'String'>
    readonly brandId: FieldRef<"CloudLoyaltyTransaction", 'String'>
    readonly accountId: FieldRef<"CloudLoyaltyTransaction", 'String'>
    readonly customerId: FieldRef<"CloudLoyaltyTransaction", 'String'>
    readonly orderId: FieldRef<"CloudLoyaltyTransaction", 'String'>
    readonly type: FieldRef<"CloudLoyaltyTransaction", 'String'>
    readonly points: FieldRef<"CloudLoyaltyTransaction", 'Int'>
    readonly newBalance: FieldRef<"CloudLoyaltyTransaction", 'Int'>
    readonly occurredAt: FieldRef<"CloudLoyaltyTransaction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CloudLoyaltyTransaction findUnique
   */
  export type CloudLoyaltyTransactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudLoyaltyTransaction
     */
    select?: CloudLoyaltyTransactionSelect<ExtArgs> | null
    /**
     * Filter, which CloudLoyaltyTransaction to fetch.
     */
    where: CloudLoyaltyTransactionWhereUniqueInput
  }

  /**
   * CloudLoyaltyTransaction findUniqueOrThrow
   */
  export type CloudLoyaltyTransactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudLoyaltyTransaction
     */
    select?: CloudLoyaltyTransactionSelect<ExtArgs> | null
    /**
     * Filter, which CloudLoyaltyTransaction to fetch.
     */
    where: CloudLoyaltyTransactionWhereUniqueInput
  }

  /**
   * CloudLoyaltyTransaction findFirst
   */
  export type CloudLoyaltyTransactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudLoyaltyTransaction
     */
    select?: CloudLoyaltyTransactionSelect<ExtArgs> | null
    /**
     * Filter, which CloudLoyaltyTransaction to fetch.
     */
    where?: CloudLoyaltyTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudLoyaltyTransactions to fetch.
     */
    orderBy?: CloudLoyaltyTransactionOrderByWithRelationInput | CloudLoyaltyTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudLoyaltyTransactions.
     */
    cursor?: CloudLoyaltyTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudLoyaltyTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudLoyaltyTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudLoyaltyTransactions.
     */
    distinct?: CloudLoyaltyTransactionScalarFieldEnum | CloudLoyaltyTransactionScalarFieldEnum[]
  }

  /**
   * CloudLoyaltyTransaction findFirstOrThrow
   */
  export type CloudLoyaltyTransactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudLoyaltyTransaction
     */
    select?: CloudLoyaltyTransactionSelect<ExtArgs> | null
    /**
     * Filter, which CloudLoyaltyTransaction to fetch.
     */
    where?: CloudLoyaltyTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudLoyaltyTransactions to fetch.
     */
    orderBy?: CloudLoyaltyTransactionOrderByWithRelationInput | CloudLoyaltyTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CloudLoyaltyTransactions.
     */
    cursor?: CloudLoyaltyTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudLoyaltyTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudLoyaltyTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CloudLoyaltyTransactions.
     */
    distinct?: CloudLoyaltyTransactionScalarFieldEnum | CloudLoyaltyTransactionScalarFieldEnum[]
  }

  /**
   * CloudLoyaltyTransaction findMany
   */
  export type CloudLoyaltyTransactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudLoyaltyTransaction
     */
    select?: CloudLoyaltyTransactionSelect<ExtArgs> | null
    /**
     * Filter, which CloudLoyaltyTransactions to fetch.
     */
    where?: CloudLoyaltyTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CloudLoyaltyTransactions to fetch.
     */
    orderBy?: CloudLoyaltyTransactionOrderByWithRelationInput | CloudLoyaltyTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CloudLoyaltyTransactions.
     */
    cursor?: CloudLoyaltyTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CloudLoyaltyTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CloudLoyaltyTransactions.
     */
    skip?: number
    distinct?: CloudLoyaltyTransactionScalarFieldEnum | CloudLoyaltyTransactionScalarFieldEnum[]
  }

  /**
   * CloudLoyaltyTransaction create
   */
  export type CloudLoyaltyTransactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudLoyaltyTransaction
     */
    select?: CloudLoyaltyTransactionSelect<ExtArgs> | null
    /**
     * The data needed to create a CloudLoyaltyTransaction.
     */
    data: XOR<CloudLoyaltyTransactionCreateInput, CloudLoyaltyTransactionUncheckedCreateInput>
  }

  /**
   * CloudLoyaltyTransaction createMany
   */
  export type CloudLoyaltyTransactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CloudLoyaltyTransactions.
     */
    data: CloudLoyaltyTransactionCreateManyInput | CloudLoyaltyTransactionCreateManyInput[]
  }

  /**
   * CloudLoyaltyTransaction createManyAndReturn
   */
  export type CloudLoyaltyTransactionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudLoyaltyTransaction
     */
    select?: CloudLoyaltyTransactionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CloudLoyaltyTransactions.
     */
    data: CloudLoyaltyTransactionCreateManyInput | CloudLoyaltyTransactionCreateManyInput[]
  }

  /**
   * CloudLoyaltyTransaction update
   */
  export type CloudLoyaltyTransactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudLoyaltyTransaction
     */
    select?: CloudLoyaltyTransactionSelect<ExtArgs> | null
    /**
     * The data needed to update a CloudLoyaltyTransaction.
     */
    data: XOR<CloudLoyaltyTransactionUpdateInput, CloudLoyaltyTransactionUncheckedUpdateInput>
    /**
     * Choose, which CloudLoyaltyTransaction to update.
     */
    where: CloudLoyaltyTransactionWhereUniqueInput
  }

  /**
   * CloudLoyaltyTransaction updateMany
   */
  export type CloudLoyaltyTransactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CloudLoyaltyTransactions.
     */
    data: XOR<CloudLoyaltyTransactionUpdateManyMutationInput, CloudLoyaltyTransactionUncheckedUpdateManyInput>
    /**
     * Filter which CloudLoyaltyTransactions to update
     */
    where?: CloudLoyaltyTransactionWhereInput
  }

  /**
   * CloudLoyaltyTransaction upsert
   */
  export type CloudLoyaltyTransactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudLoyaltyTransaction
     */
    select?: CloudLoyaltyTransactionSelect<ExtArgs> | null
    /**
     * The filter to search for the CloudLoyaltyTransaction to update in case it exists.
     */
    where: CloudLoyaltyTransactionWhereUniqueInput
    /**
     * In case the CloudLoyaltyTransaction found by the `where` argument doesn't exist, create a new CloudLoyaltyTransaction with this data.
     */
    create: XOR<CloudLoyaltyTransactionCreateInput, CloudLoyaltyTransactionUncheckedCreateInput>
    /**
     * In case the CloudLoyaltyTransaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CloudLoyaltyTransactionUpdateInput, CloudLoyaltyTransactionUncheckedUpdateInput>
  }

  /**
   * CloudLoyaltyTransaction delete
   */
  export type CloudLoyaltyTransactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudLoyaltyTransaction
     */
    select?: CloudLoyaltyTransactionSelect<ExtArgs> | null
    /**
     * Filter which CloudLoyaltyTransaction to delete.
     */
    where: CloudLoyaltyTransactionWhereUniqueInput
  }

  /**
   * CloudLoyaltyTransaction deleteMany
   */
  export type CloudLoyaltyTransactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CloudLoyaltyTransactions to delete
     */
    where?: CloudLoyaltyTransactionWhereInput
  }

  /**
   * CloudLoyaltyTransaction without action
   */
  export type CloudLoyaltyTransactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CloudLoyaltyTransaction
     */
    select?: CloudLoyaltyTransactionSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CloudBranchScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    name: 'name',
    brandName: 'brandName',
    apiKeyHash: 'apiKeyHash',
    createdAt: 'createdAt'
  };

  export type CloudBranchScalarFieldEnum = (typeof CloudBranchScalarFieldEnum)[keyof typeof CloudBranchScalarFieldEnum]


  export const SyncedEventScalarFieldEnum: {
    id: 'id',
    branchId: 'branchId',
    aggregateType: 'aggregateType',
    aggregateId: 'aggregateId',
    eventType: 'eventType',
    occurredAt: 'occurredAt',
    appliedAt: 'appliedAt'
  };

  export type SyncedEventScalarFieldEnum = (typeof SyncedEventScalarFieldEnum)[keyof typeof SyncedEventScalarFieldEnum]


  export const CloudOrderScalarFieldEnum: {
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

  export type CloudOrderScalarFieldEnum = (typeof CloudOrderScalarFieldEnum)[keyof typeof CloudOrderScalarFieldEnum]


  export const CloudPaymentScalarFieldEnum: {
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

  export type CloudPaymentScalarFieldEnum = (typeof CloudPaymentScalarFieldEnum)[keyof typeof CloudPaymentScalarFieldEnum]


  export const CloudWaiterRequestScalarFieldEnum: {
    id: 'id',
    branchId: 'branchId',
    type: 'type',
    status: 'status',
    createdAt: 'createdAt',
    completedAt: 'completedAt',
    occurredAt: 'occurredAt'
  };

  export type CloudWaiterRequestScalarFieldEnum = (typeof CloudWaiterRequestScalarFieldEnum)[keyof typeof CloudWaiterRequestScalarFieldEnum]


  export const CloudProductAvailabilityScalarFieldEnum: {
    id: 'id',
    branchId: 'branchId',
    productId: 'productId',
    status: 'status',
    occurredAt: 'occurredAt'
  };

  export type CloudProductAvailabilityScalarFieldEnum = (typeof CloudProductAvailabilityScalarFieldEnum)[keyof typeof CloudProductAvailabilityScalarFieldEnum]


  export const CloudGameSessionScalarFieldEnum: {
    id: 'id',
    branchId: 'branchId',
    status: 'status',
    playerCount: 'playerCount',
    occurredAt: 'occurredAt'
  };

  export type CloudGameSessionScalarFieldEnum = (typeof CloudGameSessionScalarFieldEnum)[keyof typeof CloudGameSessionScalarFieldEnum]


  export const CloudRefundScalarFieldEnum: {
    id: 'id',
    paymentId: 'paymentId',
    branchId: 'branchId',
    amount: 'amount',
    status: 'status',
    occurredAt: 'occurredAt'
  };

  export type CloudRefundScalarFieldEnum = (typeof CloudRefundScalarFieldEnum)[keyof typeof CloudRefundScalarFieldEnum]


  export const CloudShiftScalarFieldEnum: {
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

  export type CloudShiftScalarFieldEnum = (typeof CloudShiftScalarFieldEnum)[keyof typeof CloudShiftScalarFieldEnum]


  export const CloudExpenseScalarFieldEnum: {
    id: 'id',
    branchId: 'branchId',
    shiftId: 'shiftId',
    category: 'category',
    amount: 'amount',
    occurredAt: 'occurredAt'
  };

  export type CloudExpenseScalarFieldEnum = (typeof CloudExpenseScalarFieldEnum)[keyof typeof CloudExpenseScalarFieldEnum]


  export const CloudCashMovementScalarFieldEnum: {
    id: 'id',
    branchId: 'branchId',
    shiftId: 'shiftId',
    type: 'type',
    amount: 'amount',
    occurredAt: 'occurredAt'
  };

  export type CloudCashMovementScalarFieldEnum = (typeof CloudCashMovementScalarFieldEnum)[keyof typeof CloudCashMovementScalarFieldEnum]


  export const CloudDeliveryOrderScalarFieldEnum: {
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

  export type CloudDeliveryOrderScalarFieldEnum = (typeof CloudDeliveryOrderScalarFieldEnum)[keyof typeof CloudDeliveryOrderScalarFieldEnum]


  export const CloudReservationScalarFieldEnum: {
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

  export type CloudReservationScalarFieldEnum = (typeof CloudReservationScalarFieldEnum)[keyof typeof CloudReservationScalarFieldEnum]


  export const CloudIngredientScalarFieldEnum: {
    id: 'id',
    brandId: 'brandId',
    name: 'name',
    unit: 'unit',
    currentStock: 'currentStock',
    lowStockThreshold: 'lowStockThreshold',
    occurredAt: 'occurredAt'
  };

  export type CloudIngredientScalarFieldEnum = (typeof CloudIngredientScalarFieldEnum)[keyof typeof CloudIngredientScalarFieldEnum]


  export const CloudRecipeLineScalarFieldEnum: {
    id: 'id',
    productId: 'productId',
    ingredientId: 'ingredientId',
    quantity: 'quantity',
    unit: 'unit',
    costPerUnitSnapshot: 'costPerUnitSnapshot',
    occurredAt: 'occurredAt'
  };

  export type CloudRecipeLineScalarFieldEnum = (typeof CloudRecipeLineScalarFieldEnum)[keyof typeof CloudRecipeLineScalarFieldEnum]


  export const CloudLoyaltyTransactionScalarFieldEnum: {
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

  export type CloudLoyaltyTransactionScalarFieldEnum = (typeof CloudLoyaltyTransactionScalarFieldEnum)[keyof typeof CloudLoyaltyTransactionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type CloudBranchWhereInput = {
    AND?: CloudBranchWhereInput | CloudBranchWhereInput[]
    OR?: CloudBranchWhereInput[]
    NOT?: CloudBranchWhereInput | CloudBranchWhereInput[]
    id?: StringFilter<"CloudBranch"> | string
    tenantId?: StringFilter<"CloudBranch"> | string
    name?: StringFilter<"CloudBranch"> | string
    brandName?: StringFilter<"CloudBranch"> | string
    apiKeyHash?: StringFilter<"CloudBranch"> | string
    createdAt?: DateTimeFilter<"CloudBranch"> | Date | string
  }

  export type CloudBranchOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    brandName?: SortOrder
    apiKeyHash?: SortOrder
    createdAt?: SortOrder
  }

  export type CloudBranchWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    apiKeyHash?: string
    AND?: CloudBranchWhereInput | CloudBranchWhereInput[]
    OR?: CloudBranchWhereInput[]
    NOT?: CloudBranchWhereInput | CloudBranchWhereInput[]
    tenantId?: StringFilter<"CloudBranch"> | string
    name?: StringFilter<"CloudBranch"> | string
    brandName?: StringFilter<"CloudBranch"> | string
    createdAt?: DateTimeFilter<"CloudBranch"> | Date | string
  }, "id" | "apiKeyHash">

  export type CloudBranchOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    brandName?: SortOrder
    apiKeyHash?: SortOrder
    createdAt?: SortOrder
    _count?: CloudBranchCountOrderByAggregateInput
    _max?: CloudBranchMaxOrderByAggregateInput
    _min?: CloudBranchMinOrderByAggregateInput
  }

  export type CloudBranchScalarWhereWithAggregatesInput = {
    AND?: CloudBranchScalarWhereWithAggregatesInput | CloudBranchScalarWhereWithAggregatesInput[]
    OR?: CloudBranchScalarWhereWithAggregatesInput[]
    NOT?: CloudBranchScalarWhereWithAggregatesInput | CloudBranchScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CloudBranch"> | string
    tenantId?: StringWithAggregatesFilter<"CloudBranch"> | string
    name?: StringWithAggregatesFilter<"CloudBranch"> | string
    brandName?: StringWithAggregatesFilter<"CloudBranch"> | string
    apiKeyHash?: StringWithAggregatesFilter<"CloudBranch"> | string
    createdAt?: DateTimeWithAggregatesFilter<"CloudBranch"> | Date | string
  }

  export type SyncedEventWhereInput = {
    AND?: SyncedEventWhereInput | SyncedEventWhereInput[]
    OR?: SyncedEventWhereInput[]
    NOT?: SyncedEventWhereInput | SyncedEventWhereInput[]
    id?: StringFilter<"SyncedEvent"> | string
    branchId?: StringFilter<"SyncedEvent"> | string
    aggregateType?: StringFilter<"SyncedEvent"> | string
    aggregateId?: StringFilter<"SyncedEvent"> | string
    eventType?: StringFilter<"SyncedEvent"> | string
    occurredAt?: DateTimeFilter<"SyncedEvent"> | Date | string
    appliedAt?: DateTimeFilter<"SyncedEvent"> | Date | string
  }

  export type SyncedEventOrderByWithRelationInput = {
    id?: SortOrder
    branchId?: SortOrder
    aggregateType?: SortOrder
    aggregateId?: SortOrder
    eventType?: SortOrder
    occurredAt?: SortOrder
    appliedAt?: SortOrder
  }

  export type SyncedEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SyncedEventWhereInput | SyncedEventWhereInput[]
    OR?: SyncedEventWhereInput[]
    NOT?: SyncedEventWhereInput | SyncedEventWhereInput[]
    branchId?: StringFilter<"SyncedEvent"> | string
    aggregateType?: StringFilter<"SyncedEvent"> | string
    aggregateId?: StringFilter<"SyncedEvent"> | string
    eventType?: StringFilter<"SyncedEvent"> | string
    occurredAt?: DateTimeFilter<"SyncedEvent"> | Date | string
    appliedAt?: DateTimeFilter<"SyncedEvent"> | Date | string
  }, "id">

  export type SyncedEventOrderByWithAggregationInput = {
    id?: SortOrder
    branchId?: SortOrder
    aggregateType?: SortOrder
    aggregateId?: SortOrder
    eventType?: SortOrder
    occurredAt?: SortOrder
    appliedAt?: SortOrder
    _count?: SyncedEventCountOrderByAggregateInput
    _max?: SyncedEventMaxOrderByAggregateInput
    _min?: SyncedEventMinOrderByAggregateInput
  }

  export type SyncedEventScalarWhereWithAggregatesInput = {
    AND?: SyncedEventScalarWhereWithAggregatesInput | SyncedEventScalarWhereWithAggregatesInput[]
    OR?: SyncedEventScalarWhereWithAggregatesInput[]
    NOT?: SyncedEventScalarWhereWithAggregatesInput | SyncedEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SyncedEvent"> | string
    branchId?: StringWithAggregatesFilter<"SyncedEvent"> | string
    aggregateType?: StringWithAggregatesFilter<"SyncedEvent"> | string
    aggregateId?: StringWithAggregatesFilter<"SyncedEvent"> | string
    eventType?: StringWithAggregatesFilter<"SyncedEvent"> | string
    occurredAt?: DateTimeWithAggregatesFilter<"SyncedEvent"> | Date | string
    appliedAt?: DateTimeWithAggregatesFilter<"SyncedEvent"> | Date | string
  }

  export type CloudOrderWhereInput = {
    AND?: CloudOrderWhereInput | CloudOrderWhereInput[]
    OR?: CloudOrderWhereInput[]
    NOT?: CloudOrderWhereInput | CloudOrderWhereInput[]
    id?: StringFilter<"CloudOrder"> | string
    tenantId?: StringFilter<"CloudOrder"> | string
    branchId?: StringFilter<"CloudOrder"> | string
    type?: StringFilter<"CloudOrder"> | string
    status?: StringFilter<"CloudOrder"> | string
    subtotal?: DecimalFilter<"CloudOrder"> | Decimal | DecimalJsLike | number | string
    discountTotal?: DecimalFilter<"CloudOrder"> | Decimal | DecimalJsLike | number | string
    taxTotal?: DecimalFilter<"CloudOrder"> | Decimal | DecimalJsLike | number | string
    serviceFeeTotal?: DecimalFilter<"CloudOrder"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"CloudOrder"> | Decimal | DecimalJsLike | number | string
    currency?: StringFilter<"CloudOrder"> | string
    occurredAt?: DateTimeFilter<"CloudOrder"> | Date | string
    createdAt?: DateTimeFilter<"CloudOrder"> | Date | string
  }

  export type CloudOrderOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    branchId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    subtotal?: SortOrder
    discountTotal?: SortOrder
    taxTotal?: SortOrder
    serviceFeeTotal?: SortOrder
    total?: SortOrder
    currency?: SortOrder
    occurredAt?: SortOrder
    createdAt?: SortOrder
  }

  export type CloudOrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CloudOrderWhereInput | CloudOrderWhereInput[]
    OR?: CloudOrderWhereInput[]
    NOT?: CloudOrderWhereInput | CloudOrderWhereInput[]
    tenantId?: StringFilter<"CloudOrder"> | string
    branchId?: StringFilter<"CloudOrder"> | string
    type?: StringFilter<"CloudOrder"> | string
    status?: StringFilter<"CloudOrder"> | string
    subtotal?: DecimalFilter<"CloudOrder"> | Decimal | DecimalJsLike | number | string
    discountTotal?: DecimalFilter<"CloudOrder"> | Decimal | DecimalJsLike | number | string
    taxTotal?: DecimalFilter<"CloudOrder"> | Decimal | DecimalJsLike | number | string
    serviceFeeTotal?: DecimalFilter<"CloudOrder"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"CloudOrder"> | Decimal | DecimalJsLike | number | string
    currency?: StringFilter<"CloudOrder"> | string
    occurredAt?: DateTimeFilter<"CloudOrder"> | Date | string
    createdAt?: DateTimeFilter<"CloudOrder"> | Date | string
  }, "id">

  export type CloudOrderOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    branchId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    subtotal?: SortOrder
    discountTotal?: SortOrder
    taxTotal?: SortOrder
    serviceFeeTotal?: SortOrder
    total?: SortOrder
    currency?: SortOrder
    occurredAt?: SortOrder
    createdAt?: SortOrder
    _count?: CloudOrderCountOrderByAggregateInput
    _avg?: CloudOrderAvgOrderByAggregateInput
    _max?: CloudOrderMaxOrderByAggregateInput
    _min?: CloudOrderMinOrderByAggregateInput
    _sum?: CloudOrderSumOrderByAggregateInput
  }

  export type CloudOrderScalarWhereWithAggregatesInput = {
    AND?: CloudOrderScalarWhereWithAggregatesInput | CloudOrderScalarWhereWithAggregatesInput[]
    OR?: CloudOrderScalarWhereWithAggregatesInput[]
    NOT?: CloudOrderScalarWhereWithAggregatesInput | CloudOrderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CloudOrder"> | string
    tenantId?: StringWithAggregatesFilter<"CloudOrder"> | string
    branchId?: StringWithAggregatesFilter<"CloudOrder"> | string
    type?: StringWithAggregatesFilter<"CloudOrder"> | string
    status?: StringWithAggregatesFilter<"CloudOrder"> | string
    subtotal?: DecimalWithAggregatesFilter<"CloudOrder"> | Decimal | DecimalJsLike | number | string
    discountTotal?: DecimalWithAggregatesFilter<"CloudOrder"> | Decimal | DecimalJsLike | number | string
    taxTotal?: DecimalWithAggregatesFilter<"CloudOrder"> | Decimal | DecimalJsLike | number | string
    serviceFeeTotal?: DecimalWithAggregatesFilter<"CloudOrder"> | Decimal | DecimalJsLike | number | string
    total?: DecimalWithAggregatesFilter<"CloudOrder"> | Decimal | DecimalJsLike | number | string
    currency?: StringWithAggregatesFilter<"CloudOrder"> | string
    occurredAt?: DateTimeWithAggregatesFilter<"CloudOrder"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"CloudOrder"> | Date | string
  }

  export type CloudPaymentWhereInput = {
    AND?: CloudPaymentWhereInput | CloudPaymentWhereInput[]
    OR?: CloudPaymentWhereInput[]
    NOT?: CloudPaymentWhereInput | CloudPaymentWhereInput[]
    id?: StringFilter<"CloudPayment"> | string
    orderId?: StringFilter<"CloudPayment"> | string
    branchId?: StringFilter<"CloudPayment"> | string
    method?: StringFilter<"CloudPayment"> | string
    amount?: DecimalFilter<"CloudPayment"> | Decimal | DecimalJsLike | number | string
    tipAmount?: DecimalFilter<"CloudPayment"> | Decimal | DecimalJsLike | number | string
    currency?: StringFilter<"CloudPayment"> | string
    status?: StringFilter<"CloudPayment"> | string
    occurredAt?: DateTimeFilter<"CloudPayment"> | Date | string
    shiftId?: StringNullableFilter<"CloudPayment"> | string | null
  }

  export type CloudPaymentOrderByWithRelationInput = {
    id?: SortOrder
    orderId?: SortOrder
    branchId?: SortOrder
    method?: SortOrder
    amount?: SortOrder
    tipAmount?: SortOrder
    currency?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
    shiftId?: SortOrderInput | SortOrder
  }

  export type CloudPaymentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CloudPaymentWhereInput | CloudPaymentWhereInput[]
    OR?: CloudPaymentWhereInput[]
    NOT?: CloudPaymentWhereInput | CloudPaymentWhereInput[]
    orderId?: StringFilter<"CloudPayment"> | string
    branchId?: StringFilter<"CloudPayment"> | string
    method?: StringFilter<"CloudPayment"> | string
    amount?: DecimalFilter<"CloudPayment"> | Decimal | DecimalJsLike | number | string
    tipAmount?: DecimalFilter<"CloudPayment"> | Decimal | DecimalJsLike | number | string
    currency?: StringFilter<"CloudPayment"> | string
    status?: StringFilter<"CloudPayment"> | string
    occurredAt?: DateTimeFilter<"CloudPayment"> | Date | string
    shiftId?: StringNullableFilter<"CloudPayment"> | string | null
  }, "id">

  export type CloudPaymentOrderByWithAggregationInput = {
    id?: SortOrder
    orderId?: SortOrder
    branchId?: SortOrder
    method?: SortOrder
    amount?: SortOrder
    tipAmount?: SortOrder
    currency?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
    shiftId?: SortOrderInput | SortOrder
    _count?: CloudPaymentCountOrderByAggregateInput
    _avg?: CloudPaymentAvgOrderByAggregateInput
    _max?: CloudPaymentMaxOrderByAggregateInput
    _min?: CloudPaymentMinOrderByAggregateInput
    _sum?: CloudPaymentSumOrderByAggregateInput
  }

  export type CloudPaymentScalarWhereWithAggregatesInput = {
    AND?: CloudPaymentScalarWhereWithAggregatesInput | CloudPaymentScalarWhereWithAggregatesInput[]
    OR?: CloudPaymentScalarWhereWithAggregatesInput[]
    NOT?: CloudPaymentScalarWhereWithAggregatesInput | CloudPaymentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CloudPayment"> | string
    orderId?: StringWithAggregatesFilter<"CloudPayment"> | string
    branchId?: StringWithAggregatesFilter<"CloudPayment"> | string
    method?: StringWithAggregatesFilter<"CloudPayment"> | string
    amount?: DecimalWithAggregatesFilter<"CloudPayment"> | Decimal | DecimalJsLike | number | string
    tipAmount?: DecimalWithAggregatesFilter<"CloudPayment"> | Decimal | DecimalJsLike | number | string
    currency?: StringWithAggregatesFilter<"CloudPayment"> | string
    status?: StringWithAggregatesFilter<"CloudPayment"> | string
    occurredAt?: DateTimeWithAggregatesFilter<"CloudPayment"> | Date | string
    shiftId?: StringNullableWithAggregatesFilter<"CloudPayment"> | string | null
  }

  export type CloudWaiterRequestWhereInput = {
    AND?: CloudWaiterRequestWhereInput | CloudWaiterRequestWhereInput[]
    OR?: CloudWaiterRequestWhereInput[]
    NOT?: CloudWaiterRequestWhereInput | CloudWaiterRequestWhereInput[]
    id?: StringFilter<"CloudWaiterRequest"> | string
    branchId?: StringFilter<"CloudWaiterRequest"> | string
    type?: StringFilter<"CloudWaiterRequest"> | string
    status?: StringFilter<"CloudWaiterRequest"> | string
    createdAt?: DateTimeFilter<"CloudWaiterRequest"> | Date | string
    completedAt?: DateTimeNullableFilter<"CloudWaiterRequest"> | Date | string | null
    occurredAt?: DateTimeFilter<"CloudWaiterRequest"> | Date | string
  }

  export type CloudWaiterRequestOrderByWithRelationInput = {
    id?: SortOrder
    branchId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    occurredAt?: SortOrder
  }

  export type CloudWaiterRequestWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CloudWaiterRequestWhereInput | CloudWaiterRequestWhereInput[]
    OR?: CloudWaiterRequestWhereInput[]
    NOT?: CloudWaiterRequestWhereInput | CloudWaiterRequestWhereInput[]
    branchId?: StringFilter<"CloudWaiterRequest"> | string
    type?: StringFilter<"CloudWaiterRequest"> | string
    status?: StringFilter<"CloudWaiterRequest"> | string
    createdAt?: DateTimeFilter<"CloudWaiterRequest"> | Date | string
    completedAt?: DateTimeNullableFilter<"CloudWaiterRequest"> | Date | string | null
    occurredAt?: DateTimeFilter<"CloudWaiterRequest"> | Date | string
  }, "id">

  export type CloudWaiterRequestOrderByWithAggregationInput = {
    id?: SortOrder
    branchId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    occurredAt?: SortOrder
    _count?: CloudWaiterRequestCountOrderByAggregateInput
    _max?: CloudWaiterRequestMaxOrderByAggregateInput
    _min?: CloudWaiterRequestMinOrderByAggregateInput
  }

  export type CloudWaiterRequestScalarWhereWithAggregatesInput = {
    AND?: CloudWaiterRequestScalarWhereWithAggregatesInput | CloudWaiterRequestScalarWhereWithAggregatesInput[]
    OR?: CloudWaiterRequestScalarWhereWithAggregatesInput[]
    NOT?: CloudWaiterRequestScalarWhereWithAggregatesInput | CloudWaiterRequestScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CloudWaiterRequest"> | string
    branchId?: StringWithAggregatesFilter<"CloudWaiterRequest"> | string
    type?: StringWithAggregatesFilter<"CloudWaiterRequest"> | string
    status?: StringWithAggregatesFilter<"CloudWaiterRequest"> | string
    createdAt?: DateTimeWithAggregatesFilter<"CloudWaiterRequest"> | Date | string
    completedAt?: DateTimeNullableWithAggregatesFilter<"CloudWaiterRequest"> | Date | string | null
    occurredAt?: DateTimeWithAggregatesFilter<"CloudWaiterRequest"> | Date | string
  }

  export type CloudProductAvailabilityWhereInput = {
    AND?: CloudProductAvailabilityWhereInput | CloudProductAvailabilityWhereInput[]
    OR?: CloudProductAvailabilityWhereInput[]
    NOT?: CloudProductAvailabilityWhereInput | CloudProductAvailabilityWhereInput[]
    id?: StringFilter<"CloudProductAvailability"> | string
    branchId?: StringFilter<"CloudProductAvailability"> | string
    productId?: StringFilter<"CloudProductAvailability"> | string
    status?: StringFilter<"CloudProductAvailability"> | string
    occurredAt?: DateTimeFilter<"CloudProductAvailability"> | Date | string
  }

  export type CloudProductAvailabilityOrderByWithRelationInput = {
    id?: SortOrder
    branchId?: SortOrder
    productId?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudProductAvailabilityWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CloudProductAvailabilityWhereInput | CloudProductAvailabilityWhereInput[]
    OR?: CloudProductAvailabilityWhereInput[]
    NOT?: CloudProductAvailabilityWhereInput | CloudProductAvailabilityWhereInput[]
    branchId?: StringFilter<"CloudProductAvailability"> | string
    productId?: StringFilter<"CloudProductAvailability"> | string
    status?: StringFilter<"CloudProductAvailability"> | string
    occurredAt?: DateTimeFilter<"CloudProductAvailability"> | Date | string
  }, "id">

  export type CloudProductAvailabilityOrderByWithAggregationInput = {
    id?: SortOrder
    branchId?: SortOrder
    productId?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
    _count?: CloudProductAvailabilityCountOrderByAggregateInput
    _max?: CloudProductAvailabilityMaxOrderByAggregateInput
    _min?: CloudProductAvailabilityMinOrderByAggregateInput
  }

  export type CloudProductAvailabilityScalarWhereWithAggregatesInput = {
    AND?: CloudProductAvailabilityScalarWhereWithAggregatesInput | CloudProductAvailabilityScalarWhereWithAggregatesInput[]
    OR?: CloudProductAvailabilityScalarWhereWithAggregatesInput[]
    NOT?: CloudProductAvailabilityScalarWhereWithAggregatesInput | CloudProductAvailabilityScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CloudProductAvailability"> | string
    branchId?: StringWithAggregatesFilter<"CloudProductAvailability"> | string
    productId?: StringWithAggregatesFilter<"CloudProductAvailability"> | string
    status?: StringWithAggregatesFilter<"CloudProductAvailability"> | string
    occurredAt?: DateTimeWithAggregatesFilter<"CloudProductAvailability"> | Date | string
  }

  export type CloudGameSessionWhereInput = {
    AND?: CloudGameSessionWhereInput | CloudGameSessionWhereInput[]
    OR?: CloudGameSessionWhereInput[]
    NOT?: CloudGameSessionWhereInput | CloudGameSessionWhereInput[]
    id?: StringFilter<"CloudGameSession"> | string
    branchId?: StringFilter<"CloudGameSession"> | string
    status?: StringFilter<"CloudGameSession"> | string
    playerCount?: IntFilter<"CloudGameSession"> | number
    occurredAt?: DateTimeFilter<"CloudGameSession"> | Date | string
  }

  export type CloudGameSessionOrderByWithRelationInput = {
    id?: SortOrder
    branchId?: SortOrder
    status?: SortOrder
    playerCount?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudGameSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CloudGameSessionWhereInput | CloudGameSessionWhereInput[]
    OR?: CloudGameSessionWhereInput[]
    NOT?: CloudGameSessionWhereInput | CloudGameSessionWhereInput[]
    branchId?: StringFilter<"CloudGameSession"> | string
    status?: StringFilter<"CloudGameSession"> | string
    playerCount?: IntFilter<"CloudGameSession"> | number
    occurredAt?: DateTimeFilter<"CloudGameSession"> | Date | string
  }, "id">

  export type CloudGameSessionOrderByWithAggregationInput = {
    id?: SortOrder
    branchId?: SortOrder
    status?: SortOrder
    playerCount?: SortOrder
    occurredAt?: SortOrder
    _count?: CloudGameSessionCountOrderByAggregateInput
    _avg?: CloudGameSessionAvgOrderByAggregateInput
    _max?: CloudGameSessionMaxOrderByAggregateInput
    _min?: CloudGameSessionMinOrderByAggregateInput
    _sum?: CloudGameSessionSumOrderByAggregateInput
  }

  export type CloudGameSessionScalarWhereWithAggregatesInput = {
    AND?: CloudGameSessionScalarWhereWithAggregatesInput | CloudGameSessionScalarWhereWithAggregatesInput[]
    OR?: CloudGameSessionScalarWhereWithAggregatesInput[]
    NOT?: CloudGameSessionScalarWhereWithAggregatesInput | CloudGameSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CloudGameSession"> | string
    branchId?: StringWithAggregatesFilter<"CloudGameSession"> | string
    status?: StringWithAggregatesFilter<"CloudGameSession"> | string
    playerCount?: IntWithAggregatesFilter<"CloudGameSession"> | number
    occurredAt?: DateTimeWithAggregatesFilter<"CloudGameSession"> | Date | string
  }

  export type CloudRefundWhereInput = {
    AND?: CloudRefundWhereInput | CloudRefundWhereInput[]
    OR?: CloudRefundWhereInput[]
    NOT?: CloudRefundWhereInput | CloudRefundWhereInput[]
    id?: StringFilter<"CloudRefund"> | string
    paymentId?: StringFilter<"CloudRefund"> | string
    branchId?: StringFilter<"CloudRefund"> | string
    amount?: DecimalFilter<"CloudRefund"> | Decimal | DecimalJsLike | number | string
    status?: StringFilter<"CloudRefund"> | string
    occurredAt?: DateTimeFilter<"CloudRefund"> | Date | string
  }

  export type CloudRefundOrderByWithRelationInput = {
    id?: SortOrder
    paymentId?: SortOrder
    branchId?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudRefundWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CloudRefundWhereInput | CloudRefundWhereInput[]
    OR?: CloudRefundWhereInput[]
    NOT?: CloudRefundWhereInput | CloudRefundWhereInput[]
    paymentId?: StringFilter<"CloudRefund"> | string
    branchId?: StringFilter<"CloudRefund"> | string
    amount?: DecimalFilter<"CloudRefund"> | Decimal | DecimalJsLike | number | string
    status?: StringFilter<"CloudRefund"> | string
    occurredAt?: DateTimeFilter<"CloudRefund"> | Date | string
  }, "id">

  export type CloudRefundOrderByWithAggregationInput = {
    id?: SortOrder
    paymentId?: SortOrder
    branchId?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
    _count?: CloudRefundCountOrderByAggregateInput
    _avg?: CloudRefundAvgOrderByAggregateInput
    _max?: CloudRefundMaxOrderByAggregateInput
    _min?: CloudRefundMinOrderByAggregateInput
    _sum?: CloudRefundSumOrderByAggregateInput
  }

  export type CloudRefundScalarWhereWithAggregatesInput = {
    AND?: CloudRefundScalarWhereWithAggregatesInput | CloudRefundScalarWhereWithAggregatesInput[]
    OR?: CloudRefundScalarWhereWithAggregatesInput[]
    NOT?: CloudRefundScalarWhereWithAggregatesInput | CloudRefundScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CloudRefund"> | string
    paymentId?: StringWithAggregatesFilter<"CloudRefund"> | string
    branchId?: StringWithAggregatesFilter<"CloudRefund"> | string
    amount?: DecimalWithAggregatesFilter<"CloudRefund"> | Decimal | DecimalJsLike | number | string
    status?: StringWithAggregatesFilter<"CloudRefund"> | string
    occurredAt?: DateTimeWithAggregatesFilter<"CloudRefund"> | Date | string
  }

  export type CloudShiftWhereInput = {
    AND?: CloudShiftWhereInput | CloudShiftWhereInput[]
    OR?: CloudShiftWhereInput[]
    NOT?: CloudShiftWhereInput | CloudShiftWhereInput[]
    id?: StringFilter<"CloudShift"> | string
    branchId?: StringFilter<"CloudShift"> | string
    status?: StringFilter<"CloudShift"> | string
    openedAt?: DateTimeFilter<"CloudShift"> | Date | string
    closedAt?: DateTimeNullableFilter<"CloudShift"> | Date | string | null
    openingCash?: DecimalFilter<"CloudShift"> | Decimal | DecimalJsLike | number | string
    expectedCash?: DecimalNullableFilter<"CloudShift"> | Decimal | DecimalJsLike | number | string | null
    actualCash?: DecimalNullableFilter<"CloudShift"> | Decimal | DecimalJsLike | number | string | null
    variance?: DecimalNullableFilter<"CloudShift"> | Decimal | DecimalJsLike | number | string | null
    varianceReason?: StringNullableFilter<"CloudShift"> | string | null
    occurredAt?: DateTimeFilter<"CloudShift"> | Date | string
  }

  export type CloudShiftOrderByWithRelationInput = {
    id?: SortOrder
    branchId?: SortOrder
    status?: SortOrder
    openedAt?: SortOrder
    closedAt?: SortOrderInput | SortOrder
    openingCash?: SortOrder
    expectedCash?: SortOrderInput | SortOrder
    actualCash?: SortOrderInput | SortOrder
    variance?: SortOrderInput | SortOrder
    varianceReason?: SortOrderInput | SortOrder
    occurredAt?: SortOrder
  }

  export type CloudShiftWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CloudShiftWhereInput | CloudShiftWhereInput[]
    OR?: CloudShiftWhereInput[]
    NOT?: CloudShiftWhereInput | CloudShiftWhereInput[]
    branchId?: StringFilter<"CloudShift"> | string
    status?: StringFilter<"CloudShift"> | string
    openedAt?: DateTimeFilter<"CloudShift"> | Date | string
    closedAt?: DateTimeNullableFilter<"CloudShift"> | Date | string | null
    openingCash?: DecimalFilter<"CloudShift"> | Decimal | DecimalJsLike | number | string
    expectedCash?: DecimalNullableFilter<"CloudShift"> | Decimal | DecimalJsLike | number | string | null
    actualCash?: DecimalNullableFilter<"CloudShift"> | Decimal | DecimalJsLike | number | string | null
    variance?: DecimalNullableFilter<"CloudShift"> | Decimal | DecimalJsLike | number | string | null
    varianceReason?: StringNullableFilter<"CloudShift"> | string | null
    occurredAt?: DateTimeFilter<"CloudShift"> | Date | string
  }, "id">

  export type CloudShiftOrderByWithAggregationInput = {
    id?: SortOrder
    branchId?: SortOrder
    status?: SortOrder
    openedAt?: SortOrder
    closedAt?: SortOrderInput | SortOrder
    openingCash?: SortOrder
    expectedCash?: SortOrderInput | SortOrder
    actualCash?: SortOrderInput | SortOrder
    variance?: SortOrderInput | SortOrder
    varianceReason?: SortOrderInput | SortOrder
    occurredAt?: SortOrder
    _count?: CloudShiftCountOrderByAggregateInput
    _avg?: CloudShiftAvgOrderByAggregateInput
    _max?: CloudShiftMaxOrderByAggregateInput
    _min?: CloudShiftMinOrderByAggregateInput
    _sum?: CloudShiftSumOrderByAggregateInput
  }

  export type CloudShiftScalarWhereWithAggregatesInput = {
    AND?: CloudShiftScalarWhereWithAggregatesInput | CloudShiftScalarWhereWithAggregatesInput[]
    OR?: CloudShiftScalarWhereWithAggregatesInput[]
    NOT?: CloudShiftScalarWhereWithAggregatesInput | CloudShiftScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CloudShift"> | string
    branchId?: StringWithAggregatesFilter<"CloudShift"> | string
    status?: StringWithAggregatesFilter<"CloudShift"> | string
    openedAt?: DateTimeWithAggregatesFilter<"CloudShift"> | Date | string
    closedAt?: DateTimeNullableWithAggregatesFilter<"CloudShift"> | Date | string | null
    openingCash?: DecimalWithAggregatesFilter<"CloudShift"> | Decimal | DecimalJsLike | number | string
    expectedCash?: DecimalNullableWithAggregatesFilter<"CloudShift"> | Decimal | DecimalJsLike | number | string | null
    actualCash?: DecimalNullableWithAggregatesFilter<"CloudShift"> | Decimal | DecimalJsLike | number | string | null
    variance?: DecimalNullableWithAggregatesFilter<"CloudShift"> | Decimal | DecimalJsLike | number | string | null
    varianceReason?: StringNullableWithAggregatesFilter<"CloudShift"> | string | null
    occurredAt?: DateTimeWithAggregatesFilter<"CloudShift"> | Date | string
  }

  export type CloudExpenseWhereInput = {
    AND?: CloudExpenseWhereInput | CloudExpenseWhereInput[]
    OR?: CloudExpenseWhereInput[]
    NOT?: CloudExpenseWhereInput | CloudExpenseWhereInput[]
    id?: StringFilter<"CloudExpense"> | string
    branchId?: StringFilter<"CloudExpense"> | string
    shiftId?: StringNullableFilter<"CloudExpense"> | string | null
    category?: StringFilter<"CloudExpense"> | string
    amount?: DecimalFilter<"CloudExpense"> | Decimal | DecimalJsLike | number | string
    occurredAt?: DateTimeFilter<"CloudExpense"> | Date | string
  }

  export type CloudExpenseOrderByWithRelationInput = {
    id?: SortOrder
    branchId?: SortOrder
    shiftId?: SortOrderInput | SortOrder
    category?: SortOrder
    amount?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudExpenseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CloudExpenseWhereInput | CloudExpenseWhereInput[]
    OR?: CloudExpenseWhereInput[]
    NOT?: CloudExpenseWhereInput | CloudExpenseWhereInput[]
    branchId?: StringFilter<"CloudExpense"> | string
    shiftId?: StringNullableFilter<"CloudExpense"> | string | null
    category?: StringFilter<"CloudExpense"> | string
    amount?: DecimalFilter<"CloudExpense"> | Decimal | DecimalJsLike | number | string
    occurredAt?: DateTimeFilter<"CloudExpense"> | Date | string
  }, "id">

  export type CloudExpenseOrderByWithAggregationInput = {
    id?: SortOrder
    branchId?: SortOrder
    shiftId?: SortOrderInput | SortOrder
    category?: SortOrder
    amount?: SortOrder
    occurredAt?: SortOrder
    _count?: CloudExpenseCountOrderByAggregateInput
    _avg?: CloudExpenseAvgOrderByAggregateInput
    _max?: CloudExpenseMaxOrderByAggregateInput
    _min?: CloudExpenseMinOrderByAggregateInput
    _sum?: CloudExpenseSumOrderByAggregateInput
  }

  export type CloudExpenseScalarWhereWithAggregatesInput = {
    AND?: CloudExpenseScalarWhereWithAggregatesInput | CloudExpenseScalarWhereWithAggregatesInput[]
    OR?: CloudExpenseScalarWhereWithAggregatesInput[]
    NOT?: CloudExpenseScalarWhereWithAggregatesInput | CloudExpenseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CloudExpense"> | string
    branchId?: StringWithAggregatesFilter<"CloudExpense"> | string
    shiftId?: StringNullableWithAggregatesFilter<"CloudExpense"> | string | null
    category?: StringWithAggregatesFilter<"CloudExpense"> | string
    amount?: DecimalWithAggregatesFilter<"CloudExpense"> | Decimal | DecimalJsLike | number | string
    occurredAt?: DateTimeWithAggregatesFilter<"CloudExpense"> | Date | string
  }

  export type CloudCashMovementWhereInput = {
    AND?: CloudCashMovementWhereInput | CloudCashMovementWhereInput[]
    OR?: CloudCashMovementWhereInput[]
    NOT?: CloudCashMovementWhereInput | CloudCashMovementWhereInput[]
    id?: StringFilter<"CloudCashMovement"> | string
    branchId?: StringFilter<"CloudCashMovement"> | string
    shiftId?: StringFilter<"CloudCashMovement"> | string
    type?: StringFilter<"CloudCashMovement"> | string
    amount?: DecimalFilter<"CloudCashMovement"> | Decimal | DecimalJsLike | number | string
    occurredAt?: DateTimeFilter<"CloudCashMovement"> | Date | string
  }

  export type CloudCashMovementOrderByWithRelationInput = {
    id?: SortOrder
    branchId?: SortOrder
    shiftId?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudCashMovementWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CloudCashMovementWhereInput | CloudCashMovementWhereInput[]
    OR?: CloudCashMovementWhereInput[]
    NOT?: CloudCashMovementWhereInput | CloudCashMovementWhereInput[]
    branchId?: StringFilter<"CloudCashMovement"> | string
    shiftId?: StringFilter<"CloudCashMovement"> | string
    type?: StringFilter<"CloudCashMovement"> | string
    amount?: DecimalFilter<"CloudCashMovement"> | Decimal | DecimalJsLike | number | string
    occurredAt?: DateTimeFilter<"CloudCashMovement"> | Date | string
  }, "id">

  export type CloudCashMovementOrderByWithAggregationInput = {
    id?: SortOrder
    branchId?: SortOrder
    shiftId?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    occurredAt?: SortOrder
    _count?: CloudCashMovementCountOrderByAggregateInput
    _avg?: CloudCashMovementAvgOrderByAggregateInput
    _max?: CloudCashMovementMaxOrderByAggregateInput
    _min?: CloudCashMovementMinOrderByAggregateInput
    _sum?: CloudCashMovementSumOrderByAggregateInput
  }

  export type CloudCashMovementScalarWhereWithAggregatesInput = {
    AND?: CloudCashMovementScalarWhereWithAggregatesInput | CloudCashMovementScalarWhereWithAggregatesInput[]
    OR?: CloudCashMovementScalarWhereWithAggregatesInput[]
    NOT?: CloudCashMovementScalarWhereWithAggregatesInput | CloudCashMovementScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CloudCashMovement"> | string
    branchId?: StringWithAggregatesFilter<"CloudCashMovement"> | string
    shiftId?: StringWithAggregatesFilter<"CloudCashMovement"> | string
    type?: StringWithAggregatesFilter<"CloudCashMovement"> | string
    amount?: DecimalWithAggregatesFilter<"CloudCashMovement"> | Decimal | DecimalJsLike | number | string
    occurredAt?: DateTimeWithAggregatesFilter<"CloudCashMovement"> | Date | string
  }

  export type CloudDeliveryOrderWhereInput = {
    AND?: CloudDeliveryOrderWhereInput | CloudDeliveryOrderWhereInput[]
    OR?: CloudDeliveryOrderWhereInput[]
    NOT?: CloudDeliveryOrderWhereInput | CloudDeliveryOrderWhereInput[]
    id?: StringFilter<"CloudDeliveryOrder"> | string
    orderId?: StringFilter<"CloudDeliveryOrder"> | string
    branchId?: StringFilter<"CloudDeliveryOrder"> | string
    status?: StringFilter<"CloudDeliveryOrder"> | string
    zoneId?: StringNullableFilter<"CloudDeliveryOrder"> | string | null
    deliveryFee?: DecimalFilter<"CloudDeliveryOrder"> | Decimal | DecimalJsLike | number | string
    driverId?: StringNullableFilter<"CloudDeliveryOrder"> | string | null
    deliveredAt?: DateTimeNullableFilter<"CloudDeliveryOrder"> | Date | string | null
    occurredAt?: DateTimeFilter<"CloudDeliveryOrder"> | Date | string
  }

  export type CloudDeliveryOrderOrderByWithRelationInput = {
    id?: SortOrder
    orderId?: SortOrder
    branchId?: SortOrder
    status?: SortOrder
    zoneId?: SortOrderInput | SortOrder
    deliveryFee?: SortOrder
    driverId?: SortOrderInput | SortOrder
    deliveredAt?: SortOrderInput | SortOrder
    occurredAt?: SortOrder
  }

  export type CloudDeliveryOrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CloudDeliveryOrderWhereInput | CloudDeliveryOrderWhereInput[]
    OR?: CloudDeliveryOrderWhereInput[]
    NOT?: CloudDeliveryOrderWhereInput | CloudDeliveryOrderWhereInput[]
    orderId?: StringFilter<"CloudDeliveryOrder"> | string
    branchId?: StringFilter<"CloudDeliveryOrder"> | string
    status?: StringFilter<"CloudDeliveryOrder"> | string
    zoneId?: StringNullableFilter<"CloudDeliveryOrder"> | string | null
    deliveryFee?: DecimalFilter<"CloudDeliveryOrder"> | Decimal | DecimalJsLike | number | string
    driverId?: StringNullableFilter<"CloudDeliveryOrder"> | string | null
    deliveredAt?: DateTimeNullableFilter<"CloudDeliveryOrder"> | Date | string | null
    occurredAt?: DateTimeFilter<"CloudDeliveryOrder"> | Date | string
  }, "id">

  export type CloudDeliveryOrderOrderByWithAggregationInput = {
    id?: SortOrder
    orderId?: SortOrder
    branchId?: SortOrder
    status?: SortOrder
    zoneId?: SortOrderInput | SortOrder
    deliveryFee?: SortOrder
    driverId?: SortOrderInput | SortOrder
    deliveredAt?: SortOrderInput | SortOrder
    occurredAt?: SortOrder
    _count?: CloudDeliveryOrderCountOrderByAggregateInput
    _avg?: CloudDeliveryOrderAvgOrderByAggregateInput
    _max?: CloudDeliveryOrderMaxOrderByAggregateInput
    _min?: CloudDeliveryOrderMinOrderByAggregateInput
    _sum?: CloudDeliveryOrderSumOrderByAggregateInput
  }

  export type CloudDeliveryOrderScalarWhereWithAggregatesInput = {
    AND?: CloudDeliveryOrderScalarWhereWithAggregatesInput | CloudDeliveryOrderScalarWhereWithAggregatesInput[]
    OR?: CloudDeliveryOrderScalarWhereWithAggregatesInput[]
    NOT?: CloudDeliveryOrderScalarWhereWithAggregatesInput | CloudDeliveryOrderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CloudDeliveryOrder"> | string
    orderId?: StringWithAggregatesFilter<"CloudDeliveryOrder"> | string
    branchId?: StringWithAggregatesFilter<"CloudDeliveryOrder"> | string
    status?: StringWithAggregatesFilter<"CloudDeliveryOrder"> | string
    zoneId?: StringNullableWithAggregatesFilter<"CloudDeliveryOrder"> | string | null
    deliveryFee?: DecimalWithAggregatesFilter<"CloudDeliveryOrder"> | Decimal | DecimalJsLike | number | string
    driverId?: StringNullableWithAggregatesFilter<"CloudDeliveryOrder"> | string | null
    deliveredAt?: DateTimeNullableWithAggregatesFilter<"CloudDeliveryOrder"> | Date | string | null
    occurredAt?: DateTimeWithAggregatesFilter<"CloudDeliveryOrder"> | Date | string
  }

  export type CloudReservationWhereInput = {
    AND?: CloudReservationWhereInput | CloudReservationWhereInput[]
    OR?: CloudReservationWhereInput[]
    NOT?: CloudReservationWhereInput | CloudReservationWhereInput[]
    id?: StringFilter<"CloudReservation"> | string
    branchId?: StringFilter<"CloudReservation"> | string
    tableId?: StringNullableFilter<"CloudReservation"> | string | null
    guestName?: StringFilter<"CloudReservation"> | string
    guestPhone?: StringFilter<"CloudReservation"> | string
    partySize?: IntFilter<"CloudReservation"> | number
    reservedFor?: DateTimeFilter<"CloudReservation"> | Date | string
    durationMinutes?: IntFilter<"CloudReservation"> | number
    status?: StringFilter<"CloudReservation"> | string
    occurredAt?: DateTimeFilter<"CloudReservation"> | Date | string
  }

  export type CloudReservationOrderByWithRelationInput = {
    id?: SortOrder
    branchId?: SortOrder
    tableId?: SortOrderInput | SortOrder
    guestName?: SortOrder
    guestPhone?: SortOrder
    partySize?: SortOrder
    reservedFor?: SortOrder
    durationMinutes?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudReservationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CloudReservationWhereInput | CloudReservationWhereInput[]
    OR?: CloudReservationWhereInput[]
    NOT?: CloudReservationWhereInput | CloudReservationWhereInput[]
    branchId?: StringFilter<"CloudReservation"> | string
    tableId?: StringNullableFilter<"CloudReservation"> | string | null
    guestName?: StringFilter<"CloudReservation"> | string
    guestPhone?: StringFilter<"CloudReservation"> | string
    partySize?: IntFilter<"CloudReservation"> | number
    reservedFor?: DateTimeFilter<"CloudReservation"> | Date | string
    durationMinutes?: IntFilter<"CloudReservation"> | number
    status?: StringFilter<"CloudReservation"> | string
    occurredAt?: DateTimeFilter<"CloudReservation"> | Date | string
  }, "id">

  export type CloudReservationOrderByWithAggregationInput = {
    id?: SortOrder
    branchId?: SortOrder
    tableId?: SortOrderInput | SortOrder
    guestName?: SortOrder
    guestPhone?: SortOrder
    partySize?: SortOrder
    reservedFor?: SortOrder
    durationMinutes?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
    _count?: CloudReservationCountOrderByAggregateInput
    _avg?: CloudReservationAvgOrderByAggregateInput
    _max?: CloudReservationMaxOrderByAggregateInput
    _min?: CloudReservationMinOrderByAggregateInput
    _sum?: CloudReservationSumOrderByAggregateInput
  }

  export type CloudReservationScalarWhereWithAggregatesInput = {
    AND?: CloudReservationScalarWhereWithAggregatesInput | CloudReservationScalarWhereWithAggregatesInput[]
    OR?: CloudReservationScalarWhereWithAggregatesInput[]
    NOT?: CloudReservationScalarWhereWithAggregatesInput | CloudReservationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CloudReservation"> | string
    branchId?: StringWithAggregatesFilter<"CloudReservation"> | string
    tableId?: StringNullableWithAggregatesFilter<"CloudReservation"> | string | null
    guestName?: StringWithAggregatesFilter<"CloudReservation"> | string
    guestPhone?: StringWithAggregatesFilter<"CloudReservation"> | string
    partySize?: IntWithAggregatesFilter<"CloudReservation"> | number
    reservedFor?: DateTimeWithAggregatesFilter<"CloudReservation"> | Date | string
    durationMinutes?: IntWithAggregatesFilter<"CloudReservation"> | number
    status?: StringWithAggregatesFilter<"CloudReservation"> | string
    occurredAt?: DateTimeWithAggregatesFilter<"CloudReservation"> | Date | string
  }

  export type CloudIngredientWhereInput = {
    AND?: CloudIngredientWhereInput | CloudIngredientWhereInput[]
    OR?: CloudIngredientWhereInput[]
    NOT?: CloudIngredientWhereInput | CloudIngredientWhereInput[]
    id?: StringFilter<"CloudIngredient"> | string
    brandId?: StringFilter<"CloudIngredient"> | string
    name?: StringFilter<"CloudIngredient"> | string
    unit?: StringFilter<"CloudIngredient"> | string
    currentStock?: DecimalNullableFilter<"CloudIngredient"> | Decimal | DecimalJsLike | number | string | null
    lowStockThreshold?: DecimalNullableFilter<"CloudIngredient"> | Decimal | DecimalJsLike | number | string | null
    occurredAt?: DateTimeFilter<"CloudIngredient"> | Date | string
  }

  export type CloudIngredientOrderByWithRelationInput = {
    id?: SortOrder
    brandId?: SortOrder
    name?: SortOrder
    unit?: SortOrder
    currentStock?: SortOrderInput | SortOrder
    lowStockThreshold?: SortOrderInput | SortOrder
    occurredAt?: SortOrder
  }

  export type CloudIngredientWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CloudIngredientWhereInput | CloudIngredientWhereInput[]
    OR?: CloudIngredientWhereInput[]
    NOT?: CloudIngredientWhereInput | CloudIngredientWhereInput[]
    brandId?: StringFilter<"CloudIngredient"> | string
    name?: StringFilter<"CloudIngredient"> | string
    unit?: StringFilter<"CloudIngredient"> | string
    currentStock?: DecimalNullableFilter<"CloudIngredient"> | Decimal | DecimalJsLike | number | string | null
    lowStockThreshold?: DecimalNullableFilter<"CloudIngredient"> | Decimal | DecimalJsLike | number | string | null
    occurredAt?: DateTimeFilter<"CloudIngredient"> | Date | string
  }, "id">

  export type CloudIngredientOrderByWithAggregationInput = {
    id?: SortOrder
    brandId?: SortOrder
    name?: SortOrder
    unit?: SortOrder
    currentStock?: SortOrderInput | SortOrder
    lowStockThreshold?: SortOrderInput | SortOrder
    occurredAt?: SortOrder
    _count?: CloudIngredientCountOrderByAggregateInput
    _avg?: CloudIngredientAvgOrderByAggregateInput
    _max?: CloudIngredientMaxOrderByAggregateInput
    _min?: CloudIngredientMinOrderByAggregateInput
    _sum?: CloudIngredientSumOrderByAggregateInput
  }

  export type CloudIngredientScalarWhereWithAggregatesInput = {
    AND?: CloudIngredientScalarWhereWithAggregatesInput | CloudIngredientScalarWhereWithAggregatesInput[]
    OR?: CloudIngredientScalarWhereWithAggregatesInput[]
    NOT?: CloudIngredientScalarWhereWithAggregatesInput | CloudIngredientScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CloudIngredient"> | string
    brandId?: StringWithAggregatesFilter<"CloudIngredient"> | string
    name?: StringWithAggregatesFilter<"CloudIngredient"> | string
    unit?: StringWithAggregatesFilter<"CloudIngredient"> | string
    currentStock?: DecimalNullableWithAggregatesFilter<"CloudIngredient"> | Decimal | DecimalJsLike | number | string | null
    lowStockThreshold?: DecimalNullableWithAggregatesFilter<"CloudIngredient"> | Decimal | DecimalJsLike | number | string | null
    occurredAt?: DateTimeWithAggregatesFilter<"CloudIngredient"> | Date | string
  }

  export type CloudRecipeLineWhereInput = {
    AND?: CloudRecipeLineWhereInput | CloudRecipeLineWhereInput[]
    OR?: CloudRecipeLineWhereInput[]
    NOT?: CloudRecipeLineWhereInput | CloudRecipeLineWhereInput[]
    id?: StringFilter<"CloudRecipeLine"> | string
    productId?: StringFilter<"CloudRecipeLine"> | string
    ingredientId?: StringFilter<"CloudRecipeLine"> | string
    quantity?: DecimalFilter<"CloudRecipeLine"> | Decimal | DecimalJsLike | number | string
    unit?: StringFilter<"CloudRecipeLine"> | string
    costPerUnitSnapshot?: DecimalNullableFilter<"CloudRecipeLine"> | Decimal | DecimalJsLike | number | string | null
    occurredAt?: DateTimeFilter<"CloudRecipeLine"> | Date | string
  }

  export type CloudRecipeLineOrderByWithRelationInput = {
    id?: SortOrder
    productId?: SortOrder
    ingredientId?: SortOrder
    quantity?: SortOrder
    unit?: SortOrder
    costPerUnitSnapshot?: SortOrderInput | SortOrder
    occurredAt?: SortOrder
  }

  export type CloudRecipeLineWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CloudRecipeLineWhereInput | CloudRecipeLineWhereInput[]
    OR?: CloudRecipeLineWhereInput[]
    NOT?: CloudRecipeLineWhereInput | CloudRecipeLineWhereInput[]
    productId?: StringFilter<"CloudRecipeLine"> | string
    ingredientId?: StringFilter<"CloudRecipeLine"> | string
    quantity?: DecimalFilter<"CloudRecipeLine"> | Decimal | DecimalJsLike | number | string
    unit?: StringFilter<"CloudRecipeLine"> | string
    costPerUnitSnapshot?: DecimalNullableFilter<"CloudRecipeLine"> | Decimal | DecimalJsLike | number | string | null
    occurredAt?: DateTimeFilter<"CloudRecipeLine"> | Date | string
  }, "id">

  export type CloudRecipeLineOrderByWithAggregationInput = {
    id?: SortOrder
    productId?: SortOrder
    ingredientId?: SortOrder
    quantity?: SortOrder
    unit?: SortOrder
    costPerUnitSnapshot?: SortOrderInput | SortOrder
    occurredAt?: SortOrder
    _count?: CloudRecipeLineCountOrderByAggregateInput
    _avg?: CloudRecipeLineAvgOrderByAggregateInput
    _max?: CloudRecipeLineMaxOrderByAggregateInput
    _min?: CloudRecipeLineMinOrderByAggregateInput
    _sum?: CloudRecipeLineSumOrderByAggregateInput
  }

  export type CloudRecipeLineScalarWhereWithAggregatesInput = {
    AND?: CloudRecipeLineScalarWhereWithAggregatesInput | CloudRecipeLineScalarWhereWithAggregatesInput[]
    OR?: CloudRecipeLineScalarWhereWithAggregatesInput[]
    NOT?: CloudRecipeLineScalarWhereWithAggregatesInput | CloudRecipeLineScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CloudRecipeLine"> | string
    productId?: StringWithAggregatesFilter<"CloudRecipeLine"> | string
    ingredientId?: StringWithAggregatesFilter<"CloudRecipeLine"> | string
    quantity?: DecimalWithAggregatesFilter<"CloudRecipeLine"> | Decimal | DecimalJsLike | number | string
    unit?: StringWithAggregatesFilter<"CloudRecipeLine"> | string
    costPerUnitSnapshot?: DecimalNullableWithAggregatesFilter<"CloudRecipeLine"> | Decimal | DecimalJsLike | number | string | null
    occurredAt?: DateTimeWithAggregatesFilter<"CloudRecipeLine"> | Date | string
  }

  export type CloudLoyaltyTransactionWhereInput = {
    AND?: CloudLoyaltyTransactionWhereInput | CloudLoyaltyTransactionWhereInput[]
    OR?: CloudLoyaltyTransactionWhereInput[]
    NOT?: CloudLoyaltyTransactionWhereInput | CloudLoyaltyTransactionWhereInput[]
    id?: StringFilter<"CloudLoyaltyTransaction"> | string
    branchId?: StringFilter<"CloudLoyaltyTransaction"> | string
    brandId?: StringFilter<"CloudLoyaltyTransaction"> | string
    accountId?: StringFilter<"CloudLoyaltyTransaction"> | string
    customerId?: StringFilter<"CloudLoyaltyTransaction"> | string
    orderId?: StringNullableFilter<"CloudLoyaltyTransaction"> | string | null
    type?: StringFilter<"CloudLoyaltyTransaction"> | string
    points?: IntFilter<"CloudLoyaltyTransaction"> | number
    newBalance?: IntFilter<"CloudLoyaltyTransaction"> | number
    occurredAt?: DateTimeFilter<"CloudLoyaltyTransaction"> | Date | string
  }

  export type CloudLoyaltyTransactionOrderByWithRelationInput = {
    id?: SortOrder
    branchId?: SortOrder
    brandId?: SortOrder
    accountId?: SortOrder
    customerId?: SortOrder
    orderId?: SortOrderInput | SortOrder
    type?: SortOrder
    points?: SortOrder
    newBalance?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudLoyaltyTransactionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CloudLoyaltyTransactionWhereInput | CloudLoyaltyTransactionWhereInput[]
    OR?: CloudLoyaltyTransactionWhereInput[]
    NOT?: CloudLoyaltyTransactionWhereInput | CloudLoyaltyTransactionWhereInput[]
    branchId?: StringFilter<"CloudLoyaltyTransaction"> | string
    brandId?: StringFilter<"CloudLoyaltyTransaction"> | string
    accountId?: StringFilter<"CloudLoyaltyTransaction"> | string
    customerId?: StringFilter<"CloudLoyaltyTransaction"> | string
    orderId?: StringNullableFilter<"CloudLoyaltyTransaction"> | string | null
    type?: StringFilter<"CloudLoyaltyTransaction"> | string
    points?: IntFilter<"CloudLoyaltyTransaction"> | number
    newBalance?: IntFilter<"CloudLoyaltyTransaction"> | number
    occurredAt?: DateTimeFilter<"CloudLoyaltyTransaction"> | Date | string
  }, "id">

  export type CloudLoyaltyTransactionOrderByWithAggregationInput = {
    id?: SortOrder
    branchId?: SortOrder
    brandId?: SortOrder
    accountId?: SortOrder
    customerId?: SortOrder
    orderId?: SortOrderInput | SortOrder
    type?: SortOrder
    points?: SortOrder
    newBalance?: SortOrder
    occurredAt?: SortOrder
    _count?: CloudLoyaltyTransactionCountOrderByAggregateInput
    _avg?: CloudLoyaltyTransactionAvgOrderByAggregateInput
    _max?: CloudLoyaltyTransactionMaxOrderByAggregateInput
    _min?: CloudLoyaltyTransactionMinOrderByAggregateInput
    _sum?: CloudLoyaltyTransactionSumOrderByAggregateInput
  }

  export type CloudLoyaltyTransactionScalarWhereWithAggregatesInput = {
    AND?: CloudLoyaltyTransactionScalarWhereWithAggregatesInput | CloudLoyaltyTransactionScalarWhereWithAggregatesInput[]
    OR?: CloudLoyaltyTransactionScalarWhereWithAggregatesInput[]
    NOT?: CloudLoyaltyTransactionScalarWhereWithAggregatesInput | CloudLoyaltyTransactionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CloudLoyaltyTransaction"> | string
    branchId?: StringWithAggregatesFilter<"CloudLoyaltyTransaction"> | string
    brandId?: StringWithAggregatesFilter<"CloudLoyaltyTransaction"> | string
    accountId?: StringWithAggregatesFilter<"CloudLoyaltyTransaction"> | string
    customerId?: StringWithAggregatesFilter<"CloudLoyaltyTransaction"> | string
    orderId?: StringNullableWithAggregatesFilter<"CloudLoyaltyTransaction"> | string | null
    type?: StringWithAggregatesFilter<"CloudLoyaltyTransaction"> | string
    points?: IntWithAggregatesFilter<"CloudLoyaltyTransaction"> | number
    newBalance?: IntWithAggregatesFilter<"CloudLoyaltyTransaction"> | number
    occurredAt?: DateTimeWithAggregatesFilter<"CloudLoyaltyTransaction"> | Date | string
  }

  export type CloudBranchCreateInput = {
    id: string
    tenantId: string
    name: string
    brandName: string
    apiKeyHash: string
    createdAt?: Date | string
  }

  export type CloudBranchUncheckedCreateInput = {
    id: string
    tenantId: string
    name: string
    brandName: string
    apiKeyHash: string
    createdAt?: Date | string
  }

  export type CloudBranchUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    apiKeyHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudBranchUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    apiKeyHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudBranchCreateManyInput = {
    id: string
    tenantId: string
    name: string
    brandName: string
    apiKeyHash: string
    createdAt?: Date | string
  }

  export type CloudBranchUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    apiKeyHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudBranchUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    apiKeyHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SyncedEventCreateInput = {
    id: string
    branchId: string
    aggregateType: string
    aggregateId: string
    eventType: string
    occurredAt: Date | string
    appliedAt?: Date | string
  }

  export type SyncedEventUncheckedCreateInput = {
    id: string
    branchId: string
    aggregateType: string
    aggregateId: string
    eventType: string
    occurredAt: Date | string
    appliedAt?: Date | string
  }

  export type SyncedEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    aggregateType?: StringFieldUpdateOperationsInput | string
    aggregateId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SyncedEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    aggregateType?: StringFieldUpdateOperationsInput | string
    aggregateId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SyncedEventCreateManyInput = {
    id: string
    branchId: string
    aggregateType: string
    aggregateId: string
    eventType: string
    occurredAt: Date | string
    appliedAt?: Date | string
  }

  export type SyncedEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    aggregateType?: StringFieldUpdateOperationsInput | string
    aggregateId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SyncedEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    aggregateType?: StringFieldUpdateOperationsInput | string
    aggregateId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudOrderCreateInput = {
    id: string
    tenantId: string
    branchId: string
    type: string
    status: string
    subtotal: Decimal | DecimalJsLike | number | string
    discountTotal: Decimal | DecimalJsLike | number | string
    taxTotal: Decimal | DecimalJsLike | number | string
    serviceFeeTotal?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    currency: string
    occurredAt: Date | string
    createdAt: Date | string
  }

  export type CloudOrderUncheckedCreateInput = {
    id: string
    tenantId: string
    branchId: string
    type: string
    status: string
    subtotal: Decimal | DecimalJsLike | number | string
    discountTotal: Decimal | DecimalJsLike | number | string
    taxTotal: Decimal | DecimalJsLike | number | string
    serviceFeeTotal?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    currency: string
    occurredAt: Date | string
    createdAt: Date | string
  }

  export type CloudOrderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discountTotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    taxTotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    serviceFeeTotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudOrderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discountTotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    taxTotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    serviceFeeTotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudOrderCreateManyInput = {
    id: string
    tenantId: string
    branchId: string
    type: string
    status: string
    subtotal: Decimal | DecimalJsLike | number | string
    discountTotal: Decimal | DecimalJsLike | number | string
    taxTotal: Decimal | DecimalJsLike | number | string
    serviceFeeTotal?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    currency: string
    occurredAt: Date | string
    createdAt: Date | string
  }

  export type CloudOrderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discountTotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    taxTotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    serviceFeeTotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudOrderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discountTotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    taxTotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    serviceFeeTotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudPaymentCreateInput = {
    id: string
    orderId: string
    branchId: string
    method: string
    amount: Decimal | DecimalJsLike | number | string
    tipAmount?: Decimal | DecimalJsLike | number | string
    currency: string
    status: string
    occurredAt: Date | string
    shiftId?: string | null
  }

  export type CloudPaymentUncheckedCreateInput = {
    id: string
    orderId: string
    branchId: string
    method: string
    amount: Decimal | DecimalJsLike | number | string
    tipAmount?: Decimal | DecimalJsLike | number | string
    currency: string
    status: string
    occurredAt: Date | string
    shiftId?: string | null
  }

  export type CloudPaymentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tipAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shiftId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CloudPaymentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tipAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shiftId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CloudPaymentCreateManyInput = {
    id: string
    orderId: string
    branchId: string
    method: string
    amount: Decimal | DecimalJsLike | number | string
    tipAmount?: Decimal | DecimalJsLike | number | string
    currency: string
    status: string
    occurredAt: Date | string
    shiftId?: string | null
  }

  export type CloudPaymentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tipAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shiftId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CloudPaymentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tipAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shiftId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CloudWaiterRequestCreateInput = {
    id: string
    branchId: string
    type: string
    status: string
    createdAt: Date | string
    completedAt?: Date | string | null
    occurredAt: Date | string
  }

  export type CloudWaiterRequestUncheckedCreateInput = {
    id: string
    branchId: string
    type: string
    status: string
    createdAt: Date | string
    completedAt?: Date | string | null
    occurredAt: Date | string
  }

  export type CloudWaiterRequestUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudWaiterRequestUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudWaiterRequestCreateManyInput = {
    id: string
    branchId: string
    type: string
    status: string
    createdAt: Date | string
    completedAt?: Date | string | null
    occurredAt: Date | string
  }

  export type CloudWaiterRequestUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudWaiterRequestUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudProductAvailabilityCreateInput = {
    id: string
    branchId: string
    productId: string
    status: string
    occurredAt: Date | string
  }

  export type CloudProductAvailabilityUncheckedCreateInput = {
    id: string
    branchId: string
    productId: string
    status: string
    occurredAt: Date | string
  }

  export type CloudProductAvailabilityUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudProductAvailabilityUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudProductAvailabilityCreateManyInput = {
    id: string
    branchId: string
    productId: string
    status: string
    occurredAt: Date | string
  }

  export type CloudProductAvailabilityUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudProductAvailabilityUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudGameSessionCreateInput = {
    id: string
    branchId: string
    status: string
    playerCount: number
    occurredAt: Date | string
  }

  export type CloudGameSessionUncheckedCreateInput = {
    id: string
    branchId: string
    status: string
    playerCount: number
    occurredAt: Date | string
  }

  export type CloudGameSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    playerCount?: IntFieldUpdateOperationsInput | number
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudGameSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    playerCount?: IntFieldUpdateOperationsInput | number
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudGameSessionCreateManyInput = {
    id: string
    branchId: string
    status: string
    playerCount: number
    occurredAt: Date | string
  }

  export type CloudGameSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    playerCount?: IntFieldUpdateOperationsInput | number
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudGameSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    playerCount?: IntFieldUpdateOperationsInput | number
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudRefundCreateInput = {
    id: string
    paymentId: string
    branchId: string
    amount: Decimal | DecimalJsLike | number | string
    status: string
    occurredAt: Date | string
  }

  export type CloudRefundUncheckedCreateInput = {
    id: string
    paymentId: string
    branchId: string
    amount: Decimal | DecimalJsLike | number | string
    status: string
    occurredAt: Date | string
  }

  export type CloudRefundUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    paymentId?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudRefundUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    paymentId?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudRefundCreateManyInput = {
    id: string
    paymentId: string
    branchId: string
    amount: Decimal | DecimalJsLike | number | string
    status: string
    occurredAt: Date | string
  }

  export type CloudRefundUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    paymentId?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudRefundUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    paymentId?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudShiftCreateInput = {
    id: string
    branchId: string
    status: string
    openedAt: Date | string
    closedAt?: Date | string | null
    openingCash: Decimal | DecimalJsLike | number | string
    expectedCash?: Decimal | DecimalJsLike | number | string | null
    actualCash?: Decimal | DecimalJsLike | number | string | null
    variance?: Decimal | DecimalJsLike | number | string | null
    varianceReason?: string | null
    occurredAt: Date | string
  }

  export type CloudShiftUncheckedCreateInput = {
    id: string
    branchId: string
    status: string
    openedAt: Date | string
    closedAt?: Date | string | null
    openingCash: Decimal | DecimalJsLike | number | string
    expectedCash?: Decimal | DecimalJsLike | number | string | null
    actualCash?: Decimal | DecimalJsLike | number | string | null
    variance?: Decimal | DecimalJsLike | number | string | null
    varianceReason?: string | null
    occurredAt: Date | string
  }

  export type CloudShiftUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    openingCash?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    expectedCash?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    actualCash?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    variance?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    varianceReason?: NullableStringFieldUpdateOperationsInput | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudShiftUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    openingCash?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    expectedCash?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    actualCash?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    variance?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    varianceReason?: NullableStringFieldUpdateOperationsInput | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudShiftCreateManyInput = {
    id: string
    branchId: string
    status: string
    openedAt: Date | string
    closedAt?: Date | string | null
    openingCash: Decimal | DecimalJsLike | number | string
    expectedCash?: Decimal | DecimalJsLike | number | string | null
    actualCash?: Decimal | DecimalJsLike | number | string | null
    variance?: Decimal | DecimalJsLike | number | string | null
    varianceReason?: string | null
    occurredAt: Date | string
  }

  export type CloudShiftUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    openingCash?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    expectedCash?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    actualCash?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    variance?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    varianceReason?: NullableStringFieldUpdateOperationsInput | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudShiftUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    openingCash?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    expectedCash?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    actualCash?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    variance?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    varianceReason?: NullableStringFieldUpdateOperationsInput | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudExpenseCreateInput = {
    id: string
    branchId: string
    shiftId?: string | null
    category: string
    amount: Decimal | DecimalJsLike | number | string
    occurredAt: Date | string
  }

  export type CloudExpenseUncheckedCreateInput = {
    id: string
    branchId: string
    shiftId?: string | null
    category: string
    amount: Decimal | DecimalJsLike | number | string
    occurredAt: Date | string
  }

  export type CloudExpenseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    shiftId?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudExpenseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    shiftId?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudExpenseCreateManyInput = {
    id: string
    branchId: string
    shiftId?: string | null
    category: string
    amount: Decimal | DecimalJsLike | number | string
    occurredAt: Date | string
  }

  export type CloudExpenseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    shiftId?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudExpenseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    shiftId?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudCashMovementCreateInput = {
    id: string
    branchId: string
    shiftId: string
    type: string
    amount: Decimal | DecimalJsLike | number | string
    occurredAt: Date | string
  }

  export type CloudCashMovementUncheckedCreateInput = {
    id: string
    branchId: string
    shiftId: string
    type: string
    amount: Decimal | DecimalJsLike | number | string
    occurredAt: Date | string
  }

  export type CloudCashMovementUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    shiftId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudCashMovementUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    shiftId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudCashMovementCreateManyInput = {
    id: string
    branchId: string
    shiftId: string
    type: string
    amount: Decimal | DecimalJsLike | number | string
    occurredAt: Date | string
  }

  export type CloudCashMovementUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    shiftId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudCashMovementUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    shiftId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudDeliveryOrderCreateInput = {
    id: string
    orderId: string
    branchId: string
    status: string
    zoneId?: string | null
    deliveryFee: Decimal | DecimalJsLike | number | string
    driverId?: string | null
    deliveredAt?: Date | string | null
    occurredAt: Date | string
  }

  export type CloudDeliveryOrderUncheckedCreateInput = {
    id: string
    orderId: string
    branchId: string
    status: string
    zoneId?: string | null
    deliveryFee: Decimal | DecimalJsLike | number | string
    driverId?: string | null
    deliveredAt?: Date | string | null
    occurredAt: Date | string
  }

  export type CloudDeliveryOrderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    zoneId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    driverId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudDeliveryOrderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    zoneId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    driverId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudDeliveryOrderCreateManyInput = {
    id: string
    orderId: string
    branchId: string
    status: string
    zoneId?: string | null
    deliveryFee: Decimal | DecimalJsLike | number | string
    driverId?: string | null
    deliveredAt?: Date | string | null
    occurredAt: Date | string
  }

  export type CloudDeliveryOrderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    zoneId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    driverId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudDeliveryOrderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    zoneId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    driverId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudReservationCreateInput = {
    id: string
    branchId: string
    tableId?: string | null
    guestName: string
    guestPhone: string
    partySize: number
    reservedFor: Date | string
    durationMinutes: number
    status: string
    occurredAt: Date | string
  }

  export type CloudReservationUncheckedCreateInput = {
    id: string
    branchId: string
    tableId?: string | null
    guestName: string
    guestPhone: string
    partySize: number
    reservedFor: Date | string
    durationMinutes: number
    status: string
    occurredAt: Date | string
  }

  export type CloudReservationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    tableId?: NullableStringFieldUpdateOperationsInput | string | null
    guestName?: StringFieldUpdateOperationsInput | string
    guestPhone?: StringFieldUpdateOperationsInput | string
    partySize?: IntFieldUpdateOperationsInput | number
    reservedFor?: DateTimeFieldUpdateOperationsInput | Date | string
    durationMinutes?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudReservationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    tableId?: NullableStringFieldUpdateOperationsInput | string | null
    guestName?: StringFieldUpdateOperationsInput | string
    guestPhone?: StringFieldUpdateOperationsInput | string
    partySize?: IntFieldUpdateOperationsInput | number
    reservedFor?: DateTimeFieldUpdateOperationsInput | Date | string
    durationMinutes?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudReservationCreateManyInput = {
    id: string
    branchId: string
    tableId?: string | null
    guestName: string
    guestPhone: string
    partySize: number
    reservedFor: Date | string
    durationMinutes: number
    status: string
    occurredAt: Date | string
  }

  export type CloudReservationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    tableId?: NullableStringFieldUpdateOperationsInput | string | null
    guestName?: StringFieldUpdateOperationsInput | string
    guestPhone?: StringFieldUpdateOperationsInput | string
    partySize?: IntFieldUpdateOperationsInput | number
    reservedFor?: DateTimeFieldUpdateOperationsInput | Date | string
    durationMinutes?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudReservationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    tableId?: NullableStringFieldUpdateOperationsInput | string | null
    guestName?: StringFieldUpdateOperationsInput | string
    guestPhone?: StringFieldUpdateOperationsInput | string
    partySize?: IntFieldUpdateOperationsInput | number
    reservedFor?: DateTimeFieldUpdateOperationsInput | Date | string
    durationMinutes?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudIngredientCreateInput = {
    id: string
    brandId: string
    name: string
    unit: string
    currentStock?: Decimal | DecimalJsLike | number | string | null
    lowStockThreshold?: Decimal | DecimalJsLike | number | string | null
    occurredAt: Date | string
  }

  export type CloudIngredientUncheckedCreateInput = {
    id: string
    brandId: string
    name: string
    unit: string
    currentStock?: Decimal | DecimalJsLike | number | string | null
    lowStockThreshold?: Decimal | DecimalJsLike | number | string | null
    occurredAt: Date | string
  }

  export type CloudIngredientUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    unit?: StringFieldUpdateOperationsInput | string
    currentStock?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    lowStockThreshold?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudIngredientUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    unit?: StringFieldUpdateOperationsInput | string
    currentStock?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    lowStockThreshold?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudIngredientCreateManyInput = {
    id: string
    brandId: string
    name: string
    unit: string
    currentStock?: Decimal | DecimalJsLike | number | string | null
    lowStockThreshold?: Decimal | DecimalJsLike | number | string | null
    occurredAt: Date | string
  }

  export type CloudIngredientUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    unit?: StringFieldUpdateOperationsInput | string
    currentStock?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    lowStockThreshold?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudIngredientUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    unit?: StringFieldUpdateOperationsInput | string
    currentStock?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    lowStockThreshold?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudRecipeLineCreateInput = {
    id: string
    productId: string
    ingredientId: string
    quantity: Decimal | DecimalJsLike | number | string
    unit: string
    costPerUnitSnapshot?: Decimal | DecimalJsLike | number | string | null
    occurredAt: Date | string
  }

  export type CloudRecipeLineUncheckedCreateInput = {
    id: string
    productId: string
    ingredientId: string
    quantity: Decimal | DecimalJsLike | number | string
    unit: string
    costPerUnitSnapshot?: Decimal | DecimalJsLike | number | string | null
    occurredAt: Date | string
  }

  export type CloudRecipeLineUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    ingredientId?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unit?: StringFieldUpdateOperationsInput | string
    costPerUnitSnapshot?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudRecipeLineUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    ingredientId?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unit?: StringFieldUpdateOperationsInput | string
    costPerUnitSnapshot?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudRecipeLineCreateManyInput = {
    id: string
    productId: string
    ingredientId: string
    quantity: Decimal | DecimalJsLike | number | string
    unit: string
    costPerUnitSnapshot?: Decimal | DecimalJsLike | number | string | null
    occurredAt: Date | string
  }

  export type CloudRecipeLineUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    ingredientId?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unit?: StringFieldUpdateOperationsInput | string
    costPerUnitSnapshot?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudRecipeLineUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    ingredientId?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unit?: StringFieldUpdateOperationsInput | string
    costPerUnitSnapshot?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudLoyaltyTransactionCreateInput = {
    id: string
    branchId: string
    brandId: string
    accountId: string
    customerId: string
    orderId?: string | null
    type: string
    points: number
    newBalance: number
    occurredAt: Date | string
  }

  export type CloudLoyaltyTransactionUncheckedCreateInput = {
    id: string
    branchId: string
    brandId: string
    accountId: string
    customerId: string
    orderId?: string | null
    type: string
    points: number
    newBalance: number
    occurredAt: Date | string
  }

  export type CloudLoyaltyTransactionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    newBalance?: IntFieldUpdateOperationsInput | number
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudLoyaltyTransactionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    newBalance?: IntFieldUpdateOperationsInput | number
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudLoyaltyTransactionCreateManyInput = {
    id: string
    branchId: string
    brandId: string
    accountId: string
    customerId: string
    orderId?: string | null
    type: string
    points: number
    newBalance: number
    occurredAt: Date | string
  }

  export type CloudLoyaltyTransactionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    newBalance?: IntFieldUpdateOperationsInput | number
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CloudLoyaltyTransactionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    newBalance?: IntFieldUpdateOperationsInput | number
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CloudBranchCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    brandName?: SortOrder
    apiKeyHash?: SortOrder
    createdAt?: SortOrder
  }

  export type CloudBranchMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    brandName?: SortOrder
    apiKeyHash?: SortOrder
    createdAt?: SortOrder
  }

  export type CloudBranchMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    brandName?: SortOrder
    apiKeyHash?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type SyncedEventCountOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    aggregateType?: SortOrder
    aggregateId?: SortOrder
    eventType?: SortOrder
    occurredAt?: SortOrder
    appliedAt?: SortOrder
  }

  export type SyncedEventMaxOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    aggregateType?: SortOrder
    aggregateId?: SortOrder
    eventType?: SortOrder
    occurredAt?: SortOrder
    appliedAt?: SortOrder
  }

  export type SyncedEventMinOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    aggregateType?: SortOrder
    aggregateId?: SortOrder
    eventType?: SortOrder
    occurredAt?: SortOrder
    appliedAt?: SortOrder
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[]
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[]
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type CloudOrderCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    branchId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    subtotal?: SortOrder
    discountTotal?: SortOrder
    taxTotal?: SortOrder
    serviceFeeTotal?: SortOrder
    total?: SortOrder
    currency?: SortOrder
    occurredAt?: SortOrder
    createdAt?: SortOrder
  }

  export type CloudOrderAvgOrderByAggregateInput = {
    subtotal?: SortOrder
    discountTotal?: SortOrder
    taxTotal?: SortOrder
    serviceFeeTotal?: SortOrder
    total?: SortOrder
  }

  export type CloudOrderMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    branchId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    subtotal?: SortOrder
    discountTotal?: SortOrder
    taxTotal?: SortOrder
    serviceFeeTotal?: SortOrder
    total?: SortOrder
    currency?: SortOrder
    occurredAt?: SortOrder
    createdAt?: SortOrder
  }

  export type CloudOrderMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    branchId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    subtotal?: SortOrder
    discountTotal?: SortOrder
    taxTotal?: SortOrder
    serviceFeeTotal?: SortOrder
    total?: SortOrder
    currency?: SortOrder
    occurredAt?: SortOrder
    createdAt?: SortOrder
  }

  export type CloudOrderSumOrderByAggregateInput = {
    subtotal?: SortOrder
    discountTotal?: SortOrder
    taxTotal?: SortOrder
    serviceFeeTotal?: SortOrder
    total?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[]
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[]
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CloudPaymentCountOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    branchId?: SortOrder
    method?: SortOrder
    amount?: SortOrder
    tipAmount?: SortOrder
    currency?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
    shiftId?: SortOrder
  }

  export type CloudPaymentAvgOrderByAggregateInput = {
    amount?: SortOrder
    tipAmount?: SortOrder
  }

  export type CloudPaymentMaxOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    branchId?: SortOrder
    method?: SortOrder
    amount?: SortOrder
    tipAmount?: SortOrder
    currency?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
    shiftId?: SortOrder
  }

  export type CloudPaymentMinOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    branchId?: SortOrder
    method?: SortOrder
    amount?: SortOrder
    tipAmount?: SortOrder
    currency?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
    shiftId?: SortOrder
  }

  export type CloudPaymentSumOrderByAggregateInput = {
    amount?: SortOrder
    tipAmount?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type CloudWaiterRequestCountOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudWaiterRequestMaxOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudWaiterRequestMinOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrder
    occurredAt?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type CloudProductAvailabilityCountOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    productId?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudProductAvailabilityMaxOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    productId?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudProductAvailabilityMinOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    productId?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type CloudGameSessionCountOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    status?: SortOrder
    playerCount?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudGameSessionAvgOrderByAggregateInput = {
    playerCount?: SortOrder
  }

  export type CloudGameSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    status?: SortOrder
    playerCount?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudGameSessionMinOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    status?: SortOrder
    playerCount?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudGameSessionSumOrderByAggregateInput = {
    playerCount?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type CloudRefundCountOrderByAggregateInput = {
    id?: SortOrder
    paymentId?: SortOrder
    branchId?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudRefundAvgOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type CloudRefundMaxOrderByAggregateInput = {
    id?: SortOrder
    paymentId?: SortOrder
    branchId?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudRefundMinOrderByAggregateInput = {
    id?: SortOrder
    paymentId?: SortOrder
    branchId?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudRefundSumOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type CloudShiftCountOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    status?: SortOrder
    openedAt?: SortOrder
    closedAt?: SortOrder
    openingCash?: SortOrder
    expectedCash?: SortOrder
    actualCash?: SortOrder
    variance?: SortOrder
    varianceReason?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudShiftAvgOrderByAggregateInput = {
    openingCash?: SortOrder
    expectedCash?: SortOrder
    actualCash?: SortOrder
    variance?: SortOrder
  }

  export type CloudShiftMaxOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    status?: SortOrder
    openedAt?: SortOrder
    closedAt?: SortOrder
    openingCash?: SortOrder
    expectedCash?: SortOrder
    actualCash?: SortOrder
    variance?: SortOrder
    varianceReason?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudShiftMinOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    status?: SortOrder
    openedAt?: SortOrder
    closedAt?: SortOrder
    openingCash?: SortOrder
    expectedCash?: SortOrder
    actualCash?: SortOrder
    variance?: SortOrder
    varianceReason?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudShiftSumOrderByAggregateInput = {
    openingCash?: SortOrder
    expectedCash?: SortOrder
    actualCash?: SortOrder
    variance?: SortOrder
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type CloudExpenseCountOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    shiftId?: SortOrder
    category?: SortOrder
    amount?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudExpenseAvgOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type CloudExpenseMaxOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    shiftId?: SortOrder
    category?: SortOrder
    amount?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudExpenseMinOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    shiftId?: SortOrder
    category?: SortOrder
    amount?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudExpenseSumOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type CloudCashMovementCountOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    shiftId?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudCashMovementAvgOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type CloudCashMovementMaxOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    shiftId?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudCashMovementMinOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    shiftId?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudCashMovementSumOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type CloudDeliveryOrderCountOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    branchId?: SortOrder
    status?: SortOrder
    zoneId?: SortOrder
    deliveryFee?: SortOrder
    driverId?: SortOrder
    deliveredAt?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudDeliveryOrderAvgOrderByAggregateInput = {
    deliveryFee?: SortOrder
  }

  export type CloudDeliveryOrderMaxOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    branchId?: SortOrder
    status?: SortOrder
    zoneId?: SortOrder
    deliveryFee?: SortOrder
    driverId?: SortOrder
    deliveredAt?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudDeliveryOrderMinOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    branchId?: SortOrder
    status?: SortOrder
    zoneId?: SortOrder
    deliveryFee?: SortOrder
    driverId?: SortOrder
    deliveredAt?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudDeliveryOrderSumOrderByAggregateInput = {
    deliveryFee?: SortOrder
  }

  export type CloudReservationCountOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    tableId?: SortOrder
    guestName?: SortOrder
    guestPhone?: SortOrder
    partySize?: SortOrder
    reservedFor?: SortOrder
    durationMinutes?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudReservationAvgOrderByAggregateInput = {
    partySize?: SortOrder
    durationMinutes?: SortOrder
  }

  export type CloudReservationMaxOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    tableId?: SortOrder
    guestName?: SortOrder
    guestPhone?: SortOrder
    partySize?: SortOrder
    reservedFor?: SortOrder
    durationMinutes?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudReservationMinOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    tableId?: SortOrder
    guestName?: SortOrder
    guestPhone?: SortOrder
    partySize?: SortOrder
    reservedFor?: SortOrder
    durationMinutes?: SortOrder
    status?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudReservationSumOrderByAggregateInput = {
    partySize?: SortOrder
    durationMinutes?: SortOrder
  }

  export type CloudIngredientCountOrderByAggregateInput = {
    id?: SortOrder
    brandId?: SortOrder
    name?: SortOrder
    unit?: SortOrder
    currentStock?: SortOrder
    lowStockThreshold?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudIngredientAvgOrderByAggregateInput = {
    currentStock?: SortOrder
    lowStockThreshold?: SortOrder
  }

  export type CloudIngredientMaxOrderByAggregateInput = {
    id?: SortOrder
    brandId?: SortOrder
    name?: SortOrder
    unit?: SortOrder
    currentStock?: SortOrder
    lowStockThreshold?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudIngredientMinOrderByAggregateInput = {
    id?: SortOrder
    brandId?: SortOrder
    name?: SortOrder
    unit?: SortOrder
    currentStock?: SortOrder
    lowStockThreshold?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudIngredientSumOrderByAggregateInput = {
    currentStock?: SortOrder
    lowStockThreshold?: SortOrder
  }

  export type CloudRecipeLineCountOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    ingredientId?: SortOrder
    quantity?: SortOrder
    unit?: SortOrder
    costPerUnitSnapshot?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudRecipeLineAvgOrderByAggregateInput = {
    quantity?: SortOrder
    costPerUnitSnapshot?: SortOrder
  }

  export type CloudRecipeLineMaxOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    ingredientId?: SortOrder
    quantity?: SortOrder
    unit?: SortOrder
    costPerUnitSnapshot?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudRecipeLineMinOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    ingredientId?: SortOrder
    quantity?: SortOrder
    unit?: SortOrder
    costPerUnitSnapshot?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudRecipeLineSumOrderByAggregateInput = {
    quantity?: SortOrder
    costPerUnitSnapshot?: SortOrder
  }

  export type CloudLoyaltyTransactionCountOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    brandId?: SortOrder
    accountId?: SortOrder
    customerId?: SortOrder
    orderId?: SortOrder
    type?: SortOrder
    points?: SortOrder
    newBalance?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudLoyaltyTransactionAvgOrderByAggregateInput = {
    points?: SortOrder
    newBalance?: SortOrder
  }

  export type CloudLoyaltyTransactionMaxOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    brandId?: SortOrder
    accountId?: SortOrder
    customerId?: SortOrder
    orderId?: SortOrder
    type?: SortOrder
    points?: SortOrder
    newBalance?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudLoyaltyTransactionMinOrderByAggregateInput = {
    id?: SortOrder
    branchId?: SortOrder
    brandId?: SortOrder
    accountId?: SortOrder
    customerId?: SortOrder
    orderId?: SortOrder
    type?: SortOrder
    points?: SortOrder
    newBalance?: SortOrder
    occurredAt?: SortOrder
  }

  export type CloudLoyaltyTransactionSumOrderByAggregateInput = {
    points?: SortOrder
    newBalance?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[]
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[]
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[]
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[]
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use CloudBranchDefaultArgs instead
     */
    export type CloudBranchArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CloudBranchDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SyncedEventDefaultArgs instead
     */
    export type SyncedEventArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SyncedEventDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CloudOrderDefaultArgs instead
     */
    export type CloudOrderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CloudOrderDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CloudPaymentDefaultArgs instead
     */
    export type CloudPaymentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CloudPaymentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CloudWaiterRequestDefaultArgs instead
     */
    export type CloudWaiterRequestArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CloudWaiterRequestDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CloudProductAvailabilityDefaultArgs instead
     */
    export type CloudProductAvailabilityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CloudProductAvailabilityDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CloudGameSessionDefaultArgs instead
     */
    export type CloudGameSessionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CloudGameSessionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CloudRefundDefaultArgs instead
     */
    export type CloudRefundArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CloudRefundDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CloudShiftDefaultArgs instead
     */
    export type CloudShiftArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CloudShiftDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CloudExpenseDefaultArgs instead
     */
    export type CloudExpenseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CloudExpenseDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CloudCashMovementDefaultArgs instead
     */
    export type CloudCashMovementArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CloudCashMovementDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CloudDeliveryOrderDefaultArgs instead
     */
    export type CloudDeliveryOrderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CloudDeliveryOrderDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CloudReservationDefaultArgs instead
     */
    export type CloudReservationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CloudReservationDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CloudIngredientDefaultArgs instead
     */
    export type CloudIngredientArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CloudIngredientDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CloudRecipeLineDefaultArgs instead
     */
    export type CloudRecipeLineArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CloudRecipeLineDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CloudLoyaltyTransactionDefaultArgs instead
     */
    export type CloudLoyaltyTransactionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CloudLoyaltyTransactionDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}