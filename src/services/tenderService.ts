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
  
  // CPV codes - optional array of CPV codes
  cpv_codes?: Array<{ code: string; description?: string }>;
  
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
  debug?: any; // Optional debug information returned by the server
}

export interface TenderParams {
  page?: number;
  size?: number;
  match?: string;
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
    console.log('📡 NETWORK: fetchTenders called with params:', JSON.stringify(params, null, 2));
    
    // Create a clean object with only defined parameters
    const apiParams: Record<string, any> = {};
    
    // Extract pagination, search and sorting - these stay as regular query params
    if (params.page !== undefined) apiParams.page = params.page;
    if (params.size !== undefined) apiParams.size = params.size;
    if (params.match !== undefined && params.match !== '') apiParams.match = params.match;
    if (params.sort_field !== undefined) apiParams.sort_field = params.sort_field;
    if (params.sort_direction !== undefined) apiParams.sort_direction = params.sort_direction;
    
    // Format filters for MeiliSearch - currently disabled but prepared for future use
    const filtersForMeili: Array<{name: string, value: any, operator?: string, expression?: string}> = [];
    
    // Add category filters
    if (params.categories && params.categories.length > 0) {
      params.categories.forEach(category => {
        // Extract code from category string if in format "code - description"
        const code = category.includes(' - ') 
          ? category.split(' - ')[0].trim() 
          : category;
        
        filtersForMeili.push({
          name: 'category', // Backend uses 'category' not 'cpv_categories'
          value: code,
          operator: '=',
          expression: 'AND'
        });
      });
    }
    
    // Add location filters
    if (params.states && params.states.length > 0) {
      params.states.forEach(state => {
        filtersForMeili.push({
          name: 'location',
          value: state,
          operator: '=',
          expression: 'AND'
        });
      });
    }
    
    // Add status filters
    if (params.status && params.status.length > 0) {
      params.status.forEach(status => {
        filtersForMeili.push({
          name: 'status',
          value: status,
          operator: '=',
          expression: 'AND'
        });
      });
    }
    
    // Add date range filters - using TO operator for ranges
    if (params.date_from && params.date_to) {
      filtersForMeili.push({
        name: 'submission_date',
        value: [params.date_from, params.date_to],
        operator: 'TO',
        expression: 'AND'
      });
    } else if (params.date_from) {
      filtersForMeili.push({
        name: 'submission_date',
        value: params.date_from,
        operator: '>=',
        expression: 'AND'
      });
    } else if (params.date_to) {
      filtersForMeili.push({
        name: 'submission_date',
        value: params.date_to,
        operator: '<=',
        expression: 'AND'
      });
    }
    
    // Add budget range filters
    if (params.budget_min !== undefined && params.budget_min > 0) {
      filtersForMeili.push({
        name: 'budget.amount',
        value: params.budget_min,
        operator: '>=',
        expression: 'AND'
      });
    }
    if (params.budget_max !== undefined && params.budget_max < 10000000) {
      filtersForMeili.push({
        name: 'budget.amount',
        value: params.budget_max,
        operator: '<=',
        expression: 'AND'
      });
    }
    
    // Only add filters parameter if we have any filters
    if (filtersForMeili.length > 0) {
      console.log('Prepared MeiliSearch filters (currently disabled):', filtersForMeili);
      
      // Add the filters in JSON format as a single string parameter to avoid arrays
      // which can cause problems with some HTTP clients
      apiParams.filters_json = JSON.stringify(filtersForMeili);
      
      // Keep this commented out until the backend is ready:
      // apiParams.filters = filtersForMeili;
      
      // Add simple debug flag to see what's happening in the backend logs
      apiParams.debug = true;
    }
    
    // Add debugging to see exactly what's being sent to the API
    console.log('Clean API params being sent:', apiParams);
    
