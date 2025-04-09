import React from 'react';
import { useTranslation } from 'react-i18next';
import TenderStatusIcon from './TenderStatusIcon';
import { TenderStatus } from '@/types/types';
import { mapTenderStatus, getTenderStatusClass, getTenderStatusTranslationKey } from '@/utils/tenderStatusMapper';

interface TenderStatusBadgeProps {
  status: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const TenderStatusBadge = ({ 
  status, 
  size = 'md', 
  showIcon = true 
}: TenderStatusBadgeProps) => {
  const { t } = useTranslation('ui');
  
  // Map the status string to our standardized enum
  const mappedStatus = mapTenderStatus(status);
  const statusClass = getTenderStatusClass(mappedStatus);
  const translationKey = getTenderStatusTranslationKey(mappedStatus);
  
  // Determine size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1'
  };

  // Format the displayed text
  const displayText = t(translationKey, {
    defaultValue: status || 'Unknown'
  });

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap ${statusClass} ${sizeClasses[size]}`}
    >
      {showIcon && <TenderStatusIcon status={status} className={size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'} />}
      {displayText}
    </span>
  );
};

export default TenderStatusBadge; 