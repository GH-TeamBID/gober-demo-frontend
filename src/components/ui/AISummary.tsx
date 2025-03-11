
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AISummaryProps {
  aiSummary: string;
}

const AISummary = ({ aiSummary }: AISummaryProps) => {
  const wordCount = aiSummary.trim().split(/\s+/).filter(Boolean).length;
  
  return (
    <Card className="shadow-md border-gray-200 dark:border-gray-700 overflow-hidden h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-xl">AI Summary</CardTitle>
        <Sparkles className="h-5 w-5 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="bg-orange-50 dark:bg-amber-950/20 rounded-md p-4 text-gray-800 dark:text-gray-200 min-h-[200px] border border-orange-100 dark:border-amber-900/30">
          {aiSummary ? (
            <p>{aiSummary}</p>
          ) : (
            <p className="text-gray-500 italic">No AI summary available for this tender.</p>
          )}
        </div>
        <div className="text-xs mt-2 text-right text-gray-500">
          {wordCount} words {wordCount > 200 && <span className="text-amber-500">(recommended: 200 words max)</span>}
        </div>
      </CardContent>
    </Card>
  );
};

export default AISummary;
