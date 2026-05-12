import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { pool } from '@/src/lib/db/client'
import { getCurrentUser } from '@/src/lib/auth'

const FEEDBACK_TYPES = ['BUG', 'IDEA', 'QUESTION', 'OTHER'] as const
type FeedbackType = (typeof FEEDBACK_TYPES)[number]

function isFeedbackType(value: string): value is FeedbackType {
  return (FEEDBACK_TYPES as readonly string[]).includes(value)
}

function safeString(value: unknown, fallback = '', maxLength = 2000) {
  return typeof value === 'string' && value.trim()
    ? value.trim().slice(0, maxLength)
    : fallback
}

async function sendSlackFeedbackNotification(input: {
  type: FeedbackType
  message: string
  screenPath: string
  screenLabel: string
  url: string
  userEmail: string
}) {
  const webhookUrl = process.env.SLACK_FEEDBACK_WEBHOOK_PLAN || process.env.SLACK_FEEDBACK_WEBHOOK_URL
  if (!webhookUrl || process.env.SLACK_FEEDBACK_ENABLED === 'false') return

  const payload = {
    text: `Nieuwe Plan demo feedback: ${input.type}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'Nieuwe demo feedback - Plan' },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: '*App:*\nPlan' },
          { type: 'mrkdwn', text: `*Omgeving:*\n${process.env.NODE_ENV || 'development'}` },
          { type: 'mrkdwn', text: `*Type:*\n${input.type}` },
          { type: 'mrkdwn', text: `*Gebruiker:*\n${input.userEmail}` },
          { type: 'mrkdwn', text: `*Scherm:*\n${input.screenLabel}` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Feedback:*\n${input.message}` },
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: input.url ? `<${input.url}|${input.screenPath}>` : input.screenPath }],
      },
    ],
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      console.warn('Plan Slack feedback webhook failed:', response.status, await response.text().catch(() => ''))
    }
  } catch (error) {
    console.warn('Plan Slack feedback webhook failed:', error)
  }
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const result = await pool.query(
    `select id, source_app, environment, type, message, screen_path, screen_label, url, status,
            admin_response, created_at, updated_at
       from feedback
      where user_id = $1 and source_app = 'plan'
      order by created_at desc
      limit 100`,
    [user.id],
  )

  return NextResponse.json({ feedback: result.rows })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Ongeldige JSON' }, { status: 400 })

  const typeRaw = safeString(body.type, 'OTHER', 40)
  const type = isFeedbackType(typeRaw) ? typeRaw : 'OTHER'
  const message = safeString(body.message, '', 2000)
  if (!message) return NextResponse.json({ error: 'Bericht is verplicht' }, { status: 400 })

  const screenPath = safeString(body.screen_path ?? body.screenPath, '/', 500)
  const screenLabel = safeString(body.screen_label ?? body.screenLabel, 'Plan', 200)
  const url = safeString(body.url, '', 2000)
  const userAgent = safeString(request.headers.get('user-agent') ?? body.user_agent ?? body.userAgent, '', 2000)
  const id = `feedback-${randomUUID()}`

  const result = await pool.query(
    `insert into feedback
      (id, user_id, source_app, environment, type, message, screen_path, screen_label, url, user_agent, status)
     values ($1,$2,'plan',$3,$4,$5,$6,$7,$8,$9,'PENDING')
     returning id, source_app, environment, type, message, screen_path, screen_label, url, status,
               admin_response, created_at, updated_at`,
    [id, user.id, process.env.NODE_ENV || 'development', type, message, screenPath, screenLabel, url, userAgent],
  )

  await sendSlackFeedbackNotification({
    type,
    message,
    screenPath,
    screenLabel,
    url,
    userEmail: user.email,
  })

  return NextResponse.json({ feedback: result.rows[0] }, { status: 201 })
}
