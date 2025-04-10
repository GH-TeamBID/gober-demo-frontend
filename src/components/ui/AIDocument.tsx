import React, { useState, useRef, useEffect, Fragment } from 'react';
import { FileDown, Save, Edit, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';

// Custom tooltip component with markdown support and adaptive positioning
interface ChunkTooltipProps {
  text: string;
  isVisible: boolean;
  maxChars?: number;
  position: {
    top: number;
    left: number;
    bottom: number;
    right: number; 
  };
  containerRef: React.RefObject<HTMLDivElement>;
}

const ChunkTooltip = ({ text, isVisible, maxChars = 500, position, containerRef }: ChunkTooltipProps) => {
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [placement, setPlacement] = useState<string>('top');

  useEffect(() => {
    if (isVisible && tooltipRef.current && containerRef.current) {
      const tooltip = tooltipRef.current;
      const container = containerRef.current;
      const tooltipRect = tooltip.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const spaceTop = position.top - containerRect.top;
      const spaceBottom = containerRect.bottom - position.bottom;
      const spaceLeft = position.left - containerRect.left;
      const spaceRight = containerRect.right - position.right;
      
      const spaces = [
        { direction: 'top', space: spaceTop },
        { direction: 'right', space: spaceRight },
        { direction: 'bottom', space: spaceBottom },
        { direction: 'left', space: spaceLeft },
      ];
      
      spaces.sort((a, b) => b.space - a.space);
      setPlacement(spaces[0].direction);
    }
  }, [isVisible, position, containerRef]);
  
  if (!isVisible) return null;

  const getTooltipStyles = () => {
    const baseStyles = {
      position: 'absolute',
      zIndex: 50,
      maxWidth: '280px',
      width: 'auto',
    } as React.CSSProperties;
    
    switch (placement) {
      case 'top': return { ...baseStyles, bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-8px)' };
      case 'right': return { ...baseStyles, left: '100%', top: '50%', transform: 'translateY(-50%) translateX(8px)' };
      case 'bottom': return { ...baseStyles, top: '100%', left: '50%', transform: 'translateX(-50%) translateY(8px)' };
      case 'left': return { ...baseStyles, right: '100%', top: '50%', transform: 'translateY(-50%) translateX(-8px)' };
      default: return baseStyles;
    }
  };
  
  const getArrowStyles = () => {
    const baseStyles = { position: 'absolute', width: '8px', height: '8px', backgroundColor: '#1f2937' } as React.CSSProperties;
    switch (placement) {
      case 'top': return { ...baseStyles, bottom: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' };
      case 'right': return { ...baseStyles, left: '-4px', top: '50%', transform: 'translateY(-50%) rotate(45deg)' };
      case 'bottom': return { ...baseStyles, top: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' };
      case 'left': return { ...baseStyles, right: '-4px', top: '50%', transform: 'translateY(-50%) rotate(45deg)' };
      default: return baseStyles;
    }
  };

  // Truncate text if it's longer than maxChars
  const truncatedText = text.length > maxChars ? `${text.substring(0, maxChars)}...` : text;

  // Define smaller heading components specifically for the tooltip markdown
  const tooltipMarkdownComponents = {
    h1: ({node, ...props}: any) => <h1 className="text-xs font-bold" {...props} />, 
    h2: ({node, ...props}: any) => <h2 className="text-[11px] font-bold" {...props} />, 
    h3: ({node, ...props}: any) => <h3 className="text-[10px] font-bold" {...props} />,
    h4: ({node, ...props}: any) => <h3 className="text-[10px] font-bold" {...props} />, 
    h5: ({node, ...props}: any) => <h3 className="text-[10px] font-bold" {...props} />, 
    h6: ({node, ...props}: any) => <h3 className="text-[10px] font-bold" {...props} />, 
    p: ({node, ...props}: any) => <p className="text-[10px] mb-1" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc list-inside text-[10px] mb-1" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal list-inside text-[10px] mb-1" {...props} />,
    li: ({node, ...props}: any) => <li className="text-[10px]" {...props} />,
  };

  return (
    <span 
      ref={tooltipRef} 
      className="bg-gray-800 text-white p-3 rounded shadow-lg text-[10px] min-w-[220px] absolute z-50"
      style={{
        ...getTooltipStyles(),
        maxWidth: '400px',
        maxHeight: '400px',
        width: 'fit-content',
        display: isVisible ? 'inline-block' : 'none'
      }}
    >
      <span className="relative markdown-content">
        <span style={getArrowStyles()}></span>
        <ReactMarkdown components={tooltipMarkdownComponents}>
          {truncatedText}
        </ReactMarkdown>
      </span>
    </span>
  );
};

// Define AIDocument Props Interface AFTER ChunkTooltip
interface AIDocumentProps {
  aiDocument: string;
  onSave: (document: string) => void;
  documentUrl?: string | null;
  chunkMap?: Map<string, string>;
  tenderId?: string; 
}

// Define AIDocument Component AFTER AIDocumentProps
const AIDocument = ({
  aiDocument,
  onSave,
  documentUrl = null,
  chunkMap = new Map(),
  tenderId = ""
}: AIDocumentProps) => {
  // State and Refs
  const [document, setDocument] = useState(aiDocument);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('ui');
  
  // Effect to update document state when prop changes
  useEffect(() => {
    setDocument(aiDocument);
  }, [aiDocument]);

  // Define ChunkReference Component INSIDE AIDocument scope
  const ChunkReference = ({ 
    chunkId, 
    chunkMap, 
    containerRef 
  }: { 
    chunkId: string; 
    chunkMap: Map<string, string>; 
    containerRef: React.RefObject<HTMLDivElement>;
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, bottom: 0, right: 0 });
    const refElement = useRef<HTMLSpanElement>(null);
    
    const chunkText = chunkMap.has(chunkId) ? chunkMap.get(chunkId) : `Reference not found: ${chunkId}`;
    
    const handleMouseEnter = () => {
      if (refElement.current) {
        const rect = refElement.current.getBoundingClientRect();
        setPosition({ top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right });
        setIsHovered(true);
      }
    };
    
    return (
      <span
        ref={refElement}
        className="inline-flex items-center text-gober-accent-500 cursor-help relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
      >
        <FileText className="h-4 w-4" />
        <ChunkTooltip 
          text={chunkText || 'Content not available'} 
          isVisible={isHovered}
          maxChars={500}
          position={position}
          containerRef={containerRef} // Pass containerRef down
        />
      </span>
    );
  }; // End of ChunkReference

  // Define markdownComponents INSIDE AIDocument scope, AFTER ChunkReference
  const markdownComponents = {
    p: ({ node, children, ...props }: any) => { 
      // Recursive helper function to process nodes within the paragraph
      const processNode = (nodeContent: React.ReactNode, keyPrefix: string = 'node'): React.ReactNode[] => {
        if (typeof nodeContent === 'string') {
          const chunksRegex = /\[chunk.*?\]/g; 
          
          const parts: React.ReactNode[] = [];
          let lastIndex = 0;
          let match;
          let partIndex = 0;

          while ((match = chunksRegex.exec(nodeContent)) !== null) {
            if (match.index > lastIndex) {
              // Push raw string instead of Fragment
              parts.push(nodeContent.slice(lastIndex, match.index));
            }

            const chunkReference = match[0];
            const chunkId = chunkReference.replace(/[\[\]]/g, ''); 

            if (!chunkId) {
              // Push raw string instead of Fragment
              parts.push(chunkReference);
            } else {
              parts.push(
                <ChunkReference
                  key={`${keyPrefix}-chunk-${partIndex++}-${chunkId}`}
                  chunkId={chunkId} 
                  chunkMap={chunkMap} 
                  containerRef={containerRef} 
                />
              );
            }
            lastIndex = match.index + match[0].length;
          }

          if (lastIndex < nodeContent.length) {
            // Push raw string instead of Fragment
            parts.push(nodeContent.slice(lastIndex));
          }
          
          // If parts array is empty, it means no chunks found in this string segment
          return parts.length > 0 ? parts : [nodeContent]; // Return original string if no chunks
          
        } else if (Array.isArray(nodeContent)) {
          // Process arrays recursively
          return nodeContent.flatMap((item, index) => processNode(item, `${keyPrefix}-arr-${index}`)).filter(Boolean); // Filter out null/undefined
        } else if (React.isValidElement(nodeContent)) {
          // Process React elements recursively
           if (nodeContent.props.children) {
               const processedChildren = processNode(nodeContent.props.children, `${keyPrefix}-${nodeContent.type}-${nodeContent.key || 'nokey'}`);
               // Filter out null/undefined results before cloning
               const validChildren = processedChildren.filter(child => child !== null && child !== undefined);
               // Use element's existing key if available, otherwise generate one
               const elementKey = nodeContent.key || `${keyPrefix}-elem-${nodeContent.type}`;
               try {
                 return [React.cloneElement(nodeContent, { key: elementKey }, ...validChildren)];
               } catch (error) {
                  console.error("Error cloning element:", error, nodeContent);
                  return [nodeContent]; // Return original if cloning fails
               }
           } else {
               return [nodeContent]; // Return element's as is if no children
           }
        }
        // Handle other types (null, boolean, etc.) by filtering them out
        return [];
      };

      // Process the paragraph's children using the recursive helper
      const processedChildren = processNode(children, 'p-root');
      // Filter out any top-level null/undefined results
      const validProcessedChildren = processedChildren.filter(child => child !== null && child !== undefined);

      // Return the paragraph element with processed children
      return <p>{validProcessedChildren}</p>; 
    },
    // Add renderer for list items (li) using the same logic
    li: ({ node, children, ...props }: any) => { 
      // Replicate the recursive helper function for list items
      const processNode = (nodeContent: React.ReactNode, keyPrefix: string = 'node'): React.ReactNode[] => {
        if (typeof nodeContent === 'string') {
          const chunksRegex = /\[chunk.*?\]/g; 
          const parts: React.ReactNode[] = [];
          let lastIndex = 0;
          let match;
          let partIndex = 0;

          while ((match = chunksRegex.exec(nodeContent)) !== null) {
            if (match.index > lastIndex) {
              // Push raw string instead of Fragment
              parts.push(nodeContent.slice(lastIndex, match.index));
            }
            const chunkReference = match[0];
            const chunkId = chunkReference.replace(/[\[\]]/g, ''); 
            if (!chunkId) {
              // Push raw string instead of Fragment
              parts.push(chunkReference);
            } else {
              parts.push(
                <ChunkReference
                  key={`${keyPrefix}-chunk-${partIndex++}-${chunkId}`}
                  chunkId={chunkId} 
                  chunkMap={chunkMap} 
                  containerRef={containerRef} 
                />
              );
            }
            lastIndex = match.index + match[0].length;
          }
          if (lastIndex < nodeContent.length) {
            // Push raw string instead of Fragment
            parts.push(nodeContent.slice(lastIndex));
          }
          return parts.length > 0 ? parts : [nodeContent];
        } else if (Array.isArray(nodeContent)) {
          return nodeContent.flatMap((item, index) => processNode(item, `${keyPrefix}-arr-${index}`)).filter(Boolean);
        } else if (React.isValidElement(nodeContent)) {
           if (nodeContent.props.children) {
               const processedChildren = processNode(nodeContent.props.children, `${keyPrefix}-${nodeContent.type}-${nodeContent.key || 'nokey'}`);
               const validChildren = processedChildren.filter(child => child !== null && child !== undefined);
               const elementKey = nodeContent.key || `${keyPrefix}-elem-${nodeContent.type}`;
               try {
                 return [React.cloneElement(nodeContent, { key: elementKey }, ...validChildren)];
               } catch (error) {
                  console.error("Error cloning element:", error, nodeContent);
                  return [nodeContent];
               }
           } else {
               return [nodeContent]; 
           }
        }
        return [];
      };
      // Process the list item's children
      const processedChildren = processNode(children, 'li-root');
      const validProcessedChildren = processedChildren.filter(child => child !== null && child !== undefined);
      // Return the list item element
      return <li>{validProcessedChildren}</li>; 
    },
  }; // End of markdownComponents
  
  // Define Handlers INSIDE AIDocument scope
  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(document);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleExport = (format: 'docx' | 'pdf') => {
    const element = window.document.createElement('a');
    const file = new Blob([document], { type: 'text/plain' });
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

  // Return JSX INSIDE AIDocument scope
  return (
    <Card className="shadow-md border-gray-200 dark:border-gray-700 overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-xl">{t('aiSummary.title', 'AI Document')}</CardTitle>
        <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={toggleEditMode}>
          {isEditing ? (
            <><Check className="h-4 w-4" /><span>{t('aiSummary.done', 'Done')}</span></>
          ) : (
            <><Edit className="h-4 w-4" /><span>{t('aiSummary.edit', 'Edit')}</span></>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {t('aiSummary.markdown_support')}
        </div>
        {isEditing ? (
          <Textarea 
            ref={textareaRef} // Use ref correctly
            value={document} 
            onChange={handleChange} 
            onFocus={handleTextareaFocus} 
            placeholder="AI-generated document will appear here. This supports markdown formatting..." 
            className="min-h-[400px] resize-y border-gray-200 focus:border-gober-accent-500 transition-all duration-200 font-mono" 
          />
        ) : (
          <div ref={containerRef} // Use ref correctly
               className="min-h-[400px] border rounded-md p-4 font-mono text-sm overflow-auto whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/30">
            <ReactMarkdown components={markdownComponents}>
              {document || "No AI document available for this tender."}
            </ReactMarkdown>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 bg-gray-50 dark:bg-gober-primary-700/30">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleExport('docx')}>
            <FileDown className="h-4 w-4" /><span>DOCX</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleExport('pdf')}>
            <FileDown className="h-4 w-4" /><span>PDF</span>
          </Button>
        </div>
        {isEditing && (
          <Button size="sm" className="flex items-center gap-1 bg-gober-accent-500 hover:bg-gober-accent-600" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4" /><span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}; // End of AIDocument Component

// Default export AFTER all definitions
export default AIDocument;
