import { AppEvent, AppPerformance, AppUsage } from "../models";
import { Op } from "sequelize";
import geoip from "geoip-lite";

const getGeolocationFromIP = (ipAddress: string) => {
  try {
    const geo = geoip.lookup(ipAddress);
    if (geo) {
      return {
        country: geo.country,
        region: geo.region,
        city: geo.city,
      };
    }
  } catch (error) {
    console.error("Geolocation lookup error:", error);
  }
  return {
    country: null,
    region: null,
    city: null,
  };
};

const getDeviceType = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone")
  ) {
    return "mobile";
  }
  if (ua.includes("tablet") || ua.includes("ipad")) {
    return "tablet";
  }
  return "desktop";
};

const isBot = (userAgent: string): boolean => {
  const botPatterns = [
    "bot",
    "crawler",
    "spider",
    "scraper",
    "facebook",
    "twitter",
    "linkedin",
    "whatsapp",
    "telegram",
    "slackbot",
    "googlebot",
    "bingbot",
    "yandexbot",
    "baiduspider",
    "duckduckbot",
  ];
  const ua = userAgent.toLowerCase();
  return botPatterns.some((pattern) => ua.includes(pattern));
};

const getBrowser = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("chrome")) return "Chrome";
  if (ua.includes("edge")) return "Edge";
  if (ua.includes("opera")) return "Opera";
  return "Unknown";
};

const getOperatingSystem = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("macintosh") || ua.includes("mac os")) return "macOS";
  if (ua.includes("linux")) return "Linux";
  if (ua.includes("android")) return "Android";
  if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad"))
    return "iOS";
  return "Unknown";
};

export const analyticsResolvers = {
  Query: {
    appEvents: async (
      _: any,
      { limit, offset, sessionId, eventType, startDate, endDate }: any
    ) => {
      const where: any = {};

      if (sessionId) where.sessionId = sessionId;
      if (eventType) where.eventType = eventType;

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp[Op.gte] = new Date(startDate);
        if (endDate) where.timestamp[Op.lte] = new Date(endDate);
      }

      const events = await AppEvent.findAll({
        where,
        limit: limit || 100,
        offset: offset || 0,
        order: [["timestamp", "DESC"]],
      });

      return events.map((event) => event.toJSON());
    },

    appPerformance: async (
      _: any,
      { limit, offset, sessionId, metricType, startDate, endDate }: any
    ) => {
      const where: any = {};

      if (sessionId) where.sessionId = sessionId;
      if (metricType) where.metricType = metricType;

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp[Op.gte] = new Date(startDate);
        if (endDate) where.timestamp[Op.lte] = new Date(endDate);
      }

      const performance = await AppPerformance.findAll({
        where,
        limit: limit || 100,
        offset: offset || 0,
        order: [["timestamp", "DESC"]],
      });

      return performance.map((perf) => perf.toJSON());
    },

    appUsage: async (
      _: any,
      { limit, offset, sessionId, actionType, startDate, endDate }: any
    ) => {
      const where: any = {};

      if (sessionId) where.sessionId = sessionId;
      if (actionType) where.actionType = actionType;

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp[Op.gte] = new Date(startDate);
        if (endDate) where.timestamp[Op.lte] = new Date(endDate);
      }

      const usage = await AppUsage.findAll({
        where,
        limit: limit || 100,
        offset: offset || 0,
        order: [["timestamp", "DESC"]],
      });

      return usage.map((use) => use.toJSON());
    },
  },

  Mutation: {
    trackEvent: async (_: any, { input }: any, context: any) => {
      const { req } = context;
      const ipAddress =
        req?.ip || req?.connection?.remoteAddress || "127.0.0.1";

      const geoLocation = getGeolocationFromIP(ipAddress);

      const eventData = {
        ...input,
        timestamp: input.timestamp || new Date(),
        ipAddress,
        ...geoLocation,
        deviceType: getDeviceType(input.userAgent),
        browser: getBrowser(input.userAgent),
        operatingSystem: getOperatingSystem(input.userAgent),
        isBot: isBot(input.userAgent),
      };

      const event = await AppEvent.create(eventData);
      return event.toJSON();
    },

    trackPerformance: async (_: any, { input }: any) => {
      const performanceData = {
        ...input,
        timestamp: input.timestamp || new Date(),
      };

      const performance = await AppPerformance.create(performanceData);
      return performance.toJSON();
    },

    trackUsage: async (_: any, { input }: any) => {
      const usageData = {
        ...input,
        timestamp: input.timestamp || new Date(),
      };

      const usage = await AppUsage.create(usageData);
      return usage.toJSON();
    },

    trackEventsBatch: async (_: any, { events }: any, context: any) => {
      const { req } = context;
      const ipAddress =
        req?.ip || req?.connection?.remoteAddress || "127.0.0.1";

      const eventsData = events.map((event: any) => {
        const geoLocation = getGeolocationFromIP(ipAddress);

        return {
          ...event,
          timestamp: event.timestamp || new Date(),
          ipAddress,
          ...geoLocation,
          deviceType: getDeviceType(event.userAgent),
          browser: getBrowser(event.userAgent),
          operatingSystem: getOperatingSystem(event.userAgent),
          isBot: isBot(event.userAgent),
        };
      });

      const createdEvents = await AppEvent.bulkCreate(eventsData);
      return createdEvents.map((event) => event.toJSON());
    },

    trackPerformanceBatch: async (_: any, { performance }: any) => {
      const performanceData = performance.map((perf: any) => ({
        ...perf,
        timestamp: perf.timestamp || new Date(),
      }));

      const createdPerformance = await AppPerformance.bulkCreate(
        performanceData
      );
      return createdPerformance.map((perf) => perf.toJSON());
    },

    trackUsageBatch: async (_: any, { usage }: any) => {
      const usageData = usage.map((use: any) => ({
        ...use,
        timestamp: use.timestamp || new Date(),
      }));

      const createdUsage = await AppUsage.bulkCreate(usageData);
      return createdUsage.map((use) => use.toJSON());
    },
  },
};
