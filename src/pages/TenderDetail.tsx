import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenders } from '@/contexts/TendersContext';
import Layout from '@/components/layout/Layout';
import TenderHeader from '@/components/tender/TenderHeader';
import TenderDetailTabs from '@/components/tender/TenderDetailTabs';
import TenderDetailSkeleton from '@/components/tender/TenderDetailSkeleton';
import { getStatusClass } from '@/utils/tenderUtils';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';


const TenderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    fetchTenderDetail,
    currentTenderDetail,
    loadingTenderDetail,
    tenderDetailError,
    toggleSaveTender,
    isTenderSaved,
    updateTenderAIDocument,
    clearTenderDetail
  } = useTenders();
  
  const [activeTab, setActiveTab] = useState('details');
  
  // Handle saving AI document with UI-specific logic
  const handleSaveAIDocument = useCallback((document: string) => {
    if (!id) return;
    
    // Call the context method but handle UI-specific behavior here
    updateTenderAIDocument(id, document).catch(error => {
      // This is UI-specific error handling beyond what the context does
      console.error('Failed to save AI document in component:', error);
    });
  }, [id, updateTenderAIDocument]);
  
  useEffect(() => {
    const loadTenderDetails = async () => {
      if (!id) {
        return;
      }
      
      // Clear any previous tender detail
      clearTenderDetail();
      
      // Fetch the tender details from the API
      await fetchTenderDetail(id);
    };
    
    loadTenderDetails();
    
    // Clean up when component unmounts
    return () => {
      clearTenderDetail();
    };
  }, [id, fetchTenderDetail, clearTenderDetail]);
  
  // Render loading state
  if (loadingTenderDetail) {
    return <TenderDetailSkeleton />;
  }
  
  // Render error state
  if (tenderDetailError) {
    return (
      <Layout>
        <div className="page-container">
          <TenderHeader title="Tender Details" />
          
          <div className="max-w-3xl mx-auto mt-8">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{tenderDetailError}</AlertDescription>
            </Alert>
            
            <div className="text-center py-8">
              <p className="mb-6">Unable to load tender details.</p>
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to tenders
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Render empty state
  if (!currentTenderDetail) {
    return (
      <Layout>
        <div className="page-container">
          <TenderHeader title="Tender Details" />
          
          <div className="text-center py-12">
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg max-w-xl mx-auto">
              <h2 className="text-xl font-medium mb-4">Tender Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The tender you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/')}>Return to Tenders List</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Log AI content availability with improved validation
  const hasAiSummary = !!(currentTenderDetail.aiSummary && currentTenderDetail.aiSummary.trim() !== '');
  const hasAiDocument = !!(currentTenderDetail.aiDocument && currentTenderDetail.aiDocument.trim() !== '');
  
  // Extended logging for debugging
  if (hasAiSummary) {
    console.log(`AI summary available for tender ${id} (${currentTenderDetail.aiSummary!.length} chars)`);
  } else {
    console.log(`No AI summary available for tender ${id}`);
  }
  
  if (hasAiDocument) {
    console.log(`AI document URL available: ${currentTenderDetail.aiDocument}`);
  } else {
    console.log(`No AI document available for tender ${id}`);
  }
  
  // Log overall AI content availability
  if (hasAiSummary && hasAiDocument) {
    console.log(`Tender ${id} has both AI summary and document available`);
  } else if (hasAiSummary) {
    console.log(`Tender ${id} has only AI summary available`);
  } else if (hasAiDocument) {
    console.log(`Tender ${id} has only AI document available`);
  } else {
    console.log(`Tender ${id} has no AI content available`);
  }
  
  // Render tender details
  return (
    <Layout>
      <div className="page-container">
        <TenderHeader title="Tender Details" />
        
        <TenderDetailTabs
          tender={currentTenderDetail}
          isTenderSaved={isTenderSaved}
          toggleSaveTender={toggleSaveTender}
          handleSaveAIDocument={handleSaveAIDocument}
          getStatusClass={getStatusClass}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </Layout>
  );
};

export default TenderDetail;