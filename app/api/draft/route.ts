import { NextResponse } from 'next/server'

import {
  ConsentGatedAIAdapter,
  ConsentRequiredError,
  type DraftRequest,
} from '@/lib/ai-adapter'

const adapter = new ConsentGatedAIAdapter()

export async function POST(request: Request) {
  const body = (await request.json()) as DraftRequest

  try {
    const result = await adapter.generateEssayDraft(body)

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ConsentRequiredError) {
      return NextResponse.json(
        {
          error: error.code,
          message: error.message,
        },
        { status: 403 },
      )
    }

    return NextResponse.json(
      {
        error: 'AI_REQUEST_FAILED',
        message: 'Failed to generate the requested essay draft.',
      },
      { status: 500 },
    )
  }
}
