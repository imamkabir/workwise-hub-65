import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  onLogin: (email: string) => void;
}

export const AuthForm = ({ onLogin }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "⚠️ Missing Fields",
        description: "Please fill all fields!",
        variant: "destructive",
      });
      return;
    }

    if (isLogin) {
      // Admin bypass
      if (email === "admin" && password === "124") {
        toast({
          title: "✅ Welcome Admin!",
          description: "Redirecting to admin dashboard...",
        });
        setTimeout(() => onLogin("admin"), 1000);
        return;
      }

      // Demo user bypass
      if (email === "user" && password === "123") {
        toast({
          title: "✅ Welcome User!",
          description: "Redirecting to user dashboard...",
        });
        setTimeout(() => onLogin("user"), 1000);
        return;
      }

      // Check localStorage for user
      const stored = localStorage.getItem(email);
      if (!stored) {
        toast({
          title: "❌ Account Not Found",
          description: "No account found with this email!",
          variant: "destructive",
        });
      } else {
        const userData = JSON.parse(stored);
        if (userData.password !== password) {
          toast({
            title: "❌ Wrong Password",
            description: "Please check your credentials!",
            variant: "destructive",
          });
        } else {
          toast({
            title: "✅ Welcome Back!",
            description: `Welcome back, ${userData.email}`,
          });
          setTimeout(() => onLogin(userData.email), 1000);
        }
      }
    } else {
      // Register user
      if (localStorage.getItem(email)) {
        toast({
          title: "⚠️ Account Exists",
          description: "Account already exists with this email!",
          variant: "destructive",
        });
      } else {
        localStorage.setItem(email, JSON.stringify({ email, password }));
        toast({
          title: "✅ Account Created!",
          description: "You can now login with your credentials.",
        });
        setIsLogin(true);
        setPassword("");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">🌀</div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Iconic Lite
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin ? "Welcome back! Please sign in." : "Create your account to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full gradient-primary glow font-semibold"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary/80 transition-colors text-sm"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
          
          {isLogin && (
            <div className="mt-4 p-3 glass rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Demo Accounts:</strong><br />
                Admin: admin | 124<br />
                User: user | 123
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};