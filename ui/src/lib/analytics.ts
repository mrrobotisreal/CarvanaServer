import { graphqlClient } from "./graphql-client";
import { gql } from "graphql-request";

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

export const getSessionId = (): string => {
  let sessionId = localStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
};

export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    userAgent,
    language,
    timezone,
    screenWidth: screen.width,
    screenHeight: screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  };
};

export const getConnectionInfo = () => {
  const connection =
    (
      navigator as unknown as {
        connection?: {
          type?: string;
          effectiveType?: string;
          downlink?: number;
          rtt?: number;
        };
        mozConnection?: {
          type?: string;
          effectiveType?: string;
          downlink?: number;
          rtt?: number;
        };
        webkitConnection?: {
          type?: string;
          effectiveType?: string;
          downlink?: number;
          rtt?: number;
        };
      }
    ).connection ||
    (
      navigator as unknown as {
        mozConnection?: {
          type?: string;
          effectiveType?: string;
          downlink?: number;
          rtt?: number;
        };
      }
    ).mozConnection ||
    (
      navigator as unknown as {
        webkitConnection?: {
          type?: string;
          effectiveType?: string;
          downlink?: number;
          rtt?: number;
        };
      }
    ).webkitConnection;

  if (connection) {
    return {
      connectionType: connection.type || "unknown",
      effectiveConnectionType: connection.effectiveType || "unknown",
      downlink: connection.downlink || null,
      rtt: connection.rtt || null,
    };
  }

  return {
    connectionType: "unknown",
    effectiveConnectionType: "unknown",
    downlink: null,
    rtt: null,
  };
};

export const getPerformanceMetrics = () => {
  const navigation = performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType("paint");

  const metrics: Record<string, number> = {};

  if (navigation) {
    metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
    metrics.domContentLoadedTime =
      navigation.domContentLoadedEventEnd - navigation.fetchStart;
    metrics.dnsLookupTime =
      navigation.domainLookupEnd - navigation.domainLookupStart;
    metrics.tcpConnectTime = navigation.connectEnd - navigation.connectStart;
    metrics.requestTime = navigation.responseStart - navigation.requestStart;
    metrics.responseTime = navigation.responseEnd - navigation.responseStart;

    if (navigation.secureConnectionStart > 0) {
      metrics.sslHandshakeTime =
        navigation.connectEnd - navigation.secureConnectionStart;
    }
  }

  paint.forEach((entry) => {
    if (entry.name === "first-contentful-paint") {
      metrics.firstContentfulPaint = entry.startTime;
    }
  });

  // Try to get LCP, FID, CLS if available
  if ("web-vitals" in window) {
    // TODO: use web-vitals to get LCP, FID, CLS
  }

  return metrics;
};

export const getMemoryInfo = () => {
  const memory = (
    performance as unknown as { memory?: { usedJSHeapSize: number } }
  ).memory;
  if (memory) {
    return {
      memoryUsage: memory.usedJSHeapSize / (1024 * 1024), // Convert to MB
    };
  }
  return { memoryUsage: null };
};

const TRACK_PERFORMANCE_MUTATION = gql`
  mutation TrackPerformance($input: AppPerformanceInput!) {
    trackPerformance(input: $input) {
      id
      timestamp
    }
  }
`;

const TRACK_USAGE_MUTATION = gql`
  mutation TrackUsage($input: AppUsageInput!) {
    trackUsage(input: $input) {
      id
      timestamp
    }
  }
`;

const TRACK_EVENTS_BATCH_MUTATION = gql`
  mutation TrackEventsBatch($events: [AppEventInput!]!) {
    trackEventsBatch(events: $events) {
      id
      timestamp
    }
  }
`;

export interface EventData {
  eventType: string;
  url?: string;
  domain?: string;
  referrer?: string;
  metadata?: Record<string, unknown>;
}

export interface PerformanceData {
  metricType: string;
  url?: string;
  graphqlQueryName?: string;
  graphqlResponseTime?: number;
  graphqlQuerySize?: number;
  graphqlResponseSize?: number;
  metadata?: Record<string, unknown>;
}

export interface UsageData {
  actionType: string;
  url?: string;
  paginationAction?: string;
  previousPage?: number;
  newPage?: number;
  previousPageSize?: number;
  newPageSize?: number;
  totalPages?: number;
  totalRecords?: number;
  columnAction?: string;
  columnName?: string;
  previousColumnState?: boolean;
  newColumnState?: boolean;
  visibleColumns?: string[];
  hiddenColumns?: string[];
  searchAction?: string;
  searchQuery?: string;
  previousSearchQuery?: string;
  searchFilters?: string[];
  previousSearchFilters?: string[];
  searchResultCount?: number;
  searchDuration?: number;
  clickTarget?: string;
  navigationAction?: string;
  timeSpentOnPage?: number;
  metadata?: Record<string, unknown>;
}

