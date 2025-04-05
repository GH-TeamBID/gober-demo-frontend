import { useState, useRef, useEffect } from 'react';
import { FileDown, Save, Edit, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

interface AIDocumentProps {
  aiDocument: string;
  onSave: (document: string) => void;
  documentUrl?: string | null;
}

const AIDocument = ({
  aiDocument,
  onSave,
  documentUrl = null
}: AIDocumentProps) => {
  const [document, setDocument] = useState(aiDocument);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDocument(aiDocument);
  }, [aiDocument]);

  // Custom components for ReactMarkdown
  const markdownComponents = {
    p: ({ children }: { children: React.ReactNode }) => {
      if (typeof children === 'string') {
        // Replace [chunk...] patterns with icon
        const parts = children.split(/(\[chunk[^\]]*\])/g);
        
        return (
          <p>
            {parts.map((part, index) => {
              if (part.match(/\[chunk[^\]]*\]/)) {
                return (
                  <span 
                    key={index} 
                    className="inline-flex items-center text-gober-accent-500"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    {part}
                  </span>
                );
              }
              return part;
            })}
          </p>
        );
      }
      return <p>{children}</p>;
    }
  };

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
    const element = window.document.createElement('a');
    const file = new Blob([document], {
      type: 'text/plain'
    });
    element.href = URL.createObjectURL(file);
    element.download = `tender-document.${format}`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
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
        <CardTitle className="text-xl">AI Document</CardTitle>
        <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={toggleEditMode}>
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
            <ReactMarkdown components={markdownComponents}>
              {document || "No AI document available for this tender."}
            </ReactMarkdown>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 bg-gray-50 dark:bg-gober-primary-700/30">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleExport('docx')}>
            <FileDown className="h-4 w-4" />
            <span>DOCX</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleExport('pdf')}>
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
