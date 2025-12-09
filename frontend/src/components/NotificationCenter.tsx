import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Bell, Phone, CheckCircle2, AlertTriangle, Mic, X } from "lucide-react";

export interface Notification {
  id: string;
  type: "call" | "agent" | "alert" | "recording" | "info";
  title: string;
  description: string;
  timestamp: string;
  isNew: boolean;
  icon: "call" | "success" | "warning" | "recording";
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
}: NotificationCenterProps) {
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

  const unreadCount = notifications.filter((n) => n.isNew).length;

  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case "call":
        return Phone;
      case "success":
        return CheckCircle2;
      case "warning":
        return AlertTriangle;
      case "recording":
        return Mic;
      default:
        return Bell;
    }
  };

  const getIconColor = (iconType: string) => {
    switch (iconType) {
      case "call":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      case "success":
        return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case "warning":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "recording":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="size-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-all relative"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center shadow-lg shadow-red-500/50">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-96 bg-slate-900 rounded-lg shadow-xl border border-slate-800 overflow-hidden z-50">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-white">Notifications</h3>
              <p className="text-slate-400 text-sm">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="size-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                  <Bell className="size-6 text-slate-500" />
                </div>
                <p className="text-slate-400">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const IconComponent = getIconComponent(notification.icon);
                const iconColor = getIconColor(notification.icon);

                return (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-slate-800 transition-all ${
                      notification.isNew ? "bg-slate-800/50" : "hover:bg-slate-800/30"
                    }`}
                    onClick={() => {
                      if (notification.isNew) {
                        onMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`size-10 rounded-lg flex items-center justify-center shrink-0 border ${iconColor}`}
                      >
                        <IconComponent className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <p className="text-white flex-1">{notification.title}</p>
                          {notification.isNew && (
                            <Badge className="bg-blue-600 shadow-lg shadow-blue-600/30 shrink-0">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-2">
                          {notification.description}
                        </p>
                        <p className="text-slate-500 text-xs">{notification.timestamp}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss(notification.id);
                        }}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="p-3 border-t border-slate-800">
              <Button
                variant="ghost"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white"
                onClick={onMarkAllAsRead}
              >
                Mark all as read
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
