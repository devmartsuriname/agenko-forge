import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Quote, 
  Code, 
  Minus,
  Image,
  Paperclip,
  Type
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MediaPicker } from '@/components/media/MediaPicker';

interface RichEditorProps {
  content: string;
  onChange: (content: string) => void;
  onInsertToken?: (token: string) => void;
}

const TOOLBAR_BUTTONS = [
  { icon: Bold, label: 'Bold', tag: 'strong' },
  { icon: Italic, label: 'Italic', tag: 'em' },
  { icon: Underline, label: 'Underline', tag: 'u' },
  { icon: List, label: 'Bullet List', tag: 'ul' },
  { icon: ListOrdered, label: 'Numbered List', tag: 'ol' },
  { icon: Quote, label: 'Quote', tag: 'blockquote' },
  { icon: Code, label: 'Code', tag: 'code' },
  { icon: Minus, label: 'Divider', tag: 'hr' }
];

const COMMON_TOKENS = [
  { name: 'client_name', label: 'Client Name' },
  { name: 'client_company', label: 'Company' },
  { name: 'total_amount', label: 'Total Amount' },
  { name: 'expires_at', label: 'Expires At' },
  { name: 'sender_name', label: 'Sender Name' },
  { name: 'proposal_link', label: 'Proposal Link' }
];

export function RichEditor({ content, onChange, onInsertToken }: RichEditorProps) {
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const insertFormatting = (tag: string) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    
    let formattedText = '';
    switch (tag) {
      case 'strong':
        formattedText = `<strong>${selectedText || 'Bold text'}</strong>`;
        break;
      case 'em':
        formattedText = `<em>${selectedText || 'Italic text'}</em>`;
        break;
      case 'u':
        formattedText = `<u>${selectedText || 'Underlined text'}</u>`;
        break;
      case 'ul':
        formattedText = `<ul><li>List item</li></ul>`;
        break;
      case 'ol':
        formattedText = `<ol><li>List item</li></ol>`;
        break;
      case 'blockquote':
        formattedText = `<blockquote>${selectedText || 'Quote text'}</blockquote>`;
        break;
      case 'code':
        formattedText = `<code>${selectedText || 'Code text'}</code>`;
        break;
      case 'hr':
        formattedText = '<hr>';
        break;
      default:
        formattedText = selectedText;
    }
    
    onChange(content + formattedText);
  };

  const insertLink = () => {
    if (linkText && linkUrl) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      onChange(content + linkHtml);
      setLinkText('');
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const handleImageSelect = (media: { url: string; alt: string; width?: number; height?: number }) => {
    const imageHtml = `<img src="${media.url}" alt="${media.alt}" style="max-width: 100%; height: auto;" />`;
    onChange(content + imageHtml);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/50">
        {TOOLBAR_BUTTONS.map(({ icon: Icon, label, tag }) => (
          <Button
            key={tag}
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting(tag)}
            title={label}
            className="h-8 w-8 p-1"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLinkDialog(true)}
          title="Insert Link"
          className="h-8 w-8 p-1"
        >
          <Link className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMediaPicker(true)}
          title="Insert Image"
          className="h-8 w-8 p-1"
        >
          <Image className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTokenDialog(true)}
          title="Insert Variable"
          className="h-8 px-2"
        >
          <Type className="h-4 w-4 mr-1" />
          Variable
        </Button>
      </div>

      {/* Editor */}
      <Textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start writing your proposal content..."
        className="min-h-[400px] font-mono text-sm"
      />

      {/* Live Preview */}
      <Card className="p-4">
        <h4 className="font-medium mb-2">Preview:</h4>
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </Card>

      {/* Token Dialog */}
      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Variable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a variable to insert into your content:
            </p>
            <div className="flex flex-wrap gap-2">
              {COMMON_TOKENS.map(token => (
                <Badge
                  key={token.name}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => {
                    onInsertToken?.(token.name);
                    setShowTokenDialog(false);
                  }}
                >
                  {token.label}
                </Badge>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-text">Link Text</Label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Click here"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                Cancel
              </Button>
              <Button onClick={insertLink}>
                Insert Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Picker */}
      <MediaPicker
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
        onSelect={handleImageSelect}
        uploadPath="proposals/"
      />
    </div>
  );
}