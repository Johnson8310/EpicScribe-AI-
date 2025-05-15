// Summarize and Rewrite Chapter Flow
'use server';
/**
 * @fileOverview This file defines a Genkit flow to summarize and rewrite a given chapter of a book.
 *
 * - summarizeAndRewriteChapter - A function that takes chapter content and rewriting instructions as input and returns a summarized and rewritten chapter.
 * - SummarizeAndRewriteChapterInput - The input type for the summarizeAndRewriteChapter function.
 * - SummarizeAndRewriteChapterOutput - The return type for the summarizeAndRewriteChapter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAndRewriteChapterInputSchema = z.object({
  chapterContent: z
    .string()
    .describe('The content of the chapter to be summarized and rewritten.'),
  instructions: z
    .string()
    .describe(
      'Instructions on how to rewrite the chapter, including the desired style or tone.'
    ),
});
export type SummarizeAndRewriteChapterInput = z.infer<
  typeof SummarizeAndRewriteChapterInputSchema
>;

const SummarizeAndRewriteChapterOutputSchema = z.object({
  rewrittenChapter: z
    .string()
    .describe('The summarized and rewritten content of the chapter.'),
});
export type SummarizeAndRewriteChapterOutput = z.infer<
  typeof SummarizeAndRewriteChapterOutputSchema
>;

export async function summarizeAndRewriteChapter(
  input: SummarizeAndRewriteChapterInput
): Promise<SummarizeAndRewriteChapterOutput> {
  return summarizeAndRewriteChapterFlow(input);
}

const summarizeAndRewriteChapterPrompt = ai.definePrompt({
  name: 'summarizeAndRewriteChapterPrompt',
  input: {schema: SummarizeAndRewriteChapterInputSchema},
  output: {schema: SummarizeAndRewriteChapterOutputSchema},
  prompt: `Summarize and rewrite the following chapter content according to the instructions provided.\n\nChapter Content:\n{{{chapterContent}}}\n\nInstructions:\n{{{instructions}}}\n\nRewritten Chapter:`,
});

const summarizeAndRewriteChapterFlow = ai.defineFlow(
  {
    name: 'summarizeAndRewriteChapterFlow',
    inputSchema: SummarizeAndRewriteChapterInputSchema,
    outputSchema: SummarizeAndRewriteChapterOutputSchema,
  },
  async input => {
    const {output} = await summarizeAndRewriteChapterPrompt(input);
    return output!;
  }
);
