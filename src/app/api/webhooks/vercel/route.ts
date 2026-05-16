import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function verifyCaller(request: Request): boolean {
  const secret = process.env.WEBHOOK_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }
  const auth = request.headers.get('authorization');
  const headerSecret = request.headers.get('x-webhook-secret');
  let provided = '';
  if (auth?.startsWith('Bearer ')) provided = auth.slice(7).trim();
  else if (headerSecret) provided = headerSecret.trim();
  if (!provided) return false;
  const ha = createHash('sha256').update(secret, 'utf8').digest();
  const hb = createHash('sha256').update(provided, 'utf8').digest();
  return timingSafeEqual(ha, hb);
}

function deploymentLogsUrl(deploymentId: string | undefined): string {
  const team = process.env.VERCEL_TEAM_SLUG ?? 'your-team';
  const project =
    process.env.VERCEL_PROJECT_NAME ?? process.env.VERCEL_PROJECT ?? 'souq-pro';
  if (deploymentId) {
    return `https://vercel.com/${team}/${project}/deployments/${deploymentId}`;
  }
  return 'https://vercel.com/dashboard';
}

export async function POST(request: Request) {
  if (!verifyCaller(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();

    if (payload.type === 'deployment.error' || payload.type === 'deployment.failed') {
      const projectName = payload.payload?.name || 'Souq Pro';
      const errorMessage = payload.payload?.errorMessage || 'Deployment failed on Vercel.';
      const deploymentId = payload.payload?.deploymentId || payload.payload?.id;
      const logsLink = deploymentLogsUrl(deploymentId);

      const message = `
❌ <b>Vercel Deployment Failure</b> ❌
<b>Project:</b> ${projectName}
<b>Error:</b> ${errorMessage}

<a href="${logsLink}">🔗 View Vercel Logs</a>
`;

      await sendTelegramMessage(message);
    }

    if (payload.type === 'app.error') {
      const errorMessage = payload.errorMessage || 'Unknown 500 Error';
      const errorStack = payload.errorStack || 'No stack trace provided';
      const path = payload.path || 'Unknown Path';

      const message = `
⚠️ <b>Souq Pro 500 Error</b> ⚠️
<b>Path:</b> ${path}
<b>Error:</b> ${errorMessage}
<pre>${errorStack}</pre>
`;

      await sendTelegramMessage(message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function sendTelegramMessage(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram credentials are not configured');
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Telegram request:', error);
  }
}
