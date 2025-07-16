
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Book, Chapter } from '@/types';

const booksCollection = collection(db, 'books');

// Helper to convert Firestore timestamp to string, handling server and local timestamps
const convertTimestamp = (timestamp: Timestamp | Date): string => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  return timestamp.toISOString();
};


// Create a new book
export const addBook = async (bookData: Omit<Book, 'id' | 'lastModified' | 'chapters'> & { chapters: Omit<Chapter, 'id'>[] }): Promise<string> => {
  const docRef = await addDoc(booksCollection, {
    ...bookData,
    lastModified: serverTimestamp(),
  });
  return docRef.id;
};

// Get all books for a user
export const getBooksByUserId = async (userId: string): Promise<Book[]> => {
  const q = query(booksCollection, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      lastModified: data.lastModified ? convertTimestamp(data.lastModified) : new Date().toISOString(),
    } as Book;
  }).sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
};

// Get a single book by its ID
export const getBookById = async (bookId: string): Promise<Book | null> => {
    const docRef = doc(db, 'books', bookId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            ...data,
            id: docSnap.id,
            lastModified: data.lastModified ? convertTimestamp(data.lastModified) : new Date().toISOString(),
        } as Book;
    } else {
        return null;
    }
};

// Update a book's cover image
export const updateBookCover = async (bookId: string, coverImageUrl: string): Promise<void> => {
  const docRef = doc(db, 'books', bookId);
  await updateDoc(docRef, { coverImageUrl, lastModified: serverTimestamp() });
};


// Update a specific chapter's content
export const updateChapterContent = async (bookId: string, chapterId: string, newContent: string): Promise<void> => {
  const bookRef = doc(db, 'books', bookId);
  const bookSnap = await getDoc(bookRef);

  if (bookSnap.exists()) {
    const bookData = bookSnap.data() as Book;
    const updatedChapters = bookData.chapters.map(ch => 
      ch.id === chapterId ? { ...ch, content: newContent } : ch
    );
    await updateDoc(bookRef, { 
        chapters: updatedChapters,
        lastModified: serverTimestamp(),
    });
  } else {
    throw new Error('Book not found');
  }
};

// Delete a book
export const deleteBook = async (bookId: string): Promise<void> => {
  const docRef = doc(db, 'books', bookId);
  await deleteDoc(docRef);
};
