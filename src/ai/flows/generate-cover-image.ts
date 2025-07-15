
'use server';
/**
 * @fileOverview A flow to generate a book cover image.
 *
 * - generateCoverImage - A function that generates an image based on a title and genre.
 * - GenerateCoverImageInput - The input type for the generateCoverImage function.
 * - GenerateCoverImageOutput - The return type for the generateCoverImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCoverImageInputSchema = z.object({
  title: z.string().describe('The title of the book.'),
  genre: z.string().describe('The genre of the book.'),
  prompt: z.string().optional().describe('A specific prompt for the cover image style and content.'),
  imageDataUri: z.string().optional().describe("An optional inspiration image as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateCoverImageInput = z.infer<typeof GenerateCoverImageInputSchema>;

const GenerateCoverImageOutputSchema = z.object({
  coverImageUrl: z.string().describe("The data URI of the generated cover image. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateCoverImageOutput = z.infer<typeof GenerateCoverImageOutputSchema>;

export async function generateCoverImage(input: GenerateCoverImageInput): Promise<GenerateCoverImageOutput> {
  return generateCoverImageFlow(input);
}

const generateCoverImageFlow = ai.defineFlow(
  {
    name: 'generateCoverImageFlow',
    inputSchema: GenerateCoverImageInputSchema,
    outputSchema: GenerateCoverImageOutputSchema,
  },
  async ({title, genre, prompt, imageDataUri}) => {
    
    // Construct the final prompt for the model
    const basePrompt = prompt 
      ? prompt 
      : `A professional, eye-catching book cover for a ${genre} book titled "${title}".`;
    
    const finalPrompt = `${basePrompt} The style should be high-quality and suitable for a bestseller. Do not include any text or words on the image itself.`;

    const promptPayload = imageDataUri 
      ? [{media: {url: imageDataUri}}, {text: finalPrompt}] 
      : [finalPrompt];
      
    const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: promptPayload,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media) {
      throw new Error('Image generation failed to return media.');
    }
    
    return { coverImageUrl: media.url };
  }
);
