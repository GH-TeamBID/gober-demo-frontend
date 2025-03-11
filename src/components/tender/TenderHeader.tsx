
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TenderHeaderProps {
  title: string;
}

const TenderHeader = ({ title }: TenderHeaderProps) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Link to="/">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-gober-primary-900 dark:text-white">
        {title}
      </h1>
    </div>
  );
};

export default TenderHeader;
