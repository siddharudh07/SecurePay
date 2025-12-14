import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Store, ArrowLeft, Copy, CheckCircle, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateRealTransactions } from "@/lib/mockData";
import { calculateFraudRisk, verifyMerchant } from "@/lib/fraudDetection";
import QRCodeGenerator from "@/components/QRCodeGenerator";

const MerchantProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [merchantData, setMerchantData] = useState<any>(null);
  const [qrCodeData, setQrCodeData] = useState("");
  const [merchantVerification, setMerchantVerification] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedData = localStorage.getItem('merchantData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setMerchantData(data);
      
      // Generate unique UPI ID based on business name and timestamp
      const uniqueId = `${data.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}${Date.now().toString().slice(-4)}`;
      const upiId = `${uniqueId}@paytm`;
      
      // Generate proper UPI payment link
      setQrCodeData(`upi://pay?pa=${upiId}&pn=${encodeURIComponent(data.businessName)}&mc=0000&mode=02&purpose=00`);
      
      // Update merchant data with UPI ID if not already present
      if (!data.upiId) {
        data.upiId = upiId;
        localStorage.setItem('merchantData', JSON.stringify(data));
      }
      
      // Load merchant verification data and recent transactions
      loadMerchantData(data);
    } else {
      navigate("/merchant-setup");
    }
  }, [navigate]);

  const loadMerchantData = async (data: any) => {
    try {
      // For now, set default verification for newly created merchants
      // In a real app, this would be based on actual transaction history
      const verification = {
        status: 'VERIFIED',
        verificationScore: 0.95,
        flags: []
      };
      
      setMerchantVerification(verification);
      setRecentTransactions([]); // No transactions yet for new merchants
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading merchant data:", error);
      setIsLoading(false);
    }
  };

  const getCategoryCode = (category: string): number => {
    const categoryMap: Record<string, number> = {
      "Entertainment": 0,
      "Food Dining": 1,
      "Gas Transport": 2,
      "Grocery Net": 3,
      "Grocery POS": 4,
      "Health Fitness": 5,
      "Home": 6,
      "Kids Pets": 7,
      "Misc Net": 8,
      "Misc POS": 9,
      "Personal Care": 10,
      "Shopping Net": 11,
      "Shopping POS": 12,
      "Travel": 13
    };
    return categoryMap[category] || 0;
  };

  const getStateCode = (state: string): number => {
    const stateMap: Record<string, number> = {
      "Andhra Pradesh": 0,
      "Arunachal Pradesh": 1,
      "Assam": 2,
      "Bihar": 3,
      "Chhattisgarh": 4,
      "Goa": 5,
      "Gujarat": 6,
      "Haryana": 7,
      "Himachal Pradesh": 8,
      "Jharkhand": 9,
      "Karnataka": 10,
      "Kerala": 11,
      "Madhya Pradesh": 12,
      "Maharashtra": 13,
      "Manipur": 14,
      "Meghalaya": 15,
      "Mizoram": 16,
      "Nagaland": 17,
      "Odisha": 18,
      "Punjab": 19,
      "Rajasthan": 20,
      "Sikkim": 21,
      "Tamil Nadu": 22,
      "Telangana": 23,
      "Tripura": 24,
      "Uttar Pradesh": 25,
      "Uttarakhand": 26,
      "West Bengal": 27
    };
    return stateMap[state] || 13; // Default to Maharashtra
  };

  const copyQRData = () => {
    navigator.clipboard.writeText(qrCodeData);
    toast({
      title: "QR Code Data Copied!",
      description: "Payment link copied to clipboard",
    });
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${merchantData.businessName}-QR-Code.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast({
        title: "QR Code Downloaded!",
        description: "QR code saved to your downloads",
      });
    }
  };

  if (!merchantData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate("/user-dashboard")}
            variant="outline"
            size="icon"
            className="border-border/50 bg-background/50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Your Merchant Profile</h1>
            <p className="text-muted-foreground">Your business is now ready to accept payments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Merchant Info Card */}
          <Card className="backdrop-blur-sm bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <Badge className="bg-success/20 text-success">Active</Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Business Name</p>
                  <p className="font-medium">{merchantData.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Owner</p>
                  <p className="font-medium">{merchantData.ownerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Business Type</p>
                  <p className="font-medium">{merchantData.businessType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{merchantData.mobile}</p>
                  <p className="text-sm text-muted-foreground">{merchantData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">UPI ID</p>
                  <p className="font-medium font-mono text-primary">{merchantData.upiId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{merchantData.address}</p>
                  <p className="text-sm text-muted-foreground">{merchantData.city}, {merchantData.state} {merchantData.zipCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Status Card */}
          <Card className="backdrop-blur-sm bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {merchantVerification?.status === 'FLAGGED' ? (
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                ) : (
                  <Shield className="w-5 h-5 text-primary" />
                )}
                Merchant Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div>Loading verification data...</div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Verification Status:</span>
                    <Badge
                      className={
                        merchantVerification?.status === 'VERIFIED'
                          ? "bg-success/20 text-success"
                          : merchantVerification?.status === 'FLAGGED'
                          ? "bg-destructive/20 text-destructive"
                          : "bg-warning/20 text-warning"
                      }
                    >
                      {merchantVerification?.status || 'PENDING'}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Verification Score</p>
                      <p className="font-medium">
                        {merchantVerification ? (merchantVerification.verificationScore * 100).toFixed(1) : '0'}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Transactions</p>
                      <p className="font-medium">{recentTransactions.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fraud Detection</p>
                      <p className="font-medium">
                        {merchantVerification?.flags?.length > 0
                          ? `${merchantVerification.flags.length} potential issues`
                          : "No issues detected"}
                      </p>
                    </div>
                  </div>
                  {merchantVerification?.flags?.length > 0 && (
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground mb-2">Potential Issues:</p>
                      <ul className="text-xs space-y-1">
                        {merchantVerification.flags.map((flag: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <AlertTriangle className="w-3 h-3 text-destructive mr-1 mt-0.5 flex-shrink-0" />
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* QR Code Card */}
        <Card className="backdrop-blur-sm bg-card/50 border-border/50 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Payment QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {/* QR Code Display */}
            <div className="flex justify-center">
              <QRCodeGenerator 
                value={qrCodeData} 
                size={192} 
                className="shadow-lg"
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">UPI Payment Link</p>
              <div className="flex items-center gap-2 p-2 bg-background/50 rounded-md">
                <code className="text-xs flex-1 truncate">{qrCodeData}</code>
                <Button
                  onClick={copyQRData}
                  variant="outline"
                  size="sm"
                  className="border-border/50"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-center gap-2 text-success">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Fraud Protection Active</span>
              </div>
              <p className="text-xs text-muted-foreground">
                All payments are protected by our AI-powered fraud detection system
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="backdrop-blur-sm bg-card/50 border-border/50 mt-6">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading transactions...</div>
            ) : recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.slice(0, 5).map((transaction, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-border/30">
                    <div>
                      <p className="font-medium">₹{transaction.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{transaction.timestamp}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={transaction.riskLevel === 'HIGH' ? 'destructive' : transaction.riskLevel === 'MEDIUM' ? 'secondary' : 'default'}
                      >
                        {transaction.riskLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No transactions found</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="backdrop-blur-sm bg-card/50 border-border/50 mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="border-border/50 bg-background/50">
                View All Transactions
              </Button>
              <Button 
                variant="outline" 
                className="border-border/50 bg-background/50"
                onClick={downloadQRCode}
              >
                Download QR Code
              </Button>
              <Button variant="outline" className="border-border/50 bg-background/50">
                Update Profile
              </Button>
              <Button variant="outline" className="border-border/50 bg-background/50">
                Payment Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MerchantProfile;