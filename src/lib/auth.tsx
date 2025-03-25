import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define user type based on what we expect from backend
interface User {
  email: string;
  name?: string;
  role?: string; // 'account_manager', 'admin', or 'client'
  id?: number;   // Add user ID field
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// Create the API client
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fetch user details including role and id
  const fetchUserDetails = async (): Promise<{ role?: string; id?: number } | null> => {
    try {
      // First get the role
      const roleResponse = await apiClient.get('/auth/role');
      const role = roleResponse.data.role;
      
      // Then get the user ID
      const userResponse = await apiClient.get('/auth/me');
      const id = userResponse.data.id;
      
      return { role, id };
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };
  
  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Validate token and get user info
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);
  
  // Validate token and fetch user data
  const validateToken = async (token: string) => {
    try {
      // Extract basic user info from token
      const payload = parseJwt(token);
      if (payload && payload.sub) {
        // Set basic user info from token
        setUser({ 
          email: payload.sub,
          // If the ID is in the token, use it (common for JWT)
          ...(payload.user_id && { id: payload.user_id }) 
        });
        setIsAuthenticated(true);
        
        // Fetch additional user details
        const details = await fetchUserDetails();
        if (details) {
          setUser(prev => ({ 
            ...prev!, 
            ...(details.role && { role: details.role }),
            ...(details.id && { id: details.id })
          }));
        }
      } else {
        // Invalid token
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error validating token:', error);
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to parse JWT token
  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  // Real API call for login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      
      // Store token and set auth state
      const { access_token } = response.data;
      localStorage.setItem('auth_token', access_token);
      
      // Extract user info from token
      const payload = parseJwt(access_token);
      if (payload && payload.sub) {
        // Set basic user info
        setUser({ 
          email: payload.sub,
          // If the ID is in the token, use it (common for JWT)
          ...(payload.user_id && { id: payload.user_id })
        });
        setIsAuthenticated(true);
        
        // Fetch additional user details
        const details = await fetchUserDetails();
        if (details) {
          setUser(prev => ({ 
            ...prev!, 
            ...(details.role && { role: details.role }),
            ...(details.id && { id: details.id })
          }));
        }
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export the API client for use in other parts of the app
export { apiClient }; 