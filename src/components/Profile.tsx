import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X, Mail, Phone, MapPin, Calendar, Clock, Award } from "lucide-react";

interface ProfileProps {
  currentUser: string;
}

export const Profile = ({ currentUser }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser === 'admin' ? 'Administrator' : currentUser,
    email: currentUser === 'admin' ? 'admin@company.com' : `${currentUser}@company.com`,
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    department: currentUser === 'admin' ? 'Administration' : 'Engineering',
    position: currentUser === 'admin' ? 'System Administrator' : 'Software Developer',
    joinDate: '2023-01-15',
    employeeId: currentUser === 'admin' ? 'ADM001' : 'EMP' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
  });
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "✅ Profile Updated",
      description: "Your profile has been successfully updated.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data here if needed
  };

  const stats = [
    { label: "Days Present", value: "182", icon: Calendar, color: "text-green-400" },
    { label: "Hours Worked", value: "1,456", icon: Clock, color: "text-blue-400" },
    { label: "Projects", value: "8", icon: Award, color: "text-purple-400" },
    { label: "Performance", value: "94%", icon: Award, color: "text-yellow-400" },
  ];

  const recentActivity = [
    { date: "2024-01-15", action: "Checked in", time: "09:15 AM" },
    { date: "2024-01-14", action: "Checked out", time: "06:30 PM" },
    { date: "2024-01-14", action: "Checked in", time: "08:45 AM" },
    { date: "2024-01-13", action: "Checked out", time: "05:45 PM" },
    { date: "2024-01-13", action: "Checked in", time: "09:00 AM" },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src="/placeholder-avatar.jpg" alt={profileData.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {profileData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">{profileData.name}</h2>
              <p className="text-lg text-primary">{profileData.position}</p>
              <p className="text-muted-foreground">{profileData.department}</p>
              <div className="flex justify-center md:justify-start space-x-2 mt-2">
                <Badge variant="secondary" className="glass">ID: {profileData.employeeId}</Badge>
                <Badge variant="outline" className="glass">Active</Badge>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className={isEditing ? "glass" : "gradient-primary glow"}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Personal Information
              {isEditing && (
                <Button onClick={handleSave} size="sm" className="gradient-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="glass"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{profileData.name}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="glass"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{profileData.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="glass"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{profileData.phone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    className="glass"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{profileData.location}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <div className="flex items-center space-x-2">
                  <span>{profileData.department}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Join Date</Label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(profileData.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Performance Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center p-4 rounded-lg bg-secondary/30">
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <span className="font-medium">{activity.action}</span>
                    <p className="text-sm text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};