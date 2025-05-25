import { useState, useMemo, useEffect, useRef } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { allColumns, defaultVisibleColumns } from "./columns";
import { useOrders } from "@/hooks/useOrders";
import { useDebounce } from "@/hooks/useDebounce";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  FilterIcon,
  Loader2,
  SettingsIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  X,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "./ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

export function OrdersTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      const initialState: VisibilityState = {};
      allColumns.forEach((column) => {
        if ("accessorKey" in column && column.accessorKey) {
          initialState[column.accessorKey] = false;
        } else if (column.id) {
          initialState[column.id] = false;
        }
      });
      defaultVisibleColumns.forEach((columnKey) => {
        initialState[columnKey] = true;
      });
      return initialState;
    }
  );

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);
  const [selectedSearchFilters, setSelectedSearchFilters] = useState<string[]>(
    []
  );
  const [isOrderIdChecked, setIsOrderIdChecked] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isFirstNameChecked, setIsFirstNameChecked] = useState(false);
  const [isLastNameChecked, setIsLastNameChecked] = useState(false);
  const [isStatusChecked, setIsStatusChecked] = useState(false);
  const [isPaymentMethodChecked, setIsPaymentMethodChecked] = useState(false);
  const [isPriceChecked, setIsPriceChecked] = useState(false);
  const [isMakeChecked, setIsMakeChecked] = useState(false);
  const [isCarModelChecked, setIsCarModelChecked] = useState(false);
  const [isYearChecked, setIsYearChecked] = useState(false);
  const [isColorChecked, setIsColorChecked] = useState(false);
  const [isVinChecked, setIsVinChecked] = useState(false);
  const [isAddressChecked, setIsAddressChecked] = useState(false);
  const [isCityChecked, setIsCityChecked] = useState(false);
  const [isStateChecked, setIsStateChecked] = useState(false);
  const [isZipChecked, setIsZipChecked] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);

  const debouncedSearchText = useDebounce(searchText, 1000);

  const analytics = useAnalytics();

  const prevPageSizeRef = useRef(pageSize);
  const prevCurrentPageRef = useRef(currentPage);
  const prevSearchTextRef = useRef("");
  const prevSelectedSearchFiltersRef = useRef<string[]>([]);
  const searchStartTimeRef = useRef<number>(0);

  const visibleFields = useMemo(() => {
    return Object.keys(columnVisibility).filter((key) => columnVisibility[key]);
  }, [columnVisibility]);

  const searchFields = useMemo(() => {
    return selectedSearchFilters.length > 0 ? selectedSearchFilters : undefined;
  }, [selectedSearchFilters]);

  useEffect(() => {
    const searchTextChanged = debouncedSearchText !== prevSearchTextRef.current;
    const searchFieldsChanged =
      JSON.stringify(selectedSearchFilters) !==
      JSON.stringify(prevSelectedSearchFiltersRef.current);

    if (searchTextChanged || searchFieldsChanged) {
      setCurrentPage(1);
    }

    if (searchTextChanged && searchStartTimeRef.current > 0) {
      const searchDuration = Date.now() - searchStartTimeRef.current;
      setTimeout(() => {
        analytics.trackSearch(
          debouncedSearchText,
          selectedSearchFilters,
          undefined,
          searchDuration
        );
      }, 0);
    }

    prevSearchTextRef.current = debouncedSearchText;
    prevSelectedSearchFiltersRef.current = selectedSearchFilters;
  }, [debouncedSearchText, selectedSearchFilters, analytics]);

  const { data, isLoading, status, error } = useOrders(
    pageSize,
    currentPage,
    visibleFields,
    debouncedSearchText || undefined,
    searchFields
  );
  console.log(status, error);

  const tableData = useMemo(() => {
    return data?.edges.map((e) => e.node) ?? [];
  }, [data]);

  const paginationDisplay = useMemo(() => {
    if (!data || data.totalCount === 0) {
      return ["No orders", "No pages"];
    }

    let currentPageNumber: number;
    let startItem: number;
    let endItem: number;

    if (data.totalCount <= pageSize) {
      currentPageNumber = 1;
      startItem = 1;
      endItem = data.totalCount;
    } else {
      currentPageNumber = currentPage;
      startItem = (currentPage - 1) * pageSize + 1;
      endItem = Math.min(
        currentPage * pageSize,
        startItem + tableData.length - 1
      );
    }

    return [
      `${startItem}-${endItem} of ${data.totalCount}`,
      `${currentPageNumber} of ${Math.ceil(data.totalCount / pageSize)}`,
    ];
  }, [data, currentPage, pageSize, tableData.length]);

  const visibleColumns = useMemo(() => {
    return allColumns.filter((column) => {
      if ("accessorKey" in column && column.accessorKey) {
        return columnVisibility[column.accessorKey];
      }
      if (column.id) {
        return columnVisibility[column.id];
      }
      return false;
    });
  }, [columnVisibility]);

  const table = useReactTable({
    data: tableData,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    manualPagination: true,
  });

  const updatePageSize = (newPageSize: number) => {
    const totalPages = data ? Math.ceil(data.totalCount / newPageSize) : 1;
    analytics.trackPageSizeChange(
      prevPageSizeRef.current,
      newPageSize,
      currentPage,
      totalPages,
      data?.totalCount || 0
    );

    prevPageSizeRef.current = newPageSize;
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const goToNextPage = () => {
    if (data?.pageInfo.hasNextPage) {
      const newPage = currentPage + 1;
      const totalPages = Math.ceil(data.totalCount / pageSize);

      analytics.trackNextPage(
        currentPage,
        newPage,
        pageSize,
        totalPages,
        data.totalCount
      );

      prevCurrentPageRef.current = newPage;
      setCurrentPage(newPage);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 1;

      analytics.trackPreviousPage(
        currentPage,
        newPage,
        pageSize,
        totalPages,
        data?.totalCount || 0
      );

      prevCurrentPageRef.current = newPage;
      setCurrentPage(newPage);
    }
  };

  const goToFirstPage = () => {
    const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 1;

    analytics.trackFirstPage(
      currentPage,
      pageSize,
      totalPages,
      data?.totalCount || 0
    );

    prevCurrentPageRef.current = 1;
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    if (data) {
      const totalPages = Math.ceil(data.totalCount / pageSize);

      analytics.trackLastPage(
        currentPage,
        totalPages,
        pageSize,
        totalPages,
        data.totalCount
      );

      prevCurrentPageRef.current = totalPages;
      setCurrentPage(totalPages);
    }
  };

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && searchInputRef.current) {
      // Small delay to ensure DOM has updated
      const timeoutId = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, debouncedSearchText]);

  const handleSearchFilterChange = (
    checked: boolean | string,
    filterName: string,
    setterFunction: (value: boolean) => void
  ) => {
    const isChecked = !!checked;
    let newFilters: string[];

    if (isChecked) {
      newFilters = [...new Set([...selectedSearchFilters, filterName])];
    } else {
      newFilters = selectedSearchFilters.filter(
        (filter) => filter !== filterName
      );
    }

    analytics.trackSearchFilterChange(
      prevSelectedSearchFiltersRef.current,
      newFilters
    );
    prevSelectedSearchFiltersRef.current = newFilters;

    setSelectedSearchFilters(newFilters);
    setterFunction(isChecked);
  };

  const handleColumnVisibilityChange = (
    columnKey: string,
    checked: boolean
  ) => {
    const currentVisibleColumns = Object.keys(columnVisibility).filter(
      (key) => columnVisibility[key]
    );
    const newVisibleColumns = checked
      ? [...currentVisibleColumns, columnKey]
      : currentVisibleColumns.filter((col) => col !== columnKey);

    analytics.trackColumnVisibility(
      columnKey,
      columnVisibility[columnKey] || false,
      checked,
      newVisibleColumns
    );

    setColumnVisibility((prev) => ({
      ...prev,
      [columnKey]: checked,
    }));
  };

  const handleSearchTextChange = (value: string) => {
    if (value && !searchStartTimeRef.current) {
      searchStartTimeRef.current = Date.now();
    } else if (!value && searchStartTimeRef.current) {
      searchStartTimeRef.current = 0;
    }

    setSearchText(value);
  };

  const handleSearchClear = () => {
    analytics.trackSearchClear();
    searchStartTimeRef.current = 0;
    setSearchText("");
  };

  return (
    <Card className="w-full rounded-md border p-4 bg-gray-600">
      <div className="flex flex-row items-center justify-evenly py-4">
        <Popover open={isSearchFilterOpen} onOpenChange={setIsSearchFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-cvna-blue-3 text-white"
              onClick={() => analytics.trackClick("search_filters_button")}
            >
              <FilterIcon size={16} />
              <div className="hidden md:block">
                {selectedSearchFilters.length === 0 && "Search filters"}
                {selectedSearchFilters.length > 4 &&
                  selectedSearchFilters
                    .slice(0, 4)
                    .map(
                      (filter) =>
                        filter.charAt(0).toUpperCase() + filter.slice(1)
                    )
                    .join(", ") + "..."}
                {selectedSearchFilters.length > 0 &&
                  selectedSearchFilters.length <= 4 &&
                  selectedSearchFilters
                    .map(
                      (filter) =>
                        filter.charAt(0).toUpperCase() + filter.slice(1)
                    )
                    .join(", ")}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-cvna-blue-6">
            <div className="flex flex-col gap-2">
              <p className="text-md md:text-lg font-bold text-white">
                Search filters
              </p>
              <Separator />
              <div className="flex flex-col gap-2 bg-white border border-gray-300 rounded-md p-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="order-id"
                    checked={isOrderIdChecked}
                    onCheckedChange={(checked) =>
                      handleSearchFilterChange(
                        checked,
                        "orderID",
                        setIsOrderIdChecked
                      )
                    }
                  />
                  <label
                    htmlFor="order-id"
                    className="font-medium leading-none"
                  >
                    Order ID
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email"
                    checked={isEmailChecked}
                    onCheckedChange={(checked) =>
                      handleSearchFilterChange(
                        checked,
                        "email",
                        setIsEmailChecked
                      )
                    }
                  />
                  <label htmlFor="email" className="font-medium leading-none">
                    Email
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="first-name"
                    checked={isFirstNameChecked}
                    onCheckedChange={(checked) =>
                      handleSearchFilterChange(
                        checked,
                        "firstName",
                        setIsFirstNameChecked
                      )
                    }
                  />
                  <label
                    htmlFor="first-name"
                    className="font-medium leading-none"
                  >
                    First Name
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="last-name"
                    checked={isLastNameChecked}
                    onCheckedChange={(checked) =>
                      handleSearchFilterChange(
                        checked,
                        "lastName",
                        setIsLastNameChecked
                      )
                    }
                  />
                  <label
                    htmlFor="last-name"
                    className="font-medium leading-none"
                  >
                    Last Name
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status"
                    checked={isStatusChecked}
                    onCheckedChange={(checked) =>
                      handleSearchFilterChange(
                        checked,
                        "status",
                        setIsStatusChecked
                      )
                    }
                  />
                  <label htmlFor="status" className="font-medium leading-none">
                    Status
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="payment-method"
                    checked={isPaymentMethodChecked}
                    onCheckedChange={(checked) =>
                      handleSearchFilterChange(
                        checked,
                        "paymentMethod",
                        setIsPaymentMethodChecked
                      )
                    }
                  />
                  <label
                    htmlFor="payment-method"
                    className="font-medium leading-none"
                  >
                    Payment Method
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="price"
                    checked={isPriceChecked}
                    onCheckedChange={(checked) =>
                      handleSearchFilterChange(
                        checked,
                        "price",
                        setIsPriceChecked
                      )
                    }
                  />
                  <label htmlFor="price" className="font-medium leading-none">
                    Price
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="make"
                    checked={isMakeChecked}
                    onCheckedChange={(checked) =>
                      handleSearchFilterChange(
                        checked,
                        "make",
                        setIsMakeChecked
                      )
                    }
                  />
                  <label htmlFor="make" className="font-medium leading-none">
                    Make
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="car-model"
                    checked={isCarModelChecked}
                    onCheckedChange={(checked) =>
                      handleSearchFilterChange(
                        checked,
                        "carModel",
                        setIsCarModelChecked
                      )
                    }
                  />
                  <label
                    htmlFor="car-model"
                    className="font-medium leading-none"
                  >
                    Car Model
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="year"
                    checked={isYearChecked}
                    onCheckedChange={(checked) =>
                      handleSearchFilterChange(
                        checked,
                        "year",
                        setIsYearChecked
                      )
                    }
                  />
                  <label htmlFor="year" className="font-medium leading-none">
                    Year
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="color"
                    checked={isColorChecked}
                    onCheckedChange={(checked) =>
                      handleSearchFilterChange(
                        checked,
                        "color",
                        setIsColorChecked
                      )
                    }
                  />
                  <label htmlFor="color" className="font-medium leading-none">
                    Color
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vin"
                    checked={isVinChecked}
                    onCheckedChange={(checked) =>
                      handleSearchFilterChange(checked, "vin", setIsVinChecked)
                    }
                  />
                  <label htmlFor="vin" className="font-medium leading-none">
                    VIN
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="address"
                    checked={isAddressChecked}
                    onCheckedChange={(checked) =>
                      handleSearchFilterChange(
                        checked,
                        "address",
                        setIsAddressChecked
                      )
                    }
                  />
                  <label htmlFor="address" className="font-medium leading-none">
                    Address
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="city"
                    checked={isCityChecked}
                    onCheckedChange={(checked) =>
                      handleSearchFilterChange(
                        checked,
                        "city",
                        setIsCityChecked
                      )
                    }
                  />
                  <label htmlFor="city" className="font-medium leading-none">
                    City
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="state"
                    checked={isStateChecked}
                    onCheckedChange={(checked) =>
                      handleSearchFilterChange(
                        checked,
                        "state",
                        setIsStateChecked
                      )
                    }
                  />
                  <label htmlFor="state" className="font-medium leading-none">
                    State
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="zip"
                    checked={isZipChecked}
                    onCheckedChange={(checked) =>
                      handleSearchFilterChange(checked, "zip", setIsZipChecked)
                    }
                  />
                  <label htmlFor="zip" className="font-medium leading-none">
                    Zip
                  </label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="relative mx-1 md:w-1/2">
          <Input
            placeholder={
              selectedSearchFilters.length > 0
                ? `Search in ${selectedSearchFilters.join(", ")}...`
                : "Search all fields..."
            }
            value={searchText}
            onChange={(e) => handleSearchTextChange(e.target.value)}
            className="bg-white pr-8"
            ref={searchInputRef}
          />
          {searchText && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-200"
              onClick={handleSearchClear}
            >
              <X size={14} />
            </Button>
          )}
        </div>

        <Popover open={columnSettingsOpen} onOpenChange={setColumnSettingsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-cvna-blue-3 text-white"
              onClick={() => analytics.trackClick("column_settings_button")}
            >
              <SettingsIcon size={16} />
              <div className="hidden md:block">Column settings</div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-70 bg-cvna-blue-6">
            <div className="flex flex-col gap-2">
              <p className="text-md md:text-lg font-bold text-white">
                Column visibility settings
              </p>
              <Separator />
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto bg-white border border-gray-300 rounded-md p-2">
                {allColumns
                  .filter((column) => {
                    return (
                      column.id !== "actions" &&
                      (("accessorKey" in column && column.accessorKey) ||
                        column.id)
                    );
                  })
                  .map((column) => {
                    const columnKey =
                      ("accessorKey" in column && column.accessorKey) ||
                      column.id ||
                      "";
                    const columnLabel =
                      typeof column.header === "string"
                        ? column.header
                        : columnKey.charAt(0).toUpperCase() +
                          columnKey.slice(1);

                    return (
                      <div
                        key={columnKey}
                        className="flex items-center space-x-2"
                      >
                        <Switch
                          id={columnKey}
                          checked={columnVisibility[columnKey] || false}
                          onCheckedChange={(checked) =>
                            handleColumnVisibilityChange(columnKey, checked)
                          }
                        />
                        <label
                          htmlFor={columnKey}
                          className="font-medium leading-none cursor-pointer"
                        >
                          {columnLabel}
                        </label>
                      </div>
                    );
                  })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="rounded-lg overflow-hidden border border-gray-300 bg-gray-300">
        <Table className="border-separate border-spacing-0">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-cvna-blue-6 hover:bg-cvna-blue-5 border-0 font-bold"
              >
                {headerGroup.headers.map((header, index) => (
                  <TableHead
                    key={header.id}
                    className={`border-0 text-white ${
                      index === 0 ? "rounded-tl-lg" : ""
                    } ${
                      index === headerGroup.headers.length - 1
                        ? "rounded-tr-lg"
                        : ""
                    }`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-white">
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  className="h-32 text-center border-0"
                >
                  <div className="flex justify-center items-center">
                    <Loader2 className="animate-spin text-cvna-blue-2 mr-2" />
                    <span>Loading orders...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, rowIndex) => {
                const isLastRow =
                  rowIndex === table.getRowModel().rows.length - 1;

                return (
                  <TableRow key={row.id} className="border-0 hover:bg-gray-50">
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <TableCell
                        key={cell.id}
                        className={`border-0 ${
                          isLastRow && cellIndex === 0 ? "rounded-bl-lg" : ""
                        } ${
                          isLastRow &&
                          cellIndex === row.getVisibleCells().length - 1
                            ? "rounded-br-lg"
                            : ""
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  className="h-24 text-center border-0 rounded-b-lg"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex flex-row items-center justify-between md:justify-around py-1">
          <div className="flex items-center space-x-2">
            <p className="text-sm md:text-lg font-normal text-white">
              {paginationDisplay[0]}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <DropdownMenu
              open={isPageSizeOpen}
              onOpenChange={setIsPageSizeOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="text-sm md:text-lg bg-cvna-blue-3 text-white"
                  onClick={() => analytics.trackClick("page_size_dropdown")}
                >
                  {pageSize} orders
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-50 bg-cvna-blue-6 p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-md md:text-lg font-bold text-white">
                    Orders per page
                  </p>
                  <Separator />
                  <RadioGroup
                    defaultChecked
                    defaultValue="10"
                    className="flex flex-col gap-2 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-md p-2"
                    value={pageSize.toString()}
                    onValueChange={(value) => updatePageSize(Number(value))}
                  >
                    <DropdownMenuItem className="flex flex-row space-x-2 items-center justify-start">
                      <RadioGroupItem value="10" />
                      <p className=" font-medium text-center">10 orders</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-row space-x-2 items-center justify-start">
                      <RadioGroupItem value="20" />
                      <p className=" font-medium text-center">20 orders</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-row space-x-2 items-center justify-start">
                      <RadioGroupItem value="50" />
                      <p className=" font-medium text-center">50 orders</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-row space-x-2 items-center justify-start">
                      <RadioGroupItem value="100" />
                      <p className=" font-medium text-center">100 orders</p>
                    </DropdownMenuItem>
                  </RadioGroup>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between md:justify-center space-x-2">
          <div className="flex flex-row items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={goToFirstPage}
              className="mx-1 bg-cvna-blue-3 text-white"
            >
              <ChevronsLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={goToPreviousPage}
              className="mx-1 bg-cvna-blue-3 text-white"
            >
              <ChevronLeft size={16} />
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center gap-0">
            <span className="text-sm md:text-lg font-medium mx-2 text-white">
              Page
            </span>
            <span className="text-sm md:text-lg font-medium mx-2 text-white">
              {paginationDisplay[1]}
            </span>
          </div>
          <div className="flex flex-row items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              disabled={!data?.pageInfo.hasNextPage}
              onClick={goToNextPage}
              className="mx-1 bg-cvna-blue-3 text-white"
            >
              <ChevronRight size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={!data?.pageInfo.hasNextPage}
              onClick={goToLastPage}
              className="mx-1 bg-cvna-blue-3 text-white"
            >
              <ChevronsRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
