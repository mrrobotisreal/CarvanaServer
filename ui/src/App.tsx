import { OrdersTable } from "@/components/orders-table";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const qc = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={qc}>
      <main className="p-8 max-w-7xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">Carvana Orders</h1>

        <OrdersTable />
      </main>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
