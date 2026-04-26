import { NextResponse } from 'next/server'

import {
  ConsentGatedAIAdapter,
  ConsentRequiredError,
  type InterviewRequest,
} from '@/lib/ai-adapter'

const adapter = new ConsentGatedAIAdapter()

export async function POST(request: Request) {
  const body = (await request.json()) as InterviewRequest

  try {
    const result = await adapter.generateInterviewQuestion(body)

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
        message: 'Failed to generate the next interview question.',
      },
      { status: 500 },
    )
  }
}
