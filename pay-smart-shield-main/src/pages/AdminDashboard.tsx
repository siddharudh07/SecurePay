import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, Store, Receipt, Settings } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const adminActions = [
    {
      title: "Create Account",
      description: "Onboard new users and merchants",
      icon: UserPlus,
      action: () => navigate("/create-account"),
      color: "text-primary"
    },
    {
      title: "View Users",
      description: "Manage registered bank accounts",
      icon: Users,
      action: () => navigate("/view-users"),
      color: "text-success"
    },
    {
      title: "View Merchants",
      description: "Monitor merchant accounts",
      icon: Store,
      action: () => navigate("/view-merchants"),
      color: "text-warning"
    },
    {
      title: "View Transactions",
      description: "Audit transaction history",
      icon: Receipt,
      action: () => navigate("/view-transactions"),
      color: "text-destructive"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Settings className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Administrative Control Panel</h1>
          <p className="text-muted-foreground">Manage users, merchants, and transactions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminActions.map((item, index) => (
            <Card key={index} className="backdrop-blur-sm bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center pb-4">
                <item.icon className={`w-12 h-12 mx-auto mb-2 ${item.color}`} />
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4 text-sm">{item.description}</p>
                <Button 
                  onClick={item.action}
                  variant="hero"
                  className="w-full"
                >
                  Access
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button 
            onClick={() => navigate("/")} 
            variant="outline"
            className="border-border/50 bg-background/50"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;