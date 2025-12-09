import { useState, useRef, useEffect } from "react";
import { Badge } from "./ui/badge";
import {
  User,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  Bell,
  Shield,
  FileText,
  Crown,
  ChevronRight,
  Building,
  Radio,
  Palette,
} from "lucide-react";

interface UserMenuProps {
  user: { name: string; email: string };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function UserMenu({ user, onNavigate, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = [
    {
      icon: User,
      label: "My Profile",
      page: "profile",
      color: "text-blue-400",
    },
    {
      icon: Settings,
      label: "Account Settings",
      page: "settings",
      color: "text-purple-400",
    },
    {
      icon: Building,
      label: "Workspaces & Team",
      page: "workspaces",
      color: "text-cyan-400",
      badge: "Pro",
    },
    {
      icon: Radio,
      label: "Real-Time Monitoring",
      page: "monitoring",
      color: "text-red-400",
      badge: "Pro",
    },
    {
      icon: Palette,
      label: "White-Label Branding",
      page: "whitelabel",
      color: "text-yellow-400",
      badge: "Enterprise",
    },
    {
      icon: Bell,
      label: "Notifications",
      page: "notifications",
      color: "text-orange-400",
    },
    {
      icon: Shield,
      label: "Privacy & Security",
      page: "security",
      color: "text-green-400",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      page: "help",
      color: "text-pink-400",
    },
    {
      icon: FileText,
      label: "API Documentation",
      page: "api-docs",
      color: "text-indigo-400",
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white hover:shadow-lg transition-all hover:scale-105 relative"
      >
        {user.name[0].toUpperCase()}
        <span className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 rounded-full border-2 border-white" />
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-72 bg-slate-900 rounded-lg shadow-xl border border-slate-800 overflow-hidden z-50">
          {/* User Info Header */}
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-b border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                {user.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white truncate">{user.name}</p>
                <p className="text-slate-400 text-sm truncate">{user.email}</p>
              </div>
            </div>
            <Badge className="bg-blue-600 flex items-center gap-1 w-fit shadow-lg shadow-blue-600/30">
              <Crown className="size-3" />
              Professional
            </Badge>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate(item.page);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3 text-left group"
              >
                <item.icon className={`size-5 ${item.color}`} />
                <span className="flex-1 text-white">{item.label}</span>
                {item.badge && (
                  <Badge
                    className={`${
                      item.badge === "Enterprise"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                        : "bg-blue-600"
                    } flex items-center gap-1 w-fit shadow-lg ${
                      item.badge === "Enterprise"
                        ? "shadow-purple-600/30"
                        : "shadow-blue-600/30"
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
                <ChevronRight className="size-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="p-2 border-t border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full px-4 py-3 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-3 text-left text-red-400 hover:text-red-300"
            >
              <LogOut className="size-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}