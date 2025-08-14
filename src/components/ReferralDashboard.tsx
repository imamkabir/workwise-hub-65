import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Copy, Check, Gift, TrendingUp, UserPlus, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReferralDashboardProps {
  userCredits: number;
  onCreditUpdate: (newCredits: number) => void;
}

// Mock referral data
const mockReferralData = {
  referralCode: "ICONIC2024USER",
  totalReferrals: 12,
  creditsEarned: 60,
  pendingReferrals: 3,
  recentReferrals: [
    { name: "John Doe", joinDate: "2024-01-20", status: "completed", credits: 5 },
    { name: "Jane Smith", joinDate: "2024-01-18", status: "completed", credits: 5 },
    { name: "Mike Johnson", joinDate: "2024-01-15", status: "pending", credits: 0 },
    { name: "Sarah Wilson", joinDate: "2024-01-12", status: "completed", credits: 5 },
    { name: "Tom Brown", joinDate: "2024-01-10", status: "completed", credits: 5 }
  ]
};

export const ReferralDashboard = ({ userCredits, onCreditUpdate }: ReferralDashboardProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyReferralLink = () => {
    const referralLink = `https://iconicshare.com/signup?ref=${mockReferralData.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Referral Link Copied!",
      description: "Share this link to earn 5 credits per signup.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Referral Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Invite friends and earn credits for every successful referral
          </p>
        </div>
        <Card className="glass p-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">{userCredits} Credits</span>
          </div>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold text-blue-500">{mockReferralData.totalReferrals}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Credits Earned</p>
                <p className="text-2xl font-bold text-green-500">{mockReferralData.creditsEarned}</p>
              </div>
              <Gift className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{mockReferralData.pendingReferrals}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-500">75%</p>
              </div>
              <UserPlus className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-500" />
            Your Referral Link
          </CardTitle>
          <CardDescription>
            Share this link with friends to earn 5 credits per successful signup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={`https://iconicshare.com/signup?ref=${mockReferralData.referralCode}`}
                readOnly
                className="glass"
              />
              <Button 
                onClick={copyReferralLink}
                variant="outline"
                className="glass"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">How it works:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Share your unique referral link with friends</li>
                <li>• When they sign up using your link, you earn 5 credits</li>
                <li>• Credits are added to your account once they complete registration</li>
                <li>• No limit on the number of referrals you can make</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>
            Track your recent referral activity and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReferralData.recentReferrals.map((referral, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{referral.name}</p>
                    <p className="text-sm text-muted-foreground">Joined {referral.joinDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={referral.status === "completed" ? "default" : "secondary"}
                    className={referral.status === "completed" ? "bg-green-500" : ""}
                  >
                    {referral.status}
                  </Badge>
                  {referral.credits > 0 && (
                    <div className="flex items-center gap-1 text-green-500">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-semibold">+{referral.credits}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referral Tips */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-orange-500" />
            Maximize Your Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Share on Social Media</h4>
              <p className="text-sm text-muted-foreground">
                Post your referral link on Facebook, Twitter, Instagram to reach more friends
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Direct Messaging</h4>
              <p className="text-sm text-muted-foreground">
                Send personal messages to friends who might be interested in study materials
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Study Groups</h4>
              <p className="text-sm text-muted-foreground">
                Share with classmates and study group members who need past questions
              </p>
            </div>
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Educational Forums</h4>
              <p className="text-sm text-muted-foreground">
                Post in educational forums and communities where students gather
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};