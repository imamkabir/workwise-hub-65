import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Download, Gift, Users, Play, Calendar, Search, TrendingUp, TrendingDown, CreditCard as CreditIcon } from "lucide-react";

interface TransactionHistoryProps {
  userCredits: number;
}

// Mock transaction data
const mockTransactions = [
  {
    id: 1,
    type: "spent",
    amount: -3,
    reason: "Downloaded Mathematics Past Paper 2023",
    date: "2024-01-20",
    time: "14:30",
    category: "download",
    details: "PDF • 2.5 MB"
  },
  {
    id: 2,
    type: "earned",
    amount: +50,
    reason: "Purchased credit package",
    date: "2024-01-20",
    time: "09:15",
    category: "purchase",
    details: "50 credits for $4.99"
  },
  {
    id: 3,
    type: "earned",
    amount: +5,
    reason: "Referral bonus - John Doe signed up",
    date: "2024-01-19",
    time: "16:45",
    category: "referral",
    details: "Friend referral completed"
  },
  {
    id: 4,
    type: "spent",
    amount: -5,
    reason: "Downloaded Physics Video Lecture",
    date: "2024-01-19",
    time: "12:20",
    category: "download",
    details: "Video • 156 MB"
  },
  {
    id: 5,
    type: "earned",
    amount: +2,
    reason: "Watched promotional ad",
    date: "2024-01-18",
    time: "18:30",
    category: "ad",
    details: "30-second video ad"
  },
  {
    id: 6,
    type: "earned",
    amount: +1,
    reason: "Daily bonus claimed",
    date: "2024-01-18",
    time: "08:00",
    category: "bonus",
    details: "Daily login reward"
  },
  {
    id: 7,
    type: "spent",
    amount: -2,
    reason: "Downloaded Chemistry Audio Notes",
    date: "2024-01-17",
    time: "20:15",
    category: "download",
    details: "Audio • 45 MB"
  },
  {
    id: 8,
    type: "earned",
    amount: +5,
    reason: "Referral bonus - Jane Smith signed up",
    date: "2024-01-17",
    time: "11:30",
    category: "referral",
    details: "Friend referral completed"
  },
  {
    id: 9,
    type: "spent",
    amount: -4,
    reason: "Downloaded Biology Study Guide 2024",
    date: "2024-01-16",
    time: "15:45",
    category: "download",
    details: "Document • 1.8 MB"
  },
  {
    id: 10,
    type: "earned",
    amount: +100,
    reason: "Purchased premium credit package",
    date: "2024-01-15",
    time: "10:00",
    category: "purchase",
    details: "100 credits for $8.99"
  }
];

export const TransactionHistory = ({ userCredits }: TransactionHistoryProps) => {
  const [transactions] = useState(mockTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const getTransactionIcon = (category: string) => {
    switch (category) {
      case "download":
        return <Download className="w-5 h-5 text-blue-500" />;
      case "purchase":
        return <CreditCard className="w-5 h-5 text-green-500" />;
      case "referral":
        return <Users className="w-5 h-5 text-purple-500" />;
      case "ad":
        return <Play className="w-5 h-5 text-orange-500" />;
      case "bonus":
        return <Gift className="w-5 h-5 text-pink-500" />;
      default:
        return <CreditIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredAndSortedTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.details.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || 
                         (filterType === "earned" && transaction.type === "earned") ||
                         (filterType === "spent" && transaction.type === "spent") ||
                         (filterType === transaction.category);
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime();
        case "oldest":
          return new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime();
        case "amount-high":
          return Math.abs(b.amount) - Math.abs(a.amount);
        case "amount-low":
          return Math.abs(a.amount) - Math.abs(b.amount);
        default:
          return 0;
      }
    });

  // Calculate summary stats
  const totalEarned = transactions
    .filter(t => t.type === "earned")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalSpent = Math.abs(transactions
    .filter(t => t.type === "spent")
    .reduce((sum, t) => sum + t.amount, 0));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Transaction History
          </h1>
          <p className="text-muted-foreground mt-2">
            Track all your credit earnings and spending
          </p>
        </div>
        <Card className="glass p-4">
          <div className="flex items-center gap-2">
            <CreditIcon className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">{userCredits} Credits</span>
          </div>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold text-green-500">+{totalEarned}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-red-500">-{totalSpent}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Balance</p>
                <p className="text-2xl font-bold text-blue-500">{totalEarned - totalSpent}</p>
              </div>
              <CreditIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="glass">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="earned">Credits Earned</SelectItem>
                <SelectItem value="spent">Credits Spent</SelectItem>
                <SelectItem value="download">Downloads</SelectItem>
                <SelectItem value="purchase">Purchases</SelectItem>
                <SelectItem value="referral">Referrals</SelectItem>
                <SelectItem value="ad">Ads Watched</SelectItem>
                <SelectItem value="bonus">Bonuses</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="glass">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
                <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            {filteredAndSortedTransactions.length} transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAndSortedTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-background/50 rounded-lg">
                    {getTransactionIcon(transaction.category)}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.reason}</p>
                    <p className="text-sm text-muted-foreground">{transaction.details}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {transaction.date} at {transaction.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    transaction.type === "earned" ? "text-green-500" : "text-red-500"
                  }`}>
                    {transaction.type === "earned" ? "+" : ""}{transaction.amount}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${
                      transaction.type === "earned" 
                        ? "border-green-500/50 text-green-500" 
                        : "border-red-500/50 text-red-500"
                    }`}
                  >
                    {transaction.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {filteredAndSortedTransactions.length === 0 && (
            <div className="text-center py-12">
              <CreditIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};