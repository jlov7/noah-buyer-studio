import { NextRequest, NextResponse } from 'next/server';
import { generateBuyerBrief, BuyerBriefSchema } from '@/lib/llm/githubModels';

export const runtime = 'nodejs';

const TREC =
  'This represents an estimated sale price for this property. It is not the same as the opinion of value in an appraisal developed by a licensed appraiser under the Uniform Standards of Professional Appraisal Practice.';

export async function POST(req: NextRequest) {
  try {
    const intake = await req.json();
    const brief = await generateBuyerBrief(intake);
    // Ensure neutral school language: client copy already instructs, but we can gently post-process (no subjective ratings here).
    let summary = brief.summary;
    const hasPriceContext = Boolean(intake?.budgetMin || intake?.budgetMax || /\$\d/.test(summary));
    if (hasPriceContext) summary += `\n\n${TREC}`;
    const safe = BuyerBriefSchema.parse({ ...brief, summary });
    return NextResponse.json(safe);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to generate brief' }, { status: 500 });
  }
}

