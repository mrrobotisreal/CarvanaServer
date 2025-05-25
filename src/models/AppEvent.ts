import { DataTypes, Model } from "sequelize";
import { analyticsDB } from "../config/database";

export interface AppEventAttributes {
  id?: number;
  eventType: string;
  timestamp: Date;
  url: string;
  domain: string;
  referrer?: string;
  userAgent: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  ipAddress: string;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  sessionId: string;
  userId?: string;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  isBot?: boolean;
  metadata?: object;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AppEvent
  extends Model<AppEventAttributes>
  implements AppEventAttributes
{
  public id!: number;
  public eventType!: string;
  public timestamp!: Date;
  public url!: string;
  public domain!: string;
  public referrer?: string;
  public userAgent!: string;
  public language!: string;
  public screenWidth!: number;
  public screenHeight!: number;
  public viewportWidth!: number;
  public viewportHeight!: number;
  public ipAddress!: string;
  public country?: string;
  public region?: string;
  public city?: string;
  public timezone?: string;
  public sessionId!: string;
  public userId?: string;
  public deviceType?: string;
  public browser?: string;
  public operatingSystem?: string;
  public isBot?: boolean;
  public metadata?: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AppEvent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    eventType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Type of event (e.g., visit, page_view)",
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "UTC timestamp of the event",
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Full URL of the page",
    },
    domain: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Domain of the page",
    },
    referrer: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Referrer URL",
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Browser user agent string",
    },
    language: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "Browser language",
    },
    screenWidth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Screen width in pixels",
    },
    screenHeight: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Screen height in pixels",
    },
    viewportWidth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Viewport width in pixels",
    },
    viewportHeight: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Viewport height in pixels",
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "IP address (supports IPv6)",
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Country from IP geolocation",
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Region/state from IP geolocation",
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "City from IP geolocation",
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Timezone from browser",
    },
    sessionId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Session identifier",
    },
    userId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "User identifier if available",
    },
    deviceType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Device type (mobile, tablet, desktop)",
    },
    browser: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Browser name and version",
    },
    operatingSystem: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Operating system",
    },
    isBot: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: "Whether the request appears to be from a bot",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Additional metadata as JSON",
    },
  },
  {
    sequelize: analyticsDB,
    tableName: "app_events",
    timestamps: true,
    indexes: [
      {
        fields: ["eventType"],
      },
      {
        fields: ["timestamp"],
      },
      {
        fields: ["sessionId"],
      },
      {
        fields: ["domain"],
      },
      {
        fields: ["ipAddress"],
      },
    ],
  }
);
