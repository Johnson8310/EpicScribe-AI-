"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Book, Chapter } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import ChapterItem from '@/components/ChapterItem';
import EditorActions from '@/components/EditorActions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Save, Edit3, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBookById, updateChapterContent } from '@/lib/firestore';

export default function BookEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const bookId = params.bookId as string;

  const [book, setBook] = useState<Book | null>(null);
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (bookId) {
      const fetchBook = async () => {
        setIsLoading(true);
        try {
          const fetchedBook = await getBookById(bookId);
          if (fetchedBook) {
            setBook(fetchedBook);
            if (fetchedBook.chapters && fetchedBook.chapters.length > 0) {
              const firstChapter = fetchedBook.chapters[0];
              setCurrentChapterId(firstChapter.id);
              setEditedContent(firstChapter.content);
            }
          } else {
            toast({ title: "Error", description: "Book not found.", variant: "destructive" });
            router.push('/'); // Redirect if book not found
          }
        } catch (error) {
          console.error("Error fetching book: ", error);
          toast({ title: "Error", description: "Could not load the book.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchBook();
    }
  }, [bookId, router, toast]);

  const handleChapterSelect = (chapterId: string) => {
    setCurrentChapterId(chapterId);
    const chapter = book?.chapters.find(c => c.id === chapterId);
    if (chapter) {
      setEditedContent(chapter.content);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
  };

  const handleSaveChanges = async () => {
    if (!book || !currentChapterId) return;
    setIsSaving(true);
    
    try {
      await updateChapterContent(book.id, currentChapterId, editedContent);
      
      // Update local state to reflect changes immediately
      const updatedChapters = book.chapters.map(ch =>
        ch.id === currentChapterId ? { ...ch, content: editedContent } : ch
      );
      setBook(prevBook => prevBook ? { ...prevBook, chapters: updatedChapters, lastModified: new Date().toISOString() } : null);

      toast({
          title: "Chapter Saved!",
          description: `${book.chapters.find(c=>c.id === currentChapterId)?.title} has been updated.`,
      });
    } catch (error) {
        console.error("Error saving chapter:", error);
        toast({ title: "Error", description: "Could not save chapter changes.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  const handleChapterRewrite = (rewrittenContent: string) => {
    setEditedContent(rewrittenContent);
    toast({
      title: "Editor Updated",
      description: "Chapter content in the editor has been updated. Review and save your changes.",
      variant: "default"
    });
  };
  
  const currentChapter = book?.chapters.find(c => c.id === currentChapterId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-var(--header-height,4rem))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-var(--header-height,4rem))]">
        <p className="text-xl text-muted-foreground">Book not found or could not be loaded.</p>
        <Button onClick={() => router.push('/')} variant="link" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-var(--header-height,4rem)-2*theme(spacing.8))]">
      <header className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="mb-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Edit3 className="h-6 w-6 text-primary" />
                Editing: {book.title}
            </h1>
        </div>
        <EditorActions currentChapter={currentChapter} onChapterRewrite={handleChapterRewrite} />
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 overflow-hidden">
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-lg">Chapters</CardTitle>
          </CardHeader>
          <CardContent className="p-2 flex-1 overflow-y-auto">
            <ScrollArea className="h-full">
              <nav className="flex flex-col gap-1">
                {book.chapters.map(chapter => (
                  <ChapterItem
                    key={chapter.id}
                    chapter={chapter}
                    isActive={chapter.id === currentChapterId}
                    onClick={() => handleChapterSelect(chapter.id)}
                  />
                ))}
              </nav>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{currentChapter?.title || "Select a Chapter"}</CardTitle>
            <Button size="sm" onClick={handleSaveChanges} disabled={isSaving || !currentChapter}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Chapter
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {currentChapter ? (
              <Textarea
                value={editedContent}
                onChange={handleContentChange}
                className="h-full w-full resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 text-base"
                placeholder="Chapter content will appear here..."
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a chapter to view or edit its content.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
