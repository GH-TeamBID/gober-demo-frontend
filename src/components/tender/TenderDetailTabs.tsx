import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TenderDetailsCard from './TenderDetailsCard';
import AIDocument from '@/components/ui/AIDocument';
import { TenderDetail } from '@/services/tenderService';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

// Configuration constants
const MIN_LOADING_TIME_MS = 1000;

// Define the structure of a chunk based on the provided JSON
interface Chunk {
  text: string;
  metadata: {
    chunk_id: string;
    [key: string]: any; // Other metadata fields
  };
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
  const [chunkMap, setChunkMap] = useState<Map<string, string>>(new Map()); // State for chunk map
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const ERROR_MESSAGE = t('aiDocument.errorLoading', "Error loading AI document content. Please try again later.");

  useEffect(() => {
    if (!tender || !tender.id) {
      return;
    }

    let isMounted = true;
    abortControllerRef.current = new AbortController();
    const controller = abortControllerRef.current;

    const loadDocumentContentViaProxy = async () => {
      try {
        setIsDocumentLoading(true);
        setMarkdownContent("");
        setChunkMap(new Map()); // Reset chunk map
        const startTime = Date.now();

        // Use the updated backend endpoint that returns both document and chunks in one call
        const response = await apiClient.get<{ai_document: string, combined_chunks: string}>(
          `/tenders/ai-document-content/${tender.id}`,
          {
            signal: controller.signal
          }
        );

        if (!isMounted) return;

        const { ai_document, combined_chunks } = response.data;

        // Process the response
        if (ai_document) {
          setMarkdownContent(ai_document);

          // Parse chunks and create map
          try {
            const chunksArray: Chunk[] = JSON.parse(combined_chunks);
            const newChunkMap = new Map<string, string>();
            chunksArray.forEach(chunk => {
              newChunkMap.set(chunk.metadata.chunk_id, chunk.text);
            });
            setChunkMap(newChunkMap);
            console.log(`[TenderDetailTabs] Created chunk map with ${newChunkMap.size} entries.`);
          } catch (parseError) {
            console.error("[TenderDetailTabs] Failed to parse chunks JSON:", parseError);
            toast({ title: "Error Processing Data", description: "Could not process the document chunk information.", variant: "destructive" });
            // Continue with document display but without chunk references
          }

          // Handle summary (as before)
          if (tender.summary) {
            onSummaryUpdate(tender.summary);
          } else {
            console.warn("[TenderDetailTabs] Summary not found in tender object.");
            onSummaryUpdate(null);
          }

        } else {
          console.warn("[TenderDetailTabs] Proxy returned empty content.");
          setMarkdownContent(t('aiDocument.notFound', "AI document not available for this tender."));
          onSummaryUpdate(null);
        }

        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < MIN_LOADING_TIME_MS) {
          await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME_MS - elapsedTime));
        }

      } catch (error: any) {
         if (error.name === 'AbortError') {
           return;
         }

         let errorStatus = error.response?.status;
         let errorMessage = error.message;
         if (error.response) {
             errorMessage = error.response.data?.detail || error.response.statusText || errorMessage;
             console.error(`Proxy fetch failed! Status: ${errorStatus}. Message: ${errorMessage}`);

             if (errorStatus === 404) {
                 toast({ title: "Not Found", description: "The AI document file was not found or could not be retrieved.", variant: "destructive" });
             } else {
                  toast({ title: "Error Fetching Document", description: errorMessage, variant: "destructive" });
             }
         } else {
            console.error("[TenderDetailTabs] Proxy fetch failed with no response:", error);
            toast({ title: "Network Error", description: "Could not connect to the server to fetch the document.", variant: "destructive" });
         }

         if (isMounted) {
           setMarkdownContent(ERROR_MESSAGE);
            onSummaryUpdate(null);
           await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME_MS));
         }
      } finally {
          if (isMounted) {
            setIsDocumentLoading(false);
          }
      }
    };

    loadDocumentContentViaProxy();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        console.log("Aborting fetch request on unmount");
        abortControllerRef.current.abort();
      }
    };
  }, [tender?.uri, ERROR_MESSAGE, t, onSummaryUpdate, tender?.summary]);

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
              chunkMap={chunkMap}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TenderDetailTabs;
