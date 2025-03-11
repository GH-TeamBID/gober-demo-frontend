import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { useTenders } from '@/hooks/useTenders';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AISummary from '@/components/ui/AISummary';
import AIDocument from '@/components/ui/AIDocument';

const TenderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    getTenderById,
    updateTender,
    isTenderSaved,
    toggleSaveTender,
  } = useTenders();
  
  const [tender, setTender] = useState(getTenderById(id || ''));
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  
  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    
    const tenderData = getTenderById(id);
    if (!tenderData) {
      navigate('/');
      return;
    }
    
    setTender(tenderData);
    setIsLoading(false);
  }, [id, getTenderById, navigate]);
  
  const handleSaveAIDocument = (document: string) => {
    if (!tender) return;
    
    const updatedTender = {
      ...tender,
      aiDocument: document,
    };
    
    updateTender(updatedTender);
    setTender(updatedTender);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy');
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Open':
        return 'status-badge-open';
      case 'Closed':
        return 'status-badge-closed';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Awarded':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  if (isLoading || !tender) {
    return (
      <Layout>
        <div className="page-container">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="page-container">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gober-primary-900 dark:text-white">
            Tender Details
          </h1>
        </div>
        
        <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Tender Details</TabsTrigger>
            <TabsTrigger value="document">AI Document</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tender Details */}
              <div className="space-y-6">
                <Card className="overflow-hidden shadow-md border-gray-200 dark:border-gray-700">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="px-6 py-5 bg-gray-50 dark:bg-gober-primary-700/30 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Tender ID: {tender.id}
                        </div>
                        <h2 className="text-xl font-semibold mt-1 text-gober-primary-900 dark:text-white">
                          {tender.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`status-badge ${getStatusClass(tender.status)}`}>
                          {tender.status}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => toggleSaveTender(tender.id)}
                        >
                          <Heart
                            className={`h-5 w-5 transition-colors ${
                              isTenderSaved(tender.id)
                                ? 'fill-gober-accent-500 text-gober-accent-500'
                                : 'text-gray-400 hover:text-gober-accent-500'
                            }`}
                          />
                          <span className="sr-only">
                            {isTenderSaved(tender.id) ? 'Unsave' : 'Save'} tender
                          </span>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Description
                          </h3>
                          <p className="text-gober-primary-900 dark:text-white">
                            {tender.description}
                          </p>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Submit By
                            </h3>
                            <p className="text-gober-primary-900 dark:text-white font-medium">
                              {formatDate(tender.submitOn)}
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Budget
                            </h3>
                            <p className="text-gober-primary-900 dark:text-white font-medium">
                              {formatCurrency(tender.budget)}
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Organisation
                            </h3>
                            <p className="text-gober-primary-900 dark:text-white">
                              {tender.organisation}
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Location
                            </h3>
                            <p className="text-gober-primary-900 dark:text-white">
                              {tender.location}
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Contract Type
                            </h3>
                            <p className="text-gober-primary-900 dark:text-white">
                              {tender.contractType}
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Number of Lots
                            </h3>
                            <p className="text-gober-primary-900 dark:text-white">
                              {tender.lots}
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Category
                            </h3>
                            <p className="text-gober-primary-900 dark:text-white">
                              {tender.category}
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Last Updated
                            </h3>
                            <p className="text-gober-primary-900 dark:text-white">
                              {formatDate(tender.updatedOn)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* AI Summary */}
              <div>
                <AISummary aiSummary={tender.aiSummary || ''} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="document">
            <AIDocument 
              aiDocument={tender.aiDocument || ''} 
              onSave={handleSaveAIDocument} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TenderDetail;
