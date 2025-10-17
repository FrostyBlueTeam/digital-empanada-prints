import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// make sure Netlify uses Node runtime for this route
export const runtime = 'nodejs';
// (optional but safe) never prerender this route
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ok: true, route: 'checkout' });
}

export async function POST(req: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    const proto = req.headers.get('x-forwarded-proto') ?? 'https';
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const origin = `${proto}://${host}`;

    const { quantity = 1, flavor = 'Beef' } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Digital Empanada Print — ${flavor}`,
              description: 'Never frozen, always digital.',
            },
            unit_amount: 500,
          },
          quantity,
        },
      ],
      success_url: `${origin}/success`,
      cancel_url: `${origin}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
