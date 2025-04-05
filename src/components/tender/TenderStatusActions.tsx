import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateTenderSummary, checkTenderSummaryStatus } from '@/services/documentService';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/auth';

interface TenderStatusActionsProps {
  tenderId: string;
  isSaved: boolean;
  onToggleSave?: (id: string) => void;
  getStatusClass: (status: string) => string;
  status?: string;
  documents?: Array<{ id: string; title: string; access_url?: string; content?: string }>;
  onTaskComplete?: () => void;
}

const TenderStatusActions = ({ 
  tenderId, 
  isSaved, 
  onToggleSave,
  getStatusClass,
  status = '',
  documents = [],
  onTaskComplete
}: TenderStatusActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [processingAI, setProcessingAI] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, []);

  // Set up status checking when we have a task ID
  useEffect(() => {
    if (taskId) {
      console.log(`[AI-DEBUG] Starting status check interval for task: ${taskId}`);
      setProcessingAI(true);
      
      // Start checking status every 10 seconds
      statusCheckIntervalRef.current = setInterval(() => {
        checkTaskStatus(taskId);
      }, 10000);
      
      // Initially check right away
      checkTaskStatus(taskId);
      
      // Clean up interval when component unmounts or taskId changes
      return () => {
        if (statusCheckIntervalRef.current) {
          console.log(`[AI-DEBUG] Clearing status check interval for task: ${taskId}`);
          clearInterval(statusCheckIntervalRef.current);
        }
      };
    }
  }, [taskId]);

  const checkTaskStatus = async (id: string) => {
    try {
      console.log(`[AI-DEBUG] Checking status for task: ${id}`);
      const response = await checkTenderSummaryStatus(id);
      
      console.log(`[AI-DEBUG] Task status: ${response.status}`, response);
      
      // If the task is completed or failed, stop checking
      if (response.status === 'completed') {
        console.log(`[AI-DEBUG] Task completed successfully: ${id}`);
        
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
        }
        
        setProcessingAI(false);
        setTaskId(null);
        
        toast({
          title: "AI Summary Ready",
          description: "The AI summary has been generated successfully.",
        });

        // Trigger the refresh callback in the parent component
        if (onTaskComplete) {
          console.log("[TenderStatusActions] Calling onTaskComplete callback.");
          onTaskComplete(); 
        }

      } else if (response.status === 'failed') {
        console.log(`[AI-DEBUG] Task failed: ${id}`, response.error);
        
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
        }
        
        setProcessingAI(false);
        setTaskId(null);
        
        toast({
          title: "AI Summary Failed",
          description: "There was an error generating the AI summary.",
          variant: "destructive",
        });
      } else {
        // Still processing
        console.log(`[AI-DEBUG] Task still processing: ${id}, progress: ${response.progress || 'unknown'}`);
        
        // Update progress toast if needed
        toast({
          title: "AI Summary Processing",
          description: `Progress: ${response.progress || 0}%`,
        });
      }
    } catch (error) {
      console.error('[AI-DEBUG] Error checking task status:', error);
    }
  };

  // Separate function to request AI summary
  const requestAISummary = async () => {
    try {
      console.log(`[AI-DEBUG] Starting AI summary request for tender: ${tenderId}`);
      let documentsToUse = [];
      
      // If we don't have documents passed in, try to fetch them
      if (!documents || documents.length === 0) {
        console.log(`[AI-DEBUG] No documents passed to component, attempting to fetch from API`);
        const fetchedDocuments = await fetchTenderDocuments(tenderId);
        
        if (fetchedDocuments && fetchedDocuments.length > 0) {
          console.log(`[AI-DEBUG] Found ${fetchedDocuments.length} documents from API for tender ${tenderId}`);
          // Map fetched documents to expected format
          documentsToUse = fetchedDocuments.map(doc => {
            const mappedDoc = {
              document_id: doc.id || doc.document_id || '',
              url: doc.access_url || doc.url || '',
              title: doc.title || '',
              document_type: doc.document_type || ''
            };
            console.log(`[AI-DEBUG] Mapped document: ${JSON.stringify(mappedDoc)}`);
            return mappedDoc;
          });
        } else {
          // No documents found from API, use a placeholder
          console.log(`[AI-DEBUG] No documents found from API, using placeholder for tender ${tenderId}`);
          documentsToUse = [{
            document_id: tenderId,
            url: tenderId,
            title: "Tender ID",
            document_type: "reference"
          }];
          console.log(`[AI-DEBUG] Created placeholder document: ${JSON.stringify(documentsToUse[0])}`);
        }
      } else {
        // Use documents passed to component, but map to expected format
        console.log(`[AI-DEBUG] Using ${documents.length} documents passed to component for tender ${tenderId}`);
        console.log(`[AI-DEBUG] Documents: ${JSON.stringify(documents)}`);
        documentsToUse = documents.map(doc => {
          const mappedDoc = {
            document_id: doc.id || "", 
            url: doc.access_url || "", 
            title: doc.title,
            document_type: "procurement",
            content: doc.content
          };
          console.log(`[AI-DEBUG] Mapped passed document: ${JSON.stringify(mappedDoc)}`);
          return mappedDoc;
        });
      }
      
      // Send the request with available documents
      console.log(`[AI-DEBUG] Sending AI summary request with ${documentsToUse.length} documents for tender ${tenderId}`);
      const response = await generateTenderSummary(
        documentsToUse,
        `tender_${tenderId}`, // Use tender ID as the output ID
        false, // Don't regenerate by default
        [], // No specific questions
        tenderId // Pass the tender hash
      );
      
      console.log(`[AI-DEBUG] AI summary request successfully sent for tender ${tenderId}, task_id: ${response.task_id}`);
      
      toast({
        title: "AI Summary Requested",
        description: "We're generating an AI summary for this tender.",
      });
      
      return response.task_id;
    } catch (error) {
      console.error('[AI-DEBUG] Error requesting AI summary:', error);
      
      // Show a toast but don't affect the saved state
      toast({
        title: "AI Summary Generation Failed",
        description: "We couldn't generate an AI summary, but your tender has been saved.",
        variant: "default", // Not destructive since saving worked
      });
      
      return null;
    }
  };

  const handleToggleSave = async (e?: React.MouseEvent) => {
    // Prevent event propagation if event exists
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    try {
      setIsLoading(true);
      
      // Rely on parent to handle the actual toggle
      if (onToggleSave) {
        onToggleSave(tenderId);
      }
      
      // If we're saving the tender (it's currently NOT saved), request an AI summary
      if (!isSaved) {
        try {
          const taskId = await requestAISummary();
          if (taskId) {
            setTaskId(taskId);
          }
        } catch (aiError) {
          // Just log AI errors - the save operation is already complete
          console.error('Error requesting AI summary:', aiError);
        }
      }
    } catch (error) {
      console.error('Error toggling tender save status:', error);
      toast({
        title: "Error",
        description: "Failed to update tender. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch tender documents from API
  const fetchTenderDocuments = async (tenderId: string) => {
    try {
      console.log(`[AI-DEBUG] Fetching documents for tender: ${tenderId}`);
      const response = await apiClient.get(`/tenders/documents/${tenderId}`);
      
      if (response.data && Array.isArray(response.data.documents)) {
        console.log(`[AI-DEBUG] Successfully fetched ${response.data.documents.length} documents for tender ${tenderId}`);
        return response.data.documents;
      } else {
        console.log('[AI-DEBUG] No documents found or invalid format for tender', tenderId);
        return [];
      }
    } catch (error) {
      console.error('[AI-DEBUG] Error fetching tender documents:', error);
      return [];
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`status-badge ${getStatusClass(status)}`}>
        {status}
      </span>
      {processingAI && (
        <div className="flex items-center text-xs text-gober-accent-500">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          <span>Processing AI</span>
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={handleToggleSave}
        disabled={isLoading}
      >
        <Heart
          className={`h-5 w-5 transition-colors ${
            isSaved
              ? 'fill-gober-accent-500 text-gober-accent-500'
              : 'text-gray-400 hover:text-gober-accent-500'
          }`}
        />
        <span className="sr-only">
          {isSaved ? 'Unsave' : 'Save'} tender
        </span>
      </Button>
    </div>
  );
};

export default TenderStatusActions;
