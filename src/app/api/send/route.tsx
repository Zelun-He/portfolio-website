import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();

    const { data, error } = await resend.emails.send({
      from: `Zelun <${process.env.FROM_EMAIL}>`,
      to: [body.email || 'zelunhe@gmail.com'],
      subject: body.subject || 'Hello world',
      html: `
        <h1>${body.subject || 'Hello world'}</h1>
        <p>Thank you for contacting us!</p>
        <p>New message submitted:</p>
        <p>${body.message || 'No message provided.'}</p>
      `,
    });

    if (error) {
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    return new Response(JSON.stringify(data));
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
