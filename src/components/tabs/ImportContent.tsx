
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Book, Chapter } from "@/types";
import { addBook } from "@/lib/firestore";
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Import } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const importSchema = z.object({
  title: z.string().min(5, { message: "Book title must be at least 5 characters." }).max(100),
  genre: z.string().min(3, { message: "Genre must be at least 3 characters." }).max(50),
  customContent: z.string().min(20, { message: "Content must be at least 20 characters." }),
});

type ImportFormData = z.infer<typeof importSchema>;

// Helper to split custom content into chapters
const splitContentIntoChapters = (content: string): { title: string; content: string }[] => {
    const chapterRegex = /^(Chapter\s+(\d+|[IVXLCDM]+)|CHAPTER\s+(\d+|[IVXLCDM]+))/im;
    const parts = content.split(chapterRegex);

    const chapters: { title: string; content: string }[] = [];
    let currentContent = '';
    
    if (parts.length > 1 && parts[0].trim() !== '') {
        currentContent = parts[0].trim();
    }

    for (let i = 1; i < parts.length; i += 4) {
        const title = parts[i]?.trim();
        const chapterBody = parts[i + 3]?.trim();

        if (title && chapterBody) {
             if (currentContent) {
                chapters.push({ title: "Prologue", content: currentContent });
                currentContent = '';
            }
            chapters.push({ title, content: chapterBody });
        }
    }

    if (chapters.length === 0 && content.trim()) {
        chapters.push({ title: "Chapter 1", content: content.trim() });
    }

    return chapters;
};

export default function ImportContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);


  const form = useForm<ImportFormData>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      title: "",
      genre: "",
      customContent: "",
    },
  });

  async function onSubmit(data: ImportFormData) {
    if (!user) {
        toast({ title: "Not Signed In", description: "You must be signed in to import a book.", variant: "destructive"});
        router.push('/signin?redirect=/?tab=import-content');
        return;
    }

    setIsProcessing(true);
    try {
        const generatedChapters = splitContentIntoChapters(data.customContent);
        
        if (generatedChapters.length === 0) {
            throw new Error("Could not extract any chapters from the content.");
        }

        const tempBookId = Date.now();
        const chapters: Omit<Chapter, 'id'>[] & { id: string }[] = generatedChapters.map((ch, index) => ({
          id: `${tempBookId}-chapter-${index + 1}`,
          title: ch.title,
          content: ch.content,
        }));

        const newBookData = {
          title: data.title,
          prompt: data.customContent.substring(0, 500), // Use start of content as prompt
          genre: data.genre,
          numChapters: chapters.length,
          chapters: chapters,
          status: 'completed' as const,
          userId: user.uid,
          coverImageUrl: `https://placehold.co/300x450.png?text=${encodeURIComponent(data.title.substring(0,15))}`,
        };
        
        const bookId = await addBook(newBookData);

        toast({
          title: "Book Imported!",
          description: `"${data.title}" has been created from your content.`,
        });
        router.push(`/book/${bookId}`);

    } catch (error) {
      console.error("Error importing book:", error);
      toast({
        title: "Import Failed",
        description: "Could not create the book from your content. Please check it and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Import className="h-6 w-6 text-primary" />
          Import Your Content
        </CardTitle>
        <CardDescription>Paste your existing story to bring it into the editor.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book Title</FormLabel>
                  <FormControl>
                    <Input placeholder="The title of your existing work" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                      <Input placeholder="The genre of your work" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="customContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Book Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste your entire story or book content here. Use chapter headings like 'Chapter 1' or 'Chapter II' to automatically split your content."
                      className="min-h-[250px] font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The content will be split into chapters based on common headings.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isProcessing || !user}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : !user ? (
                "Sign In to Import Content"
              ) : (
                <>
                  <Import className="mr-2 h-4 w-4" />
                   Create Book from Content
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
