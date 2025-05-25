import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Date
  scalar JSON

  type Order {
    id: ID!
    orderID: Int!
    firstName: String!
    lastName: String!
    email: String!
    status: String!
    paymentMethod: String!
    price: Float!
    tax: Float!
    deliveryFee: Float!
    orderedAt: Date!
    paidAt: Date
    inTransitAt: Date
    deliveredAt: Date
    make: String!
    carModel: String!
    year: Int!
    color: String!
    vin: String!
    address: String!
    city: String!
    state: String!
    zip: Int!
  }

  type OrderEdge {
    node: Order!
    cursor: String!
  }

  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
  }

  type OrderConnection {
    edges: [OrderEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  # Analytics Types
  type AppEvent {
    id: ID!
    eventType: String!
    timestamp: Date!
    url: String!
    domain: String!
    referrer: String
    userAgent: String!
    language: String!
    screenWidth: Int!
    screenHeight: Int!
    viewportWidth: Int!
    viewportHeight: Int!
    ipAddress: String!
    country: String
    region: String
    city: String
    timezone: String
    sessionId: String!
    userId: String
    deviceType: String
    browser: String
    operatingSystem: String
    isBot: Boolean
    metadata: JSON
    createdAt: Date!
    updatedAt: Date!
  }

  type AppPerformance {
    id: ID!
    sessionId: String!
    eventId: Int
    metricType: String!
    timestamp: Date!
    url: String!
    pageLoadTime: Float
    domContentLoadedTime: Float
    firstContentfulPaint: Float
    largestContentfulPaint: Float
    firstInputDelay: Float
    cumulativeLayoutShift: Float
    timeToInteractive: Float
    dnsLookupTime: Float
    tcpConnectTime: Float
    sslHandshakeTime: Float
    requestTime: Float
    responseTime: Float
    graphqlQueryName: String
    graphqlResponseTime: Float
    graphqlQuerySize: Int
    graphqlResponseSize: Int
    graphqlCacheHit: Boolean
    resourceType: String
    resourceSize: Int
    resourceLoadTime: Float
    connectionType: String
    effectiveConnectionType: String
    downlink: Float
    rtt: Float
    memoryUsage: Float
    cpuUsage: Float
    metadata: JSON
    createdAt: Date!
    updatedAt: Date!
  }

  type AppUsage {
    id: ID!
    sessionId: String!
    eventId: Int
    actionType: String!
    timestamp: Date!
    url: String!
    sessionStartTime: Date
    sessionEndTime: Date
    sessionDuration: Float
    pageViewDuration: Float
    paginationAction: String
    previousPage: Int
    newPage: Int
    previousPageSize: Int
    newPageSize: Int
    totalPages: Int
    totalRecords: Int
    columnAction: String
    columnName: String
    previousColumnState: Boolean
    newColumnState: Boolean
    visibleColumns: JSON
    hiddenColumns: JSON
    searchAction: String
    searchQuery: String
    previousSearchQuery: String
    searchFilters: JSON
    previousSearchFilters: JSON
    searchResultCount: Int
    searchDuration: Float
    clickTarget: String
    clickPosition: JSON
    scrollPosition: Int
    timeSpentOnPage: Float
    navigationAction: String
    previousUrl: String
    nextUrl: String
    exitType: String
    formAction: String
    formField: String
    formValue: String
    errorType: String
    errorMessage: String
    errorStack: String
    metadata: JSON
    createdAt: Date!
    updatedAt: Date!
  }

  # Input types for analytics
  input AppEventInput {
    eventType: String!
    timestamp: Date
    url: String!
    domain: String!
    referrer: String
    userAgent: String!
    language: String!
    screenWidth: Int!
    screenHeight: Int!
    viewportWidth: Int!
    viewportHeight: Int!
    timezone: String
    sessionId: String!
    userId: String
    deviceType: String
    browser: String
    operatingSystem: String
    metadata: JSON
  }

  input AppPerformanceInput {
    sessionId: String!
    eventId: Int
    metricType: String!
    timestamp: Date
    url: String!
    pageLoadTime: Float
    domContentLoadedTime: Float
    firstContentfulPaint: Float
    largestContentfulPaint: Float
    firstInputDelay: Float
    cumulativeLayoutShift: Float
    timeToInteractive: Float
    dnsLookupTime: Float
    tcpConnectTime: Float
    sslHandshakeTime: Float
    requestTime: Float
    responseTime: Float
    graphqlQueryName: String
    graphqlResponseTime: Float
    graphqlQuerySize: Int
    graphqlResponseSize: Int
    graphqlCacheHit: Boolean
    resourceType: String
    resourceSize: Int
    resourceLoadTime: Float
    connectionType: String
    effectiveConnectionType: String
    downlink: Float
    rtt: Float
    memoryUsage: Float
    cpuUsage: Float
    metadata: JSON
  }

  input AppUsageInput {
    sessionId: String!
    eventId: Int
    actionType: String!
    timestamp: Date
    url: String!
    sessionStartTime: Date
    sessionEndTime: Date
    sessionDuration: Float
    pageViewDuration: Float
    paginationAction: String
    previousPage: Int
    newPage: Int
    previousPageSize: Int
    newPageSize: Int
    totalPages: Int
    totalRecords: Int
    columnAction: String
    columnName: String
    previousColumnState: Boolean
    newColumnState: Boolean
    visibleColumns: JSON
    hiddenColumns: JSON
    searchAction: String
    searchQuery: String
    previousSearchQuery: String
    searchFilters: JSON
    previousSearchFilters: JSON
    searchResultCount: Int
    searchDuration: Float
    clickTarget: String
    clickPosition: JSON
    scrollPosition: Int
    timeSpentOnPage: Float
    navigationAction: String
    previousUrl: String
    nextUrl: String
    exitType: String
    formAction: String
    formField: String
    formValue: String
    errorType: String
    errorMessage: String
    errorStack: String
    metadata: JSON
  }

  type Query {
    orders(
      first: Int = 10
      page: Int = 1
      search: String
      searchFields: [String!]
    ): OrderConnection!

    # Analytics queries
    appEvents(
      limit: Int = 100
      offset: Int = 0
      sessionId: String
      eventType: String
      startDate: Date
      endDate: Date
    ): [AppEvent!]!

    appPerformance(
      limit: Int = 100
      offset: Int = 0
      sessionId: String
      metricType: String
      startDate: Date
      endDate: Date
    ): [AppPerformance!]!

    appUsage(
      limit: Int = 100
      offset: Int = 0
      sessionId: String
      actionType: String
      startDate: Date
      endDate: Date
    ): [AppUsage!]!
  }

  type Mutation {
    # Analytics mutations
    trackEvent(input: AppEventInput!): AppEvent!
    trackPerformance(input: AppPerformanceInput!): AppPerformance!
    trackUsage(input: AppUsageInput!): AppUsage!

    # Batch tracking
    trackEventsBatch(events: [AppEventInput!]!): [AppEvent!]!
    trackPerformanceBatch(
      performance: [AppPerformanceInput!]!
    ): [AppPerformance!]!
    trackUsageBatch(usage: [AppUsageInput!]!): [AppUsage!]!
  }
`;
