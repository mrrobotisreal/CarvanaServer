import { useCallback, useEffect, useRef } from "react";
import { analytics } from "@/lib/analytics";
import type { EventData, PerformanceData, UsageData } from "@/lib/analytics";

export const useAnalytics = () => {
  const lastSearchRef = useRef<string>("");
  const lastSearchFiltersRef = useRef<string[]>([]);
  const lastPageRef = useRef<number>(1);
  const lastPageSizeRef = useRef<number>(10);
  const lastVisibleColumnsRef = useRef<string[]>([]);

  useEffect(() => {
    analytics.trackPageView();
  }, []);

  const trackPagination = useCallback(
    (
      action: string,
      data: {
        previousPage?: number;
        newPage?: number;
        previousPageSize?: number;
        newPageSize?: number;
        totalPages?: number;
        totalRecords?: number;
      }
    ) => {
      analytics.trackUsage({
        actionType: "pagination",
        paginationAction: action,
        ...data,
      });

      if (data.newPage !== undefined) lastPageRef.current = data.newPage;
      if (data.newPageSize !== undefined)
        lastPageSizeRef.current = data.newPageSize;
    },
    []
  );

  const trackNextPage = useCallback(
    (
      currentPage: number,
      newPage: number,
      pageSize: number,
      totalPages: number,
      totalRecords: number
    ) => {
      trackPagination("next", {
        previousPage: currentPage,
        newPage,
        previousPageSize: pageSize,
        newPageSize: pageSize,
        totalPages,
        totalRecords,
      });
    },
    [trackPagination]
  );

  const trackPreviousPage = useCallback(
    (
      currentPage: number,
      newPage: number,
      pageSize: number,
      totalPages: number,
      totalRecords: number
    ) => {
      trackPagination("previous", {
        previousPage: currentPage,
        newPage,
        previousPageSize: pageSize,
        newPageSize: pageSize,
        totalPages,
        totalRecords,
      });
    },
    [trackPagination]
  );

  const trackFirstPage = useCallback(
    (
      currentPage: number,
      pageSize: number,
      totalPages: number,
      totalRecords: number
    ) => {
      trackPagination("first", {
        previousPage: currentPage,
        newPage: 1,
        previousPageSize: pageSize,
        newPageSize: pageSize,
        totalPages,
        totalRecords,
      });
    },
    [trackPagination]
  );

  const trackLastPage = useCallback(
    (
      currentPage: number,
      lastPage: number,
      pageSize: number,
      totalPages: number,
      totalRecords: number
    ) => {
      trackPagination("last", {
        previousPage: currentPage,
        newPage: lastPage,
        previousPageSize: pageSize,
        newPageSize: pageSize,
        totalPages,
        totalRecords,
      });
    },
    [trackPagination]
  );

  const trackPageSizeChange = useCallback(
    (
      previousPageSize: number,
      newPageSize: number,
      currentPage: number,
      totalPages: number,
      totalRecords: number
    ) => {
      trackPagination("page_size_change", {
        previousPage: currentPage,
        newPage: 1,
        previousPageSize,
        newPageSize,
        totalPages,
        totalRecords,
      });
    },
    [trackPagination]
  );

  const trackColumnVisibility = useCallback(
    (
      columnName: string,
      previousState: boolean,
      newState: boolean,
      visibleColumns: string[]
    ) => {
      const hiddenColumns = lastVisibleColumnsRef.current.filter(
        (col) => !visibleColumns.includes(col)
      );

      analytics.trackUsage({
        actionType: "column_visibility",
        columnAction: newState ? "show" : "hide",
        columnName,
        previousColumnState: previousState,
        newColumnState: newState,
        visibleColumns,
        hiddenColumns,
      });

      lastVisibleColumnsRef.current = visibleColumns;
    },
    []
  );

  const trackSearch = useCallback(
    (
      searchQuery: string,
      searchFilters: string[],
      resultCount?: number,
      duration?: number
    ) => {
      analytics.trackUsage({
        actionType: "search",
        searchAction: "search",
        searchQuery,
        previousSearchQuery: lastSearchRef.current,
        searchFilters,
        previousSearchFilters: lastSearchFiltersRef.current,
        searchResultCount: resultCount,
        searchDuration: duration,
      });

      lastSearchRef.current = searchQuery;
      lastSearchFiltersRef.current = searchFilters;
    },
    []
  );

  const trackSearchFilterChange = useCallback(
    (previousFilters: string[], newFilters: string[]) => {
      analytics.trackUsage({
        actionType: "search",
        searchAction: "filter_change",
        searchFilters: newFilters,
        previousSearchFilters: previousFilters,
      });

      lastSearchFiltersRef.current = newFilters;
    },
    []
  );

  const trackSearchClear = useCallback(() => {
    analytics.trackUsage({
      actionType: "search",
      searchAction: "clear",
      searchQuery: "",
      previousSearchQuery: lastSearchRef.current,
      searchFilters: [],
      previousSearchFilters: lastSearchFiltersRef.current,
    });

    lastSearchRef.current = "";
    lastSearchFiltersRef.current = [];
  }, []);

  const trackClick = useCallback(
    (target: string, position?: { x: number; y: number }) => {
      analytics.trackUsage({
        actionType: "click",
        clickTarget: target,
        metadata: position ? { clickPosition: position } : undefined,
      });
    },
    []
  );

  const trackGraphQLQuery = useCallback(
    (
      queryName: string,
      startTime: number,
      querySize?: number,
      responseSize?: number
    ) => {
      const responseTime = Date.now() - startTime;
      analytics.trackGraphQLQuery(
        queryName,
        responseTime,
        querySize,
        responseSize
      );
    },
    []
  );

  const trackFormInteraction = useCallback(
    (action: string, field: string, value?: string) => {
      analytics.trackUsage({
        actionType: "form",
        metadata: {
          formAction: action,
          formField: field,
          formValue: value,
        },
      });
    },
    []
  );

  const trackError = useCallback(
    (errorType: string, errorMessage: string, errorStack?: string) => {
      analytics.trackUsage({
        actionType: "error",
        metadata: {
          errorType,
          errorMessage,
          errorStack,
        },
      });
    },
    []
  );

  const trackEvent = useCallback((data: EventData) => {
    analytics.trackEvent(data);
  }, []);

  const trackPerformance = useCallback((data: PerformanceData) => {
    analytics.trackPerformance(data);
  }, []);

  const trackUsage = useCallback((data: UsageData) => {
    analytics.trackUsage(data);
  }, []);

  return {
    trackNextPage,
    trackPreviousPage,
    trackFirstPage,
    trackLastPage,
    trackPageSizeChange,

    trackColumnVisibility,

    trackSearch,
    trackSearchFilterChange,
    trackSearchClear,

    trackClick,
    trackFormInteraction,

    trackGraphQLQuery,

    trackError,

    trackEvent,
    trackPerformance,
    trackUsage,
  };
};
