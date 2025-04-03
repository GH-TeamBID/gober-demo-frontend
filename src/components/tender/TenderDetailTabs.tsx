import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TenderDetailsCard from './TenderDetailsCard';
import AIDocument from '@/components/ui/AIDocument';
import { TenderDetail } from '@/services/tenderService';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

interface TenderDetailTabsProps {
  tender: TenderDetail;
  isTenderSaved: (id: string) => boolean;
  toggleSaveTender: (id: string) => void;
  handleSaveAIDocument: (document: string) => void;
  getStatusClass: (status: string) => string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Configuration constants
const MIN_LOADING_TIME_MS = 2000;

const TenderDetailTabs = ({
  tender,
  isTenderSaved,
  toggleSaveTender,
  handleSaveAIDocument,
  getStatusClass,
  activeTab,
  setActiveTab
}: TenderDetailTabsProps) => {
  const { t } = useTranslation('tenders');
  const { t: tCommon } = useTranslation('common');
  
  const [isDocumentLoading, setIsDocumentLoading] = useState(true);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  // Error message with translation
  const ERROR_MESSAGE = t('aiDocument.errorLoading', "Error loading AI document content. Please try again later.");

  // Helper to create a cancellable timeout
  const timeout = (ms: number) => {
    return new Promise<void>(resolve => {
      const id = setTimeout(() => resolve(), ms);
      return () => clearTimeout(id);
    });
  };

  useEffect(() => {
    console.log("Loading document for tender ID:", tender.id);
    let isMounted = true;
    
    const loadDocumentContent = async () => {
      if (!tender.id) return;
      
      try {
        setIsDocumentLoading(true);
        const startTime = Date.now();
        
        // Create a new abort controller for this request
        const controller = new AbortController();
        abortControllerRef.current = controller;
        
        // Fetch document content directly from API
        const response = await apiClient.get(`/tenders/ai_documents/${tender.id}`);
        
        if (isMounted) {
          if (!response.data) {
            throw new Error("Empty response from API");
          }
          
          setMarkdownContent(response.data);
          
          // Calculate elapsed time and ensure minimum loading time
          const elapsedTime = Date.now() - startTime;
          if (elapsedTime < MIN_LOADING_TIME_MS) {
            await timeout(MIN_LOADING_TIME_MS - elapsedTime);
          }
        }
      } catch (error) {
        console.error("Document fetching failed:", error);
        
        if (isMounted) {
          setMarkdownContent(ERROR_MESSAGE);
          await timeout(2000); // Still show error for a readable time
        }
      } finally {
        if (isMounted) {
          setIsDocumentLoading(false);
        }
      }
    };

    loadDocumentContent();

    // Cleanup function
    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [tender.id, ERROR_MESSAGE]);

  // If we're loading, switch to details tab
  useEffect(() => {
    if (isDocumentLoading && activeTab === 'document') {
      setActiveTab('details');
    }
  }, [isDocumentLoading, activeTab, setActiveTab]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">{t('tabs.details', "Tender Details")}</TabsTrigger>
          <TabsTrigger value="document" disabled={isDocumentLoading}>
            {t('tabs.aiDocument', "AI Document")} {isDocumentLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <TenderDetailsCard 
            tender={tender}
            isTenderSaved={isTenderSaved}
            toggleSaveTender={toggleSaveTender}
            getStatusClass={getStatusClass}
            documents={tender.procurement_documents}
          />
        </TabsContent>
        
        <TabsContent value="document">
          {isDocumentLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-gober-accent-500" />
              <span className="ml-2 text-gray-500">{t('aiDocument.loading', "Loading document...")}</span>
            </div>
          ) : (
            <AIDocument 
              aiDocument={markdownContent}
              onSave={handleSaveAIDocument}
              documentUrl={null}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TenderDetailTabs;
