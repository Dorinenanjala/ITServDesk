import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { BarChart3, Plus } from "lucide-react";

export default function Navigation() {
  const [location, setLocation] = useLocation();

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard", 
      path: "/dashboard",
      icon: BarChart3,
    },
    {
      id: "new-ticket",
      label: "New Ticket",
      path: "/new-ticket", 
      icon: Plus,
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const isActive = location === tab.path || (location === "/" && tab.path === "/dashboard");
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => setLocation(tab.path)}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex items-center",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
