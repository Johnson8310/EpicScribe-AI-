'use server';
/**
 * @fileOverview Book chapter generation AI agent.
 *
 * - generateBookChapters - A function that handles the book chapter generation process.
 * - GenerateBookChaptersInput - The input type for the generateBookChapters function.
 * - GenerateBookChaptersOutput - The return type for the generateBookChapters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBookChaptersInputSchema = z.object({
  prompt: z.string().describe('The overall prompt for the book.'),
  genre: z.string().describe('The genre of the book.'),
  chapters: z.number().describe('The desired number of chapters.'),
});
export type GenerateBookChaptersInput = z.infer<typeof GenerateBookChaptersInputSchema>;

const GenerateBookChaptersOutputSchema = z.object({
  chapters: z.array(z.string()).describe('The generated chapters of the book.'),
});
export type GenerateBookChaptersOutput = z.infer<typeof GenerateBookChaptersOutputSchema>;

export async function generateBookChapters(input: GenerateBookChaptersInput): Promise<GenerateBookChaptersOutput> {
  return generateBookChaptersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBookChaptersPrompt',
  input: {schema: GenerateBookChaptersInputSchema},
  output: {schema: GenerateBookChaptersOutputSchema},
  prompt: `You are a professional book writer. You are to generate the requested number of chapters for a book based on the given prompt and genre.

Prompt: {{{prompt}}}
Genre: {{{genre}}}
Number of Chapters: {{{chapters}}}

Please generate the chapters and return them as an array of strings.
`,
});

const generateBookChaptersFlow = ai.defineFlow(
  {
    name: 'generateBookChaptersFlow',
    inputSchema: GenerateBookChaptersInputSchema,
    outputSchema: GenerateBookChaptersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
