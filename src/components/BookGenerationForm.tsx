"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { generateBookChapters, type GenerateBookChaptersInput } from "@/ai/flows/generate-book-chapters";
import type { Book, Chapter } from "@/types";

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
import { Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const bookGenerationSchema = z.object({
  title: z.string().min(5, { message: "Book title must be at least 5 characters." }).max(100),
  prompt: z.string().min(10, { message: "Prompt must be at least 10 characters." }).max(1000),
  genre: z.string().min(3, { message: "Genre must be at least 3 characters." }).max(50),
  themes: z.string().optional(),
  numChapters: z.coerce.number().min(1, { message: "Number of chapters must be at least 1." }).max(50, { message: "Maximum 50 chapters." }),
});

type BookGenerationFormData = z.infer<typeof bookGenerationSchema>;

interface BookGenerationFormProps {
  onBookGenerated: (book: Book) => void;
}

export default function BookGenerationForm({ onBookGenerated }: BookGenerationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<BookGenerationFormData>({
    resolver: zodResolver(bookGenerationSchema),
    defaultValues: {
      title: "",
      prompt: "",
      genre: "",
      themes: "",
      numChapters: 5,
    },
  });

  async function onSubmit(data: BookGenerationFormData) {
    setIsGenerating(true);
    try {
      const aiInput: GenerateBookChaptersInput = {
        prompt: data.prompt,
        genre: data.genre,
        chapters: data.numChapters,
      };
      // Add themes to prompt if provided
      if (data.themes && data.themes.trim() !== "") {
        aiInput.prompt = `${data.prompt} Key themes: ${data.themes}.`;
      }
      
      const result = await generateBookChapters(aiInput);

      if (result.chapters && result.chapters.length > 0) {
        const newBookId = Date.now().toString(); // Simple unique ID for client-side
        const chapters: Chapter[] = result.chapters.map((content, index) => ({
          id: `${newBookId}-chapter-${index + 1}`,
          title: `Chapter ${index + 1}`,
          content: content,
        }));

        const newBook: Book = {
          id: newBookId,
          title: data.title,
          prompt: data.prompt,
          genre: data.genre,
          themes: data.themes,
          numChapters: data.numChapters,
          chapters: chapters,
          status: 'completed',
          lastModified: new Date().toISOString(),
          coverImageUrl: `https://placehold.co/300x450.png?text=${encodeURIComponent(data.title.substring(0,15))}`,
        };
        
        onBookGenerated(newBook); // Callback to update parent state

        // Store in localStorage for editor page to pick up (simple state persistence)
        localStorage.setItem(`book-${newBook.id}`, JSON.stringify(newBook));

        toast({
          title: "Book Generated!",
          description: `"${data.title}" is ready. Redirecting to editor...`,
        });
        router.push(`/book/${newBook.id}`);
      } else {
        throw new Error("AI did not return any chapters.");
      }
    } catch (error) {
      console.error("Error generating book:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate the book. Please try again.",
        variant: "destructive",
      });
      form.setError("prompt", { type: "manual", message: "AI generation failed. Please check your prompt or try again later."});
    } finally {
      setIsGenerating(false);
    }
  }
  
  // Ensure Math.random() or new Date() are not used during server render for default values if needed
  // For example, if numChapters had a random default, it would need useEffect. Here it's static.

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Wand2 className="h-6 w-6 text-primary" />
          Create New Book
        </CardTitle>
        <CardDescription>Fill in the details below to generate your next bestseller with AI.</CardDescription>
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
                    <Input placeholder="e.g., The Last Stargazer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Prompt / Idea</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the core story, main characters, and plot points..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The more detailed your prompt, the better the AI can tailor the story.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Science Fiction, Fantasy, Romance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numChapters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Chapters</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="themes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Themes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Redemption, Betrayal, Hope" {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma-separated themes to guide the AI.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Book
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
