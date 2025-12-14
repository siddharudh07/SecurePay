import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Zap, Users, CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Advanced fraud detection with AI-powered risk analysis"
    },
    {
      icon: Zap,
      title: "Instant Payments",
      description: "Real-time UPI transactions with zero delays"
    },
    {
      icon: Lock,
      title: "Secure Verification",
      description: "Multi-layer authentication and OTP verification"
    },
    {
      icon: Users,
      title: "Merchant Support",
      description: "Complete merchant onboarding and QR code generation"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Shield className="w-20 h-20 text-primary mx-auto mb-6" />
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Secure UPI Payments
            </h1>
            <p className="text-2xl text-muted-foreground mb-4">Instantly</p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of digital payments with our AI-powered fraud detection system. 
              Secure, fast, and reliable UPI transactions for everyone.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={() => navigate("/login")}
              variant="hero"
              size="lg"
              className="text-lg px-8 py-4"
            >
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SecurePay?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="backdrop-blur-sm bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                <CardHeader className="text-center">
                  <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="backdrop-blur-sm bg-card/50 border-border/50">
            <CardContent className="py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <h3 className="text-3xl font-bold text-primary mb-2">99.9%</h3>
                  <p className="text-muted-foreground">Fraud Detection Accuracy</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-primary mb-2">&lt; 2s</h3>
                  <p className="text-muted-foreground">Average Transaction Time</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-primary mb-2">24/7</h3>
                  <p className="text-muted-foreground">Security Monitoring</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
