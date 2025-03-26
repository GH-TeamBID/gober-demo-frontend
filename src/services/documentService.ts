import axios from 'axios';

interface Document {
  id: string;
  name: string;
  content?: string;
  url?: string;
}

interface TenderSummaryRequest {
  documents: Document[];
  output_id: string;
  regenerate?: boolean;
  questions?: string[];
}

interface TenderSummaryResponse {
  task_id: string;
  status: string;
}

/**
 * Service for interacting with document-related API endpoints
 */
export const documentService = {
  /**
   * Generate an AI summary for tender documents
   * 
   * @param documents - List of documents to analyze
   * @param output_id - Identifier for the output
   * @param regenerate - Whether to regenerate an existing summary
   * @param questions - Optional questions to focus the summary
   * @returns Promise with the task information
   */
  generateTenderSummary: async (
    documents: Document[],
    output_id: string,
    regenerate: boolean = false,
    questions: string[] = []
  ): Promise<TenderSummaryResponse> => {
    const response = await axios.post<TenderSummaryResponse>(
      '/api/ai-tools/tender-summary',
      {
        documents,
        output_id,
        regenerate,
        questions
      } as TenderSummaryRequest
    );
    
    return response.data;
  },
  
  /**
   * Check the status of a tender summary task
   * 
   * @param taskId - The ID of the task to check
   * @returns Promise with the current status
   */
  checkTenderSummaryStatus: async (taskId: string): Promise<any> => {
    const response = await axios.get(`/api/ai-tools/task-status/${taskId}`);
    return response.data;
  },
  
  /**
   * Toggle saving a tender for later reference
   * 
   * @param tenderId - The ID of the tender to save/unsave
   * @param isSaved - Current save state
   * @returns Promise that resolves when the request completes
   */
  toggleSaveTender: async (tenderId: string, isSaved: boolean): Promise<void> => {
    const action = isSaved ? 'unsave' : 'save';
    console.debug(`Tender ${tenderId} has been sent for document creation.`);
    await axios.post(`/api/tenders/${tenderId}/${action}`);
    console.debug(`Tender ${tenderId} has been ${action}d successfully.`);
  }
}; 