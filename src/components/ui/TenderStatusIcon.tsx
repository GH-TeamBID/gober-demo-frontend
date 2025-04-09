import React from 'react';
import { AlertCircle, CheckCircle, Clock, Award, AlertTriangle, FileCheck, Calendar } from 'lucide-react';
import { TenderStatus } from '@/types/types';
import { mapTenderStatus } from '@/utils/tenderStatusMapper';

interface TenderStatusIconProps {
  status: string | null | undefined;
  className?: string;
}

const TenderStatusIcon = ({ status, className = "h-4 w-4" }: TenderStatusIconProps) => {
  // Map the status string to our standardized enum
  const mappedStatus = mapTenderStatus(status);

  switch (mappedStatus) {
    case TenderStatus.PRIOR_NOTICE:
      return <Calendar className={`${className} text-amber-500`} />;
    case TenderStatus.PUBLISHED:
      return <CheckCircle className={`${className} text-green-500`} />;
    case TenderStatus.EVALUATION:
      return <Clock className={`${className} text-blue-500`} />;
    case TenderStatus.AWARDED:
      return <Award className={`${className} text-purple-500`} />;
    case TenderStatus.SOLVED:
      return <FileCheck className={`${className} text-gray-500`} />;
    case TenderStatus.CANCELLED:
      return <AlertTriangle className={`${className} text-red-500`} />;
    default:
      return <AlertCircle className={`${className} text-gray-400`} />;
  }
};

export default TenderStatusIcon;
