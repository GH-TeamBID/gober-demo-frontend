import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from 'react-i18next';

const PasswordSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation('settings');

  // Form validation
  const validateForm = () => {
    // Clear previous messages
    setError(null);
    
    // Check if all fields are filled
    if (!currentPassword) {
      setError(t('components.passwordSettings.errors.currentPasswordRequired'));
      return false;
    }
    
    if (!newPassword) {
      setError(t('components.passwordSettings.errors.newPasswordRequired'));
      return false;
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError(t('components.passwordSettings.errors.passwordsMustMatch'));
      return false;
    }
    
    // Check password minimum length
    if (newPassword.length < 8) {
      setError(t('components.passwordSettings.errors.passwordTooWeak'));
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
      // Call the API endpoint
      await apiClient.post('/auth/update-password', {
        old_password: currentPassword,
        new_password: newPassword
      });
      
      // Show success message
      setSuccess(t('components.passwordSettings.success'));
      toast({
        title: t('components.passwordSettings.success'),
        description: t('components.passwordSettings.success'),
      });
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err: any) {
      // Handle error
      let errorMessage = t('components.passwordSettings.errors.generalError');
      
      if (err.response?.status === 401) {
        errorMessage = t('components.passwordSettings.errors.currentPasswordIncorrect');
      }
      
      setError(errorMessage);
      toast({
        title: t('components.passwordSettings.errors.generalError'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <h2 className="text-xl font-medium mb-4">{t('components.passwordSettings.title')}</h2>
      
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
          <Label htmlFor="current">{t('components.passwordSettings.currentPassword')}</Label>
          <Input 
            id="current" 
            type="password" 
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new">{t('components.passwordSettings.newPassword')}</Label>
          <Input 
            id="new" 
            type="password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <p className="text-xs text-gray-500">{t('components.passwordSettings.requirements')}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">{t('components.passwordSettings.confirmPassword')}</Label>
          <Input 
            id="confirm" 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? t('buttons.save', { ns: 'common' }) + '...' : t('components.passwordSettings.submitButton')}
        </Button>
      </form>
    </div>
  );
};

export default PasswordSettings;
