import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { QrCode, ArrowLeft, AlertTriangle, CheckCircle, XCircle, Store, Copy } from "lucide-react";
import { calculateFraudRisk, type TransactionData } from "@/lib/fraudDetection";
import { type Merchant } from "@/lib/mockData";
import { parseUpiPayload, storage } from "@/lib/utils";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { useToast } from "@/hooks/use-toast";

const MakePayment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [merchantUPI, setMerchantUPI] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    fraudDetection?: any;
    merchant?: Merchant;
  } | null>(null);
  const [showMerchantList, setShowMerchantList] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load merchants created by users
    const loadMerchants = () => {
      try {
        const storedMerchants = storage.getMerchants();
        const merchantsForPayment: Merchant[] = storedMerchants.map((m, idx) => ({
          id: idx + 1,
          businessName: m.businessName,
          ownerName: m.ownerName,
          businessType: m.businessType,
          mobile: m.mobile,
          email: m.email,
          state: m.state || 'Unknown',
          verificationStatus: 'Verified',
          fraudScore: 0.1,
          totalTransactions: 0,
          monthlyVolume: '₹0',
          joinDate: new Date().toISOString().split('T')[0],
          upiNumber: m.upiId
        }));
        setMerchants(merchantsForPayment);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading merchants:", error);
        setIsLoading(false);
      }
    };

    loadMerchants();
  }, []);

  const handleShowMerchants = () => {
    if (merchants.length === 0) {
      toast({
        title: "No Merchants Available",
        description: "Please create a merchant account first or ask someone to register as a merchant.",
        variant: "destructive"
      });
      return;
    }
    setShowMerchantList(true);
  };

  const handleSelectMerchant = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setMerchantUPI(merchant.upiNumber);
    setShowMerchantList(false);
  };

  const copyUpiId = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    toast({
      title: "UPI ID Copied!",
      description: "UPI ID copied to clipboard",
    });
  };

  const handlePayment = () => {
    if (!merchantUPI || !amount) return;

    setIsProcessing(true);

    // Find merchant by UPI ID
    const merchant = merchants.find(m => m.upiNumber === merchantUPI);
    
    // Generate transaction data for fraud detection using real dataset patterns
    const transactionData: TransactionData = {
      trans_hour: new Date().getHours(),
      trans_day: new Date().getDate(),
      trans_month: new Date().getMonth() + 1,
      trans_year: new Date().getFullYear(),
      category: Math.floor(Math.random() * 14), // Random category for demo
      age: Math.floor(Math.random() * 50) + 18, // Random age for demo
      trans_amount: parseFloat(amount),
      state: Math.floor(Math.random() * 28), // Random state code
      zip: String(Math.floor(Math.random() * 999999) + 100000), // Random ZIP
      upi_number: merchantUPI
    };

    // Run fraud detection
    const fraudDetection = calculateFraudRisk(transactionData);

    setTimeout(() => {
      const success = !fraudDetection.isFraud;
      // Get category from merchant business type or transaction data
      const getTransactionCategory = () => {
        if (merchant?.businessType) {
          return merchant.businessType;
        }
        // Fallback to category from fraud detection data
        const categoryMappings = {
          0: "Entertainment",
          1: "Food Dining", 
          2: "Gas Transport",
          3: "Grocery Net",
          4: "Grocery POS",
          5: "Health Fitness",
          6: "Home",
          7: "Kids Pets",
          8: "Misc Net",
          9: "Misc POS",
          10: "Personal Care",
          11: "Shopping Net",
          12: "Shopping POS",
          13: "Travel"
        };
        return categoryMappings[transactionData.category as keyof typeof categoryMappings] || "General";
      };

      // Get current user data for transaction
      const currentUser = storage.getCurrentUser();
      
      // Determine customer location with multiple fallbacks
      const getCustomerLocation = () => {
        // First priority: User's registered state
        if (currentUser?.state && currentUser.state !== 'Not provided' && currentUser.state !== 'unknown') {
          return currentUser.state;
        }
        
        // Second priority: Map transaction state code to state name
        const stateNames = [
          'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
          'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
          'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
          'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
          'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
        ];
        
        if (transactionData.state >= 0 && transactionData.state < stateNames.length) {
          return stateNames[transactionData.state];
        }
        
        // Third priority: Guess from email domain or name patterns
        if (currentUser?.email) {
          const email = currentUser.email.toLowerCase();
          if (email.includes('bangalore') || email.includes('bengaluru')) return 'Karnataka';
          if (email.includes('mumbai') || email.includes('maharashtra')) return 'Maharashtra';
          if (email.includes('delhi') || email.includes('ncr')) return 'Delhi';
          if (email.includes('chennai') || email.includes('tamil')) return 'Tamil Nadu';
          if (email.includes('hyderabad') || email.includes('telangana')) return 'Telangana';
          if (email.includes('kolkata') || email.includes('bengal')) return 'West Bengal';
          if (email.includes('pune')) return 'Maharashtra';
          if (email.includes('ahmedabad') || email.includes('gujarat')) return 'Gujarat';
        }
        
        // Final fallback: Random realistic state based on user ID
        const fallbackStates = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat', 'Telangana'];
        const userIdHash = currentUser?.id ? parseInt(currentUser.id.slice(-1)) : 0;
        return fallbackStates[userIdHash % fallbackStates.length];
      };
      
      // Persist transaction with customer data
      storage.addTransaction({
        id: `TXN_${Date.now()}`,
        timestamp: new Date().toISOString(),
        amount: parseFloat(amount),
        category: getTransactionCategory(),
        merchantName: merchant?.businessName,
        upiId: merchantUPI,
        status: success ? 'Success' : 'Blocked',
        fraudRisk: fraudDetection.isFraud ? 1 : 0,
        customerAge: currentUser?.age || transactionData.age,
        customerLocation: getCustomerLocation(),
        customerId: currentUser?.id
      });

      setPaymentResult({
        success,
        fraudDetection,
        merchant
      });
      setIsProcessing(false);
    }, 1500);
  };

  const resetPayment = () => {
    setPaymentResult(null);
    setMerchantUPI("");
    setAmount("");
  };

  if (paymentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-md backdrop-blur-sm bg-card/90 border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Payment Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              {paymentResult.success ? (
                <>
                  <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-success mb-2">Payment Successful!</h3>
                  <p className="text-muted-foreground">Transaction completed securely</p>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-destructive mb-2">Payment Blocked!</h3>
                  <p className="text-muted-foreground">Fraudulent merchant detected</p>
                </>
              )}
            </div>

            {/* Fraud Detection Results */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Risk Level:</span>
                <Badge className={
                  paymentResult.fraudDetection.riskLevel === 'HIGH'
                    ? "bg-destructive/20 text-destructive"
                    : paymentResult.fraudDetection.riskLevel === 'MEDIUM'
                    ? "bg-warning/20 text-warning"
                    : "bg-success/20 text-success"
                }>
                  {paymentResult.fraudDetection.riskLevel}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Risk Score:</span>
                <span className="font-mono">
                  {(paymentResult.fraudDetection.riskScore * 100).toFixed(1)}%
                </span>
              </div>
              
              {paymentResult.fraudDetection.riskFactors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Risk Analysis:</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    {paymentResult.fraudDetection.riskLevel === 'LOW' 
                      ? 'This transaction shows multiple positive security indicators.'
                      : paymentResult.fraudDetection.riskLevel === 'MEDIUM'
                      ? 'This transaction has some risk factors that require attention.'
                      : 'This transaction shows multiple high-risk indicators and has been blocked.'
                    }
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {paymentResult.fraudDetection.riskFactors.map((factor: string, index: number) => {
                      const isPositive = factor.startsWith('✓');
                      const isNegative = factor.includes('+') && factor.includes('risk');
                      
                      return (
                        <div key={index} className={`flex items-start gap-2 p-2 rounded-md text-xs ${
                          isPositive 
                            ? 'bg-success/10 border border-success/20' 
                            : isNegative 
                            ? 'bg-destructive/10 border border-destructive/20'
                            : 'bg-muted/10 border border-muted/20'
                        }`}>
                          {isPositive ? (
                            <CheckCircle className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                          ) : isNegative ? (
                            <AlertTriangle className="w-3 h-3 text-destructive mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
                          )}
                          <span className={
                            isPositive 
                              ? 'text-success' 
                              : isNegative 
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          }>
                            {factor}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={resetPayment}
                variant="hero"
                className="w-full"
              >
                Make Another Payment
              </Button>
              <Button
                onClick={() => navigate("/user-dashboard")}
                variant="outline"
                className="w-full border-border/50"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show merchant list with QR codes
  if (showMerchantList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-600 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => setShowMerchantList(false)}
              variant="outline"
              size="icon"
              className="border-border/50 bg-background/50"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Select Merchant to Pay</h1>
              <p className="text-muted-foreground">Choose a merchant and scan their QR code</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {merchants.map((merchant) => {
              const qrData = `upi://pay?pa=${merchant.upiNumber}&pn=${encodeURIComponent(merchant.businessName)}&mc=0000&mode=02&purpose=00`;
              
              return (
                <Card key={merchant.id} className="backdrop-blur-sm bg-card/90 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Store className="w-5 h-5 text-primary" />
                      {merchant.businessName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <QRCodeGenerator 
                        value={qrData} 
                        size={150} 
                        className="mx-auto shadow-lg"
                      />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Owner: </span>
                        <span className="text-white">{merchant.ownerName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type: </span>
                        <span className="text-white">{merchant.businessType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">UPI ID: </span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-background/50 px-2 py-1 rounded text-primary flex-1">
                            {merchant.upiNumber}
                          </code>
                          <Button
                            onClick={() => copyUpiId(merchant.upiNumber)}
                            variant="outline"
                            size="sm"
                            className="border-border/50 h-7 w-7 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleSelectMerchant(merchant)}
                      variant="hero"
                      className="w-full"
                    >
                      Select This Merchant
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {merchants.length === 0 && (
            <Card className="backdrop-blur-sm bg-card/90 border-border/50">
              <CardContent className="text-center py-8">
                <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Merchants Available</h3>
                <p className="text-muted-foreground mb-4">
                  No merchants have registered yet. Create a merchant account or ask someone to register.
                </p>
                <Button
                  onClick={() => navigate("/merchant-setup")}
                  variant="hero"
                >
                  Become a Merchant
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-card/90 border-border/50">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-white">Make a Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-success/20 border-success/50">
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>Login successful!</AlertDescription>
          </Alert>

          {/* Selected Merchant Display */}
          {selectedMerchant && (
            <Card className="bg-primary/10 border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Store className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-white">{selectedMerchant.businessName}</h3>
                    <p className="text-sm text-muted-foreground">{selectedMerchant.upiNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* QR Scanner */}
          <div className="text-center space-y-3">
            <Button
              onClick={handleShowMerchants}
              variant="outline"
              className="w-full border-dashed border-2 border-primary/50 text-primary h-16"
              disabled={isLoading}
            >
              <div className="flex items-center gap-2">
                <QrCode className="w-6 h-6" />
                View Merchant QR Codes
              </div>
            </Button>
          </div>

          <div className="text-center text-muted-foreground">OR</div>

          {/* Manual Entry */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Enter Merchant UPI Number
              </label>
              <Input
                type="text"
                placeholder="merchant@upi"
                value={merchantUPI}
                onChange={(e) => setMerchantUPI(e.target.value)}
                className="bg-background/50 text-white"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background/50 text-white"
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={handlePayment}
              disabled={!merchantUPI || !amount || isProcessing || isLoading}
              className="w-full bg-success hover:bg-success/90 text-white font-medium"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing & Detecting Fraud...
                </div>
              ) : isLoading ? (
                "Loading..."
              ) : (
                "Pay & Detect Fraud"
              )}
            </Button>

            <Button
              onClick={() => navigate("/user-dashboard")}
              variant="secondary"
              className="w-full"
              disabled={isLoading}
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MakePayment;