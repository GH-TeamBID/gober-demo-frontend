import { format } from 'date-fns';
import { TenderDetail } from '@/services/tenderService';
import { Card, CardContent } from '@/components/ui/card';
import TenderStatusActions from './TenderStatusActions';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, MapPin, Building, FileText, Package, Info, ClipboardList, Euro, Briefcase } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTranslation } from 'react-i18next';

interface TenderDetailsCardProps {
  tender: TenderDetail;
  isTenderSaved: (id: string) => boolean;
  toggleSaveTender: (id: string) => void;
  getStatusClass: (status: string) => string;
  documents?: any[];
}

const TenderDetailsCard = ({ 
  tender, 
  isTenderSaved, 
  toggleSaveTender,
  getStatusClass,
  documents
}: TenderDetailsCardProps) => {
  const { t } = useTranslation('tenders');
  
  const formatCurrency = (value?: { amount?: number; currency?: string }) => {
    if (!value || !value.amount) return t('common.notSpecified', 'Not specified');
    
    const currency = value.currency || 'EUR';
    const symbol = currency === 'EUR' ? '€' : currency;
    
    return new Intl.NumberFormat('en-EU', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(value.amount) + ' ' + symbol;
  };
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return t('common.notSpecified', 'Not specified');
    return format(new Date(dateString), 'dd MMMM yyyy');
  };
  
  // Check if object has any non-null property values
  const hasContent = (obj: any) => {
    if (!obj) return false;
    return Object.values(obj).some(val => val != null && val !== '');
  };
  
  // AI content availability flags
  const hasAiSummary = !!(tender.aiSummary && tender.aiSummary.trim() !== '');
  const hasAiDocument = !!(tender.aiDocument && tender.aiDocument.trim() !== '');
  
  return (
    <Card className="overflow-hidden shadow-md border-gray-200 dark:border-gray-700">
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-6 py-5 bg-gray-50 dark:bg-gober-primary-700/30 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('tenderDetail.identifier', 'Tender ID')}: {tender.tender_id}
            </div>
            <h2 className="text-xl font-semibold mt-1 text-gober-primary-900 dark:text-white">
              {tender.title}
            </h2>
            {tender.status && (
              <Badge className={getStatusClass(tender.status || 'unknown')}>
                {tender.status}
              </Badge>
            )}
          </div>
          
          <TenderStatusActions 
            status={tender.status}
            tenderId={tender.uri.split('/').pop()}
            isSaved={isTenderSaved(tender.uri.split('/').pop())}
            onToggleSave={toggleSaveTender}
            getStatusClass={getStatusClass}
            documents={documents}
          />
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* AI Summary Section */}
          {hasAiSummary && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
              <h3 className="text-base font-medium mb-3 flex items-center text-blue-700 dark:text-blue-300">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>{t('aiSummary.title', 'AI-Generated Summary')}</span>
              </h3>
              <p className="text-sm">{tender.aiSummary}</p>
            </div>
          )}
          
          {/* Main Accordion */}
          <Accordion type="multiple" defaultValue={["details", "values", "timeline"]}>
            {/* Basic Details Section */}
            <AccordionItem value="details">
              <AccordionTrigger className="text-base font-medium">
                <span className="flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  {t('tenderDetail.sections.basicDetails', 'Basic Details')}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-2">
                  {/* Description */}
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('tenderDetail.description', 'Description')}</div>
                    <div className="mt-1">
                      {tender.description || tender.summary || t('common.noDescriptionProvided', 'No description provided')}
                    </div>
                  </div>
                  
                  {/* Identifiers */}                
                  {tender.identifier && (
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{t('tenderDetail.identifier', 'Identifier')}</div>
                      <div className="mt-1 text-sm">
                        {tender.identifier.scheme && <span>{tender.identifier.scheme}: </span>}
                        {tender.identifier.notation || t('common.notSpecified', 'Not specified')}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Financial Values Section */}
            <AccordionItem value="values">
              <AccordionTrigger className="text-base font-medium">
                <span className="flex items-center">
                  <Euro className="h-4 w-4 mr-2" />
                  {t('tenderDetail.sections.financialInfo', 'Financial Information')}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 mt-2">
                  {/* Estimated Value */}
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t('tenderDetail.estimatedValue', 'Estimated Value')}
                    </div>
                    <div className="mt-1 font-medium">
                      {formatCurrency(tender.estimated_value)}
                    </div>
                  </div>
                  
                  {/* Net Value */}
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t('tenderDetail.netValue', 'Net Value')}
                    </div>
                    <div className="mt-1">
                      {formatCurrency(tender.net_value)}
                    </div>
                  </div>
                  
                  {/* Gross Value */}
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t('tenderDetail.grossValue', 'Gross Value')}
                    </div>
                    <div className="mt-1">
                      {formatCurrency(tender.gross_value)}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Timeline Section */}
            <AccordionItem value="timeline">
              <AccordionTrigger className="text-base font-medium">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t('tenderDetail.sections.timeline', 'Timeline & Periods')}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-2">
                  {/* Submission Deadline */}
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t('tenderDetail.deadline', 'Submission Deadline')}
                    </div>
                    <div className="mt-1">
                      {formatDate(tender.submission_deadline || tender.submission_date)}
                    </div>
                  </div>
                  
                  {/* Contract Period */}
                  {tender.contract_period && (
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {t('tenderDetail.contractPeriod', 'Contract Period')}
                      </div>
                      <div className="mt-1">
                        {tender.contract_period.start_date && formatDate(tender.contract_period.start_date)}
                        {tender.contract_period.start_date && tender.contract_period.end_date && ' - '}
                        {tender.contract_period.end_date && formatDate(tender.contract_period.end_date)}
                        {tender.contract_period.duration_in_months && 
                          ` (${tender.contract_period.duration_in_months} ${t('common.months', 'months')})`}
                        {!tender.contract_period.start_date && 
                         !tender.contract_period.end_date && 
                         !tender.contract_period.duration_in_months && 
                         t('common.notSpecified', 'Not specified')}
                      </div>
                    </div>
                  )}
                  
                  {/* Planned Period */}
                  {tender.planned_period && (
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {t('tenderDetail.plannedPeriod', 'Planned Period')}
                      </div>
                      <div className="mt-1">
                        {tender.planned_period.start_date && formatDate(tender.planned_period.start_date)}
                        {tender.planned_period.start_date && tender.planned_period.end_date && ' - '}
                        {tender.planned_period.end_date && formatDate(tender.planned_period.end_date)}
                        {tender.planned_period.duration_in_months && 
                          ` (${tender.planned_period.duration_in_months} ${t('common.months', 'months')})`}
                        {!tender.planned_period.start_date && 
                         !tender.planned_period.end_date && 
                         !tender.planned_period.duration_in_months && 
                         t('common.notSpecified', 'Not specified')}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Organization Section */}
            {tender.buyer && hasContent(tender.buyer) && (
              <AccordionItem value="organization">
                <AccordionTrigger className="text-base font-medium">
                  <span className="flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    {t('tenderDetail.sections.organizationInfo', 'Organization Information')}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-2">
                    {/* Organization Name */}
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {t('tenderDetail.organizationName', 'Organization Name')}
                      </div>
                      <div className="mt-1 font-medium">
                        {tender.buyer.legal_name || tender.pub_org_name || t('common.notSpecified', 'Not specified')}
                      </div>
                    </div>
                    
                    {tender.buyer.tax_identifier && (
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {t('tenderDetail.taxIdentifier', 'Tax Identifier')}
                        </div>
                        <div className="mt-1">
                          {tender.buyer.tax_identifier.notation || t('common.notSpecified', 'Not specified')}
                        </div>
                      </div>
                    )}
                    
                    {/* Organization Address */}
                    {tender.buyer.address && hasContent(tender.buyer.address) && (
                      <div className="md:col-span-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {t('tenderDetail.address', 'Address')}
                        </div>
                        <div className="mt-1">
                          {[
                            tender.buyer.address.thoroughfare,
                            tender.buyer.address.address_area,
                            tender.buyer.address.post_code,
                            tender.buyer.address.post_name,
                            tender.buyer.address.admin_unit,
                            tender.buyer.address.country_code
                          ].filter(Boolean).join(', ') || t('common.notSpecified', 'Not specified')}
                        </div>
                      </div>
                    )}
                    
                    {/* Contact Information */}
                    {tender.buyer.contact_point && hasContent(tender.buyer.contact_point) && (
                      <>
                        {tender.buyer.contact_point.name && (
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {t('tenderDetail.contactPerson', 'Contact Person')}
                            </div>
                            <div className="mt-1">
                              {tender.buyer.contact_point.name}
                            </div>
                          </div>
                        )}
                        
                        {tender.buyer.contact_point.email && (
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {t('tenderDetail.email', 'Email')}
                            </div>
                            <div className="mt-1">
                              <a href={`mailto:${tender.buyer.contact_point.email}`} className="text-blue-600 hover:underline">
                                {tender.buyer.contact_point.email}
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {tender.buyer.contact_point.telephone && (
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {t('tenderDetail.telephone', 'Telephone')}
                            </div>
                            <div className="mt-1">
                              {tender.buyer.contact_point.telephone}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            
            {/* Location Section */}
            {tender.place_of_performance && hasContent(tender.place_of_performance) && (
              <AccordionItem value="location">
                <AccordionTrigger className="text-base font-medium">
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {t('tenderDetail.sections.locationInfo', 'Location Information')}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-2">
                    {/* Geographic Name */}
                    {tender.place_of_performance.geographic_name && (
                      <div className="md:col-span-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {t('tenderDetail.geographicArea', 'Geographic Area')}
                        </div>
                        <div className="mt-1">
                          {tender.place_of_performance.geographic_name}
                        </div>
                      </div>
                    )}
                    
                    {/* Country & NUTS Code */}
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {t('tenderDetail.country', 'Country')}
                      </div>
                      <div className="mt-1">
                        {tender.place_of_performance.country_code || 'España'}
                      </div>
                    </div>
                    
                    {tender.place_of_performance.nuts_code && (
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {t('tenderDetail.nutsCode', 'NUTS Code')}
                        </div>
                        <div className="mt-1">
                          {tender.place_of_performance.nuts_code}
                        </div>
                      </div>
                    )}
                    
                    {/* Address */}
                    {tender.place_of_performance.address && hasContent(tender.place_of_performance.address) && (
                      <div className="md:col-span-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {t('tenderDetail.address', 'Address')}
                        </div>
                        <div className="mt-1">
                          {[
                            tender.place_of_performance.address.thoroughfare,
                            tender.place_of_performance.address.address_area,
                            tender.place_of_performance.address.post_code,
                            tender.place_of_performance.address.post_name,
                            tender.place_of_performance.address.admin_unit,
                            tender.place_of_performance.address.country_code
                          ].filter(Boolean).join(', ') || t('common.notSpecified', 'Not specified')}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            
            {/* Contract Terms Section */}
            {(tender.contract_term || tender.submission_term) && (
              <AccordionItem value="contracts">
                <AccordionTrigger className="text-base font-medium">
                  <span className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    {t('tenderDetail.sections.contractTerms', 'Contract Terms')}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-2">
                    {/* Contract Type */}
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {t('tenderDetail.contractType', 'Contract Type')}
                      </div>
                      <div className="mt-1">
                        {tender.contract_type || (tender.contract_term?.contract_nature_type &&
                         `${tender.contract_term.contract_nature_type}${tender.contract_term.additional_contract_nature ? 
                           ` (${tender.contract_term.additional_contract_nature})` : ''}`
                        ) || t('common.notSpecified', 'Not specified')}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            
            {/* CPV Categories Section */}
            {tender.purpose && (tender.purpose.main_classifications?.length > 0 || tender.purpose.additional_classifications?.length > 0) && (
              <AccordionItem value="classifications">
                <AccordionTrigger className="text-base font-medium">
                  <span className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    {t('tenderDetail.sections.classifications', 'Classifications')}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 mt-2">
                    {/* Additional Classifications */}
                    {tender.purpose.additional_classifications && tender.purpose.additional_classifications.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          {t('tenderDetail.additionalClassifications', 'Additional Classifications')}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tender.purpose.additional_classifications.map((cpv, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-100 dark:bg-gray-800">
                              {cpv}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Simplified Categories */}
                    {tender.cpv_categories && tender.cpv_categories.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          {t('tenderDetail.categories', 'Categories')}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tender.cpv_categories.map((category, index) => (
                            <Badge key={index} variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            
            {/* Lots Section */}
            {tender.lots && tender.lots.length > 1 && (
              <AccordionItem value="lots">
                <AccordionTrigger className="text-base font-medium">
                  <span className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    {t('tenderDetail.sections.lots', 'Lots')} ({tender.lots.length})
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 mt-2">
                    {tender.lots.map((lot, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                        <h4 className="font-medium mb-2">
                          {t('tenderDetail.lot', 'Lot')} {lot.id}: {lot.title || t('common.untitled', 'Untitled')}
                        </h4>
                        
                        {lot.description && (
                          <div className="mb-3 text-sm">
                            {lot.description}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          {lot.estimated_value && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">{t('tenderDetail.value', 'Value')}: </span>
                              {formatCurrency(lot.estimated_value)}
                            </div>
                          )}
                          
                          {lot.cpv_codes && lot.cpv_codes.length > 0 && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">{t('tenderDetail.cpvCodes', 'CPV Codes')}: </span>
                              {lot.cpv_codes.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            
            {/* Documents Section */}
            {tender.procurement_documents && tender.procurement_documents.length > 0 && (
              <AccordionItem value="documents">
                <AccordionTrigger className="text-base font-medium">
                  <span className="flex items-center">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    {t('tenderDetail.documents', 'Documents')} ({tender.procurement_documents.length})
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 mt-2">
                    {tender.procurement_documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border-b border-gray-100 dark:border-gray-800">
                        <div>
                          <div className="font-medium">{doc.title}</div>
                          <div className="text-xs text-gray-500">{doc.document_type}</div>
                        </div>
                        
                        {doc.access_url && (
                          <a 
                            href={doc.access_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {t('common.download', 'Download')}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            
            {/* Additional Information */}
            {tender.additional_information && (
              <AccordionItem value="additional">
                <AccordionTrigger className="text-base font-medium">
                  <span className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    {t('tenderDetail.additionalInformation', 'Additional Information')}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-2 whitespace-pre-wrap">
                    {tender.additional_information}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
          
          {/* AI Document Link */}
          {hasAiDocument && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center text-blue-600 dark:text-blue-400">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="font-medium">{t('aiDocument.title', 'AI-Generated Document')}</span>
              </div>
              <div className="mt-2">
                <a 
                  href={tender.aiDocument}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  {t('aiDocument.view', 'View AI-Generated Document')}
                </a>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TenderDetailsCard;
