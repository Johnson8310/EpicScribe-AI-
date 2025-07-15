
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { generateBookChapters, type GenerateBookChaptersInput } from "@/ai/flows/generate-book-chapters";
import { generateCoverImage, type GenerateCoverImageInput } from "@/ai/flows/generate-cover-image";
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
import { Loader2, Wand2, ImageUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const bookGenerationSchema = z.object({
  title: z.string().min(5, { message: "Book title must be at least 5 characters." }).max(100),
  prompt: z.string().min(10, { message: "Prompt must be at least 10 characters." }).max(1000),
  genre: z.string().min(3, { message: "Genre must be at least 3 characters." }).max(50),
  themes: z.string().optional(),
  numChapters: z.coerce.number().min(1, { message: "Number of chapters must be at least 1." }).max(50, { message: "Maximum 50 chapters." }),
  imagePrompt: z.string().optional(),
  image: z.any().optional(), // For file upload
});

type BookGenerationFormData = z.infer<typeof bookGenerationSchema>;

interface BookGenerationFormProps {
  onBookGenerated: (book: Book) => void;
}

// Helper to convert file to data URI
const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function BookGenerationForm({ onBookGenerated }: BookGenerationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const form = useForm<BookGenerationFormData>({
    resolver: zodResolver(bookGenerationSchema),
    defaultValues: {
      title: "",
      prompt: "",
      genre: "",
      themes: "",
      numChapters: 5,
      imagePrompt: "",
    },
  });

  const triggerImageGeneration = (book: Book, imageDataUri: string | null = null) => {
    // Don't wait for this to finish. It runs in the background.
    (async () => {
      try {
        const imageInput: GenerateCoverImageInput = {
          title: book.title,
          genre: book.genre,
          prompt: book.imagePrompt,
          imageDataUri: imageDataUri ?? undefined
        };
        const result = await generateCoverImage(imageInput);
        const updatedBook: Book = { ...book, coverImageUrl: result.coverImageUrl };
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(`book-${book.id}`, JSON.stringify(updatedBook));
          // Dispatch event to notify other components of the update
          window.dispatchEvent(new CustomEvent('bookListUpdated'));
        }
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
    let uploadedImageDataUri: string | null = null;
    try {
        if (data.image && data.image[0]) {
            if (data.image[0].size > 4 * 1024 * 1024) { // 4MB limit
                 toast({
                    title: "Image Too Large",
                    description: "Please upload an image smaller than 4MB.",
                    variant: "destructive",
                });
                setIsGenerating(false);
                return;
            }
            uploadedImageDataUri = await fileToDataUri(data.image[0]);
        }

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
          imagePrompt: data.imagePrompt,
          // Use a placeholder initially
          coverImageUrl: `https://placehold.co/300x450.png?text=${encodeURIComponent(data.title.substring(0,15))}`,
        };
        
        onBookGenerated(newBook); // Callback to update parent state immediately

        // Store in localStorage for editor page to pick up (simple state persistence)
        localStorage.setItem(`book-${newBook.id}`, JSON.stringify(newBook));
        
        // Start image generation in the background
        triggerImageGeneration(newBook, uploadedImageDataUri);

        toast({
          title: "Book Generated!",
          description: `"${data.title}" is ready. Generating cover image...`,
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
             <FormField
              control={form.control}
              name="imagePrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image Prompt (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., An astronaut looking at a swirling nebula, digital art, vibrant colors..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                    Describe the cover art you envision.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Inspiration Image (Optional)</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    field.onChange(e.target.files);
                                    setUploadedFileName(e.target.files?.[0]?.name || null);
                                }}
                            />
                            <div
                                className={cn(
                                    "flex items-center justify-center w-full h-12 px-4 py-2 rounded-md border border-input bg-background text-sm ring-offset-background",
                                    "text-muted-foreground",
                                    "hover:bg-accent hover:text-accent-foreground transition-colors"
                                )}
                            >
                                <ImageUp className="mr-2 h-5 w-5" />
                                <span>{uploadedFileName || "Upload an inspiration image"}</span>
                            </div>
                        </div>
                    </FormControl>
                    <FormDescription>
                        Upload an image to influence the cover generation (max 4MB).
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
