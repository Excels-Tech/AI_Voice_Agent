// Helper functions for managing notifications

export interface Notification {
  id: string;
  type: "mention" | "reply" | "reaction" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    discussionId?: string;
    commentId?: string;
    mentionedBy?: string;
  };
}

// Get all notifications from localStorage
export function getNotifications(): Notification[] {
  try {
    const notifications = localStorage.getItem("userNotifications");
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    console.error("Error reading notifications:", error);
    return [];
  }
}

// Save notifications to localStorage
export function saveNotifications(notifications: Notification[]): void {
  try {
    localStorage.setItem("userNotifications", JSON.stringify(notifications));
    
    // Trigger custom event for NotificationCenter to update
    window.dispatchEvent(new CustomEvent("notificationsUpdated"));
  } catch (error) {
    console.error("Error saving notifications:", error);
  }
}

// Add a new notification
export function addNotification(notification: Omit<Notification, "id" | "timestamp" | "read">): void {
  const notifications = getNotifications();
  
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    read: false,
  };
  
  notifications.unshift(newNotification); // Add to beginning
  
  // Keep only last 100 notifications
  if (notifications.length > 100) {
    notifications.splice(100);
  }
  
  saveNotifications(notifications);
}

// Create mention notification
export function createMentionNotification(params: {
  mentionedBy: string;
  discussionTitle: string;
  discussionId: string;
  commentId: string;
  commentPreview: string;
}): void {
  addNotification({
    type: "mention",
    title: `${params.mentionedBy} mentioned you`,
    message: `in "${params.discussionTitle}": ${params.commentPreview.slice(0, 60)}${params.commentPreview.length > 60 ? '...' : ''}`,
    metadata: {
      discussionId: params.discussionId,
      commentId: params.commentId,
      mentionedBy: params.mentionedBy,
    },
  });
}

// Mark notification as read
export function markNotificationAsRead(notificationId: string): void {
  const notifications = getNotifications();
  const updatedNotifications = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  saveNotifications(updatedNotifications);
}

// Mark all notifications as read
export function markAllNotificationsAsRead(): void {
  const notifications = getNotifications();
  const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
  saveNotifications(updatedNotifications);
}

// Get unread notification count
export function getUnreadCount(): number {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
}

// Delete a notification
export function deleteNotification(notificationId: string): void {
  const notifications = getNotifications();
  const updatedNotifications = notifications.filter(n => n.id !== notificationId);
  saveNotifications(updatedNotifications);
}

// Clear all notifications
export function clearAllNotifications(): void {
  saveNotifications([]);
}
