import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, ArrowLeft, Search, Filter, AlertTriangle, Shield, TrendingUp } from "lucide-react";
import { getTransactionAnalytics, type Transaction } from "@/lib/mockData";
import { storage, type StoredTransaction } from "@/lib/utils";
import { CATEGORY_MAPPINGS } from "@/lib/fraudDetection";

const ViewTransactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const persisted = storage.getTransactions();
    const view: Transaction[] = persisted.map(t => ({
      id: t.id,
      timestamp: t.timestamp,
      amount: t.amount,
      category: t.category || 'General',
      merchant: t.merchantName || (t.upiId.split('@')[0] || 'Merchant'),
      customerAge: t.customerAge || 25, // Use actual customer age or default
      state: t.customerLocation && t.customerLocation !== 'Unknown' ? t.customerLocation : 'Maharashtra', // Better fallback
      fraudRisk: t.fraudRisk,
      status: t.status,
      upiNumber: t.upiId
    }));
    setTransactions(view);
    setFilteredTransactions(view);
    setAnalytics(getTransactionAnalytics(view));
  }, []);

  const categories = Object.values(CATEGORY_MAPPINGS);

  useEffect(() => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(txn => 
        txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.upiNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(txn => txn.status.toLowerCase() === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(txn => txn.category === categoryFilter);
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, statusFilter, categoryFilter, transactions]);

  const getStatusBadge = (status: string, fraudRisk: number) => {
    if (status === "Success") {
      return <Badge className="bg-success/20 text-success">Success</Badge>;
    } else if (status === "Flagged") {
      return <Badge className="bg-warning/20 text-warning">Flagged</Badge>;
    } else if (status === "Blocked") {
      return <Badge className="bg-destructive/20 text-destructive">Blocked</Badge>;
    }
    return <Badge className="bg-muted/20 text-muted-foreground">Unknown</Badge>;
  };

  const getFraudIndicator = (fraudRisk: number) => {
    return fraudRisk === 1 ? (
      <AlertTriangle className="w-4 h-4 text-destructive" />
    ) : (
      <Shield className="w-4 h-4 text-success" />
    );
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-IN'),
      time: date.toLocaleTimeString('en-IN', { hour12: true })
    };
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate("/admin-dashboard")}
            variant="outline"
            size="icon"
            className="border-border/50 bg-background/50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground">Monitor all UPI transactions and fraud detection</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="backdrop-blur-sm bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-xl font-bold">{analytics?.total || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-sm bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Legitimate</p>
                    <p className="text-xl font-bold text-success">
                      {analytics?.legitimate || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-sm bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fraudulent</p>
                    <p className="text-xl font-bold text-destructive">
                      {analytics?.fraudulent || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-sm bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Volume</p>
                    <p className="text-xl font-bold">
                      {analytics?.totalVolume || "₹0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

        <Card className="backdrop-blur-sm bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Transaction Log
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by transaction ID, merchant, UPI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-background/50">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px] bg-background/50">
                  <SelectValue placeholder="Filter Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No transactions yet. New payments will appear here.</div>
            ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Fraud Risk</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => {
                    const dateTime = formatDateTime(transaction.timestamp);
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {transaction.id}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{dateTime.date}</p>
                            <p className="text-sm text-muted-foreground">{dateTime.time}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{formatAmount(transaction.amount)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {transaction.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.merchant}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-mono">{transaction.upiNumber}</p>
                            <p className="text-xs text-muted-foreground">Age: {transaction.customerAge}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{transaction.state}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFraudIndicator(transaction.fraudRisk)}
                            <span className="text-sm">
                              {transaction.fraudRisk === 1 ? "High" : "Low"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status, transaction.fraudRisk)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewTransactions;