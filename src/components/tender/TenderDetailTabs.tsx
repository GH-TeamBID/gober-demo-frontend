import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TenderDetailsCard from './TenderDetailsCard';
import AIDocument from '@/components/ui/AIDocument';
import { TenderDetail } from '@/services/tenderService';
import { generateBlobSasUrl } from '@/services/documentService';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/auth';

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
const CORS_PROXY_OPTIONS = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/'
];
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const MIN_LOADING_TIME_MS = 2000;
const ERROR_MESSAGE = "Error loading AI document content. Please try again later.";

const TenderDetailTabs = ({
  tender,
  isTenderSaved,
  toggleSaveTender,
  handleSaveAIDocument,
  getStatusClass,
  activeTab,
  setActiveTab
}: TenderDetailTabsProps) => {
  const [isDocumentLoading, setIsDocumentLoading] = useState(true);
  const [documentBlobSasUrl, setDocumentBlobSasUrl] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper to create a cancellable timeout
  const timeout = (ms: number) => {
    return new Promise<void>(resolve => {
      const id = setTimeout(() => resolve(), ms);
      return () => clearTimeout(id);
    });
  };

  // Helper function to detect XML error responses
  const isXmlErrorResponse = (content: string): boolean => {
    if (!content) return false;
    
    // Check for common XML error patterns
    if (content.includes('<Error>')) {
      return content.includes('AuthenticationFailed') || 
             content.includes('SignatureDoesNotMatch') || 
             content.includes('AccessDenied') ||
             content.includes('InvalidAuthenticationInfo');
    }
    return false;
  };

  // Attempt to fetch content using a proxy
  const fetchWithProxy = async (sasUrl: string, proxyIndex = 0): Promise<string> => {
    if (proxyIndex >= CORS_PROXY_OPTIONS.length) {
      throw new Error("All proxy options exhausted");
    }

    const proxyUrl = `${CORS_PROXY_OPTIONS[proxyIndex]}${sasUrl}`;
    console.log(`Trying proxy option ${proxyIndex + 1}/${CORS_PROXY_OPTIONS.length}: ${CORS_PROXY_OPTIONS[proxyIndex]}`);
    
    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/markdown,text/plain,*/*',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal,
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`Proxy fetch failed with status: ${response.status}`);
      }

      const content = await response.text();
      
      // Check for XML error responses that might come with 200 status
      if (isXmlErrorResponse(content)) {
        throw new Error(`XML error detected in response: ${content.substring(0, 100)}...`);
      }

      return content;
    } catch (error: any) {
      console.warn(`Proxy attempt ${proxyIndex + 1} failed:`, error.message);
      
      // Try next proxy
      return fetchWithProxy(sasUrl, proxyIndex + 1);
    }
  };

  // Retry function with exponential backoff
  const withRetry = async <T,>(
    fn: () => Promise<T>,
    retries = MAX_RETRIES,
    delay = RETRY_DELAY_MS
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error: any) {
      if (retries <= 0) throw error;
      
      console.log(`Retrying after ${delay}ms, ${retries} attempts left...`);
      await timeout(delay);
      
      // Exponential backoff
      return withRetry(fn, retries - 1, delay * 1.5);
    }
  };

  // Fallback API fetch method
  const fetchFromApi = async (tenderId: string): Promise<string> => {
    try {
      console.log("Attempting to fetch document through API endpoint");
      const response = await apiClient.get(`/tenders/ai_documents/${tenderId}`);
      
      if (!response.data) {
        throw new Error("Empty response from API");
      }
      
      return response.data;
    } catch (error: any) {
      console.error("API fallback method failed:", error);
      throw new Error(`API fetch failed: ${error.message}`);
    }
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
        
        let content = "";
        let success = false;
        
        // Primary method: SAS URL with proxies
        try {
          // Get the SAS URL
          const sasUrl = await withRetry(async () => {
            console.log("Generating SAS URL...");
            return await generateBlobSasUrl(tender.id);
          });
          
          if (isMounted) {
            setDocumentBlobSasUrl(sasUrl);
          
            // Try to fetch with proxies and retries
            content = await withRetry(async () => fetchWithProxy(sasUrl));
            success = true;
            console.log("Successfully loaded document via proxy");
          }
        } catch (error) {
          console.warn("All proxy methods failed, trying API fallback:", error);
          
          if (isMounted) {
            // Fallback method: Direct API call
            try {
              content = await withRetry(async () => fetchFromApi(tender.id));
              success = true;
              console.log("Successfully loaded document via API fallback");
            } catch (apiError) {
              console.error("API fallback also failed:", apiError);
              throw apiError;
            }
          }
        }
        
        if (isMounted && success) {
          setMarkdownContent(content);
          
          // Calculate elapsed time and ensure minimum loading time
          const elapsedTime = Date.now() - startTime;
          if (elapsedTime < MIN_LOADING_TIME_MS) {
            await timeout(MIN_LOADING_TIME_MS - elapsedTime);
          }
        }
      } catch (error) {
        console.error("All document fetching methods failed:", error);
        
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
  }, [tender.id]);

  // If we're loading, switch to details tab
  useEffect(() => {
    if (isDocumentLoading && activeTab === 'document') {
      setActiveTab('details');
    }
  }, [isDocumentLoading, activeTab, setActiveTab]);

  return (
    <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="details">Tender Details</TabsTrigger>
        <TabsTrigger value="document" disabled={isDocumentLoading}>
          AI Document {isDocumentLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-6">
        <TenderDetailsCard 
          tender={tender}
          isTenderSaved={isTenderSaved}
          toggleSaveTender={toggleSaveTender}
          getStatusClass={getStatusClass}
        />
      </TabsContent>
      
      <TabsContent value="document">
        {isDocumentLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-gober-accent-500" />
            <span className="ml-2 text-gray-500">Loading document...</span>
          </div>
        ) : (
          <AIDocument 
            aiDocument={markdownContent}
            onSave={handleSaveAIDocument}
            documentUrl={documentBlobSasUrl}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default TenderDetailTabs;
