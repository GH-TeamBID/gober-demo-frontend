
import { useState, useRef } from 'react';
import { FileDown, Save, Edit, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Interface for reference data
interface Reference {
  id: string;
  text: string;
  link: string;
}

// Example reference data (in the future this would come from the backend)
const exampleReferences: Record<string, Reference> = {
  "1": {
    id: "ref-001",
    text: "The original document states: 'The contractor must provide all necessary equipment and materials required for the project.'",
    link: "https://example.gov/docs/tender-123.pdf"
  },
  "2": {
    id: "ref-002",
    text: "According to section 3.2: 'All work must comply with local building codes and regulations.'",
    link: "https://example.gov/docs/building-codes.pdf"
  },
  "3": {
    id: "ref-003",
    text: "The budget constraints are outlined in Appendix B: 'Total project cost not to exceed $500,000 including materials and labor.'",
    link: "https://example.gov/docs/budget-appendix.pdf"
  }
};

interface AIDocumentProps {
  aiDocument: string;
  onSave: (document: string) => void;
}

const AIDocument = ({
  aiDocument,
  onSave
}: AIDocumentProps) => {
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

  // Parse markdown text and render it properly
  const renderMarkdown = (text: string) => {
    if (!text) return null;

    // Convert markdown headings (# Heading)
    let formattedText = text.replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mt-4 mb-2">$1</h3>');
    formattedText = formattedText.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-medium mt-6 mb-3">$1</h2>');
    formattedText = formattedText.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-semibold mt-6 mb-4">$1</h1>');
    
    // Convert markdown lists
    formattedText = formattedText.replace(/^\* (.*$)/gm, '<li class="ml-6 list-disc">$1</li>');
    formattedText = formattedText.replace(/^\d+\. (.*$)/gm, '<li class="ml-6 list-decimal">$1</li>');
    
    // Convert bold and italic text
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert paragraphs (lines with content)
    formattedText = formattedText.replace(/^(?!<[hl]|<li)(.*$)/gm, function(match) {
      if (match.trim() === '') return '<br>';
      return '<p class="mb-3">' + match + '</p>';
    });
    
    // Group list items
    formattedText = formattedText.replace(/<li class="ml-6 list-disc">(.*?)<\/li>/g, function(match, p1) {
      return '<ul class="mb-4">' + match + '</ul>';
    }).replace(/<\/ul><ul class="mb-4">/g, '');
    
    formattedText = formattedText.replace(/<li class="ml-6 list-decimal">(.*?)<\/li>/g, function(match, p1) {
      return '<ol class="mb-4">' + match + '</ol>';
    }).replace(/<\/ol><ol class="mb-4">/g, '');

    return formattedText;
  };

  // Process document text to render references
  const renderDocumentWithReferences = () => {
    if (!document) return 'No AI document available for this tender.';

    // First, render the markdown
    let formattedText = renderMarkdown(document);

    // Then, process the references
    // Use regex to find reference patterns like [1], [2], etc.
    const parts = formattedText.split(/(\[\d+\])/);
    
    return parts.map((part, index) => {
      // Check if the part matches the reference pattern
      const refMatch = part.match(/\[(\d+)\]/);
      
      if (refMatch) {
        const refNumber = refMatch[1];
        const reference = exampleReferences[refNumber];
        
        if (reference) {
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a 
                    href={reference.link}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-0.5 text-gober-accent-500 hover:text-gober-accent-600 font-medium"
                  >
                    {part}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="text-xs">{reference.text}</p>
                  <p className="text-xs text-blue-500 mt-1">Click to view source document</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      }
      
      return part;
    });
  };

  // Helper function to safely render HTML from string
  const createMarkup = (html: string) => {
    return { __html: html };
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
          This document supports Markdown formatting for detailed tender analysis. References like [1] can be clicked to view source material.
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
          <div className="min-h-[400px] border rounded-md p-4 font-serif text-sm overflow-auto bg-gray-50 dark:bg-gray-900/30 prose prose-sm max-w-none">
            {typeof renderDocumentWithReferences() === 'string' ? (
              <div dangerouslySetInnerHTML={createMarkup(renderDocumentWithReferences() as string)} />
            ) : (
              renderDocumentWithReferences()
            )}
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
