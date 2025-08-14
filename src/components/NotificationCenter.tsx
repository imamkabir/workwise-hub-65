import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Upload, Gift, Users, Megaphone, CheckCircle, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationCenterProps {
  userRole: string;
}

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: "upload",
    title: "New File Available",
    message: "Mathematics Past Paper 2024 has been uploaded",
    date: "2024-01-20",
    time: "14:30",
    read: false,
    priority: "normal"
  },
  {
    id: 2,
    type: "credit",
    title: "Credits Earned",
    message: "You earned 5 credits from referral bonus",
    date: "2024-01-20",
    time: "09:15",
    read: false,
    priority: "high"
  },
  {
    id: 3,
    type: "announcement",
    title: "System Maintenance",
    message: "Scheduled maintenance on Sunday 2AM - 4AM UTC",
    date: "2024-01-19",
    time: "16:45",
    read: true,
    priority: "high"
  },
  {
    id: 4,
    type: "referral",
    title: "Friend Joined",
    message: "John Doe signed up using your referral link",
    date: "2024-01-19",
    time: "12:20",
    read: true,
    priority: "normal"
  },
  {
    id: 5,
    type: "upload",
    title: "New Content",
    message: "3 new physics video lectures uploaded",
    date: "2024-01-18",
    time: "18:30",
    read: true,
    priority: "normal"
  },
  {
    id: 6,
    type: "credit",
    title: "Daily Bonus",
    message: "Your daily bonus of 1 credit is ready to claim",
    date: "2024-01-18",
    time: "08:00",
    read: true,
    priority: "low"
  }
];

// Admin notifications
const adminNotifications = [
  {
    id: 7,
    type: "user",
    title: "New User Registration",
    message: "5 new users registered in the last 24 hours",
    date: "2024-01-20",
    time: "15:00",
    read: false,
    priority: "normal"
  },
  {
    id: 8,
    type: "analytics",
    title: "Weekly Report Ready",
    message: "Your weekly analytics report is available",
    date: "2024-01-20",
    time: "10:00",
    read: false,
    priority: "normal"
  },
  {
    id: 9,
    type: "system",
    title: "Storage Usage Alert",
    message: "File storage is at 85% capacity",
    date: "2024-01-19",
    time: "14:00",
    read: true,
    priority: "high"
  }
];

export const NotificationCenter = ({ userRole }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState(
    userRole === "admin" ? [...mockNotifications, ...adminNotifications] : mockNotifications
  );
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "upload":
        return <Upload className="w-5 h-5 text-blue-500" />;
      case "credit":
        return <Gift className="w-5 h-5 text-green-500" />;
      case "referral":
        return <Users className="w-5 h-5 text-purple-500" />;
      case "announcement":
        return <Megaphone className="w-5 h-5 text-orange-500" />;
      case "user":
        return <Users className="w-5 h-5 text-blue-500" />;
      case "analytics":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "system":
        return <Megaphone className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500/50 bg-red-500/10";
      case "normal":
        return "border-blue-500/50 bg-blue-500/10";
      case "low":
        return "border-gray-500/50 bg-gray-500/10";
      default:
        return "border-gray-500/50";
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: "All notifications marked as read",
      description: "Your notification list has been updated.",
    });
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed.",
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setIsOpen(false);
    toast({
      title: "All notifications cleared",
      description: "Your notification center is now empty.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative glass">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="glass max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-500">
                    {unreadCount} new
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Stay updated with the latest activity and announcements
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark all read
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear all
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`glass transition-all duration-200 ${
                  !notification.read ? "ring-2 ring-primary/50" : ""
                } ${getPriorityColor(notification.priority)}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.date} at {notification.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 w-8 p-0"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};