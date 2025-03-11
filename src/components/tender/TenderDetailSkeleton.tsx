
import Layout from '@/components/layout/Layout';

const TenderDetailSkeleton = () => {
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
};

export default TenderDetailSkeleton;
