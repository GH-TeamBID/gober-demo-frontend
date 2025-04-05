import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TenderDetailsCard from './TenderDetailsCard';
import AIDocument from '@/components/ui/AIDocument';
import { TenderDetail } from '@/services/tenderService';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

// Add type for the metadata response
interface AIDocumentMetadata {
  url_document: string | null;
  summary?: string; // Assuming summary might also be present
}

interface TenderDetailTabsProps {
  tender: TenderDetail;
  isTenderSaved: (id: string) => boolean;
  toggleSaveTender: (id: string) => void;
  handleSaveAIDocument: (document: string) => void;
  getStatusClass: (status: string) => string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSummaryUpdate: (summary: string | null) => void;
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
  setActiveTab,
  onSummaryUpdate
}: TenderDetailTabsProps) => {
  const { t } = useTranslation('tenders');
  const { t: tCommon } = useTranslation('common');
  
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);
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
    if (!tender || !tender.id) {
      console.log("[TenderDetailTabs] Skipping effect run: tender or tender.id is missing.");
      return;
    }

    console.log("[TenderDetailTabs] useEffect running with tender ID:", tender.id);
    let isMounted = true;
    abortControllerRef.current = new AbortController();
    const controller = abortControllerRef.current;

    const loadDocumentContent = async () => {
      try {
        console.log(`[TenderDetailTabs] Attempting to fetch AI document metadata for tender ID: ${tender.id}`);
        setIsDocumentLoading(true);
        const startTime = Date.now();

        // Step 1: Fetch document metadata (URL and potentially summary)
        const metadataResponse = await apiClient.get<AIDocumentMetadata>(
          `/tenders/ai_documents/${tender.id}`,
          { signal: controller.signal }
        );

        if (!isMounted) return;

        const documentUrl = metadataResponse.data?.url_document;

        // Also get the summary
        const summary = metadataResponse.data?.summary;
        if (isMounted && summary) {
          console.log("[TenderDetailTabs] Calling onSummaryUpdate with:", summary);
          onSummaryUpdate(summary);
        }

        if (documentUrl) {
          console.log("Found document URL:", documentUrl);
          // Step 2: Fetch the actual document content from the URL
          const contentResponse = await fetch(documentUrl, { signal: controller.signal });

          if (!isMounted) return;

          if (!contentResponse.ok) {
            throw new Error(`Failed to fetch document content: ${contentResponse.statusText}`);
          }

          const markdownText = await contentResponse.text();
          if (isMounted) {
            setMarkdownContent(markdownText);
            console.log("Successfully loaded markdown content.");
          }
        } else {
          if (isMounted) {
            // Handle case where URL is not available
            console.log("AI document URL not found in metadata.");
            setMarkdownContent(t('aiDocument.notFound', "AI document not available for this tender."));
          }
        }

        // Calculate elapsed time and ensure minimum loading time
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < MIN_LOADING_TIME_MS) {
          // Use a separate timeout mechanism that doesn't rely on the abort controller
          await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME_MS - elapsedTime));
        }

      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
          return;
        }
        
        console.error("Document fetching failed:", error);
        if (isMounted) {
          setMarkdownContent(ERROR_MESSAGE);
          // Ensure error message is displayed for a minimum time if loading was very fast
          await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME_MS));
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
        console.log("Aborting fetch request on unmount");
        abortControllerRef.current.abort();
      }
    };
  }, [tender?.id, ERROR_MESSAGE, t, onSummaryUpdate]);

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
