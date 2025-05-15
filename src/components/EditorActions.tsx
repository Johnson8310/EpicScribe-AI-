
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

export default function EditorActions({ currentChapter, onChapterRewrite }: EditorActionsProps) {
  const { toast } = useToast();
  const [isRewriteDialogOpen, setIsRewriteDialogOpen] = useState(false);
  const [rewriteInstructions, setRewriteInstructions] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);

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
            Rewrite Chapter
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Rewrite Chapter: {currentChapter?.title}</DialogTitle>
            <DialogDescription>
              Provide instructions for the AI on how you&apos;d like to rewrite this chapter.
              For example: &quot;Make this more concise&quot; or &quot;Add more dialogue between character A and B&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rewrite-instructions">Instructions</Label>
              <Textarea
                id="rewrite-instructions"
                placeholder="Enter rewrite instructions here..."
                value={rewriteInstructions}
                onChange={(e) => setRewriteInstructions(e.target.value)}
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
