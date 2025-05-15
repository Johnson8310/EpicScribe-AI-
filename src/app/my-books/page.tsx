
"use client";

import { useState, useEffect } from 'react';
import type { Book } from '@/types';
import BookCard from '@/components/BookCard';
import { BookCopy, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Helper to get initial books from localStorage
const getInitialBooks = (): Book[] => {
  if (typeof window === 'undefined') return [];
  const keys = Object.keys(localStorage);
  const bookKeys = keys.filter(key => key.startsWith('book-'));
  return bookKeys.map(key => JSON.parse(localStorage.getItem(key) as string)).sort((a,b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
};

export default function MyBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setBooks(getInitialBooks());
  }, []);

  // Re-fetch books if localStorage changes (e.g., new book created on dashboard or book deleted)
  useEffect(() => {
    const handleStorageChange = () => {
      setBooks(getInitialBooks());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      // Also listen for custom event from dashboard when a book is deleted,
      // as 'storage' event might not fire for same-page localStorage changes in all browsers.
      const handleBookListUpdate = () => setBooks(getInitialBooks());
      window.addEventListener('bookListUpdated', handleBookListUpdate);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('bookListUpdated', handleBookListUpdate);
      };
    }
  }, []);


  const handleDeleteBook = (bookId: string) => {
    if (typeof window !== 'undefined') {
      const bookToDelete = books.find(b => b.id === bookId);
      localStorage.removeItem(`book-${bookId}`);
      const updatedBooks = books.filter(b => b.id !== bookId);
      setBooks(updatedBooks);
      toast({
        title: "Book Deleted",
        description: `"${bookToDelete?.title || 'The book'}" has been successfully removed.`,
      });
      // Dispatch a custom event so other components (like dashboard) can update if necessary
      window.dispatchEvent(new CustomEvent('bookListUpdated'));
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BookCopy className="h-8 w-8 text-primary" />
          My Books
        </h1>
        <Button asChild>
            <Link href="/">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Book
            </Link>
        </Button>
      </div>

      {isClient && books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onDeleteBook={handleDeleteBook} />
          ))}
        </div>
      ) : (
        isClient && (
          <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
            <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-foreground">No books yet</h3>
            <p className="text-muted-foreground">
              You haven&apos;t created any books. Go to the{' '}
              <Link href="/" className="text-primary hover:underline">
                Dashboard
              </Link>{' '}
              to generate your first one!
            </p>
          </div>
        )
      )}
      {!isClient && (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">Loading your books...</p>
        </div>
      )}
    </div>
  );
}
