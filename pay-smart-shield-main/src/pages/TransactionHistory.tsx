import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { storage, type StoredTransaction } from "@/lib/utils";

const TransactionHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load only persisted, real user transactions
    try {
      const txns = storage.getTransactions();
      setTransactions(txns);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'Flagged':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'Blocked':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return <Badge className="bg-success/20 text-success">Success</Badge>;
      case 'Flagged':
        return <Badge className="bg-warning/20 text-warning">Flagged</Badge>;
      case 'Blocked':
        return <Badge className="bg-destructive/20 text-destructive">Blocked</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getRiskBadge = (fraudRisk: number) => {
    if (fraudRisk === 1) {
      return <Badge className="bg-destructive/20 text-destructive">High Risk</Badge>;
    } else if (fraudRisk > 0.5) {
      return <Badge className="bg-warning/20 text-warning">Medium Risk</Badge>;
    } else {
      return <Badge className="bg-success/20 text-success">Low Risk</Badge>;
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    // Color code categories based on risk level
    const highRiskCategories = ['Entertainment', 'Shopping Net', 'Shopping POS', 'Travel'];
    const mediumRiskCategories = ['Misc Net', 'Misc POS'];
    
    if (highRiskCategories.includes(category)) {
      return 'border-destructive/50 text-destructive bg-destructive/10';
    } else if (mediumRiskCategories.includes(category)) {
      return 'border-warning/50 text-warning bg-warning/10';
    } else {
      return 'border-success/50 text-success bg-success/10';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => navigate("/user-dashboard")}
              variant="outline"
              size="icon"
              className="border-border/50 bg-background/50"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Transaction History</h1>
              <p className="text-muted-foreground">Review all your past transactions and security checks</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading transaction history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate("/user-dashboard")}
            variant="outline"
            size="icon"
            className="border-border/50 bg-background/50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground">Review all your past transactions and security checks</p>
          </div>
        </div>

        <Card className="backdrop-blur-sm bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Merchant UPI</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No transactions yet. Make a payment to see your history here.
                      </TableCell>
                    </TableRow>
                  )}
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          <code className="text-sm">{transaction.id}</code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {transaction.upiId}
                        </code>
                      </TableCell>
                      <TableCell>
                        {transaction.category ? (
                          <Badge 
                            variant="outline" 
                            className={getCategoryBadgeColor(transaction.category)}
                          >
                            {transaction.category}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono">
                        ₹{transaction.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>{getRiskBadge(transaction.fraudRisk)}</TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p>{new Date(transaction.timestamp).toLocaleDateString()}</p>
                          <p className="text-muted-foreground">
                            {new Date(transaction.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionHistory;