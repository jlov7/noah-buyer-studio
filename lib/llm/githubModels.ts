// GitHub Models client wrapper. Uses process.env.GITHUB_TOKEN server-side only.
// Endpoint: https://models.github.ai/inference/chat/completions
// Note: For free prototyping use; quotas may apply. Do NOT expose the token to the browser.

import { z } from 'zod';

export const BuyerBriefSchema = z.object({
  summary: z.string().min(1),
  priorities: z.array(z.string().min(1)).min(3).max(7),
  next_steps: z.array(z.string().min(1)).min(3).max(5),
});

export type BuyerBrief = z.infer<typeof BuyerBriefSchema>;

export async function generateBuyerBrief(intake: unknown): Promise<BuyerBrief> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('Missing GITHUB_TOKEN. In Codespaces, it should be present by default.');
  }
  const body = {
    model: 'openai/gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a neutral real estate brief writer for a Texas buyer. Avoid subjective school ratings; link families to TXSchools/TEA. Use clear, concise bullet points and preview next steps.',
      },
      { role: 'user', content: JSON.stringify(intake) },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'BuyerBrief',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            summary: { type: 'string' },
            priorities: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 7 },
            next_steps: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 5 },
          },
          required: ['summary', 'priorities', 'next_steps'],
        },
      },
    },
    max_tokens: 800,
  } as const;

  const res = await fetch('https://models.github.ai/inference/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub Models error: ${res.status} ${text}`);
  }

  const json = await res.json();
  const raw = json?.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Empty model response');
  let parsed: unknown;
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    throw new Error('Model returned non-JSON content');
  }
  const result = BuyerBriefSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error('Model output failed validation: ' + result.error.message);
  }
  return result.data;
}

