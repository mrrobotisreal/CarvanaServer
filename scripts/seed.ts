import 'dotenv/config';
import mongoose from 'mongoose';
import { Order } from '../src/models/Order';
import { faker } from '@faker-js/faker';

(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  const orders = Array.from({ length: 500 }).map((_, idx) => ({
    orderID: idx + 1,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    status: faker.helpers.arrayElement([
      "ordered",
      "paid",
      "failed",
      "in transit",
      "delivered",
    ]),
    paymentMethod: faker.helpers.arrayElement(["visa", "mastercard", "cash"]),
    price: faker.finance.amount({ min: 100, max: 50000, dec: 2 }),
    tax: faker.finance.amount({ min: 5, max: 2000, dec: 2 }),
    deliveryFee: faker.finance.amount({ min: 0, max: 100, dec: 2 }),
    orderedAt: faker.date.past(),
    make: faker.vehicle.manufacturer(),
    carModel: faker.vehicle.model(),
    year: faker.number.int({ min: 2000, max: 2025 }),
    color: faker.color.human(),
    vin: faker.vehicle.vin(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    zip: faker.location.zipCode("#####"),
  }));
  await Order.insertMany(orders);
  console.log('Seeded ✨🌱');
  process.exit();
})();
