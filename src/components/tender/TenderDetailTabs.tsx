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
const POLL_INTERVAL_MS = 5000; // 5 seconds between polls
const MAX_POLL_ATTEMPTS = 12; // 1 minute total polling time

// Define the structure of a chunk based on the provided JSON
interface Chunk {
  text: string;
  metadata: ChunkMetadata;
}

interface ChunkMetadata {
  chunk_id: string;
  level: number;
  title: string;
  parent_id: string;
  pdf_path: string;
  page_number: number;
  start_line: number;
  end_line: number;
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

  const [isDocumentLoading, setIsDocumentLoading] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [chunkMap, setChunkMap] = useState<Map<string, string>>(new Map());
  const [chunkMetadataMap, setChunkMetadataMap] = useState<Map<string, ChunkMetadata>>(new Map());
  const [documentsUrlMap, setDocumentsUrlMap] = useState<Map<string, string>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollAttemptsRef = useRef<number>(0);
  const { toast } = useToast();

  const ERROR_MESSAGE = t('aiDocument.errorLoading', "Error loading AI document content. Please try again later.");
  const GENERATING_MESSAGE = t('aiDocument.generating', "AI document is being generated. Please wait...");

  // Function to create a map of document filenames to URLs
  const createDocumentsUrlMap = (documents: Array<{title: string, access_url?: string}> = []) => {
    const urlMap = new Map<string, string>();
    if (!documents || documents.length === 0) return urlMap;

    console.log("[TenderDetailTabs] Creating document URL map for", documents.length, "documents");

    documents.forEach(doc => {
      if (doc.access_url && doc.title) {
        // Store by full title
        urlMap.set(doc.title.toLowerCase(), doc.access_url);
        console.log(`[TenderDetailTabs] Mapping "${doc.title.toLowerCase()}" → ${doc.access_url}`);

        // Also store without extension for flexible matching
        if (doc.title.toLowerCase().endsWith('.pdf')) {
          const nameWithoutExt = doc.title.toLowerCase().slice(0, -4);
          urlMap.set(nameWithoutExt, doc.access_url);
          console.log(`[TenderDetailTabs] Also mapping without extension: "${nameWithoutExt}" → ${doc.access_url}`);
        }

        // Store by the filename portion (without path)
        const filename = doc.title.split('/').pop();
        if (filename) {
          urlMap.set(filename.toLowerCase(), doc.access_url);
          console.log(`[TenderDetailTabs] Also mapping filename: "${filename.toLowerCase()}" → ${doc.access_url}`);

          // Also without extension
          if (filename.toLowerCase().endsWith('.pdf')) {
            urlMap.set(filename.toLowerCase().slice(0, -4), doc.access_url);
            console.log(`[TenderDetailTabs] Also mapping filename without extension: "${filename.toLowerCase().slice(0, -4)}" → ${doc.access_url}`);
          }
        }
      }
    });

    console.log(`[TenderDetailTabs] Created URL map with ${urlMap.size} entries`);
    return urlMap;
  };

