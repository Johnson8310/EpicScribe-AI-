"use client";
import { useState, useEffect } from 'react';
import type { Book } from '@/types';
import BookGenerationForm from '@/components/BookGenerationForm';
import BookCard from '@/components/BookCard';
import { Separator } from '@/components/ui/separator';
import { FileText, PlusCircle } from 'lucide-react';

// Helper to get initial books from localStorage
const getInitialBooks = (): Book[] => {
  if (typeof window === 'undefined') return [];
  const keys = Object.keys(localStorage);
  const bookKeys = keys.filter(key => key.startsWith('book-'));
  return bookKeys.map(key => JSON.parse(localStorage.getItem(key) as string)).sort((a,b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
};

export default function DashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setBooks(getInitialBooks());
  }, []);
  
  const handleBookGenerated = (newBook: Book) => {
    // Add to local state, will also be in localStorage from BookGenerationForm
    setBooks(prevBooks => [newBook, ...prevBooks].sort((a,b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()));
  };

  return (
    <div className="container mx-auto py-2">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="lg:w-1/2 xl:w-2/5">
          <BookGenerationForm onBookGenerated={handleBookGenerated} />
        </div>
        
        <div className="lg:w-1/2 xl:w-3/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              My Recent Projects
            </h2>
            {/* Future "View All" button */}
          </div>

          {isClient && books.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {books.slice(0, 4).map((book) => ( // Show recent 4
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            isClient && (
              <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
                <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium text-foreground">No books yet</h3>
                <p className="text-muted-foreground">Start by generating your first book using the form.</p>
              </div>
            )
          )}
          {!isClient && (
             <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">Loading projects...</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
