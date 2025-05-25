import { Sequelize } from "sequelize";

export const analyticsDB = new Sequelize(
  process.env.ANALYTICS_DB_NAME || "carvana_server_analytics",
  process.env.ANALYTICS_DB_USER || "root",
  process.env.ANALYTICS_DB_PASSWORD || "",
  {
    host: process.env.ANALYTICS_DB_HOST || "localhost",
    port: parseInt(process.env.ANALYTICS_DB_PORT || "3306"),
    dialect: "mysql",
    logging:
      process.env.DEV === "true" || process.env.NODE_ENV === "development"
        ? console.log
        : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export const connectAnalyticsDB = async () => {
  try {
    await analyticsDB.authenticate();
    console.log("✅ Analytics database connection established successfully.");

    await analyticsDB.sync({ alter: true });
    console.log("✅ Analytics database models synchronized.");
  } catch (error) {
    console.error("❌ Unable to connect to analytics database:", error);
    throw error;
  }
};
