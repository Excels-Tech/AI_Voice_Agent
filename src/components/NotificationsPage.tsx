import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Phone, CheckCircle2, AlertCircle, Bell, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "call",
      title: "New inbound call received",
      message: "Sales Agent handled call from John Smith - 3:24 duration",
      time: "2 min ago",
      unread: true,
      timestamp: "2025-11-12 14:30",
    },
    {
      id: 2,
      type: "action",
      title: "Agent deployed successfully",
      message: "Support Agent is now live and handling calls",
      time: "15 min ago",
      unread: true,
      timestamp: "2025-11-12 14:15",
    },
    {
      id: 3,
      type: "alert",
      title: "Usage alert: 80% of minutes used",
      message: "You've used 4,000 of 5,000 minutes this month",
      time: "1 hour ago",
      unread: true,
      timestamp: "2025-11-12 13:30",
    },
    {
      id: 4,
      type: "success",
      title: "Call recording available",
      message: "Transcript ready for review - Client Demo Call",
      time: "2 hours ago",
      unread: false,
      timestamp: "2025-11-12 12:30",
    },
    {
      id: 5,
      type: "info",
      title: "Integration connected",
      message: "Salesforce CRM successfully connected to your account",
      time: "3 hours ago",
      unread: false,
      timestamp: "2025-11-12 11:30",
    },
    {
      id: 6,
      type: "call",
      title: "Missed call",
      message: "Lead Qualifier agent missed call from +1 555-0199",
      time: "5 hours ago",
      unread: false,
      timestamp: "2025-11-12 09:30",
    },
  ]);

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    toast.success("Marked as read");
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
    toast.success("All notifications marked as read");
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">Notifications</h1>
          <p className="text-slate-600">
            Stay updated with your AI voice agents activity
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500">{unreadCount} unread</Badge>
            )}
          </p>
        </div>
        <Button onClick={markAllAsRead} variant="outline">
          <Check className="size-4 mr-2" />
          Mark All as Read
        </Button>
      </div>

      {/* Notification Settings */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b">
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: "Call Notifications", description: "Get notified when agents handle calls" },
              { label: "Usage Alerts", description: "Alerts when reaching usage limits" },
              { label: "Agent Status", description: "Updates on agent deployment and status" },
              { label: "Integration Updates", description: "Notifications about integrations" },
            ].map((pref) => (
              <label
                key={pref.label}
                className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50"
              >
                <input type="checkbox" defaultChecked className="rounded" />
                <div>
                  <p className="text-slate-900">{pref.label}</p>
                  <p className="text-slate-600 text-sm">{pref.description}</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`bg-white border-slate-200 ${
              notification.unread ? "border-l-4 border-l-blue-500" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg shrink-0 ${
                    notification.type === "call"
                      ? "bg-green-100"
                      : notification.type === "action"
                      ? "bg-blue-100"
                      : notification.type === "alert"
                      ? "bg-red-100"
                      : notification.type === "success"
                      ? "bg-emerald-100"
                      : "bg-purple-100"
                  }`}
                >
                  {notification.type === "call" || notification.type === "action" ? (
                    <Phone
                      className={`size-5 ${
                        notification.type === "call" ? "text-green-600" : "text-blue-600"
                      }`}
                    />
                  ) : notification.type === "alert" ? (
                    <AlertCircle className="size-5 text-red-600" />
                  ) : notification.type === "success" ? (
                    <CheckCircle2 className="size-5 text-emerald-600" />
                  ) : (
                    <Bell className="size-5 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-slate-900 mb-1">{notification.title}</h3>
                      {notification.unread && (
                        <Badge className="bg-blue-500 mb-2">New</Badge>
                      )}
                    </div>
                    <span className="text-slate-500 text-sm">{notification.time}</span>
                  </div>
                  <p className="text-slate-600 mb-3">{notification.message}</p>
                  <div className="flex items-center gap-2">
                    {notification.unread && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <Card className="bg-white border-slate-200">
          <CardContent className="p-12 text-center">
            <Bell className="size-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-slate-900 mb-2">No notifications</h3>
            <p className="text-slate-600">You're all caught up!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
