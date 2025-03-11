
import { Tender } from '@/types/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TenderDetailsCard from './TenderDetailsCard';
import AIDocument from '@/components/ui/AIDocument';

interface TenderDetailTabsProps {
  tender: Tender;
  isTenderSaved: (id: string) => boolean;
  toggleSaveTender: (id: string) => void;
  handleSaveAIDocument: (document: string) => void;
  getStatusClass: (status: string) => string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TenderDetailTabs = ({
  tender,
  isTenderSaved,
  toggleSaveTender,
  handleSaveAIDocument,
  getStatusClass,
  activeTab,
  setActiveTab
}: TenderDetailTabsProps) => {
  return (
    <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="details">Tender Details</TabsTrigger>
        <TabsTrigger value="document">AI Document</TabsTrigger>
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
        <AIDocument 
          aiDocument={tender.aiDocument || ''} 
          onSave={handleSaveAIDocument} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default TenderDetailTabs;
