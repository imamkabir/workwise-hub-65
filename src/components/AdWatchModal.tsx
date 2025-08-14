import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Play, Gift, CreditCard, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCredits: number;
  onCreditUpdate: (newCredits: number) => void;
}

export const AdWatchModal = ({ isOpen, onClose, userCredits, onCreditUpdate }: AdWatchModalProps) => {
  const [adState, setAdState] = useState<"ready" | "watching" | "completed">("ready");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const startWatchingAd = () => {
    setAdState("watching");
    setProgress(0);

    // Simulate ad progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAdState("completed");
          onCreditUpdate(userCredits + 2);
          toast({
            title: "✅ Ad Completed!",
            description: "You earned 2 credits for watching the ad.",
          });
          return 100;
        }
        return prev + 2; // 2% every 60ms = 30 seconds total
      });
    }, 60);
  };

  const handleClose = () => {
    if (adState !== "watching") {
      setAdState("ready");
      setProgress(0);
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingTime = Math.ceil((100 - progress) * 0.3); // 30 seconds total

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="w-6 h-6 text-blue-500" />
            Watch Ad to Earn Credits
          </DialogTitle>
          <DialogDescription>
            Watch a short advertisement to earn 2 credits
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {adState === "ready" && (
            <>
              <Card className="glass border-2 border-dashed border-primary/50">
                <CardContent className="p-6 text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Watch</h3>
                  <p className="text-muted-foreground mb-4">
                    Watch a 30-second ad to earn 2 credits
                  </p>
                  <div className="flex items-center justify-center gap-2 text-green-500">
                    <Gift className="w-5 h-5" />
                    <span className="font-semibold">+2 Credits</span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Ad Requirements:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Watch the full 30-second advertisement</li>
                    <li>• Keep the ad window open and visible</li>
                    <li>• Credits will be added automatically after completion</li>
                    <li>• One ad per hour limit</li>
                  </ul>
                </div>

                <Button 
                  onClick={startWatchingAd}
                  className="w-full gradient-primary glow"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Watching Ad
                </Button>
              </div>
            </>
          )}

          {adState === "watching" && (
            <>
              <Card className="glass bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute inset-0 border-4 border-primary/30 rounded-lg animate-pulse"></div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">Ad Playing...</h3>
                  <p className="text-muted-foreground mb-4">
                    Please keep this window open while the ad plays
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{formatTime(remainingTime)} remaining</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                    <p className="text-xs text-muted-foreground">
                      {Math.round(progress)}% complete
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  <strong>Important:</strong> Closing this window or navigating away will cancel the ad and you won't receive credits.
                </p>
              </div>
            </>
          )}

          {adState === "completed" && (
            <>
              <Card className="glass bg-gradient-to-r from-green-500/10 to-blue-500/10">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-12 h-12 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 text-green-500">Ad Completed!</h3>
                  <p className="text-muted-foreground mb-4">
                    Thank you for watching the advertisement
                  </p>
                  
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 text-green-500">
                      <CreditCard className="w-6 h-6" />
                      <span className="text-xl font-bold">+2 Credits Earned!</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your current balance: {userCredits} credits
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">What's Next?</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Use your credits to download study materials</li>
                    <li>• Watch another ad in 1 hour to earn more credits</li>
                    <li>• Refer friends to earn 5 credits per signup</li>
                    <li>• Purchase credit packages for instant access</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleClose}
                  className="w-full"
                  variant="outline"
                >
                  Continue to Dashboard
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};