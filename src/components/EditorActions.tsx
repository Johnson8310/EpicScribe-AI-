
"use client";
import { Button } from "@/components/ui/button";
import { FileDown, FileUp, FileArchive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Chapter } from "@/types";

interface EditorActionsProps {
  currentChapter: Chapter | undefined;
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

export default function EditorActions({ currentChapter }: EditorActionsProps) {
  const { toast } = useToast();

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

  return (
    <div className="flex items-center gap-2">
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
