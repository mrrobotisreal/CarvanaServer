import { OrdersTable } from "@/components/orders-table";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // TODO: Uncomment this when debugging is needed
import logo from "@/assets/logo.svg";
import { useEffect, useRef } from "react";
import { analytics } from "@/lib/analytics";

const qc = new QueryClient();

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      analytics.trackUsage({
        actionType: "error",
        metadata: {
          errorType: "javascript_error",
          errorMessage: event.message,
          errorStack: event.error?.stack,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      analytics.trackUsage({
        actionType: "error",
        metadata: {
          errorType: "unhandled_promise_rejection",
          errorMessage: event.reason?.message || String(event.reason),
          errorStack: event.reason?.stack,
        },
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handlePromiseRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handlePromiseRejection);
    };
  }, []);

  return <>{children}</>;
}

function App() {
  const appStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    analytics.trackEvent({
      eventType: "app_start",
      metadata: {
        timestamp: new Date().toISOString(),
        appStartTime: appStartTimeRef.current,
      },
    });

    const trackAppPerformance = () => {
      const appLoadTime = Date.now() - appStartTimeRef.current;

      analytics.trackPerformance({
        metricType: "app_initialization",
        metadata: {
          appLoadTime,
          timestamp: new Date().toISOString(),
        },
      });
    };

    const timeoutId = setTimeout(trackAppPerformance, 1000);

    analytics.trackUsage({
      actionType: "session",
      metadata: {
        sessionAction: "start",
        timestamp: new Date().toISOString(),
      },
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      analytics.trackUsage({
        actionType: "session",
        metadata: {
          sessionAction: "end",
          timestamp: new Date().toISOString(),
          sessionDuration: Date.now() - appStartTimeRef.current,
        },
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
    };
  }, []);

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
