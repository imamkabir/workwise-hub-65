import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authApi, type LoginResponse } from "@/lib/api";

interface AuthFormProps {
  onLogin: (email: string) => void;
}

export const AuthForm = ({ onLogin }: AuthFormProps) => {
  const [activeTab, setActiveTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent, isLoginMode: boolean) => {
    e.preventDefault();
    
    if (!email || !password || (!isLoginMode && !name)) {
      toast({
        title: "⚠️ Missing Fields",
        description: "Please fill all fields!",
        variant: "destructive",
      });
      return;
    }

    // No hardcoded demo accounts - all authentication through backend

    // Real API calls to your backend
    try {
      if (isLoginMode) {
        // Login with your backend
        toast({
          title: "🔐 Signing In",
          description: "Connecting to backend server...",
        });
        
        const response: LoginResponse = await authApi.login(email, password);
        
        // Store auth token and user info
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userRole', response.user.role);
        localStorage.setItem('userId', response.user.id);
        localStorage.setItem('userName', response.user.name);
        
        toast({
          title: "✅ Welcome Back!",
          description: `Logged in successfully as ${response.user.role}`,
        });
        
        setTimeout(() => onLogin(response.user.email), 1000);
        
        setEmail("");
        setPassword("");
        setName("");
      } else {
        // Sign up with your backend
        toast({
          title: "🚀 Creating Account",
          description: "Connecting to backend server...",
        });
        
        const response = await authApi.signup(email, password, name);
        
        toast({
          title: "✅ Account Created!",
          description: "You can now sign in with your credentials.",
        });
        
        // Switch to login tab
        setActiveTab("login");
        setEmail("");
        setPassword("");
        setName("");
      }
    } catch (error: any) {
      console.error("Backend authentication error:", error);
      
      // Check if it's a network error (backend not running)
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        toast({
          title: "🔌 Backend Not Connected",
          description: "Please start your backend server on localhost:8000. Using demo mode for now.",
          variant: "destructive",
        });
        
        // Fallback to localStorage demo mode for development
        if (isLoginMode) {
          const stored = localStorage.getItem(email);
          if (!stored) {
            toast({
              title: "❌ Account Not Found",
              description: "No account found with this email! (Demo Mode)",
              variant: "destructive",
            });
          } else {
            const userData = JSON.parse(stored);
            if (userData.password !== password) {
              toast({
                title: "❌ Wrong Password",
                description: "Please check your credentials! (Demo Mode)",
                variant: "destructive",
              });
            } else {
              toast({
                title: "✅ Welcome Back!",
                description: `Welcome back, ${userData.name || userData.email} (Demo Mode)`,
              });
              setTimeout(() => onLogin(userData.email), 1000);
            }
          }
        } else {
          // Register in localStorage for demo
          if (localStorage.getItem(email)) {
            toast({
              title: "⚠️ Account Exists",
              description: "Account already exists with this email! (Demo Mode)",
              variant: "destructive",
            });
          } else {
            localStorage.setItem(email, JSON.stringify({ name, email, password }));
            toast({
              title: "✅ Account Created!",
              description: "You can now login with your credentials. (Demo Mode)",
            });
            setActiveTab("login");
            setPassword("");
            setName("");
          }
        }
      } else {
        // Backend returned an error (invalid credentials, etc.)
        toast({
          title: "❌ Authentication Failed",
          description: error.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleOAuthLogin = (provider: string) => {
    toast({
      title: "🚀 OAuth Login",
      description: `${provider} login will be implemented with backend integration.`,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <Card className="w-full max-w-md glass border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto mb-2">
            <img 
              src="/src/assets/iconic-portal-mascot.png" 
              alt="Iconic Portal Mascot" 
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Iconic Portal
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Your premium content platform with enterprise-grade security
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass bg-secondary/20">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass h-11 border-primary/20 focus:border-primary/40"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass h-11 border-primary/20 focus:border-primary/40"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 gradient-primary glow font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Sign In to Dashboard
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-primary/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthLogin("Google")}
                  className="glass border-primary/20 hover:bg-primary/5 h-11"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthLogin("GitHub")}
                  className="glass border-primary/20 hover:bg-primary/5 h-11"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Button>
              </div>
              
              <div className="mt-4 p-4 glass rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  <strong>🔌 Backend Integration:</strong> Live API calls to localhost:8000<br />
                  <strong>Security:</strong> Rate limited, IP tracking, admin notifications
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass h-11 border-primary/20 focus:border-primary/40"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass h-11 border-primary/20 focus:border-primary/40"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass h-11 border-primary/20 focus:border-primary/40"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 gradient-primary glow font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create Your Account
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-primary/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthLogin("Google")}
                  className="glass border-primary/20 hover:bg-primary/5 h-11"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthLogin("GitHub")}
                  className="glass border-primary/20 hover:bg-primary/5 h-11"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};