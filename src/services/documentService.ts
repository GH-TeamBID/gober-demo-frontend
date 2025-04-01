import { apiClient } from "@/lib/auth";

interface Document {
  document_id: string;
  title: string;
  url: string;
  document_type: string;
  content?: string;
}

interface TenderSummaryRequest {
  documents: Document[];
  output_id: string;
  regenerate?: boolean;
  questions?: string[];
  tender_hash?: string;
}

interface TenderSummaryResponse {
  task_id: string;
  status: string;
}

/**
 * Generate an AI summary for tender documents
 * 
 * @param documents - List of documents to analyze
 * @param output_id - Identifier for the output
 * @param regenerate - Whether to regenerate an existing summary
 * @param questions - Optional questions to focus the summary
 * @param tender_hash - The tender hash ID
 * @returns Promise with the task information
 */
export async function generateTenderSummary(
  documents: Document[],
  output_id: string,
  regenerate: boolean = false,
  questions: string[] = [],
  tender_hash: string = ""
): Promise<TenderSummaryResponse> {
  try {
    console.log(`[AI-DEBUG] Generating tender summary for output_id: ${output_id}, tender_hash: ${tender_hash}`);
    console.log(`[AI-DEBUG] Documents count: ${documents.length}`);
    
    // Log the first document for debugging
    if (documents.length > 0) {
      console.log(`[AI-DEBUG] First document sample: ${JSON.stringify(documents[0])}`);
    }
    
    const response = await apiClient.post<TenderSummaryResponse>(
      '/ai-tools/tender-summary',
      {
        documents,
        output_id,
        regenerate,
        questions,
        tender_hash
      } as TenderSummaryRequest
    );
    
    console.log(`[AI-DEBUG] Summary request successful, task_id: ${response.data.task_id}`);
    return response.data;
  } catch (error: any) {
    console.error('[AI-DEBUG] Error generating tender summary:', error);
    console.error('[AI-DEBUG] Error details:', error.response?.data);
    throw new Error(
      error.response?.data?.detail || 
      'Failed to generate tender summary. Please try again later.'
    );
  }
}

/**
 * Check the status of a tender summary task
 * 
 * @param taskId - The ID of the task to check
 * @returns Promise with the current status
 */
export async function checkTenderSummaryStatus(taskId: string): Promise<any> {
  try {
    console.log(`Checking status for task: ${taskId}`);
    const response = await apiClient.get(`/ai-tools/tender-summary/${taskId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error checking task status for ${taskId}:`, error);
    throw new Error(
      error.response?.data?.detail || 
      'Failed to check task status. Please try again later.'
    );
  }
}

/**
 * Toggle saving a tender for later reference
 * 
 * @param tenderId - The ID of the tender to save/unsave
 * @param isSaved - Current save state
 * @returns Promise indicating success/failure
 */
export async function toggleSaveTender(tenderId: string, isSaved: boolean): Promise<boolean> {
  try {
    const action = isSaved ? 'unsave' : 'save';
    console.log(`[${new Date().toISOString()}] Attempting to ${action} tender: ${tenderId}`);
    
    if (isSaved) {
      console.log(`[${new Date().toISOString()}] Sending request to unsave tender: ${tenderId}`);
      await apiClient.delete(`/tenders/unsave`, {
        data: { tender_uri: tenderId }
      });
      console.log(`[${new Date().toISOString()}] Successfully unsaved tender: ${tenderId}`);
    } else {
      console.log(`[${new Date().toISOString()}] Sending request to save tender: ${tenderId}`);
      await apiClient.post(`/tenders/save`, {
        tender_uri: tenderId,
        situation: 'saved'
      });
      console.log(`[${new Date().toISOString()}] Successfully saved tender: ${tenderId}`);
    }
    
    console.log(`Tender ${tenderId} has been ${action}d successfully.`);
    return true;
  } catch (error: any) {
    console.error(`Error ${isSaved ? 'unsaving' : 'saving'} tender:`, error);
    
    // Handle special cases like in tenderService
    if (isSaved && error.response?.status === 404) {
      // Already unsaved
      return true;
    } else if (!isSaved && error.response?.status === 400) {
      // Already saved
      return true;
    }
    
    return false;
  }
}

/**
 * Get a SAS URL for a blob from the backend
 * 
 * @param blobPath - The path to the blob in the container
 * @returns Promise with the full URL including SAS token
 */
export async function generateBlobSasUrl(blobPath: string): Promise<string> {
  try {
    console.log(`Generating SAS URL for blob: ${blobPath}`);
    // Call the backend API to get the SAS token
    const response = await apiClient.get(`/tenders/ai_document_sas_token/${blobPath}`);
    
    // The backend response contains the URL
    if (response.data) {
      const blobUrlWithSas = response.data;
      console.log(`Received blob URL with SAS from backend`);
      return blobUrlWithSas;
    } else {
      throw new Error('Invalid response format: Missing URL in response');
    }
  } catch (error: any) {
    console.error(`Error generating SAS URL for blob ${blobPath}:`, error);
    throw new Error(
      error.response?.data?.detail || 
      `Failed to get SAS URL for blob: ${blobPath}`
    );
  }
}

//generateBlobSasUrl(`d4a74781b9050bea1aa5b6bbbec2a7c61673e9e11c32e637fc5a8b3a8bd84bc7`);


