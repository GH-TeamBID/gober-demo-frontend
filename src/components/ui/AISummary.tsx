
import { useState, useRef } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AISummaryProps {
  aiSummary: string;
  onSave: (summary: string) => void;
}

const AISummary = ({ aiSummary, onSave }: AISummaryProps) => {
  const [summary, setSummary] = useState(aiSummary);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(summary);
    setIsSaving(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(e.target.value);
  };
  
  const handleTextareaFocus = () => {
    if (textareaRef.current) {
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      textareaRef.current.selectionEnd = textareaRef.current.value.length;
    }
  };
  
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };
  
  const wordCount = countWords(summary);
  const isOverLimit = wordCount > 200;
  
  return (
    <Card className="shadow-md border-gray-200 dark:border-gray-700 overflow-hidden h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">AI Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          ref={textareaRef}
          value={summary}
          onChange={handleChange}
          onFocus={handleTextareaFocus}
          placeholder="AI-generated summary will appear here (max 200 words)..."
          className="min-h-[200px] resize-y border-gray-200 focus:border-gober-accent-500 transition-all duration-200"
        />
        <div className={`text-xs mt-2 text-right ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
          {wordCount}/200 words {isOverLimit && '(over limit)'}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4 bg-gray-50 dark:bg-gober-primary-700/30">
        <Button
          size="sm"
          className="flex items-center gap-1 bg-gober-accent-500 hover:bg-gober-accent-600"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AISummary;
