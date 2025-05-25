export { Order } from "./Order";

export { AppEvent } from "./AppEvent";
export { AppPerformance } from "./AppPerformance";
export { AppUsage } from "./AppUsage";

import { AppEvent } from "./AppEvent";
import { AppPerformance } from "./AppPerformance";
import { AppUsage } from "./AppUsage";

AppEvent.hasMany(AppPerformance, {
  foreignKey: "eventId",
  as: "performanceMetrics",
});

AppEvent.hasMany(AppUsage, {
  foreignKey: "eventId",
  as: "usageMetrics",
});

AppPerformance.belongsTo(AppEvent, {
  foreignKey: "eventId",
  as: "event",
});

AppUsage.belongsTo(AppEvent, {
  foreignKey: "eventId",
  as: "event",
});
