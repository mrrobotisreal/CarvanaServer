import { OrdersTable } from "@/components/orders-table";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // TODO: Uncomment this when debugging is needed
import logo from "@/assets/logo.svg";

const qc = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={qc}>
      <main className="min-h-screen w-full p-8 mx-auto space-y-4 bg-cvna-blue-7">
        <div className="w-full flex flex-row items-center justify-center gap-2">
          <img src={logo} alt="Carvana Orders" className="w-12 h-12" />
          <h1 className="text-3xl font-bold text-white items-center justify-center text-center">
            Carvana Orders
          </h1>
        </div>

        <OrdersTable />
      </main>

      {/*
        // TODO: Uncomment this when debugging is needed
        <ReactQueryDevtools initialIsOpen={false} />
      */}
    </QueryClientProvider>
  );
}

export default App;
