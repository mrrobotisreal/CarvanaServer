import { Schema, model, Document, Types } from 'mongoose';

export interface OrderDoc extends Document {
  _id: Types.ObjectId;
  orderID: number;
  firstName: string;
  lastName: string;
  status: 'ordered' | 'paid' | 'failed' | 'in transit' | 'delivered';
  paymentMethod: 'visa' | 'mastercard' | 'cash';
  price: number;
  tax: number;
  deliveryFee: number;
  orderedAt: Date;
  paidAt?: Date;
  inTransitAt?: Date;
  deliveredAt?: Date;
  make: string;
  carModel: string;
  year: number;
  color: string;
  vin: string;
  address: string;
  city: string;
  state: string;
  zip: number;
}

const orderSchema = new Schema<OrderDoc>(
  {
    orderID: Number,
    firstName: String,
    lastName: String,
    status: String,
    paymentMethod: String,
    price: Number,
    tax: Number,
    deliveryFee: Number,
    orderedAt: Date,
    paidAt: Date,
    inTransitAt: Date,
    deliveredAt: Date,
    make: String,
    carModel: String,
    year: Number,
    color: String,
    vin: String,
    address: String,
    city: String,
    state: String,
    zip: Number,
  },
  { timestamps: false }
);

export const Order = model<OrderDoc>('Order', orderSchema);
