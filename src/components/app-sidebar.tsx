import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sidebar, SidebarHeader } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { authService } from "@/lib/auth"  // Import authService
import { ChevronDown, BarChart, LogOut, Plus, Key, BookOpen, Route, Zap } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import logo from '@/assets/logo.svg'

interface SubMenuItem {
  name: string
  path: string
  icon?: React.ReactNode
  submenu?: SubMenuItem[]
  defaultOpen?: boolean
}

interface NavSection {
  title: string
  items: SubMenuItem[]
}

const navSections: NavSection[] = [
  {
    title: "Investment Tracking",
    items: [
      { 
        name: "Dashboard", 
        path: "/dashboard/investments/",
        icon: <BarChart className="h-4 w-4" />,
        defaultOpen: true
      },
      { 
        name: "Add Investment", 
        path: "/dashboard/investments",
        icon: <Plus className="h-4 w-4" />,
        defaultOpen: true
      }
    ]
  },
  {
    title: "Developer Mode",
    items: [
      { 
        name: "Quick Start", 
        path: "/dashboard/developer/quick-start",
        icon: <Zap className="h-4 w-4" />
      },
      { 
        name: "Generate API Keys", 
        path: "/dashboard/developer/api-keys",
        icon: <Key className="h-4 w-4" />
      },
      { 
        name: "Documentation", 
        path: "/dashboard/developer/docs",
        icon: <BookOpen className="h-4 w-4" />,
        submenu: [
          { 
            name: "Authentication", 
            path: "/dashboard/developer/docs/auth",
            icon: <Route className="h-4 w-4" />
          },
          {
            name: "Companies Information",
            path: "/dashboard/developer/docs/companies",
            icon: <Route className="h-4 w-4" />
          },
          {
            name: "Email Provider",
            path: "/dashboard/developer/docs/email",
            icon: <Route className="h-4 w-4" />
          },
          {
            name: "Individual Stocks",
            path: "/dashboard/developer/docs/stocks",
            icon: <Route className="h-4 w-4" />
          },
          {
            name: "Portfolio Analysis",
            path: "/dashboard/developer/docs/portfolio",
            icon: <Route className="h-4 w-4" />
          }
        ]
      }
    ]
  }
]

interface NavItemProps {
  item: SubMenuItem
  level?: number
}

const NavItem = ({ item, level = 0 }: NavItemProps) => {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(!!item.defaultOpen)
  const hasSubmenu = item.submenu && item.submenu.length > 0
  const isActive = location.pathname === item.path || 
    (hasSubmenu && item.submenu?.some(subItem => 
      location.pathname.startsWith(subItem.path)
    ))

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubmenu) {
      e.preventDefault()
      setIsOpen(!isOpen)
    }
  }

  return (
    <div>
      <Link to={item.path} onClick={handleClick}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between",
            isActive && "bg-muted",
            level > 0 && "ml-4"
          )}
        >
          <div className="flex items-center gap-2">
            {item.icon}
            <span>{item.name}</span>
          </div>
          {hasSubmenu && (
            <ChevronDown 
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                isOpen && "rotate-180"
              )} 
            />
          )}
        </Button>
      </Link>
      {hasSubmenu && isOpen && (
        <div className="ml-4 mt-1 space-y-1">
          {item.submenu?.map((subItem) => (
            <NavItem 
              key={subItem.path} 
              item={subItem} 
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function AppSidebar() {
  // Handle logout click
  const handleLogout = () => {
    authService.logout();
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex h-24 items-center justify-center border-b px-6">
          <a href="/">
            <img src={logo} alt="Logo" className="h-[40px]" /> 
          </a>
      </SidebarHeader>
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-2">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h3 className="px-2 text-sm font-medium text-muted-foreground">
                {section.title}
              </h3>
              {section.items.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-3 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-red-500"
          onClick={handleLogout}  
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </Sidebar>
  )
}