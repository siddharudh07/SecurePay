import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Store,
  Copy
} from "lucide-react";
import { calculateFraudRisk, type TransactionData } from "@/lib/fraudDetection";
import { type Merchant } from "@/lib/mockData";
import { parseUpiPayload, storage } from "@/lib/utils";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { useToast } from "@/hooks/use-toast";

const isValidUpiId = (upi: string) => {
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return upiRegex.test(upi.trim());
};

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
          state: m.state || "Unknown",
          verificationStatus: "Verified",
          fraudScore: 0.1,
          totalTransactions: 0,
          monthlyVolume: "₹0",
          joinDate: new Date().toISOString().split("T")[0],
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
        description:
          "Please create a merchant account first or ask someone to register as a merchant.",
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
      description: "UPI ID copied to clipboard"
    });
  };

  const handlePayment = () => {
    if (!merchantUPI || !amount) return;

    if (!isValidUpiId(merchantUPI)) {
      toast({
        title: "Invalid Merchant UPI ID",
        description: "Please enter a valid UPI ID (example: merchant@upi)",
        variant: "destructive"
      });
      return;
    }

    const merchant = merchants.find(m => m.upiNumber === merchantUPI);
    
    if (!merchant) {
      toast({
        title: "Merchant Not Found",
        description: "This merchant is not registered in our system.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    const transactionData: TransactionData = {
      trans_hour: new Date().getHours(),
      trans_day: new Date().getDate(),
      trans_month: new Date().getMonth() + 1,
      trans_year: new Date().getFullYear(),
      category: Math.floor(Math.random() * 14),
      age: Math.floor(Math.random() * 50) + 18,
      trans_amount: parseFloat(amount),
      state: Math.floor(Math.random() * 28),
      zip: String(Math.floor(Math.random() * 999999) + 100000),
      upi_number: merchantUPI
    };

    const fraudDetection = calculateFraudRisk(transactionData);

    setTimeout(() => {
      const success = !fraudDetection.isFraud;

      storage.addTransaction({
        id: `TXN_${Date.now()}`,
        timestamp: new Date().toISOString(),
        amount: parseFloat(amount),
        category: merchant?.businessType || "General",
        merchantName: merchant?.businessName,
        upiId: merchantUPI,
        status: success ? "Success" : "Blocked",
        fraudRisk: fraudDetection.isFraud ? 1 : 0
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
    setSelectedMerchant(null);
  };

  // Payment Result View
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
                  <p className="text-muted-foreground">Fraudulent activity detected</p>
                </>
              )}
            </div>

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
            </div>

            <div className="space-y-3">
              <Button onClick={resetPayment} variant="hero" className="w-full">
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

  // Merchant List View with QR Codes
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

          {merchants.length === 0 ? (
            <Card className="backdrop-blur-sm bg-card/90 border-border/50">
              <CardContent className="text-center py-8">
                <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Merchants Available</h3>
                <p className="text-muted-foreground mb-4">
                  No merchants have registered yet. Create a merchant account or ask someone to register.
                </p>
                <Button onClick={() => navigate("/merchant-setup")} variant="hero">
                  Become a Merchant
                </Button>
              </CardContent>
            </Card>
          ) : (
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
                      <div className="bg-white p-4 rounded-lg">
                        <QRCodeGenerator 
                          value={qrData} 
                          size={180} 
                          className="mx-auto"
                        />
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Owner:</span>
                          <span className="text-white font-medium">{merchant.ownerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="text-white font-medium">{merchant.businessType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className="bg-success/20 text-success">
                            {merchant.verificationStatus}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-1">UPI ID:</span>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-background/50 px-2 py-1 rounded text-primary flex-1 break-all">
                              {merchant.upiNumber}
                            </code>
                            <Button
                              onClick={() => copyUpiId(merchant.upiNumber)}
                              variant="outline"
                              size="sm"
                              className="border-border/50 h-7 w-7 p-0 flex-shrink-0"
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
          )}
        </div>
      </div>
    );
  }

  // Main Payment Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-card/90 border-border/50">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-white">
            Make a Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-success/20 border-success/50">
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>Login successful!</AlertDescription>
          </Alert>

          {selectedMerchant && (
            <Card className="bg-primary/10 border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Store className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{selectedMerchant.businessName}</h3>
                    <p className="text-sm text-muted-foreground">{selectedMerchant.upiNumber}</p>
                  </div>
                  <Badge className="bg-success/20 text-success">Verified</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleShowMerchants}
            variant="outline"
            className="w-full border-dashed border-2 border-primary/50 text-primary h-16"
            disabled={isLoading}
          >
            <QrCode className="w-6 h-6 mr-2" />
            View Merchant QR Codes
          </Button>

          <div className="text-center text-muted-foreground">OR</div>

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
                className={`bg-background/50 text-white ${
                  merchantUPI && !isValidUpiId(merchantUPI)
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                disabled={isLoading}
              />
              {merchantUPI && !isValidUpiId(merchantUPI) && (
                <p className="text-xs text-destructive">Invalid UPI ID format</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Amount
              </label>
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