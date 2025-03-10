
import { useTenders } from '@/hooks/useTenders';
import Layout from '@/components/layout/Layout';
import TenderList from '@/components/ui/TenderList';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedTenders = () => {
  const {
    savedTenders,
    filters,
    sort,
    setFilters,
    setSort,
    toggleSaveTender,
  } = useTenders();
  
  const savedTenderIds = savedTenders.map(tender => tender.id);
  
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
          <h1 className="text-3xl font-bold text-gober-primary-900 dark:text-white">
            My Tenders
          </h1>
        </div>
        
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
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
              You haven't saved any tenders yet. Browse tenders and click the heart icon to save them.
            </p>
            <Link to="/">
              <Button className="bg-gober-accent-500 hover:bg-gober-accent-600">
                Browse Tenders
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SavedTenders;
