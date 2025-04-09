import { Fragment, useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getTenderById, saveAIDocument } from '@/services/tenderService';
import { TenderStatus } from '@/types/tenderTypes';
import TenderDetailTabs from '@/components/tender/TenderDetailTabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/layout/Layout';
import { TendersProvider, useTenders } from '@/contexts/TendersContext';
import TenderStatusBadge from '@/components/ui/TenderStatusBadge';
import { mapTenderStatus } from '@/utils/tenderStatusMapper';

// Function to get status class for styling purposes
const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    [TenderStatus.OPEN]: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    [TenderStatus.CLOSED]: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    [TenderStatus.PLANNED]: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    [TenderStatus.AWARDED]: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    [TenderStatus.CANCELLED]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };
  
  return statusMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
};

const TenderDetailContent = () => {
  const { t } = useTranslation('tenders');
  const { t: tCommon } = useTranslation('common');
  const { t: tErrors } = useTranslation('errors');
  
  const { id } = useParams<{ id: string }>();
  const [tender, setTender] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Use the context instead of local state
  const { 
    isTenderSaved, 
    toggleSaveTender,
    updateTenderAIDocument
  } = useTenders();

  // --- Function to fetch tender details ---
  const fetchTenderDetails = useCallback(async () => {
    if (!id) {
      setError(tErrors('notFoundTender', 'Tender not found'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const data = await getTenderById(id);
      if (!data) {
        setError(tErrors('notFoundTender', 'Tender not found'));
        setTender(null); // Clear tender data on not found
        return;
      }
      
      console.log('[TenderDetailContent] Fetched tender data:', data);
      setTender(data);
    } catch (err) {
      console.error('[TenderDetailContent] Error fetching tender details:', err);
      setError(tErrors('unableToLoad', 'Unable to load tender details. Please try again later.'));
      setTender(null); // Clear tender data on error
    } finally {
      setLoading(false);
    }
  }, [id, tErrors]);

  // --- Load tender details on initial mount or ID change ---
  useEffect(() => {
    console.log('[TenderDetailContent] Initial fetch triggered.');
    fetchTenderDetails();
  }, [fetchTenderDetails]); // Depend on the memoized fetch function

  // Callback to update summary in tender state
  const handleSummaryUpdate = useCallback((newSummary: string | null) => {
    setTender((prevTender: any) => {
      console.log("[TenderDetailContent] setTender callback triggered.");
      if (!prevTender) {
        console.log("[TenderDetailContent] No previous tender state.");
        return null;
      }
      if (newSummary !== null && prevTender.summary !== newSummary) {
        console.log("[TenderDetailContent] Summary changed. Updating state.");
        const updatedTender = { ...prevTender, summary: newSummary };
        console.log("[TenderDetailContent] New tender state object:", updatedTender);
        return updatedTender;
      } else {
        console.log("[TenderDetailContent] Summary unchanged or newSummary is null. Not updating state.");
      }
      return prevTender;
    });
  }, []);

  // --- Callback to trigger data refresh --- 
  const handleTaskComplete = useCallback(() => {
    console.log('[TenderDetailContent] AI task completed. Triggering data refresh.');
    fetchTenderDetails(); // Re-fetch all tender data
  }, [fetchTenderDetails]);

  // Function to handle saving AI document using the context
  const handleSaveAIDocument = async (document: string) => {
    if (!id) return;
    
    try {
      // Use the context function instead of direct API call
      const success = await updateTenderAIDocument(id, document);
      
      if (success) {
        toast({
          title: t('aiDocument.saved', 'Document Saved'),
          description: t('aiDocument.savedMessage', 'The AI document has been saved successfully.'),
        });
      } else {
        throw new Error("Failed to save AI document");
      }
    } catch (err) {
      console.error('Error saving AI document:', err);
      toast({
        title: t('aiDocument.error', 'Save Error'),
        description: t('aiDocument.errorSaving', 'An error occurred while saving the AI document.'),
        variant: 'destructive',
      });
    }
  };

  // Store the translated return text to avoid type issues
  const returnToListText = tCommon('returnToList', 'Return to Tenders List');

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-gober-accent-500" />
          <span className="ml-2 text-gray-500">{t('tenderDetail.loading', 'Loading tender details...')}</span>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error || !tender) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                {/* Error icon could go here */}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{t('tenderDetail.errorTitle', 'Error')}</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || tErrors('notFoundTender', 'Tender not found')}</p>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                  >
                    Return to Tenders List
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Link to="/" className="flex items-center font-medium text-gray-600 hover:text-gober-accent-500 dark:text-gray-300 dark:hover:text-gober-accent-400 transition-colors mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('tenderDetail.backToTenders', 'Back to Tenders')}
          </Link>
        </div>

        <TenderDetailTabs 
          tender={tender}
          isTenderSaved={isTenderSaved}
          toggleSaveTender={toggleSaveTender}
          handleSaveAIDocument={handleSaveAIDocument}
          getStatusClass={getStatusClass}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSummaryUpdate={handleSummaryUpdate}
        />
      </div>
    </Layout>
  );
};

// Wrap the component with TendersProvider
const TenderDetail = () => {
  return (
    <TendersProvider>
      <TenderDetailContent />
    </TendersProvider>
  );
};

export default TenderDetail;