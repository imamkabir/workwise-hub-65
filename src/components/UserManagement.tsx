import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, CreditCard, Search, UserCheck, UserX, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockUsers = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "User",
    credits: 45,
    referrals: 3,
    totalDownloads: 12,
    joinDate: "2024-01-10",
    status: "Active",
    avatar: ""
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    role: "User",
    credits: 23,
    referrals: 1,
    totalDownloads: 8,
    joinDate: "2024-01-15",
    status: "Active",
    avatar: ""
  },
  {
    id: 3,
    name: "Carol Williams",
    email: "carol@example.com",
    role: "User",
    credits: 67,
    referrals: 7,
    totalDownloads: 25,
    joinDate: "2024-01-08",
    status: "Active",
    avatar: ""
  },
  {
    id: 4,
    name: "David Brown",
    email: "david@example.com",
    role: "User",
    credits: 12,
    referrals: 0,
    totalDownloads: 4,
    joinDate: "2024-01-20",
    status: "Inactive",
    avatar: ""
  }
];

export const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleStatusToggle = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" }
        : user
    ));
    toast({
      title: "User Status Updated",
      description: "User status has been changed successfully.",
    });
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === "Active").length,
    totalCredits: users.reduce((sum, u) => sum + u.credits, 0),
    totalReferrals: users.reduce((sum, u) => sum + u.referrals, 0),
    totalDownloads: users.reduce((sum, u) => sum + u.totalDownloads, 0)
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          User Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor user activity, credits, and referrals
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalStats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{totalStats.activeUsers}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold">{totalStats.totalCredits}</p>
              </div>
              <CreditCard className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Referrals</p>
                <p className="text-2xl font-bold">{totalStats.totalReferrals}</p>
              </div>
              <Mail className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Downloads</p>
                <p className="text-2xl font-bold">{totalStats.totalDownloads}</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            View and manage user accounts and their activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.status === "Active" ? "default" : "secondary"}
                      className={user.status === "Active" ? "bg-green-500" : ""}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4 text-yellow-500" />
                      {user.credits}
                    </div>
                  </TableCell>
                  <TableCell>{user.referrals}</TableCell>
                  <TableCell>{user.totalDownloads}</TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="glass">
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass">
                          <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                            <DialogDescription>
                              View detailed user information and activity
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-16 h-16">
                                <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-lg font-semibold">{user.name}</h3>
                                <p className="text-muted-foreground">{user.email}</p>
                                <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                                  {user.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Credits</p>
                                <p className="text-xl font-bold">{user.credits}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Referrals</p>
                                <p className="text-xl font-bold">{user.referrals}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Downloads</p>
                                <p className="text-xl font-bold">{user.totalDownloads}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Join Date</p>
                                <p className="text-xl font-bold">{user.joinDate}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="glass"
                        onClick={() => handleStatusToggle(user.id)}
                      >
                        {user.status === "Active" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};