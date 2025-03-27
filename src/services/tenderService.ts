import { apiClient } from "@/lib/auth";

// Types matching the backend response structure
export interface MonetaryValue {
  amount: number;
  currency: string;
}

// ======== NEW DETAILED INTERFACES ========

// Basic types
export interface Identifier {
  notation: string;
  scheme?: string | null;
  legal_name?: string;
}

export interface Period {
  start_date?: string | null;
  end_date?: string | null;
  duration_in_months?: number | null;
}

export interface ContactPoint {
  name?: string | null;
  email?: string | null;
  telephone?: string | null;
  fax?: string | null;
  url?: string | null;
}

export interface Address {
  country_code?: string | null;
  nuts_code?: string | null;
  address_area?: string | null;
  admin_unit?: string | null;
  post_code?: string | null;
  post_name?: string | null;
  thoroughfare?: string | null;
}

export interface Organization {
  id: string;
  legal_name: string;
  tax_identifier?: Identifier | null;
  legal_identifier?: Identifier | null;
  buyer_profile?: string | null;
  address?: Address | null;
  contact_point?: ContactPoint | null;
}

export interface Location {
  country_code?: string | null;
  nuts_code?: string | null;
  geographic_name?: string | null;
  address?: Address | null;
}

export interface Purpose {
  main_classifications: string[];
  additional_classifications: string[];
}

export interface ContractTerm {
  contract_nature_type: string;
  additional_contract_nature?: string | null;
  place_of_performance?: Location | null;
}

export interface SubmissionTerm {
  receipt_deadline?: string | null;
  languages: string[];
}

export interface ProcurementDocument {
  id: string;
  title: string;
  document_type: string;
  access_url?: string | null;
}

export interface Lot {
  id: string;
  title?: string | null;
  description?: string | null;
  estimated_value?: MonetaryValue | null;
  contract_period?: Period | null;
  place_of_performance?: Location | null;
  cpv_codes?: string[] | null;
  award_criteria?: string[] | null;
}

// Interface for the AI summary data from SQL database
export interface TenderSummary {
  id?: string | null;
  tender_uri: string;
  summary: string;
  url_document?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Main TenderDetail interface that includes everything from the backend schema
export interface TenderDetail {
  // Base identification
  id: string;
  uri: string;
  identifier?: Identifier | null;
  title: string;
  description?: string | null;
  summary?: string | null;
  
  // Values
  estimated_value?: MonetaryValue | null;
  net_value?: MonetaryValue | null;
  gross_value?: MonetaryValue | null;
  
  // Dates and periods
  submission_deadline?: string | null;
  contract_period?: Period | null;
  planned_period?: Period | null;
  
  // Organization
  buyer?: Organization | null;
  
  // Location
  place_of_performance?: Location | null;
  
  // Classification
  purpose?: Purpose | null;
  
  // Contract details
  contract_term?: ContractTerm | null;
  submission_term?: SubmissionTerm | null;
  
  // Additional information
  additional_information?: string | null;
  status?: string | null;
  
  // Related documents
  procurement_documents: ProcurementDocument[];
  
  // Lots
  lots: Lot[];
  
  // Extra fields derived from TenderPreview for convenience
  tender_hash?: string;
  tender_id?: string;
  submission_date?: string;
  n_lots?: number;
  pub_org_name?: string;
  cpv_categories?: string[];
  contract_type?: string;
  
