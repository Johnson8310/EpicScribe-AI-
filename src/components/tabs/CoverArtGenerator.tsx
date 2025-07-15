
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import Image from "next/image";
import { generateCoverImage, type GenerateCoverImageInput } from "@/ai/flows/generate-cover-image";

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
import { Loader2, Wand2, Download, ImageUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const coverArtSchema = z.object({
  title: z.string().min(3, { message: "Please provide a title." }).max(100),
  genre: z.string().min(3, { message: "Please provide a genre." }).max(50),
  prompt: z.string().optional(),
  image: z.any().optional(),
});

type CoverArtFormData = z.infer<typeof coverArtSchema>;

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function CoverArtGenerator() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const form = useForm<CoverArtFormData>({
    resolver: zodResolver(coverArtSchema),
    defaultValues: {
      title: "",
      genre: "",
      prompt: "",
    },
  });

  async function onSubmit(data: CoverArtFormData) {
    setIsGenerating(true);
    setGeneratedImage(null);
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

        const imageInput: GenerateCoverImageInput = {
          title: data.title,
          genre: data.genre,
          prompt: data.prompt,
          imageDataUri: uploadedImageDataUri ?? undefined
        };
        const result = await generateCoverImage(imageInput);
        setGeneratedImage(result.coverImageUrl);
        toast({
          title: "Image Generated!",
          description: `Your cover art for "${data.title}" is ready.`,
        });

    } catch (error) {
      console.error("Error generating cover image:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate the cover art. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }
  
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `cover-${form.getValues('title').replace(/\s+/g, '_') || 'generated'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Wand2 className="h-6 w-6 text-primary" />
              Cover Art Generator
            </CardTitle>
            <CardDescription>Design a unique book cover with AI.</CardDescription>
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
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Science Fiction" {...field} />
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
                      <FormLabel>Cover Art Prompt (Optional)</FormLabel>
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
                                <div className="flex items-center justify-center w-full h-12 px-4 py-2 rounded-md border border-input bg-background text-sm ring-offset-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                                    <ImageUp className="mr-2 h-5 w-5" />
                                    <span>{uploadedFileName || "Upload an inspiration image"}</span>
                                </div>
                            </div>
                        </FormControl>
                        <FormDescription>
                            Upload an image to influence generation (max 4MB).
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
                       Generate Cover Art
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card className="w-full shadow-lg flex flex-col items-center justify-center">
            <CardHeader>
                <CardTitle>Generated Image</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center w-full">
                {isGenerating && (
                     <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Generating your masterpiece...</p>
                    </div>
                )}
                {!isGenerating && generatedImage && (
                    <div className="flex flex-col items-center gap-4">
                        <Image 
                            src={generatedImage} 
                            alt="Generated book cover"
                            width={400}
                            height={600}
                            className="rounded-lg shadow-2xl object-contain"
                            data-ai-hint="book cover"
                        />
                         <Button onClick={handleDownload} className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Download Image
                        </Button>
                    </div>
                )}
                {!isGenerating && !generatedImage && (
                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                        <FileImage className="mx-auto h-12 w-12 mb-4" />
                        <p>Your generated cover art will appear here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
