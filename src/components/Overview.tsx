import { Clock, Users, TrendingUp, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OverviewProps {
  currentUser: string;
}

export const Overview = ({ currentUser }: OverviewProps) => {
  const stats = [
    {
      title: "Total Employees",
      value: "248",
      icon: Users,
      change: "+12%",
      positive: true,
    },
    {
      title: "Present Today",
      value: "195",
      icon: CheckCircle,
      change: "+8%",
      positive: true,
    },
    {
      title: "Average Hours",
      value: "8.2h",
      icon: Clock,
      change: "+0.3h",
      positive: true,
    },
    {
      title: "Productivity",
      value: "92%",
      icon: TrendingUp,
      change: "+5%",
      positive: true,
    },
  ];

  const recentActivity = [
    { name: "John Doe", action: "Checked in", time: "09:15 AM", status: "success" },
    { name: "Sarah Wilson", action: "Checked out", time: "06:30 PM", status: "info" },
    { name: "Mike Johnson", action: "Late arrival", time: "10:45 AM", status: "warning" },
    { name: "Emily Davis", action: "Checked in", time: "08:30 AM", status: "success" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="glass hover:scale-105 transition-transform">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className={`text-xs ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full gradient-primary glow" size="lg">
              <Clock className="w-5 h-5 mr-2" />
              Check In/Out
            </Button>
            <Button variant="outline" className="w-full glass" size="lg">
              <Users className="w-5 h-5 mr-2" />
              View Team Status
            </Button>
            <Button variant="outline" className="w-full glass" size="lg">
              <TrendingUp className="w-5 h-5 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-400' :
                      activity.status === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{activity.name}</p>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message */}
      <Card className="glass border-primary/30">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">
              Welcome to Smart Attendance Portal
            </h3>
            <p className="text-muted-foreground mb-4">
              Track attendance, manage employees, and analyze productivity all in one place.
            </p>
            <div className="flex justify-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">99.2%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-xs text-muted-foreground">Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-xs text-muted-foreground">Companies</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};