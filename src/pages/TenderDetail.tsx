
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenders } from '@/hooks/useTenders';
import Layout from '@/components/layout/Layout';
import TenderHeader from '@/components/tender/TenderHeader';
import TenderDetailTabs from '@/components/tender/TenderDetailTabs';
import TenderDetailSkeleton from '@/components/tender/TenderDetailSkeleton';
import { getStatusClass } from '@/utils/tenderUtils';

// Sample AI document with reference numbers
const sampleDocumentWithReferences = `# Tender Analysis Report

## Executive Summary

This tender for IT infrastructure upgrades has several key requirements that potential bidders should note. The primary goal is modernization of existing systems [1] while ensuring minimal disruption to day-to-day operations.

## Key Requirements

1. **Hardware Specifications**: All server equipment must meet or exceed the specifications outlined in the tender document [2].

2. **Software Compatibility**: Any proposed solutions must be compatible with existing database systems and security protocols [3].

3. **Budget Constraints**: The total project value cannot exceed the allocated budget of $750,000 including all materials and labor.

## Timeline and Milestones

The project is expected to be completed within 6 months of contract award, with key milestones as follows:

- Initial assessment and planning: 2 weeks
- Equipment procurement: 6 weeks
- Installation and configuration: 8 weeks
- Testing and quality assurance: 4 weeks
- Staff training and handover: 4 weeks

## Recommendations

Based on our analysis, we recommend focusing on cloud-compatible solutions that allow for future scalability.`;

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
    
    // If the tender doesn't have an AI document yet, add the sample one
    if (!tenderData.aiDocument) {
      const updatedTender = {
        ...tenderData,
        aiDocument: sampleDocumentWithReferences
      };
      updateTender(updatedTender);
      setTender(updatedTender);
    } else {
      setTender(tenderData);
    }
    
    setIsLoading(false);
  }, [id, getTenderById, navigate, updateTender]);
  
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
