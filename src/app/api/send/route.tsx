// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);
// const fromEmail = process.env.FROM_EMAIL; // e.g., contact@zelunhe.dev

export async function POST(req) {
  try {
    const body = await req.json();
    const userEmail = body.email;
    const subject = body.subject || 'New Contact Message';
    const message = body.message || 'No message provided.';

    // TODO: Add Resend API key to .env.local to enable email functionality
    // For now, just log the message
    console.log('Contact form submission:', { userEmail, subject, message });

    // Simulate successful email send
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
