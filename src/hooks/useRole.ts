import { useAuth } from '@/lib/auth';

export function useRole() {
  const { user } = useAuth();
  
  return {
    // Only two roles exist in the system
    isAccountManager: user?.role === 'account_manager',
    isClient: user?.role === 'client' || !user?.role,
    
    // For Settings page and similar admin features
    // Note: isStaff is equivalent to isAccountManager in this system
    isStaff: user?.role === 'account_manager',
    
    // Get the raw role string (defaulting to client)
    role: user?.role || 'client'
  };
} 