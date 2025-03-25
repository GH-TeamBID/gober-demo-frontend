import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type LocationState = {
  from?: { pathname: string };
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from location state or default to '/'
  const fromLocation = (location.state as LocationState)?.from;
  const from = fromLocation?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    if (!email.trim()) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }
    
    if (!password.trim()) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        // Navigate to the intended destination
        navigate(from, { replace: true });
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gober-bg-100 dark:bg-gober-primary-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gober-primary-900 dark:text-white">GoberAI.</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to access your account</p>
        </div>
        
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the tender management platform
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm text-gober-accent-500 hover:text-gober-accent-600">
                    Forgot password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full bg-gober-accent-500 hover:bg-gober-accent-600"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                Don't have an account?{' '}
                <a href="#" className="text-gober-accent-500 hover:text-gober-accent-600">
                  Contact your administrator
                </a>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
