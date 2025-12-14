import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Store, ArrowLeft, Search, Shield, AlertTriangle, QrCode } from "lucide-react";
import { type Merchant } from "@/lib/mockData";
import { storage, type StoredMerchant } from "@/lib/utils";

const ViewMerchants = () => {
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);

  useEffect(() => {
    const stored = storage.getMerchants();
    const transactions = storage.getTransactions();
    
    // Calculate performance metrics for each merchant
    const view: Merchant[] = stored.map((m, idx) => {
      // Find transactions for this merchant
      const merchantTransactions = transactions.filter(txn => 
        txn.upiId === m.upiId || 
        (txn.merchantName && txn.merchantName.toLowerCase() === m.businessName.toLowerCase())
      );
      
      // Calculate total volume
      const totalVolume = merchantTransactions.reduce((sum, txn) => sum + txn.amount, 0);
      
      // Calculate fraud score based on actual transactions
      const fraudulentTransactions = merchantTransactions.filter(txn => txn.fraudRisk === 1);
      const fraudScore = merchantTransactions.length > 0 
        ? fraudulentTransactions.length / merchantTransactions.length 
        : 0.1;
      
      // Determine verification status based on fraud score
      let verificationStatus: 'Verified' | 'Pending' | 'Flagged';
      if (fraudScore < 0.2) {
        verificationStatus = 'Verified';
      } else if (fraudScore < 0.5) {
        verificationStatus = 'Pending';
      } else {
        verificationStatus = 'Flagged';
      }
      
      return {
        id: idx + 1,
        businessName: m.businessName,
        ownerName: m.ownerName,
        businessType: m.businessType,
        mobile: m.mobile,
        email: m.email,
        state: m.state,
        verificationStatus,
        fraudScore,
        totalTransactions: merchantTransactions.length,
        monthlyVolume: `₹${totalVolume.toLocaleString()}`,
        joinDate: new Date().toISOString().split('T')[0],
        upiNumber: m.upiId
      };
    });
    
    setMerchants(view);
    setFilteredMerchants(view);
  }, []);

  useEffect(() => {
    const filtered = merchants.filter(merchant => 
      merchant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.businessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.mobile.includes(searchTerm) ||
      merchant.state.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMerchants(filtered);
  }, [searchTerm, merchants]);

  const getFraudScoreBadge = (fraudScore: number) => {
    if (fraudScore < 0.3) {
      return <Badge className="bg-success/20 text-success">Low Risk</Badge>;
    } else if (fraudScore < 0.6) {
      return <Badge className="bg-warning/20 text-warning">Medium Risk</Badge>;
    } else {
      return <Badge className="bg-destructive/20 text-destructive">High Risk</Badge>;
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return <Badge className="bg-success/20 text-success">Verified</Badge>;
      case "Pending":
        return <Badge className="bg-warning/20 text-warning">Pending</Badge>;
      case "Flagged":
        return <Badge className="bg-destructive/20 text-destructive">Flagged</Badge>;
      default:
        return <Badge className="bg-muted/20 text-muted-foreground">Unknown</Badge>;
    }
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
            <h1 className="text-3xl font-bold">Registered Merchants</h1>
            <p className="text-muted-foreground">Monitor and manage merchant accounts</p>
          </div>
        </div>

        <Card className="backdrop-blur-sm bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Merchant Management
            </CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search merchants by business name, owner, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Total: {filteredMerchants.length} merchants</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredMerchants.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No registered merchants found.</div>
            ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Details</TableHead>
                    <TableHead>Owner & Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Fraud Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMerchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{merchant.businessName}</p>
                          <p className="text-sm text-muted-foreground">{merchant.businessType}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{merchant.ownerName}</p>
                          <p className="text-sm text-muted-foreground">{merchant.mobile}</p>
                        </div>
                      </TableCell>
                      <TableCell>{merchant.state}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{merchant.monthlyVolume}</p>
                          <p className="text-sm text-muted-foreground">{merchant.totalTransactions} transactions</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFraudScoreBadge(merchant.fraudScore)}
                          <span className="text-sm text-muted-foreground">
                            {(merchant.fraudScore * 100).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getVerificationBadge(merchant.verificationStatus)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-border/50">
                            <QrCode className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-border/50">
                            <Shield className="w-3 h-3" />
                          </Button>
                          {merchant.fraudScore > 0.5 && (
                            <Button variant="outline" size="sm" className="border-destructive/50 text-destructive">
                              <AlertTriangle className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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

export default ViewMerchants;