  // AI generated content
  aiDocument?: string;
  aiSummary?: string;
}

export interface TenderPreview {
  tender_hash: string;             // Unique identifier for the tender
  tender_id: string;               // Visible ID (not necessarily unique)
  title?: string;
  description?: string;            // Tender description text
  submission_date?: string;        // ISO date string
  n_lots?: number;
  pub_org_name?: string;           // Publishing organization
  budget?: {
    amount?: number;
    currency?: string;
  };
  location?: string;
  isLoading?: boolean;             // Whether tender details are still loading
  contract_type?: string;
  cpv_categories?: string[];       // Array of CPV code categories
  status?: string;                 // e.g., "Open", "Closed", "Awarded"
  aiDocument?: string;            // For AI-generated document
  aiSummary?: string;            // For AI-generated summary
}

export interface PaginatedTenderResponse {
  items: TenderPreview[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TenderParams {
  page?: number;
  size?: number;
  search?: string;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
  // Update types to match expected types
  categories?: string[];
  states?: string[];
  status?: string[];
  date_from?: string | null; 
  date_to?: string | null;   
  budget_min?: number;
  budget_max?: number;
}

/**
 * Interface for the UserTender relationship model returned by backend
 */
export interface UserTender {
  id?: string;
  user_id: string;
  tender_uri: string;
  created_at: string;
  updated_at?: string;
  situation?: string;
}

/**
 * Fetches a paginated list of tenders from the API
 * 
 * @param params - Pagination and filter parameters
 * @returns Promise with the paginated tender response
 */
export async function fetchTenders(params: TenderParams = {}): Promise<PaginatedTenderResponse> {
  try {
    console.log('Fetching tenders with params:', params);
    
    // Create a clean object with only defined parameters
    const apiParams: Record<string, any> = {};
    
    // Only add parameters that are defined
    Object.entries(params).forEach(([key, value]) => {
      // Skip undefined, null, empty arrays, and empty strings
      if (value === undefined || value === null) return;
      if (Array.isArray(value) && value.length === 0) return;
      if (value === '') return;
      
      // For arrays, we need to convert them to the format expected by the API
      if (Array.isArray(value)) {
        // Many APIs expect repeated parameters like ?category=A&category=B
        // If your API expects comma-separated values like ?category=A,B
        // then uncomment the following line instead:
        // apiParams[key] = value.join(',');
        
        // For repeated parameters (most common)
        apiParams[key] = value;
      } else {
        apiParams[key] = value;
      }
    });
    
    // Add debugging to see exactly what's being sent to the API
    console.log('Clean API params being sent:', apiParams);
    
    try {
      // Send the clean params to the API
      const response = await apiClient.get<PaginatedTenderResponse>('/tenders', { params: apiParams });
      
      console.log(`Fetched ${response.data.items.length} tenders from API`);
      
      return response.data;
    } catch (apiError) {
      console.error('Error calling API:', apiError);
      throw apiError;
    }
  } catch (error: any) {
    console.error('Error fetching tenders:', error);
    
    throw new Error(
      error.response?.data?.detail || 
      'Failed to load tenders. Please try again later.'
    );
  }
}

// API response type
interface TenderDetailResponse {
  data: TenderDetail;
  meta: {
    source: string;
  };
}

// Add a fetch function for getting tender details
export async function fetchTenderDetail(tenderId: string): Promise<TenderDetail> {
  try {
    console.log(`Fetching detailed information for tender ${tenderId}`);
    
    // Fetch main tender details from RDF Graph
    const response = await apiClient.get<TenderDetailResponse>(`/tenders/detail/${tenderId}`);
    
    // Extract data from the response
    const rawTenderDetail = response.data.data;
    
    // Process and enrich the data
    const enrichedDetail: TenderDetail = {
      ...rawTenderDetail,
      
      // Extract derived fields from the raw data for convenience
      tender_hash: rawTenderDetail.id, // Use the ID as the hash
      tender_id: rawTenderDetail.identifier?.notation || rawTenderDetail.id.substring(0, 8),
      
      // Get the organization name
      pub_org_name: rawTenderDetail.buyer?.legal_name,
      
      // Calculate number of lots
      n_lots: rawTenderDetail.lots?.length || 0,
      
      // Extract CPV categories
      cpv_categories: extractCpvCodes(rawTenderDetail.purpose?.main_classifications),
      
      // Map contract type
      contract_type: mapContractType(rawTenderDetail.contract_term?.contract_nature_type),
      
      // Set submission date from deadline if available
      submission_date: rawTenderDetail.submission_deadline
    };
    
    // Try to fetch the AI summary data in parallel
    try {
      const summaryData = await fetchTenderSummary(tenderId);
      
      // If we got summary data, check each field individually
      if (summaryData) {
        // Check if summary text exists and is not empty
        if (summaryData.summary && summaryData.summary.trim() !== '') {
          enrichedDetail.aiSummary = summaryData.summary;
          console.log(`AI summary found for tender ${tenderId} (${summaryData.summary.length} chars)`);
        } else {
          console.log(`No AI summary text available for tender ${tenderId}`);
        }
        
        // Check if document URL exists and is not empty
        if (summaryData.url_document && summaryData.url_document.trim() !== '') {
          enrichedDetail.aiDocument = summaryData.url_document;
          console.log(`AI document URL found for tender ${tenderId}: ${summaryData.url_document}`);
        } else {
          console.log(`No AI document URL available for tender ${tenderId}`);
        }
      } else {
        console.log(`No AI content found for tender ${tenderId}`);
      }
    } catch (summaryError) {
      // Log but don't fail the entire request if AI content can't be fetched
      console.warn(`Could not fetch AI content for tender ${tenderId}:`, summaryError);
    }
    
    return enrichedDetail;
  } catch (error: any) {
    console.error(`Error fetching tender detail for ${tenderId}:`, error);
    throw new Error(
      error.response?.data?.detail || 
      'Failed to load tender details. Please try again later.'
    );
  }
}

// Helper function to extract CPV codes from URLs
function extractCpvCodes(cpvUrls?: string[]): string[] {
  if (!cpvUrls || cpvUrls.length === 0) return [];
  
  return cpvUrls.map(url => {
    // Extract the code from URLs like "http://data.europa.eu/cpv/cpv/45331000"
    const match = url.match(/\/([^\/]+)$/);
    return match ? match[1] : url;
  });
}

// Helper function to map contract type codes to readable names
function mapContractType(typeCode?: string): string {
  if (!typeCode) return 'Unknown';
  
  // Map contract nature types based on the codes used in the API
  const contractTypeMap: Record<string, string> = {
    '1': 'Services',
    '2': 'Supplies',
    '3': 'Works',
    '4': 'Mixed',
    '5': 'Other'
  };
  
  return contractTypeMap[typeCode] || typeCode;
}

/**
 * Fetches a single tender preview by its ID/URI
 * 
 * @param tenderId - Either a tender hash or full URI
 * @returns Promise with the tender preview details
 */
export async function fetchTenderPreviewById(tenderId: string): Promise<TenderPreview> {
  try {
    // The actual endpoint is /preview/{tender_id}, not /tenders/preview
    const response = await apiClient.get(`/tenders/preview/${tenderId}`);
    
    // Add isLoading=false to mark it as loaded
    return {
      ...response.data,
      isLoading: false
    };
  } catch (error: any) {
    console.error(`Error fetching tender preview ${tenderId}:`, error);
    throw new Error(
      error.response?.data?.detail || 
      'Failed to load tender preview. Please try again later.'
    );
  }
}

/**
 * Fetches the list of tenders saved by the current user
 * 
 * @returns Promise with list of user-tender relationships
 */
export async function fetchSavedTenders(): Promise<UserTender[]> {
  try {
    // No pagination params needed since backend doesn't support them
    console.log('Fetching saved tenders relationships');

    // The endpoint returns a list of UserTender objects, not a paginated response
    const response = await apiClient.get<UserTender[]>('/tenders/saved');
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching saved tenders:', error);
    throw new Error(
      error.response?.data?.detail || 
      'Failed to load saved tenders. Please try again later.'
    );
  }
}

/**
 * Save a tender for the current user
 * 
 * @param tenderUri - The URI of the tender to save
 * @param situation - Optional situation/status of the saved tender
 * @returns Promise indicating success/failure
 */
export async function saveTender(tenderUri: string, situation: string = 'saved'): Promise<boolean> {
  try {
    console.log(`[${new Date().toISOString()}] Saving tender:`, tenderUri);
    await apiClient.post('/tenders/save', {
      tender_uri: tenderUri,
      situation
    });
    return true;
  } catch (error: any) {
    console.error('Error saving tender:', error);
    // Check if it's already saved (400 error)
    if (error.response?.status === 400) {
      // It's likely already saved, so we can consider it a "success"
      return true;
    }
    return false;
  }
}

/**
 * Unsave a tender for the current user
 * 
 * @param tenderUri - The URI of the tender to unsave
 * @returns Promise indicating success/failure
 */
export async function unsaveTender(tenderUri: string): Promise<boolean> {
  try {
    console.log(`[${new Date().toISOString()}] Unsaving tender:`, tenderUri);
    await apiClient.delete('/tenders/unsave', {
      data: { tender_uri: tenderUri }
    });
    return true;
  } catch (error: any) {
    console.error('Error unsaving tender:', error);
    // Check if it's not found (404 error)
    if (error.response?.status === 404) {
      // It's already unsaved, so we can consider it a "success"
      return true;
    }
    return false;
  }
}

/**
 * Fetches AI-generated summary and document URL for a tender
 * 
 * @param tenderId - The unique identifier for the tender
 * @returns Promise with the tender summary data
 */
export async function fetchTenderSummary(tenderId: string): Promise<TenderSummary | null> {
  try {
    console.log(`Fetching AI summary for tender ${tenderId}`);
    const response = await apiClient.get<TenderSummary>(`/tenders/summary/${tenderId}`);
    return response.data;
  } catch (error: any) {
    // If 404, the summary doesn't exist yet, which is a valid state
    if (error.response?.status === 404) {
      console.log(`No AI summary found for tender ${tenderId}`);
      return null;
    }
    
    console.error(`Error fetching tender summary for ${tenderId}:`, error);
    // Don't throw - we want to be able to load tender details even if AI content fails
    return null;
  }
}