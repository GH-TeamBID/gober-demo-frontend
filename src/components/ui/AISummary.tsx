import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface AISummaryProps {
  aiSummary: string;
}

const AISummary = ({ aiSummary }: AISummaryProps) => {
  const { t } = useTranslation('ui');
  // Log the received prop value
  console.log("[AISummary] Rendering with aiSummary:", aiSummary);
  
  const wordCount = aiSummary.trim().split(/\s+/).filter(Boolean).length;
  
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
      <h3 className="text-base font-medium mb-3 flex items-center text-blue-700 dark:text-blue-300">
        <Sparkles className="h-4 w-4 mr-2" />
        <span>{t('aiSummary.title')}</span>
      </h3>
      {aiSummary ? (
        <>
          <p className="text-sm">{aiSummary}</p>
        </>
      ) : (
        <p className="text-gray-500 italic text-sm">{t('aiSummary.noSummary')}</p>
      )}
    </div>
  );
};

export default AISummary;
