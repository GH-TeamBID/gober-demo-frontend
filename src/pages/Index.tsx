
import { useState } from 'react';
import { useTenders } from '@/hooks/useTenders';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/ui/SearchBar';
import TenderList from '@/components/ui/TenderList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const {
    allTenders,
    filteredTenders,
    savedTenders,
    isLoading,
    searchQuery,
    filters,
    sort,
    setSearchQuery,
    setFilters,
    setSort,
    toggleSaveTender,
    isTenderSaved,
  } = useTenders();
  
  const [activeTab, setActiveTab] = useState('all');
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const savedTenderIds = savedTenders.map(tender => tender.id);
  
  return (
    <Layout>
      <div className="page-container">
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-gober-primary-900 dark:text-white">
            Discover Tender Opportunities
          </h1>
          <SearchBar
            value={searchQuery}
            onSearch={setSearchQuery}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="glass-panel">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-gober-accent-500 data-[state=active]:text-white"
              >
                All Tenders
              </TabsTrigger>
              <TabsTrigger 
                value="saved"
                className="data-[state=active]:bg-gober-accent-500 data-[state=active]:text-white"
              >
                Saved Tenders
                {savedTenders.length > 0 && (
                  <span className="ml-2 bg-white text-gober-accent-500 text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    {savedTenders.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="animate-fade-in mt-0">
            <TenderList
              tenders={filteredTenders}
              isLoading={isLoading}
              savedTenderIds={savedTenderIds}
              sort={sort}
              filters={filters}
              onToggleSave={toggleSaveTender}
              onSort={setSort}
              onFilter={setFilters}
            />
          </TabsContent>
          
          <TabsContent value="saved" className="animate-fade-in mt-0">
            {savedTenders.length > 0 ? (
              <TenderList
                tenders={savedTenders}
                isLoading={false}
                savedTenderIds={savedTenderIds}
                sort={sort}
                filters={filters}
                onToggleSave={toggleSaveTender}
                onSort={setSort}
                onFilter={setFilters}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-lg font-medium mb-2">No saved tenders</div>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Save tenders by clicking the heart icon on tender cards.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Index;
