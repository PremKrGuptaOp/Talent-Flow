import * as React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { PageErrorBoundary, FeatureErrorBoundary } from "./error-boundary";
import { LoadingOverlay } from "../ui/loading";
import { SidebarProvider, SidebarInset } from "../ui/sidebar";

export const MainLayout: React.FC = () => {
  const [isLoading] = React.useState(false);

  return (
    <PageErrorBoundary>
      <div
        className="h-screen flex"
        style={{
          background:
            "radial-gradient(1200px 600px at 0% 0%, #0b0f2a 0%, transparent 60%), radial-gradient(1200px 600px at 100% 100%, #2a0c3b 0%, transparent 60%), #0b0f2a",
        }}
      >
        <SidebarProvider>
          <FeatureErrorBoundary>
            <Sidebar />
          </FeatureErrorBoundary>

          <SidebarInset
            className="flex flex-col h-full"
            style={{
              background:
                "linear-gradient(180deg, rgba(26,11,46,0.25) 0%, rgba(11,15,42,0.25) 100%)",
            }}
          >
            {/* Fixed Header */}
            <FeatureErrorBoundary>
              <Header />
            </FeatureErrorBoundary>

            {/* Scrollable Main Content */}
            <div
              className="flex-1 overflow-auto"
              style={{ background: "transparent" }}
            >
              <LoadingOverlay isLoading={isLoading}>
                <div className="h-full">
                  <FeatureErrorBoundary>
                    <Outlet />
                  </FeatureErrorBoundary>
                </div>
              </LoadingOverlay>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </PageErrorBoundary>
  );
};
