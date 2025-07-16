
"use client";

import { useState, useEffect } from 'react';
import type { Book } from '@/types';
import BookCard from '@/components/BookCard';
import { BookCopy, PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getBooksByUserId, deleteBook } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Card } from '@/components/ui/card';

export default function MyBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchBooks(currentUser.uid);
      } else {
        setIsLoading(false);
        setBooks([]); // Clear books if user logs out
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchBooks = async (userId: string) => {
    setIsLoading(true);
    try {
      const userBooks = await getBooksByUserId(userId);
      setBooks(userBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast({
        title: "Error",
        description: "Could not fetch your books.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    const bookToDelete = books.find(b => b.id === bookId);
    try {
      await deleteBook(bookId);
      setBooks(prevBooks => prevBooks.filter(b => b.id !== bookId));
      toast({
        title: "Book Deleted",
        description: `"${bookToDelete?.title || 'The book'}" has been successfully removed.`,
      });
    } catch (error) {
      console.error("Error deleting book:", error);
      toast({
        title: "Error",
        description: "Could not delete the book.",
        variant: "destructive"
      });
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
            <Link href="/?tab=ai-generator" scroll={false}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Book
            </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : !user ? (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
          <h3 className="text-xl font-medium text-foreground">Please Sign In</h3>
          <p className="text-muted-foreground">
            <Link href="/signin" className="text-primary hover:underline">
              Sign in
            </Link> to see your saved books.
          </p>
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onDeleteBook={handleDeleteBook} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
          <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium text-foreground">No books yet</h3>
          <p className="text-muted-foreground">
            You haven&apos;t created any books. Go to the{' '}
            <Link href="/?tab=ai-generator" scroll={false} className="text-primary hover:underline">
              AI Book Generator
            </Link>{' '}
            to generate your first one!
          </p>
        </div>
      )}
    </div>
  );
}
