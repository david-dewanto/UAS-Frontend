import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet, useLocation, Link } from "react-router-dom";

// Define a type for the path segments mapping
type PathSegments = {
  [key: string]: {
    label: string;
    parent?: string;
  };
};

type BreadcrumbItem = {
  label: string;
  path: string;
  clickable?: boolean;
};

export default function DashboardPage() {
  const location = useLocation();

  // Function to generate breadcrumb items based on current location
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    
    // Map of path segments to their readable names and parent relationships
    const readableSegments: PathSegments = {
      dashboard: { label: "Dashboard" },
      investments: { label: "Investment Monitoring" },
      developer: { label: "Developer Mode" },
      "api-keys": { label: "API Keys" },
      docs: { label: "Documentation" },
      "quick-start": { label: "Quick Start" },
      auth: { label: "Authentication", parent: "docs" },
      email: {label: "Email Provider", parent: "docs"},
      companies: {label:"Companies Information", parent: "docs"},
      stocks: {label:"Individual Stocks", parent: "docs"},
      portfolio: {label:"Portfolio Analysis", parent:"docs"},
      "add-investment" : {label:"Add Investment", parent: "docs"},
      "stocks-analysis" : {label:"Stocks Analysis", parent: " docs"}
    };

    // If we're in /docs/auth, return both Documentation and Authentication
    if (pathSegments.includes('docs') && pathSegments.includes('auth')) {
      return [
        { label: "Documentation", path: "/dashboard/developer/docs", clickable: false },
        { label: "Authentication", path: "/dashboard/developer/docs/auth" }
      ];
    }

    if (pathSegments.includes('docs') && pathSegments.includes('email')) {
      return [
        { label: "Documentation", path: "/dashboard/developer/docs", clickable: false },
        { label: "Email Provider", path: "/dashboard/developer/docs/email" }
      ];
    }

    if (pathSegments.includes('docs') && pathSegments.includes('companies')) {
      return [
        { label: "Documentation", path: "/dashboard/developer/docs", clickable: false },
        { label: "Companies Information", path: "/dashboard/developer/docs/companies" }
      ];
    }

    if (pathSegments.includes('docs') && pathSegments.includes('stocks')) {
      return [
        { label: "Documentation", path: "/dashboard/developer/docs", clickable: false },
        { label: "Individual Stocks", path: "/dashboard/developer/docs/stocks" }
      ];
    }

    if (pathSegments.includes('docs') && pathSegments.includes('portfolio')) {
      return [
        { label: "Documentation", path: "/dashboard/developer/docs", clickable: false },
        { label: "Portfolio Analysis", path: "/dashboard/developer/docs/portfolio" }
      ];
    }

    // For other paths, just return the last segment
    const lastSegment = pathSegments[pathSegments.length - 1];
    return [{ 
      label: readableSegments[lastSegment]?.label || lastSegment,
      path: location.pathname
    }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 md:px-16 lg:px-28 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {index === breadcrumbs.length - 1 || crumb.clickable === false ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink>
                          {crumb.path && <Link to={crumb.path}>{crumb.label}</Link>}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col p-4 pt-0 px-4 md:px-16 lg:px-28">
          <div className="space-y-6 pb-6">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}