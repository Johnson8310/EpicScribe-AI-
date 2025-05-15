"use client";
import { Button } from "@/components/ui/button";
import { Download, FileUp, FileDown, FileArchive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EditorActions() {
  const { toast } = useToast();

  const handleExport = (format: string) => {
    toast({
      title: "Export Initiated (Demo)",
      description: `Exporting book as ${format}. This feature is not yet implemented.`,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => handleExport("PDF")}>
        <FileDown className="mr-2 h-4 w-4" />
        Export PDF
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport("EPUB")}>
        <FileUp className="mr-2 h-4 w-4" />
        Export EPUB
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport("DOCX")}>
        <FileArchive className="mr-2 h-4 w-4" />
        Export DOCX
      </Button>
    </div>
  );
}
