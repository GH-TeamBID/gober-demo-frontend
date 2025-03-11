
import React from 'react';
import { AlertCircle, CheckCircle, Clock, Award } from 'lucide-react';
import { Tender } from '@/types/types';

interface TenderStatusIconProps {
  status: Tender['status'];
}

const TenderStatusIcon = ({ status }: TenderStatusIconProps) => {
  switch (status) {
    case 'Open':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'Closed':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'Under Review':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'Awarded':
      return <Award className="h-4 w-4 text-blue-500" />;
    default:
      return null;
  }
};

export default TenderStatusIcon;
