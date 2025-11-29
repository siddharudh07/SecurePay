import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, User } from "lucide-react";
import { storage } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const UserProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);

  useEffect(() => {
    // Load current user's profile data from storage
    const loadUserProfile = () => {
      try {
        const currentUser = storage.getCurrentUser();
        
        if (!currentUser) {
          // If no user is logged in, redirect to login
          navigate("/login");
          return;
        }
        
        // Use the actual logged-in user's data
        const profileData = {
          fullName: currentUser.name,
          mobileNumber: currentUser.mobile,
          email: currentUser.email,
          dateOfBirth: "Not provided", // This info isn't collected during login
          location: currentUser.state || "Not provided",
          state: currentUser.state || "Not provided",
          zipCode: "Not provided", // This info isn't collected during login
          accountCreated: new Date().toISOString().split('T')[0], // Use current date as fallback
          userId: currentUser.id,
          role: currentUser.role
        };
        
        setUserProfile(profileData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading user profile:", error);
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleEdit = () => {
    setEditedProfile({ ...userProfile });
    setIsEditing(true);
  };

  const handleSave = () => {
    try {
      const currentUser = storage.getCurrentUser();
      if (currentUser) {
        // Update user in storage
        const updatedUser = {
          ...currentUser,
          name: editedProfile.fullName,
          mobile: editedProfile.mobileNumber,
          state: editedProfile.state
        };
        
        storage.setCurrentUser(updatedUser);
        
        // Update all users list
        const allUsers = storage.getUsers();
        const updatedUsers = allUsers.map(user => 
          user.id === currentUser.id ? updatedUser : user
        );
        storage.saveUsers(updatedUsers);
        
        setUserProfile(editedProfile);
        setIsEditing(false);
        
        toast({
          title: "Profile Updated!",
          description: "Your profile has been successfully updated.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditedProfile(null);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">Error loading profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl backdrop-blur-sm bg-card/90 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl text-white">Your Profile</CardTitle>
                <p className="text-muted-foreground">Manage your account information</p>
              </div>
            </div>
            <Badge variant="outline" className="capitalize">
              {userProfile.role}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Full Name */}
            <div className="flex justify-between items-center py-3 border-b border-border/30">
              <span className="text-muted-foreground">Full Name:</span>
              {isEditing ? (
                <Input
                  value={editedProfile.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-48 bg-background/50 text-white"
                />
              ) : (
                <span className="font-medium text-white">{userProfile.fullName}</span>
              )}
            </div>
            
            {/* Mobile Number */}
            <div className="flex justify-between items-center py-3 border-b border-border/30">
              <span className="text-muted-foreground">Mobile Number:</span>
              {isEditing ? (
                <Input
                  value={editedProfile.mobileNumber}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                  className="w-48 bg-background/50 text-white"
                />
              ) : (
                <span className="font-medium text-white">{userProfile.mobileNumber}</span>
              )}
            </div>
            
            {/* Email (Read-only) */}
            <div className="flex justify-between items-center py-3 border-b border-border/30">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium text-white">{userProfile.email}</span>
            </div>
            
            {/* State */}
            <div className="flex justify-between items-center py-3 border-b border-border/30">
              <span className="text-muted-foreground">State:</span>
              {isEditing ? (
                <Input
                  value={editedProfile.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-48 bg-background/50 text-white"
                  placeholder="Enter your state"
                />
              ) : (
                <span className="font-medium text-white">{userProfile.state}</span>
              )}
            </div>
            
            {/* User ID (Read-only) */}
            <div className="flex justify-between items-center py-3 border-b border-border/30">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-medium text-white font-mono text-sm">{userProfile.userId}</span>
            </div>
            
            {/* Account Type (Read-only) */}
            <div className="flex justify-between items-center py-3 border-b border-border/30">
              <span className="text-muted-foreground">Account Type:</span>
              <Badge variant="outline" className="capitalize">
                {userProfile.role}
              </Badge>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            {isEditing ? (
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  variant="hero"
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 border-border/50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleEdit}
                variant="outline"
                className="w-full border-border/50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
            
            <Button
              onClick={() => navigate("/user-dashboard")}
              variant="secondary"
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;