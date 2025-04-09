import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import TenderList from '@/components/ui/TenderList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useTenders } from '@/contexts/TendersContext';
import { useTranslation } from 'react-i18next';

const SavedTendersContent = () => {
  const { t } = useTranslation('ui');
  const { t: tCommon } = useTranslation('common');
  
  // Use global state from TendersProvider
  const {
    tenders,
    isLoading,
    error,
    refreshTenders,
    savedTenderIds
  } = useTenders();
  
  // State for manual refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTenders();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <Layout>
      <div className="page-container">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gober-primary-900 dark:text-white">
              {t('savedTenders.title')}
            </h1>
          </div>
          
          {/* Refresh button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="mt-2 bg-white text-red-600 hover:bg-red-50"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Loading State */}
        {isLoading && tenders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gober-primary-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{t('tenderList.loadingTenders')}</p>
          </div>
        ) : !isLoading && tenders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-lg font-medium mb-4">{t('tenderList.noSavedTenders')}</div>
            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {tCommon('returnToList')}
              </Button>
            </Link>
          </div>
        ) : (
          <TenderList />
        )}
      </div>
    </Layout>
  );
};

// Wrap the component with TendersProvider, passing initialParams
import { TendersProvider } from '@/contexts/TendersContext';

const SavedTenders = () => {
  return (
    <TendersProvider initialParams={{ is_saved: true }}>
      <SavedTendersContent />
    </TendersProvider>
  );
};

export default SavedTenders;
