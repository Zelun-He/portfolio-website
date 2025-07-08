import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL; // e.g., contact@zelunhe.dev

export async function POST(req) {
  try {
    const body = await req.json();
    const userEmail = body.email;
    const subject = body.subject || 'New Contact Message';
    const message = body.message || 'No message provided.';

    // 1. Send to yourself
    await resend.emails.send({
      from: `Zelun <${fromEmail}>`,
      to: [fromEmail],
      subject: `New message from ${userEmail}`,
      html: `
        <h1>${subject}</h1>
        <p><strong>From:</strong> ${userEmail}</p>
        <p>${message}</p>
      `,
    });

    // 2. Send confirmation to the user
    await resend.emails.send({
      from: `Zelun <${fromEmail}>`,
      to: [userEmail],
      subject: 'We received your message!',
      html: `
        <p>Hi there,</p>
        <p>Thanks for reaching out. I’ve received your message and will get back to you as soon as possible.</p>
        <p>Here’s what you submitted:</p>
        <blockquote>${message}</blockquote>
        <p>– Zelun</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
