import { DataTypes, Model } from "sequelize";
import { analyticsDB } from "../config/database";

export interface AppUsageAttributes {
  id?: number;
  sessionId: string;
  eventId?: number;
  actionType: string;
  timestamp: Date;
  url: string;

  sessionStartTime?: Date;
  sessionEndTime?: Date;
  sessionDuration?: number;
  pageViewDuration?: number;

  paginationAction?: string; // 'next', 'previous', 'first', 'last', 'page_size_change'
  previousPage?: number;
  newPage?: number;
  previousPageSize?: number;
  newPageSize?: number;
  totalPages?: number;
  totalRecords?: number;

  columnAction?: string; // 'show', 'hide', 'toggle'
  columnName?: string;
  previousColumnState?: boolean;
  newColumnState?: boolean;
  visibleColumns?: object; // JSON array of visible column names
  hiddenColumns?: object; // JSON array of hidden column names

  searchAction?: string; // 'search', 'clear', 'filter_change'
  searchQuery?: string;
  previousSearchQuery?: string;
  searchFilters?: object; // JSON array of active filters
  previousSearchFilters?: object; // JSON array of previous filters
  searchResultCount?: number;
  searchDuration?: number;

  clickTarget?: string; // Element that was clicked
  clickPosition?: object; // {x, y} coordinates
  scrollPosition?: number;
  timeSpentOnPage?: number;

  navigationAction?: string; // 'back', 'forward', 'reload', 'external_link'
  previousUrl?: string;
  nextUrl?: string;
  exitType?: string; // 'navigation', 'close_tab', 'close_browser', 'timeout'

  formAction?: string; // 'focus', 'blur', 'change', 'submit'
  formField?: string;
  formValue?: string;

  errorType?: string;
  errorMessage?: string;
  errorStack?: string;

  metadata?: object;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AppUsage
  extends Model<AppUsageAttributes>
  implements AppUsageAttributes
{
  public id!: number;
  public sessionId!: string;
  public eventId?: number;
  public actionType!: string;
  public timestamp!: Date;
  public url!: string;

  public sessionStartTime?: Date;
  public sessionEndTime?: Date;
  public sessionDuration?: number;
  public pageViewDuration?: number;

  public paginationAction?: string;
  public previousPage?: number;
  public newPage?: number;
  public previousPageSize?: number;
  public newPageSize?: number;
  public totalPages?: number;
  public totalRecords?: number;

  public columnAction?: string;
  public columnName?: string;
  public previousColumnState?: boolean;
  public newColumnState?: boolean;
  public visibleColumns?: object;
  public hiddenColumns?: object;

  public searchAction?: string;
  public searchQuery?: string;
  public previousSearchQuery?: string;
  public searchFilters?: object;
  public previousSearchFilters?: object;
  public searchResultCount?: number;
  public searchDuration?: number;

  public clickTarget?: string;
  public clickPosition?: object;
  public scrollPosition?: number;
  public timeSpentOnPage?: number;

  public navigationAction?: string;
  public previousUrl?: string;
  public nextUrl?: string;
  public exitType?: string;

  public formAction?: string;
  public formField?: string;
  public formValue?: string;

  public errorType?: string;
  public errorMessage?: string;
  public errorStack?: string;

  public metadata?: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AppUsage.init(
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
    actionType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment:
        "Type of user action (pagination, column_visibility, search, navigation, etc.)",
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "UTC timestamp when action occurred",
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "URL where the action occurred",
    },

    sessionStartTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "When the session started",
    },
    sessionEndTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "When the session ended",
    },
    sessionDuration: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Total session duration in milliseconds",
    },
    pageViewDuration: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Time spent on current page in milliseconds",
    },

    paginationAction: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Type of pagination action",
    },
    previousPage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Previous page number",
    },
    newPage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "New page number",
    },
    previousPageSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Previous page size",
    },
    newPageSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "New page size",
    },
    totalPages: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Total number of pages available",
    },
    totalRecords: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Total number of records",
    },

    columnAction: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Type of column action",
    },
    columnName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Name of the column being modified",
    },
    previousColumnState: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "Previous visibility state of the column",
    },
    newColumnState: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "New visibility state of the column",
    },
    visibleColumns: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of currently visible column names",
    },
    hiddenColumns: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of currently hidden column names",
    },

    searchAction: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Type of search action",
    },
    searchQuery: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Current search query",
    },
    previousSearchQuery: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Previous search query",
    },
    searchFilters: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Currently active search filters",
    },
    previousSearchFilters: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Previously active search filters",
    },
    searchResultCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Number of results returned from search",
    },
    searchDuration: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Time taken for search to complete in milliseconds",
    },

    clickTarget: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Element or component that was clicked",
    },
    clickPosition: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "X,Y coordinates of the click",
    },
    scrollPosition: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Scroll position on the page",
    },
    timeSpentOnPage: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Time spent on current page in milliseconds",
    },

    navigationAction: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Type of navigation action",
    },
    previousUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "URL before navigation",
    },
    nextUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "URL after navigation",
    },
    exitType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "How the user left the page",
    },

    formAction: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Type of form interaction",
    },
    formField: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Form field that was interacted with",
    },
    formValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Value of the form field (anonymized if needed)",
    },

    errorType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Type of error that occurred",
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Error message",
    },
    errorStack: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Error stack trace",
    },

    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Additional usage metadata as JSON",
    },
  },
  {
    sequelize: analyticsDB,
    tableName: "app_usage",
    timestamps: true,
    indexes: [
      {
        fields: ["sessionId"],
      },
      {
        fields: ["actionType"],
      },
      {
        fields: ["timestamp"],
      },
      {
        fields: ["eventId"],
      },
      {
        fields: ["paginationAction"],
      },
      {
        fields: ["columnAction"],
      },
      {
        fields: ["searchAction"],
      },
      {
        fields: ["navigationAction"],
      },
      {
        fields: ["url"],
      },
    ],
  }
);