export class AnalyticsService {
  private sessionId: string;
  private eventQueue: (EventData & {
    sessionId: string;
    [key: string]: unknown;
  })[] = [];
  private performanceQueue: (PerformanceData & {
    sessionId: string;
    [key: string]: unknown;
  })[] = [];
  private usageQueue: (UsageData & {
    sessionId: string;
    [key: string]: unknown;
  })[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private sessionStartTime: Date;
  private pageViewStartTime: Date;
  private lastActivity: Date;

  constructor() {
    this.sessionId = getSessionId();
    this.sessionStartTime = new Date();
    this.pageViewStartTime = new Date();
    this.lastActivity = new Date();

    setInterval(() => this.flush(), this.flushInterval);

    window.addEventListener("beforeunload", () => this.flush());

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.trackUsage({
          actionType: "navigation",
          navigationAction: "page_hidden",
          timeSpentOnPage: Date.now() - this.pageViewStartTime.getTime(),
        });
      } else if (document.visibilityState === "visible") {
        this.pageViewStartTime = new Date();
        this.trackUsage({
          actionType: "navigation",
          navigationAction: "page_visible",
        });
      }
    });
  }

  async trackEvent(data: EventData) {
    try {
      const browserInfo = getBrowserInfo();
      const eventData = {
        ...data,
        sessionId: this.sessionId,
        url: data.url || window.location.href,
        domain: data.domain || window.location.hostname,
        referrer: data.referrer || document.referrer,
        ...browserInfo,
      };

      this.eventQueue.push(eventData);

      if (this.eventQueue.length >= this.batchSize) {
        await this.flushEvents();
      }
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  }

  async trackPerformance(data: PerformanceData) {
    try {
      const connectionInfo = getConnectionInfo();
      const memoryInfo = getMemoryInfo();

      const performanceData = {
        ...data,
        sessionId: this.sessionId,
        url: data.url || window.location.href,
        ...connectionInfo,
        ...memoryInfo,
      };

      this.performanceQueue.push(performanceData);

      if (this.performanceQueue.length >= this.batchSize) {
        await this.flushPerformance();
      }
    } catch (error) {
      console.error("Failed to track performance:", error);
    }
  }

  async trackUsage(data: UsageData) {
    try {
      this.lastActivity = new Date();

      const usageData = {
        ...data,
        sessionId: this.sessionId,
        url: data.url || window.location.href,
        sessionStartTime: this.sessionStartTime,
        pageViewDuration: Date.now() - this.pageViewStartTime.getTime(),
      };

      this.usageQueue.push(usageData);

      if (this.usageQueue.length >= this.batchSize) {
        await this.flushUsage();
      }
    } catch (error) {
      console.error("Failed to track usage:", error);
    }
  }

  private async flushEvents() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await graphqlClient.request(TRACK_EVENTS_BATCH_MUTATION, { events });
    } catch (error) {
      console.error("Failed to flush events:", error);
      this.eventQueue.unshift(...events);
    }
  }

  private async flushPerformance() {
    if (this.performanceQueue.length === 0) return;

    try {
      const performance = [...this.performanceQueue];
      this.performanceQueue = [];

      for (const perf of performance) {
        await graphqlClient.request(TRACK_PERFORMANCE_MUTATION, {
          input: perf,
        });
      }
    } catch (error) {
      console.error("Failed to flush performance metrics:", error);
    }
  }

  private async flushUsage() {
    if (this.usageQueue.length === 0) return;

    try {
      const usage = [...this.usageQueue];
      this.usageQueue = [];

      for (const use of usage) {
        await graphqlClient.request(TRACK_USAGE_MUTATION, { input: use });
      }
    } catch (error) {
      console.error("Failed to flush usage metrics:", error);
    }
  }

  async flush() {
    await Promise.all([
      this.flushEvents(),
      this.flushPerformance(),
      this.flushUsage(),
    ]);
  }

  async trackPageView() {
    this.pageViewStartTime = new Date();

    await this.trackEvent({
      eventType: "visit",
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });

    setTimeout(() => {
      const performanceMetrics = getPerformanceMetrics();
      this.trackPerformance({
        metricType: "page_load",
        ...performanceMetrics,
      });
    }, 1000);
  }

  async trackGraphQLQuery(
    queryName: string,
    responseTime: number,
    querySize?: number,
    responseSize?: number
  ) {
    await this.trackPerformance({
      metricType: "graphql_query",
      graphqlQueryName: queryName,
      graphqlResponseTime: responseTime,
      graphqlQuerySize: querySize,
      graphqlResponseSize: responseSize,
    });
  }
}

export const analytics = new AnalyticsService();
