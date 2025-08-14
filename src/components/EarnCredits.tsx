import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Play, Users, Copy, Check, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EarnCreditsProps {
  userCredits: number;
  onCreditUpdate: (newCredits: number) => void;
}

export const EarnCredits = ({ userCredits, onCreditUpdate }: EarnCreditsProps) => {
  const [referralCode] = useState("ICONIC2024USER");
  const [copied, setCopied] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const { toast } = useToast();

  const copyReferralCode = () => {
    navigator.clipboard.writeText(`https://iconicshare.com/signup?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Referral Link Copied!",
      description: "Share this link to earn 5 credits per signup.",
    });
  };

  const handleBuyCredits = (amount: number, cost: number) => {
    // Simulate payment
    toast({
      title: "Payment Processed",
      description: `Successfully purchased ${amount} credits for $${cost}.`,
    });
    onCreditUpdate(userCredits + amount);
  };

  const handleWatchAd = () => {
    setWatchingAd(true);
    // Simulate ad viewing
    setTimeout(() => {
      setWatchingAd(false);
      onCreditUpdate(userCredits + 2);
      toast({
        title: "✅ Ad Completed!",
        description: "You earned 2 credits for watching the ad.",
      });
    }, 3000);
  };

  const creditPackages = [
    { credits: 50, price: 4.99, popular: false },
    { credits: 100, price: 8.99, popular: true },
    { credits: 250, price: 19.99, popular: false },
    { credits: 500, price: 34.99, popular: false }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Earn Credits
          </h1>
          <p className="text-muted-foreground mt-2">
            Get credits to download premium content
          </p>
        </div>
        <Card className="glass p-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">{userCredits} Credits</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buy Credits */}
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-green-500" />
              Buy Credits
            </CardTitle>
            <CardDescription>
              Purchase credits instantly with secure payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creditPackages.map((pkg) => (
                <div key={pkg.credits} className="relative">
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-blue-400">
                      Most Popular
                    </Badge>
                  )}
                  <Card className={`glass ${pkg.popular ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div>
                          <div className="text-3xl font-bold text-yellow-500">{pkg.credits}</div>
                          <div className="text-sm text-muted-foreground">Credits</div>
                        </div>
                        <div className="text-2xl font-bold">${pkg.price}</div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full gradient-primary glow">
                              Buy Now
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass">
                            <DialogHeader>
                              <DialogTitle>Purchase {pkg.credits} Credits</DialogTitle>
                              <DialogDescription>
                                Complete your purchase for ${pkg.price}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-muted/50 rounded-lg p-4">
                                <div className="flex justify-between">
                                  <span>Credits:</span>
                                  <span className="font-semibold">{pkg.credits}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Price:</span>
                                  <span className="font-semibold">${pkg.price}</span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                  <span>Per credit:</span>
                                  <span>${(pkg.price / pkg.credits).toFixed(3)}</span>
                                </div>
                              </div>
                              <div className="text-center text-sm text-muted-foreground">
                                This is a demo payment simulation
                              </div>
                              <Button 
                                className="w-full gradient-primary glow"
                                onClick={() => handleBuyCredits(pkg.credits, pkg.price)}
                              >
                                Complete Purchase
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Free Methods */}
        <div className="space-y-6">
          {/* Watch Ads */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-6 h-6 text-blue-500" />
                Watch Ads
              </CardTitle>
              <CardDescription>
                Earn 2 credits per ad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div>
                  <div className="text-2xl font-bold text-blue-500">+2</div>
                  <div className="text-sm text-muted-foreground">Credits per ad</div>
                </div>
                <Button 
                  className="w-full"
                  onClick={handleWatchAd}
                  disabled={watchingAd}
                  variant="outline"
                >
                  {watchingAd ? "Watching Ad..." : "Watch Ad"}
                </Button>
                {watchingAd && (
                  <div className="text-sm text-muted-foreground">
                    Ad will complete in 3 seconds...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Refer Friends */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-500" />
                Refer Friends
              </CardTitle>
              <CardDescription>
                Earn 5 credits per signup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">+5</div>
                  <div className="text-sm text-muted-foreground">Credits per referral</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Referral Link:</label>
                  <div className="flex gap-2">
                    <Input 
                      value={`iconicshare.com/signup?ref=${referralCode}`}
                      readOnly
                      className="glass text-xs"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={copyReferralCode}
                      className="glass"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Share your unique link and earn credits when friends sign up!
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Bonus */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-6 h-6 text-orange-500" />
                Daily Bonus
              </CardTitle>
              <CardDescription>
                Check in daily for free credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div>
                  <div className="text-2xl font-bold text-orange-500">+1</div>
                  <div className="text-sm text-muted-foreground">Credit per day</div>
                </div>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    onCreditUpdate(userCredits + 1);
                    toast({
                      title: "Daily Bonus Claimed!",
                      description: "You earned 1 credit. Come back tomorrow!",
                    });
                  }}
                >
                  Claim Daily Bonus
                </Button>
                <div className="text-xs text-muted-foreground">
                  Next bonus available in 23:45:12
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};