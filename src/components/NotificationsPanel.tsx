import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CheckCircle2, AlertCircle, MessageCircle, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotificationsPanelProps {
  notifications: any[];
  loading?: boolean;
  onClose: () => void;
  onMarkAllRead?: () => void;
  onMarkOne?: (id: number) => void;
}

export function NotificationsPanel({ notifications, loading, onClose, onMarkAllRead, onMarkOne }: NotificationsPanelProps) {

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
            {loading && <p className="p-4 text-slate-600 text-sm">Loading notifications...</p>}
            {!loading && (!notifications || notifications.length === 0) && (
              <p className="p-4 text-slate-600 text-sm">No notifications</p>
            )}
            {!loading &&
              notifications?.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-slate-50 transition-colors cursor-pointer ${
                    notification.read === false ? "bg-blue-50" : ""
                  }`}
                  onClick={() => onMarkOne?.(notification.id)}
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
                        {notification.read === false && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-600 text-sm mb-1">{notification.message}</p>
                      <span className="text-slate-500 text-xs">
                        {notification.created_at
                          ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full" onClick={onMarkAllRead}>
              Mark all as read
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
