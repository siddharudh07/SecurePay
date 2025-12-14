import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/utils";


const MerchantSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    mobile: "",
    businessType: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    panNumber: "",
    gstNumber: ""
  });


  const businessTypes = [
    "Entertainment", "Food Dining", "Gas Transport", "Grocery Net", "Grocery POS",
    "Health Fitness", "Home", "Kids Pets", "Misc Net", "Misc POS", "Personal Care",
    "Shopping Net", "Shopping POS", "Travel"
  ];

  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];



  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSetupMerchant = () => {
    const requiredFields = ['businessName', 'ownerName', 'email', 'mobile', 'businessType', 'address', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Create persistent merchant entry with unique UPI ID
    const timestamp = Date.now();
    const uniqueId = `${formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}${timestamp.toString().slice(-4)}`;
    const upiId = `${uniqueId}@paytm`;
    
    storage.addMerchant({
      id: `mrc_${timestamp}`,
      businessName: formData.businessName,
      ownerName: formData.ownerName,
      email: formData.email,
      mobile: formData.mobile,
      businessType: formData.businessType,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      upiId
    });
    localStorage.setItem('merchantData', JSON.stringify({ ...formData, upiId }));
    // Elevate current user to merchant role if logged in
    const current = storage.getCurrentUser();
    if (current && current.role === 'user') {
      storage.setCurrentUser({ ...current, role: 'merchant' });
    }
    toast({
      title: "Merchant Account Created!",
      description: `Merchant account for ${formData.businessName} created successfully`,
    });

    setTimeout(() => {
      navigate("/merchant-profile");
    }, 2000);
  };



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
            <h1 className="text-3xl font-bold">Setup Your Merchant Account</h1>
            <p className="text-muted-foreground">Complete your business profile to start accepting payments</p>
          </div>
        </div>



        <Card className="backdrop-blur-sm bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Merchant Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Name</label>
                <Input
                  placeholder="Enter business name"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Owner Name</label>
                <Input
                  placeholder="Enter owner name"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile Number</label>
                <Input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Type</label>
                <Select onValueChange={(value) => handleInputChange('businessType', value)} value={formData.businessType}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Select onValueChange={(value) => handleInputChange('state', value)} value={formData.state}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ZIP Code</label>
                <Input
                  placeholder="Enter ZIP code"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">PAN Number</label>
                <Input
                  placeholder="Enter PAN number (optional)"
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">GST Number</label>
                <Input
                  placeholder="Enter GST number (optional)"
                  value={formData.gstNumber}
                  onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Business Address</label>
              <Input
                placeholder="Enter complete business address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="bg-background/50"
              />
            </div>

            <Button
              onClick={handleSetupMerchant}
              variant="hero"
              className="w-full mt-8"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Setup Merchant Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MerchantSetup;