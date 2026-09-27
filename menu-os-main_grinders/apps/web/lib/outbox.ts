import { json, type Prisma } from "@menu-os/db";

type Tx = Prisma.TransactionClient;

export type AggregateType =
  | "Order"
  | "KitchenOrder"
  | "Payment"
  | "WaiterRequest"
  | "ProductAvailability"
  | "TableSession"
  | "GameSession"
  | "Refund"
  | "Shift"
  | "Expense"
  | "CashMovement"
  | "DeliveryOrder"
  | "Reservation"
  | "Ingredient"
  | "Recipe"
  | "LoyaltyTransaction";

/**
 * Records one durable sync event in the SAME transaction as the operational write it
 * describes. This is the entire contract the sync engine depends on: if the write
 * commits, this event exists; if it rolls back, neither does. See
 * docs/OFFLINE_ARCHITECTURE.md §4.
 */
export async function writeOutboxEvent(
  tx: Tx,
  params: {
    branchId: string;
    aggregateType: AggregateType;
    aggregateId: string;
    eventType: string;
    payload: Record<string, unknown>;
    occurredAt?: Date;
  }
) {
  await tx.outboxEvent.create({
    data: {
      branchId: params.branchId,
      aggregateType: params.aggregateType,
      aggregateId: params.aggregateId,
      eventType: params.eventType,
      // JSON-encoded text since the move to SQLite. The cloud sync service decodes it
      // with readJson on ingestion; nothing in between needs to parse it.
      payload: json(params.payload) ?? "{}",
      occurredAt: params.occurredAt ?? new Date(),
    },
  });
}
