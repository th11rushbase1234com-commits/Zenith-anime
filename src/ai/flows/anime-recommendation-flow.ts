'use server';
/**
 * @fileOverview An AI agent that analyzes a user's watched anime and recommends new titles.
 *
 * - recommendAnime - A function that handles the anime recommendation process.
 * - RecommendAnimeInput - The input type for the recommendAnime function.
 * - RecommendAnimeOutput - The return type for the recommendAnime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WatchedAnimeItemSchema = z.object({
  title: z.string().describe('The title of the watched anime.'),
  genres: z.array(z.string()).describe('A list of genres for the anime.'),
  themes: z.array(z.string()).describe('A list of themes present in the anime.'),
  emotionalImpact: z.string().describe('A description of the emotional impact or tone of the anime.'),
  userRating: z.number().min(1).max(10).describe('The user\u0027s rating for this anime (1-10).').optional(),
});

const RecommendedAnimeItemSchema = z.object({
  title: z.string().describe('The title of the recommended anime.'),
  genres: z.array(z.string()).describe('A list of genres for the recommended anime.'),
  reason: z.string().describe('A concise explanation of why this anime is recommended, highlighting alignment with user preferences.'),
  expectedEmotionalImpact: z.string().describe('A description of the expected emotional impact or tone of the recommended anime.'),
});

const RecommendAnimeInputSchema = z.object({
  watchedAnime: z.array(WatchedAnimeItemSchema).describe('A list of anime titles the user has watched, including their genres, themes, and emotional impact.'),
});
export type RecommendAnimeInput = z.infer<typeof RecommendAnimeInputSchema>;

const RecommendAnimeOutputSchema = z.object({
  recommendations: z.array(RecommendedAnimeItemSchema).describe('A list of personalized anime recommendations.'),
});
export type RecommendAnimeOutput = z.infer<typeof RecommendAnimeOutputSchema>;

export async function recommendAnime(input: RecommendAnimeInput): Promise<RecommendAnimeOutput> {
  return animeRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'animeRecommendationPrompt',
  input: {schema: RecommendAnimeInputSchema},
  output: {schema: RecommendAnimeOutputSchema},
  prompt: `You are an expert anime recommendation engine named Zenith AI. Your goal is to provide highly personalized anime recommendations based on a user's watched anime.

Analyze the following list of anime the user has watched to understand their unique preferences regarding genres, themes, and emotional impact. Based on this analysis, generate a list of new anime recommendations.

For each recommendation, provide the anime title, its main genres, a concise explanation of why it is a good fit, and a description of its expected emotional impact, ensuring it aligns with the user's tastes.

Watched Anime History:
{{#each watchedAnime}}
- Title: {{{this.title}}}
  Genres: {{#each this.genres}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Themes: {{#each this.themes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Emotional Impact: {{{this.emotionalImpact}}}
  {{#if this.userRating}}User Rating: {{{this.userRating}}}/10{{/if}}
{{/each}}

Please provide your recommendations in a JSON array format that matches the output schema.`,
});

const animeRecommendationFlow = ai.defineFlow(
  {
    name: 'animeRecommendationFlow',
    inputSchema: RecommendAnimeInputSchema,
    outputSchema: RecommendAnimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
