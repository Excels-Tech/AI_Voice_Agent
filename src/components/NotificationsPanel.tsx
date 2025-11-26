import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CheckCircle2, AlertCircle, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";

interface NotificationsPanelProps {
  onClose: () => void;
}

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const notifications = [
    {
      id: 1,
      type: "call",
      title: "New inbound call received",
      message: "Sales Agent handled call from John Smith - 3:24 duration",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      type: "action",
      title: "Agent deployed successfully",
      message: "Support Agent is now live and handling calls",
      time: "15 min ago",
      unread: true,
    },
    {
      id: 3,
      type: "alert",
      title: "Usage alert: 80% of minutes used",
      message: "You've used 4,000 of 5,000 minutes this month",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 4,
      type: "qa",
      title: "Call recording available",
      message: "Transcript ready for review - Client Demo Call",
      time: "2 hours ago",
      unread: false,
    },
    {
      id: 5,
      type: "meeting",
      title: "Integration connected",
      message: "Salesforce CRM successfully connected to your account",
      time: "3 hours ago",
      unread: false,
    },
  ];

  const markAllRead = () => {
    toast.success("All notifications marked as read");
    onClose();
  };

  return (
    <div className="absolute top-12 right-0 w-96 z-50">
      <Card className="bg-white border-slate-200 shadow-xl">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Notifications</CardTitle>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X className="size-4 text-slate-600" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b hover:bg-slate-50 transition-colors cursor-pointer ${
                  notification.unread ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      notification.type === "action"
                        ? "bg-orange-100"
                        : notification.type === "meeting"
                        ? "bg-blue-100"
                        : notification.type === "call"
                        ? "bg-green-100"
                        : notification.type === "alert"
                        ? "bg-red-100"
                        : "bg-green-100"
                    }`}
                  >
                    {notification.type === "action" ? (
                      <CheckCircle2 className="size-4 text-orange-600" />
                    ) : notification.type === "meeting" || notification.type === "call" ? (
                      <AlertCircle className="size-4 text-blue-600" />
                    ) : notification.type === "alert" ? (
                      <AlertCircle className="size-4 text-red-600" />
                    ) : (
                      <MessageCircle className="size-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-slate-900">{notification.title}</p>
                      {notification.unread && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm mb-1">{notification.message}</p>
                    <span className="text-slate-500 text-xs">{notification.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full" onClick={markAllRead}>
              Mark all as read
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
