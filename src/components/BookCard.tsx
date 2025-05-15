
import Link from 'next/link';
import Image from 'next/image';
import type { Book } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Edit3, FileText, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BookCardProps {
  book: Book;
  onDeleteBook: (bookId: string) => void;
}

export default function BookCard({ book, onDeleteBook }: BookCardProps) {
  const formattedDate = new Date(book.lastModified).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <Image
          src={book.coverImageUrl || "https://placehold.co/300x450.png"}
          alt={`Cover for ${book.title}`}
          width={300}
          height={200} // Adjusted for aspect ratio, or make it more portrait like 450
          className="w-full h-48 object-cover"
          data-ai-hint="book cover"
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1 line-clamp-2">{book.title}</CardTitle>
        <Badge variant="outline" className="mb-2">{book.genre}</Badge>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3 mb-2">
          {book.prompt}
        </CardDescription>
        <div className="text-xs text-muted-foreground">
          <p>{book.numChapters} Chapters</p>
          <p>Last modified: {formattedDate}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-secondary/30 border-t flex items-center gap-2">
        <Link href={`/book/${book.id}`} passHref legacyBehavior className="flex-1">
          <Button variant="default" size="sm" className="w-full">
            <Edit3 className="mr-2 h-4 w-4" />
            Open Editor
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="px-3">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete Book</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the book
                &quot;{book.title}&quot; and all its chapters.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDeleteBook(book.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
