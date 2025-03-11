
import { useState, useRef } from 'react';
import { FileDown, Save, Edit, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AIDocumentProps {
  aiDocument: string;
  onSave: (document: string) => void;
}

const AIDocument = ({ aiDocument, onSave }: AIDocumentProps) => {
  const [document, setDocument] = useState(aiDocument);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(document);
    setIsSaving(false);
    setIsEditing(false);
  };
  
  const handleExport = (format: 'docx' | 'pdf') => {
    // In a real app, this would generate and download the file
    const element = document.createElement('a');
    const file = new Blob([document], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `tender-document.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocument(e.target.value);
  };
  
  const handleTextareaFocus = () => {
    if (textareaRef.current) {
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      textareaRef.current.selectionEnd = textareaRef.current.value.length;
    }
  };
  
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };
  
  return (
    <Card className="shadow-md border-gray-200 dark:border-gray-700 overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-xl">AI Document (Markdown Format)</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={toggleEditMode}
        >
          {isEditing ? (
            <>
              <Check className="h-4 w-4" />
              <span>Done</span>
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          This document supports Markdown formatting for detailed tender analysis.
        </div>
        {isEditing ? (
          <Textarea
            ref={textareaRef}
            value={document}
            onChange={handleChange}
            onFocus={handleTextareaFocus}
            placeholder="AI-generated document will appear here. This supports markdown formatting..."
            className="min-h-[400px] resize-y border-gray-200 focus:border-gober-accent-500 transition-all duration-200 font-mono"
          />
        ) : (
          <div className="min-h-[400px] border rounded-md p-4 font-mono text-sm overflow-auto whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/30">
            {document ? document : 'No AI document available for this tender.'}
          </div>
        )}
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
        {isEditing && (
          <Button
            size="sm"
            className="flex items-center gap-1 bg-gober-accent-500 hover:bg-gober-accent-600"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AIDocument;
