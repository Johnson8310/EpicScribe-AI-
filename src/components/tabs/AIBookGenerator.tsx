"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { generateBookChapters, type GenerateBookChaptersInput } from "@/ai/flows/generate-book-chapters";
import { generateCoverImage, type GenerateCoverImageInput } from "@/ai/flows/generate-cover-image";
import { addBook, updateBookCover } from "@/lib/firestore";
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

export default function AIBookGenerator() {
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

  const triggerImageGeneration = (bookId: string, title: string, genre: string) => {
    (async () => {
      try {
        const imageInput: GenerateCoverImageInput = { title, genre };
        const result = await generateCoverImage(imageInput);
        await updateBookCover(bookId, result.coverImageUrl);
      } catch (error) {
        console.error("Error generating cover image:", error);
        toast({
            title: "Cover Generation Failed",
            description: "Could not generate a cover image, but the book content is ready.",
            variant: "destructive"
        });
      }
    })();
  };


  async function onSubmit(data: BookGenerationFormData) {
    setIsGenerating(true);
    try {
      const aiInput: GenerateBookChaptersInput = {
        prompt: data.prompt,
        genre: data.genre,
        chapters: data.numChapters,
      };
      if (data.themes && data.themes.trim() !== "") {
        aiInput.prompt = `${data.prompt} Key themes: ${data.themes}.`;
      }
      
      const result = await generateBookChapters(aiInput);
      if (!result.chapters || result.chapters.length === 0) {
           throw new Error("AI did not return any chapters.");
      }

      const tempBookId = Date.now();
      const chapters: Omit<Chapter, 'id'>[] & { id: string }[] = result.chapters.map((content, index) => ({
          id: `${tempBookId}-chapter-${index + 1}`,
          title: `Chapter ${index + 1}`,
          content: content,
      }));

      const newBookData = {
        title: data.title,
        prompt: data.prompt,
        genre: data.genre,
        themes: data.themes,
        numChapters: data.numChapters,
        chapters: chapters,
        status: 'completed' as const,
        userId: 'local', // Since there's no user, we can use a placeholder
        coverImageUrl: `https://placehold.co/300x450.png?text=${encodeURIComponent(data.title.substring(0,15))}`,
      };
      
      const bookId = await addBook(newBookData);
      
      triggerImageGeneration(bookId, data.title, data.genre);

      toast({
        title: "Book Generated!",
        description: `"${data.title}" is ready. Generating cover image...`,
      });
      router.push(`/book/${bookId}`);
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

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Wand2 className="h-6 w-6 text-primary" />
          AI Book Generator
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
                  <FormLabel>Main Story Prompt</FormLabel>
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
                      <Input placeholder="e.g., Science Fiction, Fantasy" {...field} />
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
                    Comma-separated themes to guide the story.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                   Generate Book with AI
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
