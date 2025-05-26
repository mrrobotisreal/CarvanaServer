import { OrdersTable } from "@/components/orders-table";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // TODO: Uncomment this when debugging is needed
import logo from "@/assets/logo.svg";
import { useEffect, useRef } from "react";
import { analytics } from "@/lib/analytics";
import winappsLogo from "@/assets/logo_transparent_shadow.svg";
import githubLogo from "@/assets/github.svg";
import { Button } from "./components/ui/button";

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
        <main className="min-h-screen w-full mx-auto space-y-4 bg-cvna-blue-7">
          <nav className="sticky top-0 z-50 w-full border-b bg-cvna-blue-7/95 backdrop-blur supports-[backdrop-filter]:bg-cvna-blue-7/60">
            <div className="w-full flex-row container mx-auto px-4 h-16 flex items-center justify-between">
              <a
                href="https://winapps.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src={winappsLogo}
                  alt="WinApps Logo"
                  className="h-12 w-12"
                />
                <h3
                  className="text-2xl font-semibold text-white hidden md:block"
                  style={{ fontFamily: "ubuntu" }}
                >
                  WinApps
                </h3>
              </a>

              <div className="flex items-center space-x-3">
                <img src={logo} alt="Carvana Orders" className="w-12 h-12" />
                <h1 className="text-3xl font-bold text-white items-center justify-center text-center hidden md:block">
                  Carvana Orders
                </h1>
              </div>

              <Button
                variant="ghost"
                size="icon"
                asChild
                className="rounded-full bg-white hover:border-2 hover:border-cvna-blue-2 dark:hover:border-cvna-blue-2"
              >
                <a
                  href="https://github.com/mrrobotisreal/text_formatter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={githubLogo}
                    alt="GitHub"
                    className="h-12 w-12 dark:invert"
                  />
                  <span className="sr-only">View on GitHub</span>
                </a>
              </Button>
            </div>
          </nav>

          <div className="w-full mx-auto px-4">
            <OrdersTable />
          </div>
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
