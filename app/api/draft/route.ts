import { NextResponse } from 'next/server'

import { ConsentRequiredError } from '@/lib/ai-adapter'
import { generateDraft, type DraftRequestBody } from '@/lib/essay-draft-service'

export async function POST(request: Request) {
  const body = (await request.json()) as DraftRequestBody

  try {
    const result = await generateDraft(
      body.fieldId,
      body.profile ?? {},
      body.userBullets,
      body.language,
      body.consent,
    )

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

    if (error instanceof Error && /Unsupported draft field ID|Unknown field ID|validation/i.test(error.message)) {
      return NextResponse.json(
        {
          error: 'INVALID_DRAFT_REQUEST',
          message: error.message,
        },
        { status: 400 },
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
