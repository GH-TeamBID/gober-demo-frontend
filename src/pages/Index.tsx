import { useState } from 'react';
import { useTenders } from '@/contexts/TendersContext';
import Layout from '@/components/layout/Layout';
import SearchContainer from '@/components/ui/SearchContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TendersProvider } from '@/contexts/TendersContext';
import { useTranslation } from 'react-i18next';

const TendersContent = () => {
  const { t } = useTranslation('ui');
  const {
    savedTenderIds,
    setViewMode
  } = useTenders();
  
  const [activeTab, setActiveTab] = useState('all');
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'all') {
      setViewMode('all');
    } else if (value === 'saved') {
      setViewMode('saved');
    }
  };
  
  return (
    <Layout>
      <div className="page-container">
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-gober-primary-900 dark:text-white">
            {t('homepage.title')}
          </h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="glass-panel">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-gober-accent-500 data-[state=active]:text-white"
              >
                {t('tenderList.allTenders')}
              </TabsTrigger>
              <TabsTrigger 
                value="saved"
                className="data-[state=active]:bg-gober-accent-500 data-[state=active]:text-white"
              >
                {t('tenderList.savedTenders')}
                {savedTenderIds.size > 0 && (
                  <span className="ml-2 bg-white text-gober-accent-500 text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    {savedTenderIds.size}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="animate-fade-in mt-0">
            <SearchContainer />
          </TabsContent>
          
          <TabsContent value="saved" className="animate-fade-in mt-0">
            <SearchContainer />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

// Wrap the entire component with TendersProvider
const Index = () => {
  return (
    <TendersProvider>
      <TendersContent />
    </TendersProvider>
  );
};

export default Index;
