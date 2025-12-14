import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Shield, Zap, Play } from "lucide-react";
import { generateMockTransaction, calculateFraudRisk, CATEGORY_MAPPINGS } from "@/lib/fraudDetection";

const FraudDetectionDemo = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customAge, setCustomAge] = useState("");

  const runFraudDetection = () => {
    setIsRunning(true);
    
    setTimeout(() => {
      let transaction = generateMockTransaction();
      
      // Apply custom inputs if provided
      if (customAmount) {
        transaction.trans_amount = parseInt(customAmount);
      }
      if (customCategory) {
        transaction.category = parseInt(customCategory);
      }
      if (customAge) {
        transaction.age = parseInt(customAge);
      }

      const analysis = calculateFraudRisk(transaction);
      
      setCurrentTransaction(transaction);
      setRiskAnalysis(analysis);
      setIsRunning(false);
    }, 2000);
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return <Badge className="bg-success/20 text-success">Low Risk</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-warning/20 text-warning">Medium Risk</Badge>;
      case 'HIGH':
        return <Badge className="bg-destructive/20 text-destructive">High Risk</Badge>;
      default:
        return <Badge className="bg-muted/20 text-muted-foreground">Unknown</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <Card className="backdrop-blur-sm bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          AI Fraud Detection Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Custom Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (₹)</label>
            <Input
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={customCategory} onValueChange={setCustomCategory}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_MAPPINGS).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer Age</label>
            <Input
              placeholder="Enter age"
              value={customAge}
              onChange={(e) => setCustomAge(e.target.value)}
              className="bg-background/50"
            />
          </div>
        </div>

        {/* Detection Button */}
        <Button 
          onClick={runFraudDetection}
          disabled={isRunning}
          variant="hero"
          className="w-full"
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? "Analyzing Transaction..." : "Run Fraud Detection"}
        </Button>

        {/* Results */}
        {isRunning && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">AI analyzing transaction patterns...</p>
          </div>
        )}

        {riskAnalysis && currentTransaction && !isRunning && (
          <div className="space-y-4">
            {/* Transaction Details */}
            <div className="p-4 bg-background/30 rounded-lg">
              <h4 className="font-medium mb-3">Transaction Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Amount: </span>
                  <span className="font-medium">{formatAmount(currentTransaction.trans_amount)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Category: </span>
                  <span className="font-medium">
                    {CATEGORY_MAPPINGS[currentTransaction.category as keyof typeof CATEGORY_MAPPINGS]}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Time: </span>
                  <span className="font-medium">{currentTransaction.trans_hour}:00</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Customer Age: </span>
                  <span className="font-medium">{currentTransaction.age} years</span>
                </div>
              </div>
            </div>

            {/* Risk Analysis */}
            <div className="p-4 bg-background/30 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Risk Analysis</h4>
                <div className="flex items-center gap-2">
                  {riskAnalysis.isFraud ? (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  ) : (
                    <Shield className="w-5 h-5 text-success" />
                  )}
                  {getRiskBadge(riskAnalysis.riskLevel)}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Risk Score</span>
                    <span className="text-sm font-bold">
                      {(riskAnalysis.riskScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        riskAnalysis.riskScore < 0.3 ? 'bg-success' :
                        riskAnalysis.riskScore < 0.7 ? 'bg-warning' : 'bg-destructive'
                      }`}
                      style={{ width: `${riskAnalysis.riskScore * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium">Decision: </span>
                  <span className={`font-bold ${
                    riskAnalysis.isFraud ? 'text-destructive' : 'text-success'
                  }`}>
                    {riskAnalysis.isFraud ? 'BLOCK TRANSACTION' : 'APPROVE TRANSACTION'}
                  </span>
                </div>

                {riskAnalysis.riskFactors.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Risk Factors Detected:</h5>
                    <ul className="space-y-1">
                      {riskAnalysis.riskFactors.map((factor: string, index: number) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-1 bg-warning rounded-full" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FraudDetectionDemo;