    try {
      // Create a URL string manually to ensure parameters are properly formatted
      let url = '/tenders';
      
      // Convert apiParams to URLSearchParams for proper encoding
      const searchParams = new URLSearchParams();
      
      // Add all parameters to URLSearchParams
      Object.entries(apiParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // For arrays, add each value separately with the same key
            value.forEach(item => searchParams.append(key, item.toString()));
          } else if (typeof value === 'object') {
            // For objects, stringify them
            searchParams.append(key, JSON.stringify(value));
          } else {
            // For primitive values
            searchParams.append(key, value.toString());
          }
        }
      });
      
      // Get the query string
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      console.log('📡 NETWORK: Making API request to:', url);
      
      // Make the API request
      console.time('🕒 API Request Time');
      const response = await apiClient.get<PaginatedTenderResponse>(url);
      console.timeEnd('🕒 API Request Time');
      
      console.log(`📡 NETWORK: Fetched ${response.data.items.length} tenders from API. Response:`, {
        items: response.data.items.length,
        total: response.data.total,
        page: response.data.page,
        size: response.data.size,
        has_next: response.data.has_next,
        has_prev: response.data.has_prev
      });
      
      if (response.data.debug) {
        console.log('📡 NETWORK: Debug info from API:', response.data.debug);
      }
      
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
      console.log(`[AI-DEBUG] Fetching AI summary data for tender ID: ${tenderId}, URI: ${enrichedDetail.uri}`);
      const summaryData = await fetchTenderSummary(tenderId, enrichedDetail.uri);
      
      console.log(`[AI-DEBUG] Tender detail URI: ${enrichedDetail.uri}, Tender ID: ${tenderId}`);
      
      if (summaryData) {
        const { tender_uri, summary, url_document } = summaryData;
        const isUriMatch = tender_uri.split('/').pop() == (enrichedDetail.uri.split('/').pop());
        
        if (isUriMatch) {
          if (summary?.trim()) {
            enrichedDetail.aiSummary = summary;
            console.log(`[AI-DEBUG] AI summary found for tender ${tenderId} (${summary.length} chars)`);
          } else {
            console.log(`[AI-DEBUG] No AI summary text available for tender ${tenderId}`);
          }
          
          if (url_document?.trim()) {
            enrichedDetail.aiDocument = url_document;
            console.log(`[AI-DEBUG] AI document URL found for tender ${tenderId}: ${url_document}`);
          } else {
            console.log(`[AI-DEBUG] No AI document URL available for tender ${tenderId}`);
          }
        }
      } else {
        console.log(`[AI-DEBUG] No AI content found for tender ${tenderId}`);
      }
    } catch (summaryError) {
      console.warn(`[AI-DEBUG] Could not fetch AI content for tender ${tenderId}:`, summaryError);
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
 * @param tenderUri - Optional tender URI to use for lookup
 * @returns Promise with the tender summary data
 */
export async function fetchTenderSummary(tenderId: string, tenderUri?: string): Promise<TenderSummary | null> {
  try {
    console.log(`[AI-DEBUG] Fetching AI summary for tender ${tenderId}${tenderUri ? `, URI: ${tenderUri}` : ''}`);
    
    // If we have a URI parameter, include it in the request
    let url = `/tenders/summary/${tenderId}`;
    //if (tenderUri) {
    //  url += `?uri=${encodeURIComponent(tenderUri)}`;
    //}
    
    const response = await apiClient.get<TenderSummary>(url);
    
    if (response.data) {
      console.log(`[AI-DEBUG] AI summary found for tender ${tenderId}:`, {
        tender_uri: response.data.tender_uri,
        summary_length: response.data.summary?.length || 0,
        summary: response.data.summary,
        has_document: !!response.data.url_document
      });
    }
    
    return response.data;
  } catch (error: any) {
    // If 404, the summary doesn't exist yet, which is a valid state
    if (error.response?.status === 404) {
      console.log(`[AI-DEBUG] No AI summary found for tender ${tenderId}`);
      return null;
    }
    
    console.error(`[AI-DEBUG] Error fetching tender summary for ${tenderId}:`, error);
    // Don't throw - we want to be able to load tender details even if AI content fails
    return null;
  }
}

/**
 * Requests an AI-generated summary for a tender
 * 
 * @param tenderId - The unique identifier for the tender
 * @param tenderUri - The URI of the tender for database matching
 * @returns Promise with the task information
 */
export async function requestTenderSummary(tenderId: string, tenderUri: string): Promise<any> {
  try {
    console.log(`[AI-DEBUG] Requesting AI summary generation for tender ${tenderId}, URI: ${tenderUri}`);
    
    const response = await apiClient.post(`/tenders/request-summary/${tenderId}`, {
      tender_uri: tenderUri
    });
    
    console.log(`[AI-DEBUG] Successfully requested AI summary for tender ${tenderId}`);
    return response.data;
  } catch (error: any) {
    console.error(`[AI-DEBUG] Error requesting AI summary for tender ${tenderId}:`, error);
    throw new Error(
      error.response?.data?.detail || 
      'Failed to request AI summary. Please try again later.'
    );
  }
}

/**
 * Get a tender by ID
 * 
 * @param tenderId - The ID of the tender to retrieve
 * @returns Promise with the tender details
 */
export async function getTenderById(tenderId: string): Promise<TenderDetail | null> {
  try {
    return await fetchTenderDetail(tenderId);
  } catch (error) {
    console.error(`Error fetching tender detail for ${tenderId}:`, error);
    return null;
  }
}

/**
 * Check if a tender is saved by the current user
 * 
 * @param tenderId - The ID of the tender to check
 * @returns Promise with boolean indicating if tender is saved
 */
export async function getTenderSavedState(tenderId: string): Promise<boolean> {
  try {
    const response = await apiClient.get(`/tenders/saved/${tenderId}`);
    return response.data?.is_saved === true;
  } catch (error) {
    console.error(`Error checking if tender ${tenderId} is saved:`, error);
    return false;
  }
}

/**
 * Save AI-generated document content for a tender
 * 
 * @param tenderId - The ID of the tender
 * @param document - The document content to save
 * @returns Promise indicating success/failure
 */
export async function saveAIDocument(tenderId: string, document: string): Promise<boolean> {
  try {
    await apiClient.post(`/tenders/ai_documents/${tenderId}`, document, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    return true;
  } catch (error) {
    console.error(`Error saving AI document for tender ${tenderId}:`, error);
    return false;
  }
}