import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { apiClient } from '@/lib/auth';
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  id: number;
  email: string;
  full_name?: string;
  role: string;
}

const UsersList = () => {
  const { isStaff } = useRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Users list state
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  
  // Delete user dialog state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Security check: redirect if not staff
  useEffect(() => {
    if (!isStaff) {
      // Redirect to settings home if not authorized
      navigate('/settings', { replace: true });
    }
  }, [isStaff, navigate]);
  
  // Fetch users on component mount
  useEffect(() => {
    if (isStaff) {
      fetchUsers();
    }
  }, [isStaff]);
  
  // Function to fetch users from the API
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setUsersError(null);
    
    try {
      const response = await apiClient.get('/auth/users', {
        params: {
          skip: 0,
          limit: 100
        }
      });
      
      // Filter to only show client users
      const clientUsers = response.data.users.filter((user: User) => user.role === 'client');
      setUsers(clientUsers);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to load users';
      setUsersError(errorMessage);
      toast({
        title: "Error loading users",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  // Function to delete a user
  const deleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    
    try {
      await apiClient.delete(`/auth/user/${userToDelete.id}`);
      
      // Update local state to remove the deleted user
      setUsers(users.filter(user => user.id !== userToDelete.id));
      
      toast({
        title: "User deleted",
        description: `User ${userToDelete.full_name || userToDelete.email} has been removed`,
      });
      
      // Close dialog
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete user';
      toast({
        title: "Error deleting user",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Open delete dialog for a user
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };
  
  // Form validation
  const validateForm = () => {
    // Clear previous error
    setError(null);
    
    // Check if all fields are filled
    if (!email || !name || !password || !verifyPassword) {
      setError('All fields are required');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Check password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    // Check if passwords match
    if (password !== verifyPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset status messages
    setError(null);
    setSuccess(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the API endpoint - always create with 'client' role
      await apiClient.post('/auth/signup', {
        email,
        full_name: name,
        password,
        role: 'client' // Hardcoded to only create client users
      });
      
      // Show success message
      setSuccess('User created successfully');
      toast({
        title: "User created",
        description: `New client user ${name} (${email}) has been created successfully`,
      });
      
      // Clear form
      setEmail('');
      setName('');
      setPassword('');
      setVerifyPassword('');
      
      // Refresh user list
      fetchUsers();
      
    } catch (err: any) {
      // Handle error
      const errorMessage = err.response?.data?.detail || 'Failed to create user';
      setError(errorMessage);
      toast({
        title: "User creation failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Extra protection - don't render anything if not staff
  if (!isStaff) {
    return <div className="text-center py-8">You don't have permission to view this page.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium mb-4">User Management</h2>
        
        {usersError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{usersError}</AlertDescription>
          </Alert>
        )}
        
        <div className="overflow-x-auto bg-gober-bg-100 dark:bg-gober-primary-700/30 rounded-lg border border-border/50">
          {isLoadingUsers ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gober-accent-500" />
              <span className="ml-2 text-gober-primary-800 dark:text-gray-300">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-gober-primary-800 dark:text-gray-300">
              <p>No client users found.</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-3 px-4 font-medium text-gober-primary-800 dark:text-gray-300">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gober-primary-800 dark:text-gray-300">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gober-primary-800 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className={`border-b border-border/30 hover:bg-white/50 dark:hover:bg-gober-primary-700/50 transition-colors ${
                      index === users.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="py-3 px-4 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gober-accent-500/20 text-gober-accent-500 flex items-center justify-center mr-3 font-medium">
                        {(user.full_name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <span>{user.full_name || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4 text-gober-primary-800 dark:text-gray-300">{user.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="h-8 text-xs"
                          onClick={() => handleDeleteClick(user)}
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <div className="space-y-4 max-w-md border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Add New Client User</h3>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="default" className="mb-4 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="verifyPassword">Verify Password *</Label>
            <Input 
              id="verifyPassword" 
              type="password" 
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
              placeholder="Re-enter password"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating User...' : 'Create Client User'}
          </Button>
        </form>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user {userToDelete?.full_name || userToDelete?.email}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersList;
