import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Shield, User, UserCheck } from "lucide-react";
import { storage, type StoredUser } from "@/lib/utils";

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminUsername, setAdminUsername] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const id = setInterval(() => setCooldownSec((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldownSec]);

  const handleRequestOtp = async () => {
    if (!email) return;
    
    // Check if user exists
    const users = storage.getUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    setIsNewUser(!existingUser);
    
    try {
      setError(null);
      setLoading(true);
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        const sec = Math.ceil((data?.cooldownMs || 0) / 1000);
        setCooldownSec(sec > 0 ? sec : 30);
        setError(data?.error || 'Please wait before requesting another OTP.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to send OTP');
      }

      const data = await res.json();
      setPreviewUrl(data.previewUrl || null);
      setOtpSent(true);
      setShowSuccess(true);
      if (typeof data.cooldownSec === 'number') setCooldownSec(data.cooldownSec);
      setLoading(false);
    } catch (e: any) {
      setShowSuccess(false);
      setError(e?.message || 'Unable to send OTP. Please try again.');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email || !otp) return;
    if (isNewUser && !fullName.trim()) {
      setError('Please enter your full name for registration.');
      return;
    }
    
    setError(null);
    setLoading(true);
    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    if (!res.ok) {
      setLoading(false);
      try {
        const data = await res.json();
        setError(data?.error || 'Invalid or expired OTP. Resend and try again.');
      } catch {
        setError('Invalid or expired OTP. Resend and try again.');
      }
      return;
    }
    // On success, create/set user
    storage.ensureAdminUser();
    const users = storage.getUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Use the provided full name or create from email
      const userName = fullName.trim() || (() => {
        const emailName = email.split('@')[0];
        return emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._]/g, ' ');
      })();
      
      user = {
        id: `usr_${Date.now()}`,
        name: userName,
        email,
        mobile: mobileNumber || 'unknown',
        role: 'user',
        age: 25, // Default age for OTP users
        bank: 'Not provided', // Bank not collected during OTP login
        state: 'Not provided'
      } as StoredUser;
      storage.addUser(user);
    }
    storage.setCurrentUser(user);
    setShowSuccess(true);
    setLoading(false);
    setTimeout(() => navigate('/user-dashboard'), 300);
  };

  const handleAdminLogin = () => {
    setAdminError(null);
    
    if (adminUsername === "admin" && adminPassword === "admin123") {
      storage.ensureAdminUser();
      const admin: StoredUser = {
        id: 'admin',
        name: 'Admin',
        email: 'admin@system.local',
        mobile: '0000000000',
        role: 'admin'
      };
      storage.setCurrentUser(admin);
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 2000);
    } else {
      setAdminError("Invalid credentials. Use username: admin, password: admin123");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Login to SecurePay</h1>
          <p className="text-muted-foreground">Choose your login method</p>
        </div>

        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="user" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              User Login
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Admin Login
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            <Card className="backdrop-blur-sm bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-center">User Verification (Email OTP)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!otpSent ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <Button onClick={handleRequestOtp} className="w-full" variant="hero" disabled={!email || loading || cooldownSec > 0}>
                      {loading ? 'Sending...' : cooldownSec > 0 ? `Resend in ${cooldownSec}s` : 'Send OTP to Email'}
                    </Button>
                    {error && <div className="text-center text-destructive text-sm">{error}</div>}
                    {showSuccess && (
                      <div className="text-center text-success font-medium">OTP sent! Check your inbox.</div>
                    )}
                  </>
                ) : (
                  <>
                    {previewUrl && (
                      <div className="text-xs text-muted-foreground text-center">
                        Using test email (Ethereal). View OTP at: <a className="underline" href={previewUrl} target="_blank" rel="noreferrer">preview link</a>
                      </div>
                    )}
                    {isNewUser && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name (New User Registration)</label>
                        <Input
                          type="text"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-background/50"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Enter OTP</label>
                      <Input
                        type="text"
                        placeholder="6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <Button onClick={handleVerifyOtp} className="w-full" variant="hero" disabled={!otp || loading}>
                      {loading ? 'Verifying...' : 'Verify & Continue'}
                    </Button>
                    <Button onClick={handleRequestOtp} className="w-full" variant="outline" disabled={loading || cooldownSec > 0}>
                      {cooldownSec > 0 ? `Resend in ${cooldownSec}s` : 'Resend OTP'}
                    </Button>
                    {error && <div className="text-center text-destructive text-sm">{error}</div>}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card className="backdrop-blur-sm bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-center">Admin Portal</CardTitle>
                <p className="text-center text-sm text-muted-foreground">
                  Use: admin / admin123
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <Button 
                  onClick={handleAdminLogin} 
                  className="w-full"
                  variant="hero"
                  disabled={!adminPassword}
                >
                  Login as Admin
                </Button>
                {adminError && (
                  <div className="text-center text-destructive text-sm">{adminError}</div>
                )}
                {showSuccess && (
                  <div className="text-center text-success font-medium">
                    Admin login successful! Redirecting...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;