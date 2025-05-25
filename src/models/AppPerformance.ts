import { DataTypes, Model } from "sequelize";
import { analyticsDB } from "../config/database";

export interface AppPerformanceAttributes {
  id?: number;
  sessionId: string;
  eventId?: number;
  metricType: string;
  timestamp: Date;
  url: string;

  pageLoadTime?: number;
  domContentLoadedTime?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  timeToInteractive?: number;

  dnsLookupTime?: number;
  tcpConnectTime?: number;
  sslHandshakeTime?: number;
  requestTime?: number;
  responseTime?: number;

  graphqlQueryName?: string;
  graphqlResponseTime?: number;
  graphqlQuerySize?: number;
  graphqlResponseSize?: number;
  graphqlCacheHit?: boolean;

  resourceType?: string;
  resourceSize?: number;
  resourceLoadTime?: number;

  connectionType?: string;
  effectiveConnectionType?: string;
  downlink?: number;
  rtt?: number;

  memoryUsage?: number;
  cpuUsage?: number;

  metadata?: object;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AppPerformance
  extends Model<AppPerformanceAttributes>
  implements AppPerformanceAttributes
{
  public id!: number;
  public sessionId!: string;
  public eventId?: number;
  public metricType!: string;
  public timestamp!: Date;
  public url!: string;

  public pageLoadTime?: number;
  public domContentLoadedTime?: number;
  public firstContentfulPaint?: number;
  public largestContentfulPaint?: number;
  public firstInputDelay?: number;
  public cumulativeLayoutShift?: number;
  public timeToInteractive?: number;

  public dnsLookupTime?: number;
  public tcpConnectTime?: number;
  public sslHandshakeTime?: number;
  public requestTime?: number;
  public responseTime?: number;

  public graphqlQueryName?: string;
  public graphqlResponseTime?: number;
  public graphqlQuerySize?: number;
  public graphqlResponseSize?: number;
  public graphqlCacheHit?: boolean;

  public resourceType?: string;
  public resourceSize?: number;
  public resourceLoadTime?: number;

  public connectionType?: string;
  public effectiveConnectionType?: string;
  public downlink?: number;
  public rtt?: number;

  public memoryUsage?: number;
  public cpuUsage?: number;

  public metadata?: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AppPerformance.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Session identifier",
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Related app_events id if applicable",
    },
    metricType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment:
        "Type of performance metric (page_load, graphql_query, resource_load, etc.)",
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "UTC timestamp when metric was recorded",
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "URL where the metric was measured",
    },

    pageLoadTime: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Total page load time in milliseconds",
    },
    domContentLoadedTime: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "DOM content loaded time in milliseconds",
    },
    firstContentfulPaint: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "First Contentful Paint in milliseconds",
    },
    largestContentfulPaint: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Largest Contentful Paint in milliseconds",
    },
    firstInputDelay: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "First Input Delay in milliseconds",
    },
    cumulativeLayoutShift: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Cumulative Layout Shift score",
    },
    timeToInteractive: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Time to Interactive in milliseconds",
    },

    dnsLookupTime: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "DNS lookup time in milliseconds",
    },
    tcpConnectTime: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "TCP connection time in milliseconds",
    },
    sslHandshakeTime: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "SSL handshake time in milliseconds",
    },
    requestTime: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Request time in milliseconds",
    },
    responseTime: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Response time in milliseconds",
    },

    graphqlQueryName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Name of the GraphQL query",
    },
    graphqlResponseTime: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "GraphQL response time in milliseconds",
    },
    graphqlQuerySize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Size of GraphQL query in bytes",
    },
    graphqlResponseSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Size of GraphQL response in bytes",
    },
    graphqlCacheHit: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "Whether the GraphQL query was served from cache",
    },

    resourceType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Type of resource (script, image, stylesheet, etc.)",
    },
    resourceSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Size of resource in bytes",
    },
    resourceLoadTime: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Resource load time in milliseconds",
    },

    connectionType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Connection type (wifi, cellular, etc.)",
    },
    effectiveConnectionType: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "Effective connection type (slow-2g, 2g, 3g, 4g)",
    },
    downlink: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Downlink speed in Mbps",
    },
    rtt: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Round-trip time in milliseconds",
    },

    memoryUsage: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Memory usage in MB",
    },
    cpuUsage: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "CPU usage percentage",
    },

    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Additional performance metadata as JSON",
    },
  },
  {
    sequelize: analyticsDB,
    tableName: "app_performance",
    timestamps: true,
    indexes: [
      {
        fields: ["sessionId"],
      },
      {
        fields: ["metricType"],
      },
      {
        fields: ["timestamp"],
      },
      {
        fields: ["eventId"],
      },
      {
        fields: ["graphqlQueryName"],
      },
      {
        fields: ["url"],
      },
    ],
  }
);
