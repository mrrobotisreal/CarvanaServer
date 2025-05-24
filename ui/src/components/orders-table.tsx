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
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(
    undefined
  );
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

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

  const [isRequestingLastPage, setIsRequestingLastPage] = useState(false);

  const debouncedSearchText = useDebounce(searchText, 1000);

  const visibleFields = useMemo(() => {
    return Object.keys(columnVisibility).filter((key) => columnVisibility[key]);
  }, [columnVisibility]);

  const searchFields = useMemo(() => {
    return selectedSearchFilters.length > 0 ? selectedSearchFilters : undefined;
  }, [selectedSearchFilters]);

  useEffect(() => {
    setCurrentCursor(undefined);
    setCursorHistory([]);
    setIsRequestingLastPage(false);
  }, [debouncedSearchText, searchFields]);

  const { data, isLoading, status, error } = useOrders(
    pageSize,
    currentCursor,
    visibleFields,
    debouncedSearchText || undefined,
    searchFields,
    isRequestingLastPage ? pageSize : undefined
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

    if (isRequestingLastPage) {
      const totalPages = Math.ceil(data.totalCount / pageSize);
      currentPageNumber = totalPages;
      startItem = Math.max(1, data.totalCount - pageSize + 1);
      endItem = data.totalCount;
    } else {
      currentPageNumber = cursorHistory.length + 1;
      startItem = (currentPageNumber - 1) * pageSize + 1;
      endItem = Math.min(
        currentPageNumber * pageSize,
        startItem + tableData.length - 1
      );
    }

    return [
      `${startItem}-${endItem} of ${data.totalCount}`,
      `${currentPageNumber} of ${Math.ceil(data.totalCount / pageSize)}`,
    ];
  }, [
    data,
    cursorHistory.length,
    pageSize,
    tableData.length,
    isRequestingLastPage,
  ]);

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
    setPageSize(newPageSize);
    setCurrentCursor(undefined);
    setCursorHistory([]);
    setIsRequestingLastPage(false);
  };

  const goToNextPage = () => {
    if (data?.pageInfo.hasNextPage && data?.pageInfo.endCursor) {
      setCursorHistory((prev) => [...prev, currentCursor || ""]);
      setCurrentCursor(data.pageInfo.endCursor);
      setIsRequestingLastPage(false);
    }
  };

  const goToPreviousPage = () => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop();
      setCursorHistory(newHistory);
      setCurrentCursor(previousCursor === "" ? undefined : previousCursor);
      setIsRequestingLastPage(false);
    }
  };

  const goToFirstPage = () => {
    setCurrentCursor(undefined);
    setCursorHistory([]);
    setIsRequestingLastPage(false);
  };

  const goToLastPage = () => {
    setCurrentCursor(undefined);
    setCursorHistory([]);
    setIsRequestingLastPage(true);
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

  return (
    <Card className="w-full rounded-md border p-4 bg-gray-600">
      <div className="flex flex-row items-center justify-evenly py-4">
        <Popover open={isSearchFilterOpen} onOpenChange={setIsSearchFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-cvna-blue-3 text-white">
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
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setSelectedSearchFilters([
                          ...new Set([...selectedSearchFilters, "orderID"]),
                        ]);
                      } else {
                        setSelectedSearchFilters(
                          selectedSearchFilters.filter(
                            (filter) => filter !== "orderID"
                          )
                        );
                      }
                      setIsOrderIdChecked(!!checked);
                    }}
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
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setSelectedSearchFilters([
                          ...new Set([...selectedSearchFilters, "email"]),
                        ]);
                      } else {
                        setSelectedSearchFilters(
                          selectedSearchFilters.filter(
                            (filter) => filter !== "email"
                          )
                        );
                      }
                      setIsEmailChecked(!!checked);
                    }}
                  />
                  <label htmlFor="email" className="font-medium leading-none">
                    Email
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="first-name"
                    checked={isFirstNameChecked}
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setSelectedSearchFilters([
                          ...new Set([...selectedSearchFilters, "firstName"]),
                        ]);
                      } else {
                        setSelectedSearchFilters(
                          selectedSearchFilters.filter(
                            (filter) => filter !== "firstName"
                          )
                        );
                      }
                      setIsFirstNameChecked(!!checked);
                    }}
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
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setSelectedSearchFilters([
                          ...new Set([...selectedSearchFilters, "lastName"]),
                        ]);
                      } else {
                        setSelectedSearchFilters(
                          selectedSearchFilters.filter(
                            (filter) => filter !== "lastName"
                          )
                        );
                      }
                      setIsLastNameChecked(!!checked);
                    }}
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
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setSelectedSearchFilters([
                          ...new Set([...selectedSearchFilters, "status"]),
                        ]);
                      } else {
                        setSelectedSearchFilters(
                          selectedSearchFilters.filter(
                            (filter) => filter !== "status"
                          )
                        );
                      }
                      setIsStatusChecked(!!checked);
                    }}
                  />
                  <label htmlFor="status" className="font-medium leading-none">
                    Status
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="payment-method"
                    checked={isPaymentMethodChecked}
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setSelectedSearchFilters([
                          ...new Set([
                            ...selectedSearchFilters,
                            "paymentMethod",
                          ]),
                        ]);
                      } else {
                        setSelectedSearchFilters(
                          selectedSearchFilters.filter(
                            (filter) => filter !== "paymentMethod"
                          )
                        );
                      }
                      setIsPaymentMethodChecked(!!checked);
                    }}
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
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setSelectedSearchFilters([
                          ...new Set([...selectedSearchFilters, "price"]),
                        ]);
                      } else {
                        setSelectedSearchFilters(
                          selectedSearchFilters.filter(
                            (filter) => filter !== "price"
                          )
                        );
                      }
                      setIsPriceChecked(!!checked);
                    }}
                  />
                  <label htmlFor="price" className="font-medium leading-none">
                    Price
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="make"
                    checked={isMakeChecked}
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setSelectedSearchFilters([
                          ...new Set([...selectedSearchFilters, "make"]),
                        ]);
                      } else {
                        setSelectedSearchFilters(
                          selectedSearchFilters.filter(
                            (filter) => filter !== "make"
                          )
                        );
                      }
                      setIsMakeChecked(!!checked);
                    }}
                  />
                  <label htmlFor="make" className="font-medium leading-none">
                    Make
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="car-model"
                    checked={isCarModelChecked}
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setSelectedSearchFilters([
                          ...new Set([...selectedSearchFilters, "carModel"]),
                        ]);
                      } else {
                        setSelectedSearchFilters(
                          selectedSearchFilters.filter(
                            (filter) => filter !== "carModel"
                          )
                        );
                      }
                      setIsCarModelChecked(!!checked);
                    }}
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
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setSelectedSearchFilters([
                          ...new Set([...selectedSearchFilters, "year"]),
                        ]);
                      } else {
                        setSelectedSearchFilters(
                          selectedSearchFilters.filter(
                            (filter) => filter !== "year"
                          )
                        );
                      }
                      setIsYearChecked(!!checked);
                    }}
                  />
                  <label htmlFor="year" className="font-medium leading-none">
                    Year
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="color"
                    checked={isColorChecked}
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setSelectedSearchFilters([
                          ...new Set([...selectedSearchFilters, "color"]),
                        ]);
                      } else {
                        setSelectedSearchFilters(
                          selectedSearchFilters.filter(
                            (filter) => filter !== "color"
                          )
                        );
                      }
                      setIsColorChecked(!!checked);
                    }}
                  />
                  <label htmlFor="color" className="font-medium leading-none">
                    Color
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vin"
                    checked={isVinChecked}
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setSelectedSearchFilters([
                          ...new Set([...selectedSearchFilters, "vin"]),
                        ]);
                      } else {
                        setSelectedSearchFilters(
                          selectedSearchFilters.filter(
                            (filter) => filter !== "vin"
                          )
                        );
                      }
                      setIsVinChecked(!!checked);
                    }}
                  />
                  <label htmlFor="vin" className="font-medium leading-none">
                    VIN
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="address"
                    checked={isAddressChecked}
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setSelectedSearchFilters([
                          ...new Set([...selectedSearchFilters, "address"]),
                        ]);
                      } else {
                        setSelectedSearchFilters(
                          selectedSearchFilters.filter(
                            (filter) => filter !== "address"
                          )
                        );
                      }
                      setIsAddressChecked(!!checked);
                    }}
                  />
                  <label htmlFor="address" className="font-medium leading-none">
                    Address
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="city"
                    checked={isCityChecked}
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setSelectedSearchFilters([
                          ...new Set([...selectedSearchFilters, "city"]),
                        ]);
                      } else {
                        setSelectedSearchFilters(
                          selectedSearchFilters.filter(
                            (filter) => filter !== "city"
                          )
                        );
                      }
                      setIsCityChecked(!!checked);
                    }}
                  />
                  <label htmlFor="city" className="font-medium leading-none">
                    City
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="state"
                    checked={isStateChecked}
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setSelectedSearchFilters([
                          ...new Set([...selectedSearchFilters, "state"]),
                        ]);
                      } else {
                        setSelectedSearchFilters(
                          selectedSearchFilters.filter(
                            (filter) => filter !== "state"
                          )
                        );
                      }
                      setIsStateChecked(!!checked);
                    }}
                  />
                  <label htmlFor="state" className="font-medium leading-none">
                    State
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="zip"
                    checked={isZipChecked}
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setSelectedSearchFilters([
                          ...new Set([...selectedSearchFilters, "zip"]),
                        ]);
                      } else {
                        setSelectedSearchFilters(
                          selectedSearchFilters.filter(
                            (filter) => filter !== "zip"
                          )
                        );
                      }
                      setIsZipChecked(!!checked);
                    }}
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
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-white pr-8"
            ref={searchInputRef}
          />
          {searchText && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-200"
              onClick={() => setSearchText("")}
            >
              <X size={14} />
            </Button>
          )}
        </div>

        <Popover open={columnSettingsOpen} onOpenChange={setColumnSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-cvna-blue-3 text-white">
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
                          onCheckedChange={(checked) => {
                            setColumnVisibility((prev) => ({
                              ...prev,
                              [columnKey]: checked,
                            }));
                          }}
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
              disabled={cursorHistory.length === 0 && !isRequestingLastPage}
              onClick={goToFirstPage}
              className="mx-1 bg-cvna-blue-3 text-white"
            >
              <ChevronsLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={cursorHistory.length === 0 && !isRequestingLastPage}
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
              disabled={!data?.pageInfo.hasNextPage || isRequestingLastPage}
              onClick={goToNextPage}
              className="mx-1 bg-cvna-blue-3 text-white"
            >
              <ChevronRight size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={!data?.pageInfo.hasNextPage || isRequestingLastPage}
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
