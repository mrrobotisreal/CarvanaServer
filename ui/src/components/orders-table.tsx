import { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type PaginationState,
  // type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { columns } from "./columns";
import { useOrders } from "@/hooks/useOrders";
import {
  FilterIcon,
  Loader2,
  SettingsIcon,
  ChevronLeft,
  ChevronRight,
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

export function OrdersTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);
  const [selectedSearchFilter, setSelectedSearchFilter] = useState<string>("");
  const [isOrderIdChecked, setIsOrderIdChecked] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isFirstNameChecked, setIsFirstNameChecked] = useState(false);
  const [isLastNameChecked, setIsLastNameChecked] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);

  const { data, isLoading, status, error } = useOrders(pagination.pageSize);
  console.log(status, error);

  const tableData = useMemo(() => {
    return data?.edges.map((e) => e.node) ?? [];
  }, [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const updatePageSize = (newPageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
      pageIndex: 0,
    }));
  };

  const updatePageIndex = (newPageIndex: number) => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: newPageIndex,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full rounded-md border py-4 px-4 bg-gray-600">
      <div className="flex items-center justify-evenly py-4">
        <Popover open={isSearchFilterOpen} onOpenChange={setIsSearchFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <FilterIcon size={16} />
              {selectedSearchFilter.length > 0
                ? selectedSearchFilter
                : "Search filters"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-col gap-2">
              <p>Search filters</p>
              <Separator />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="order-id"
                  checked={isOrderIdChecked}
                  onCheckedChange={(checked) => {
                    setSelectedSearchFilter("orderId");
                    setIsOrderIdChecked(!!checked);
                    setIsEmailChecked(false);
                    setIsFirstNameChecked(false);
                    setIsLastNameChecked(false);
                  }}
                />
                <label
                  htmlFor="order-id"
                  className="text-sm font-medium leading-none"
                >
                  Order ID
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={isEmailChecked}
                  onCheckedChange={(checked) => {
                    setSelectedSearchFilter("email");
                    setIsEmailChecked(!!checked);
                    setIsOrderIdChecked(false);
                    setIsFirstNameChecked(false);
                    setIsLastNameChecked(false);
                  }}
                />
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none"
                >
                  Email
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="first-name"
                  checked={isFirstNameChecked}
                  onCheckedChange={(checked) => {
                    setSelectedSearchFilter("firstName");
                    setIsFirstNameChecked(!!checked);
                    setIsEmailChecked(false);
                    setIsLastNameChecked(false);
                    setIsOrderIdChecked(false);
                  }}
                />
                <label
                  htmlFor="first-name"
                  className="text-sm font-medium leading-none"
                >
                  First Name
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="last-name"
                  checked={isLastNameChecked}
                  onCheckedChange={(checked) => {
                    setSelectedSearchFilter("lastName");
                    setIsLastNameChecked(!!checked);
                    setIsOrderIdChecked(false);
                    setIsFirstNameChecked(false);
                    setIsEmailChecked(false);
                  }}
                />
                <label
                  htmlFor="last-name"
                  className="text-sm font-medium leading-none"
                >
                  Last Name
                </label>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Input
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-1/2 bg-white"
        />

        <Popover open={columnSettingsOpen} onOpenChange={setColumnSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <SettingsIcon size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-col gap-2">
              <p>Column visibility settings</p>
              <Separator />
              <div className="flex flex-col gap-2">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <div
                      key={column.id}
                      className="flex items-center space-x-2"
                    >
                      <Switch
                        id={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={column.getToggleVisibilityHandler()}
                        disabled={column.id === "actions"}
                      />
                      <label
                        htmlFor={column.id}
                        className="text-sm font-medium leading-none"
                      >
                        {column.id}
                      </label>
                    </div>
                  ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-cvna-blue-2">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-center py-4">
        <DropdownMenu open={isPageSizeOpen} onOpenChange={setIsPageSizeOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {pagination.pageSize} items per page
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => updatePageSize(10)}>
              10
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updatePageSize(25)}>
              25
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updatePageSize(50)}>
              50
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updatePageSize(100)}>
              100
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            disabled={pagination.pageIndex === 0}
            onClick={() => updatePageIndex(pagination.pageIndex - 1)}
            className="mx-2"
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-lg font-medium ml-2 mr-2">
            {pagination.pageIndex + 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={pagination.pageIndex === pagination.pageSize - 1}
            onClick={() => updatePageIndex(pagination.pageIndex + 1)}
            className="mx-2"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
