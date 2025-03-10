
import { useState, useRef } from 'react';
import { FileDown, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AIEditorProps {
  aiSummary: string;
  onSave: (summary: string) => void;
}

const AIEditor = ({ aiSummary, onSave }: AIEditorProps) => {
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
  
  const handleExport = (format: 'docx' | 'pdf') => {
    // In a real app, this would generate and download the file
    // For this demo, we'll just show how it would work
    
    const element = document.createElement('a');
    const file = new Blob([summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `tender-summary.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
  
  return (
    <Card className="shadow-md border-gray-200 dark:border-gray-700 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">AI Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          ref={textareaRef}
          value={summary}
          onChange={handleChange}
          onFocus={handleTextareaFocus}
          placeholder="AI-generated summary will appear here..."
          className="min-h-[200px] resize-y border-gray-200 focus:border-gober-accent-500 transition-all duration-200"
        />
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 bg-gray-50 dark:bg-gober-primary-700/30">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => handleExport('docx')}
          >
            <FileDown className="h-4 w-4" />
            <span>DOCX</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => handleExport('pdf')}
          >
            <FileDown className="h-4 w-4" />
            <span>PDF</span>
          </Button>
        </div>
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

export default AIEditor;
