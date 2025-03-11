
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenders } from '@/hooks/useTenders';
import Layout from '@/components/layout/Layout';
import TenderHeader from '@/components/tender/TenderHeader';
import TenderDetailTabs from '@/components/tender/TenderDetailTabs';
import TenderDetailSkeleton from '@/components/tender/TenderDetailSkeleton';
import { getStatusClass } from '@/utils/tenderUtils';

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
  
  if (isLoading || !tender) {
    return <TenderDetailSkeleton />;
  }
  
  return (
    <Layout>
      <div className="page-container">
        <TenderHeader title="Tender Details" />
        
        <TenderDetailTabs
          tender={tender}
          isTenderSaved={isTenderSaved}
          toggleSaveTender={toggleSaveTender}
          handleSaveAIDocument={handleSaveAIDocument}
          getStatusClass={getStatusClass}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </Layout>
  );
};

export default TenderDetail;
