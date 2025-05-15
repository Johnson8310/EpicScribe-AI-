import type { Chapter } from '@/types';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

interface ChapterItemProps {
  chapter: Chapter;
  isActive: boolean;
  onClick: () => void;
}

export default function ChapterItem({ chapter, isActive, onClick }: ChapterItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all w-full",
        "hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <FileText className="h-4 w-4" />
      {chapter.title}
    </button>
  );
}
