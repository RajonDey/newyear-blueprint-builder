import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink, FileText } from "lucide-react";
import { generateNotionMarkdown } from "@/utils/notionTemplate";
import { CategoryGoal, LifeCategory } from "@/types/wizard";
import { toast } from "sonner";

// Placeholder URL - The developer (Rajon) needs to replace this with their actual public Notion template
const NOTION_TEMPLATE_URL = "https://rajon.notion.site/2026-In-Review-2b8a990090a0809dbd60f447462726ad"; 

interface NotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    userName: string;
    userEmail: string;
    goals: CategoryGoal[];
    primaryCategory: LifeCategory | null;
    secondaryCategories: LifeCategory[];
  };
}

export const NotionModal: React.FC<NotionModalProps> = ({ isOpen, onClose, data }) => {
  const [step, setStep] = useState(1);
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const markdown = generateNotionMarkdown(data);
      await navigator.clipboard.writeText(markdown);
      setHasCopied(true);
      toast.success("Blueprint copied to clipboard!");
      
      // Reset copy icon after 2 seconds
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Setup Notion Template
          </DialogTitle>
          <DialogDescription>
            Follow these simple steps to move your blueprint into Notion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Get Template */}
          <div className={`space-y-3 transition-opacity ${step === 1 ? 'opacity-100' : 'opacity-50'}`}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                1
              </div>
              <h3 className="font-semibold text-foreground">Get the Template</h3>
            </div>
            <div className="pl-11">
              <p className="text-sm text-muted-foreground mb-3">
                Open our master template and click "Duplicate" to add it to your Notion workspace.
              </p>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => {
                  window.open(NOTION_TEMPLATE_URL, '_blank');
                  setStep(2);
                }}
              >
                <ExternalLink className="w-4 h-4" />
                Open Notion Template
              </Button>
            </div>
          </div>

          {/* Step 2: Copy Blueprint */}
          <div className={`space-y-3 transition-opacity ${step === 2 ? 'opacity-100' : 'opacity-50'}`}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                2
              </div>
              <h3 className="font-semibold text-foreground">Copy Your Blueprint</h3>
            </div>
            <div className="pl-11">
              <p className="text-sm text-muted-foreground mb-3">
                Copy your personalized blueprint to paste into Notion.
              </p>
              <Button 
                className="w-full gap-2" 
                onClick={handleCopy}
                disabled={step < 2}
              >
                {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {hasCopied ? "Copied!" : "Copy Blueprint"}
              </Button>
            </div>
          </div>

          {/* Step 3: Paste */}
          <div className={`space-y-3 transition-opacity ${step === 2 ? 'opacity-100' : 'opacity-50'}`}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                3
              </div>
              <h3 className="font-semibold text-foreground">Paste into Notion</h3>
            </div>
            <div className="pl-11">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>1. In your duplicated template, create a <strong>new blank page</strong> (or use an existing one).</p>
                <p>2. Press <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs">Cmd/Ctrl + V</kbd> to paste your blueprint.</p>
                <p>3. Your goals will appear beautifully formatted with all details!</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
