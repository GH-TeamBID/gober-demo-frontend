import { Fragment, useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getTenderById, getTenderSavedState, TenderDetail as TenderDetailType, saveTender, unsaveTender, saveAIDocument } from '@/services/tenderService';
import { TenderStatus } from '@/types/tenderTypes';
import TenderDetailTabs from '@/components/tender/TenderDetailTabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';

// Function to get status class for styling purposes
const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    [TenderStatus.OPEN]: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    [TenderStatus.CLOSED]: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    [TenderStatus.PLANNED]: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    [TenderStatus.AWARDED]: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    [TenderStatus.CANCELED]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };
  
  return statusMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
};

// CPV codes structure used in the TenderDetail
interface CPVCode {
  code: string;
  description?: string;
}

const TenderDetail = () => {
  const { t } = useTranslation('tenders');
  const { t: tCommon } = useTranslation('common');
  const { t: tErrors } = useTranslation('errors');
  
  const { id } = useParams<{ id: string }>();
  const [tender, setTender] = useState<TenderDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('details');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load tender details
  useEffect(() => {
    const fetchTenderDetails = async () => {
      if (!id) {
        setError(tErrors('notFoundTender', 'Tender not found'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getTenderById(id);
        if (!data) {
          setError(tErrors('notFoundTender', 'Tender not found'));
          return;
        }
        
        console.log('Tender data:', data);
        setTender(data);
        
        // Check if tender is saved
        const savedState = await getTenderSavedState(id);
        setIsSaved(savedState);
        
      } catch (err) {
        console.error('Error fetching tender details:', err);
        setError(tErrors('unableToLoad', 'Unable to load tender details. Please try again later.'));
      } finally {
        setLoading(false);
      }
    };

    fetchTenderDetails();
  }, [id, tErrors]);

  // Function to check if tender is saved
  const isTenderSaved = useCallback((tenderId: string) => {
    return isSaved;
  }, [isSaved]);

  // Function to toggle save/unsave tender
  const toggleSaveTender = useCallback(async (tenderId: string) => {
    try {
      if (isSaved) {
        await unsaveTender(tenderId);
        toast({
          title: t('tenderDetail.unsaved', 'Tender Unsaved'),
          description: t('tenderDetail.unsavedMessage', 'This tender has been removed from your saved tenders.'),
        });
      } else {
        await saveTender(tenderId);
        toast({
          title: t('tenderDetail.saved', 'Tender Saved'),
          description: t('tenderDetail.savedMessage', 'This tender has been added to your saved tenders.'),
        });
      }
      setIsSaved(!isSaved);
    } catch (err) {
      console.error('Error toggling tender save state:', err);
      toast({
        title: t('tenderDetail.error', 'Error'),
        description: t('tenderDetail.errorTogglingSave', 'An error occurred while updating your saved tenders.'),
        variant: 'destructive',
      });
    }
  }, [isSaved, toast, t]);

  // Function to handle saving AI document
  const handleSaveAIDocument = async (document: string) => {
    if (!id) return;
    
    try {
      await saveAIDocument(id, document);
      toast({
        title: t('aiDocument.saved', 'Document Saved'),
        description: t('aiDocument.savedMessage', 'The AI document has been saved successfully.'),
      });
    } catch (err) {
      console.error('Error saving AI document:', err);
      toast({
        title: t('aiDocument.error', 'Save Error'),
        description: t('aiDocument.errorSaving', 'An error occurred while saving the AI document.'),
        variant: 'destructive',
      });
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gober-accent-500" />
        <span className="ml-2 text-gray-500">{t('tenderDetail.loading', 'Loading tender details...')}</span>
      </div>
    );
  }

  // Show error state
  if (error || !tender) {
    return (
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
                  onClick={() => navigate('/tenders')}
                >
                  {tCommon('return', 'Return to Tenders List')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check for CPV codes in various places to handle different API response formats
  const cpvCodes = tender.cpv_codes || 
                  (tender.purpose?.main_classifications ? 
                    tender.purpose.main_classifications.map((c: any) => ({ code: c.classification_id, description: c.classification_name })) : 
                    []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Link to="/tenders" className="flex items-center font-medium text-gray-600 hover:text-gober-accent-500 dark:text-gray-300 dark:hover:text-gober-accent-400 transition-colors mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('tenderDetail.backToTenders', 'Back to Tenders')}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{tender.title}</h1>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(tender.status || '')}`}>
            {t(`status.${(tender.status || '').toLowerCase()}`, tender.status || '')}
          </span>
          {cpvCodes.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              {t('tenderDetail.cpvCode', 'CPV')}: {cpvCodes[0].code}
            </span>
          )}
        </div>
      </div>

      <TenderDetailTabs 
        tender={tender}
        isTenderSaved={isTenderSaved}
        toggleSaveTender={toggleSaveTender}
        handleSaveAIDocument={handleSaveAIDocument}
        getStatusClass={getStatusClass}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default TenderDetail;