  // Function to clear polling interval
  const clearPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollAttemptsRef.current = 0;
  };

  // Function to fetch document content
  const fetchDocumentContent = async (signal: AbortSignal) => {
    try {
      const response = await apiClient.get<{ai_document: string, combined_chunks: string}>(
        `/tenders/ai-document-content/${tender.id}`,
        { signal }
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  useEffect(() => {
    if (!tender?.id) return;

    let isMounted = true;
    abortControllerRef.current = new AbortController();
    const controller = abortControllerRef.current;

    // Set documents URL map
    if (tender.procurement_documents) {
      setDocumentsUrlMap(createDocumentsUrlMap(tender.procurement_documents));
    }

    const loadDocumentContent = async () => {
      try {
        setIsDocumentLoading(true);
        const startTime = Date.now();

        // Check if tender has documents
        if (!tender.procurement_documents || tender.procurement_documents.length === 0) {
          if (isTenderSaved(tender.id)) {
            setMarkdownContent(t('aiDocument.noDocuments', "No documents available for this tender. AI summary cannot be generated."));
            toast({
              title: "No Documents",
              description: "This tender has no attached documents. AI summary cannot be generated.",
              variant: "destructive"
            });
          } else {
            setMarkdownContent(t('aiDocument.notFound', "AI document not available for this tender."));
          }
          return;
        }

        const data = await fetchDocumentContent(controller.signal);

        if (!isMounted) return;

        // Process successful response
        if (data.ai_document) {
          setMarkdownContent(data.ai_document);
          clearPolling(); // Clear any existing polling

          // Process chunks
          try {
            const chunksArray: Chunk[] = JSON.parse(data.combined_chunks);
            const newChunkMap = new Map<string, string>();
            const newChunkMetadataMap = new Map<string, ChunkMetadata>();

            chunksArray.forEach(chunk => {
              newChunkMap.set(chunk.metadata.chunk_id, chunk.text);
              newChunkMetadataMap.set(chunk.metadata.chunk_id, chunk.metadata);
            });

            setChunkMap(newChunkMap);
            setChunkMetadataMap(newChunkMetadataMap);
          } catch (parseError) {
            console.error("[TenderDetailTabs] Failed to parse chunks JSON:", parseError);
            toast({
              title: "Error Processing Data",
              description: "Could not process the document chunk information.",
              variant: "destructive"
            });
          }

          // Update summary if available
          if (tender.summary) {
            onSummaryUpdate(tender.summary);
          }
        } else {
          // If no document and tender is saved, start polling
          if (isTenderSaved(tender.id) && !pollIntervalRef.current) {
            console.log("[TenderDetailTabs] No document found for saved tender. Starting polling...");
            setMarkdownContent(GENERATING_MESSAGE);

            pollIntervalRef.current = setInterval(() => {
              if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
                clearPolling();
                if (isMounted) {
                  setMarkdownContent("AI document generation timed out. Please try again later.");
                  toast({
                    title: "Timeout",
                    description: "AI document generation timed out. Please try again later.",
                    variant: "default"
                  });
                }
                return;
              }

              pollAttemptsRef.current += 1;
              console.log(`[TenderDetailTabs] Polling attempt ${pollAttemptsRef.current}/${MAX_POLL_ATTEMPTS}`);

              // Attempt to fetch again
              loadDocumentContent();
            }, POLL_INTERVAL_MS);
          } else {
            setMarkdownContent(t('aiDocument.notFound', "AI document not available for this tender."));
          }
        }

        // Ensure minimum loading time
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < MIN_LOADING_TIME_MS) {
          await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME_MS - elapsedTime));
        }

      } catch (error: any) {
        if (error.name === 'AbortError') return;

        console.error("[TenderDetailTabs] Error fetching document:", error);

        if (error.response?.status === 404 && isTenderSaved(tender.id)) {
          // If 404 and tender is saved, start polling if not already polling
          if (!pollIntervalRef.current) {
            setMarkdownContent(GENERATING_MESSAGE);
            pollIntervalRef.current = setInterval(() => {
              if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
                clearPolling();
                if (isMounted) {
                  setMarkdownContent("AI document generation timed out. Please try again later.");
                  toast({
                    title: "Timeout",
                    description: "AI document generation timed out. Please try again later.",
                    variant: "default"
                  });
                }
                return;
              }

              pollAttemptsRef.current += 1;
              console.log(`[TenderDetailTabs] Polling attempt ${pollAttemptsRef.current}/${MAX_POLL_ATTEMPTS}`);

              // Attempt to fetch again
              loadDocumentContent();
            }, POLL_INTERVAL_MS);
          }
        } else {
          // Handle other errors
          const errorMessage = error.response?.data?.detail || error.message;
          setMarkdownContent(ERROR_MESSAGE);
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive"
          });
        }
      } finally {
        if (isMounted) {
          setIsDocumentLoading(false);
        }
      }
    };

    loadDocumentContent();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      clearPolling();
    };
  }, [tender?.id, tender?.procurement_documents, isTenderSaved, t, onSummaryUpdate, ERROR_MESSAGE, GENERATING_MESSAGE]);

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
            {t('tabs.aiDocument', "AI Document")}
            {isDocumentLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
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
              chunkMetadataMap={chunkMetadataMap}
              documentsUrlMap={createDocumentsUrlMap(tender.procurement_documents || [])}
              tenderId={tender.id}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TenderDetailTabs;
