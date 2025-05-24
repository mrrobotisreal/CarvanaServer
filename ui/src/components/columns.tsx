import type { ColumnDef } from "@tanstack/react-table";
import type { OrderEdge } from "@/types/graphql";
import { Button } from "./ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const allColumns: ColumnDef<OrderEdge["node"]>[] = [
  {
    accessorKey: "orderID",
    header: "Order ID",
    cell: ({ row }) => <div>{row.getValue("orderID")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        First Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("firstName")}</div>,
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("lastName")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("paymentMethod")}</div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ getValue }) =>
      (getValue<number>() / 100).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
  },
  {
    accessorKey: "tax",
    header: "Tax",
    cell: ({ getValue }) =>
      (getValue<number>() / 100).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
  },
  {
    accessorKey: "deliveryFee",
    header: "Delivery Fee",
    cell: ({ getValue }) =>
      (getValue<number>() / 100).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
  },
  {
    accessorKey: "orderedAt",
    header: "Ordered At",
    cell: ({ getValue }) => (
      <div>{new Date(getValue<string>()).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "paidAt",
    header: "Paid At",
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      return <div>{value ? new Date(value).toLocaleDateString() : "N/A"}</div>;
    },
  },
  {
    accessorKey: "inTransitAt",
    header: "In Transit At",
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      return <div>{value ? new Date(value).toLocaleDateString() : "N/A"}</div>;
    },
  },
  {
    accessorKey: "deliveredAt",
    header: "Delivered At",
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      return <div>{value ? new Date(value).toLocaleDateString() : "N/A"}</div>;
    },
  },
  {
    accessorKey: "make",
    header: "Make",
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      return <div>{value || "N/A"}</div>;
    },
  },
  {
    accessorKey: "carModel",
    header: "Model",
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      return <div>{value || "N/A"}</div>;
    },
  },
  {
    accessorKey: "year",
    header: "Year",
    cell: ({ getValue }) => {
      const value = getValue<number | null>();
      return <div>{value || "N/A"}</div>;
    },
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      return <div className="capitalize">{value || "N/A"}</div>;
    },
  },
  {
    accessorKey: "vin",
    header: "VIN",
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      return <div className="font-mono text-sm">{value || "N/A"}</div>;
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      return <div>{value || "N/A"}</div>;
    },
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      return <div>{value || "N/A"}</div>;
    },
  },
  {
    accessorKey: "state",
    header: "State",
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      return <div>{value || "N/A"}</div>;
    },
  },
  {
    accessorKey: "zip",
    header: "ZIP",
    cell: ({ getValue }) => {
      const value = getValue<number | null>();
      return <div>{value || "N/A"}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const { orderID, email, firstName, lastName } = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(orderID.toString())}
            >
              Copy Order ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(email)}
            >
              Copy Email
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(`${firstName} ${lastName}`)
              }
            >
              Copy Name
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const defaultVisibleColumns = [
  "orderID",
  "firstName",
  "lastName",
  "email",
  "status",
  "price",
  "orderedAt",
  "actions",
];

export const columns = allColumns;
