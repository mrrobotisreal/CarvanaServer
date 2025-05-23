export type OrderStatus =
  | "ordered"
  | "paid"
  | "failed"
  | "in transit"
  | "delivered";

export type PaymentMethod = "visa" | "mastercard" | "cash";

export interface OrderNode {
  id: string;
  orderID: number;
  firstName: string;
  lastName: string;
  email: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  price: number;
  tax: number;
  deliveryFee: number;
  orderedAt: string;
  paidAt?: string | null;
  inTransitAt?: string | null;
  deliveredAt?: string | null;
  make?: string | null;
  carModel?: string | null;
  year?: number | null;
  color?: string | null;
  vin?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: number | null;
}

export interface OrderEdge {
  cursor: string;
  node: OrderNode;
}

export interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}

export interface OrdersConnection {
  edges: OrderEdge[];
  pageInfo: PageInfo;
}

export interface OrdersQueryResponse {
  orders: OrdersConnection;
}
