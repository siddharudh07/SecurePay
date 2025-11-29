import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, User, CreditCard, History, LogOut } from "lucide-react";
import { storage } from "@/lib/utils";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load current user data from storage
    const loadUserData = () => {
      try {
        const currentUser = storage.getCurrentUser();
        if (currentUser) {
          // Use the actual user's name from storage
          setUserName(currentUser.name.split(' ')[0]); // Use first name
        } else {
          // If no user is logged in, redirect to login
          navigate("/login");
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading user data:", error);
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {isLoading ? "Loading..." : `Welcome, ${userName}`}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/merchant-setup")}
              variant="hero"
              className="flex items-center gap-2"
            >
              Become a Merchant
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 border-border/50 bg-background/50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">User Dashboard</h2>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Your Profile */}
          <Card
            className="backdrop-blur-sm bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => navigate("/user-profile")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                View and manage your account details.
              </p>
            </CardContent>
          </Card>

          {/* Make a Payment */}
          <Card
            className="backdrop-blur-sm bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => navigate("/make-payment")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Make a Payment</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Initiate new UPI transactions securely.
              </p>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card
            className="backdrop-blur-sm bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => navigate("/transaction-history")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <History className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Review all your past transactions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;