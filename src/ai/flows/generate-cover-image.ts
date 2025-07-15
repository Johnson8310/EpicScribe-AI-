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
  async ({title, genre}) => {
    const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate a book cover for a ${genre} book titled "${title}". The style should be professional and eye-catching. Avoid putting any text on the image.`,
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
