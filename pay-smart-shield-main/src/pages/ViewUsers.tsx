import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; 
import { Input } from "@/components/ui/input";
import { Users, ArrowLeft, Search, UserCheck, AlertTriangle } from "lucide-react";
import { type User } from "@/lib/mockData";
import { storage, type StoredUser } from "@/lib/utils";

const ViewUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    storage.ensureAdminUser();
    const stored = storage.getUsers();
    
    // Filter out admin users - only show regular users
    const regularUsers = stored.filter(u => u.role !== 'admin');
    
    // Helper function to format bank account
    const formatBankAccount = (bank: string | undefined, userId: string) => {
      if (!bank || bank === 'Not provided') return '—';
      // Generate a realistic bank account number based on user ID
      const accountNumber = userId.slice(-4).padStart(4, '0');
      return `${bank}-****${accountNumber}`;
    };

    // Map stored to view model with actual user data
    const view: User[] = regularUsers.map((u, idx) => ({
      id: idx + 1,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      state: u.state || '—',
      age: u.age || 25, // Use actual age or default to 25
      bankAccount: formatBankAccount(u.bank, u.id), // Format bank account properly
      status: 'Active',
      riskScore: 0.1,
      joinDate: new Date().toISOString().split('T')[0]
    }));
    setUsers(view);
    setFilteredUsers(view);
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile.includes(searchTerm) ||
      user.state.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const getRiskBadge = (riskScore: number) => {
    if (riskScore < 0.3) {
      return <Badge className="bg-success/20 text-success">Low Risk</Badge>;
    } else if (riskScore < 0.6) {
      return <Badge className="bg-warning/20 text-warning">Medium Risk</Badge>;
    } else {
      return <Badge className="bg-destructive/20 text-destructive">High Risk</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "Active" 
      ? <Badge className="bg-success/20 text-success">Active</Badge>
      : <Badge className="bg-destructive/20 text-destructive">Suspended</Badge>;
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
            <h1 className="text-3xl font-bold">Registered Users</h1>
            <p className="text-muted-foreground">Manage and monitor user accounts</p>
          </div>
        </div>

        <Card className="backdrop-blur-sm bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              User Management
            </CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, mobile, or state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Total: {filteredUsers.length} users</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Details</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Bank Account</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">Age: {user.age}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.mobile}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user.state}</TableCell>
                      <TableCell>
                        {user.bankAccount === '—' ? (
                          <span className="text-muted-foreground text-sm">Not provided</span>
                        ) : (
                          <div>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {user.bankAccount}
                            </code>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRiskBadge(user.riskScore)}
                          <span className="text-sm text-muted-foreground">
                            {(user.riskScore * 100).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-border/50">
                            <UserCheck className="w-3 h-3" />
                          </Button>
                          {user.riskScore > 0.5 && (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewUsers;