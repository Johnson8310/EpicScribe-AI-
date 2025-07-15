
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, FileUp, FileArchive, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Chapter } from "@/types";
import { summarizeAndRewriteChapter, type SummarizeAndRewriteChapterInput } from "@/ai/flows/summarize-and-rewrite-chapter";

interface EditorActionsProps {
  currentChapter: Chapter | undefined;
  onChapterRewrite: (rewrittenContent: string) => void;
}

// Function to trigger download of a text file
const downloadTextFile = (filename: string, text: string) => {
  const element = document.createElement("a");
  const file = new Blob([text], {type: 'text/plain;charset=utf-8'});
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
  URL.revokeObjectURL(element.href); // Clean up
  document.body.removeChild(element);
};

const advancedTools = [
  { value: 'expand', label: 'Expand', description: 'Make this chapter longer and more detailed.' },
  { value: 'shorten', label: 'Shorten', description: 'Condense this chapter to its key points.' },
  { value: 'improve-flow', label: 'Improve Flow', description: 'Enhance transitions and pacing for a smoother read.' },
  { value: 'increase-suspense', label: 'Increase Suspense', description: 'Add more tension and intrigue.' },
  { value: 'add-dialogue', label: 'Add Dialogue', description: 'Introduce or expand dialogue between characters.' },
];

export default function EditorActions({ currentChapter, onChapterRewrite }: EditorActionsProps) {
  const { toast } = useToast();
  const [isRewriteDialogOpen, setIsRewriteDialogOpen] = useState(false);
  const [rewriteInstructions, setRewriteInstructions] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [selectedTool, setSelectedTool] = useState('');


  const handleExport = (format: "PDF" | "DOCX" | "EPUB") => {
    const chapterContent = currentChapter?.content;
    const chapterTitle = currentChapter?.title;

    if (!chapterContent || !chapterTitle) {
      toast({
        title: "Cannot Export",
        description: "No chapter selected or content is empty.",
        variant: "destructive",
      });
      return;
    }

    const sanitizedTitle = chapterTitle.replace(/[^a-z0-9_.-]+/gi, '_').replace(/_{2,}/g, '_');
    const baseFilename = sanitizedTitle || "chapter";
    let exportFilename = `${baseFilename}.txt`;
    let placeholderFormat = "";

    switch(format) {
      case "PDF":
        exportFilename = `${baseFilename}_pdf_export.txt`;
        placeholderFormat = "PDF";
        break;
      case "DOCX":
        exportFilename = `${baseFilename}_docx_export.txt`;
        placeholderFormat = "DOCX";
        break;
      case "EPUB":
        exportFilename = `${baseFilename}_epub_export.txt`;
        placeholderFormat = "EPUB";
        break;
    }

    downloadTextFile(exportFilename, chapterContent);
    toast({
      title: "Demo Export Successful",
      description: `Chapter "${chapterTitle}" downloaded as TXT (${placeholderFormat} placeholder). Full ${placeholderFormat} export is not yet implemented.`,
    });
  };
  
  const handleToolSelect = (value: string) => {
    setSelectedTool(value);
    const tool = advancedTools.find(t => t.value === value);
    if(tool) {
      setRewriteInstructions(tool.description);
    } else {
      setRewriteInstructions('');
    }
  }

  const handleRewriteSubmit = async () => {
    if (!currentChapter || !rewriteInstructions.trim()) {
      toast({
        title: "Rewrite Error",
        description: "Chapter content or rewrite instructions are missing.",
        variant: "destructive",
      });
      return;
    }
    setIsRewriting(true);
    try {
      const input: SummarizeAndRewriteChapterInput = {
        chapterContent: currentChapter.content,
        instructions: rewriteInstructions,
      };
      const result = await summarizeAndRewriteChapter(input);
      onChapterRewrite(result.rewrittenChapter);
      toast({
        title: "Chapter Rewritten!",
        description: "The chapter content has been updated with the AI's suggestions.",
      });
      setIsRewriteDialogOpen(false); // Close dialog on success
      setRewriteInstructions(""); // Clear instructions
      setSelectedTool(''); // Reset tool selection
    } catch (error) {
      console.error("Error rewriting chapter:", error);
      toast({
        title: "Rewrite Failed",
        description: "Could not rewrite the chapter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isRewriteDialogOpen} onOpenChange={setIsRewriteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={!currentChapter || isRewriting}>
            <Sparkles className="mr-2 h-4 w-4" />
            AI Editing Tools
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>AI Editing Tools: {currentChapter?.title}</DialogTitle>
            <DialogDescription>
              Select a tool or provide custom instructions for the AI on how to rewrite this chapter.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="advanced-tool-select">Select a Tool (Optional)</Label>
               <Select onValueChange={handleToolSelect} value={selectedTool}>
                <SelectTrigger id="advanced-tool-select" disabled={isRewriting}>
                  <SelectValue placeholder="Choose a preset editing tool..." />
                </SelectTrigger>
                <SelectContent>
                  {advancedTools.map(tool => (
                    <SelectItem key={tool.value} value={tool.value}>{tool.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rewrite-instructions">Or Write Custom Instructions</Label>
              <Textarea
                id="rewrite-instructions"
                placeholder="e.g., &quot;Make this more concise&quot; or &quot;Add more dialogue between character A and B&quot;."
                value={rewriteInstructions}
                onChange={(e) => {
                  setRewriteInstructions(e.target.value);
                  setSelectedTool(''); // Clear selected tool if typing custom instructions
                }}
                className="min-h-[100px]"
                disabled={isRewriting}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isRewriting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleRewriteSubmit} disabled={isRewriting || !rewriteInstructions.trim()}>
              {isRewriting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Rewrite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="outline" size="sm" onClick={() => handleExport("PDF")} disabled={!currentChapter}>
        <FileDown className="mr-2 h-4 w-4" />
        Export PDF
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport("EPUB")} disabled={!currentChapter}>
        <FileUp className="mr-2 h-4 w-4" />
        Export EPUB
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport("DOCX")} disabled={!currentChapter}>
        <FileArchive className="mr-2 h-4 w-4" />
        Export DOCX
      </Button>
    </div>
  );
}
