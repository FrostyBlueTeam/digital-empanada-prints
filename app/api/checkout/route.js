import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Ensure Node runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ok: true, route: 'checkout' });
}

export async function POST(req) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const proto = req.headers.get('x-forwarded-proto') ?? 'https';
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const origin = `${proto}://${host}`;

    const body = await req.json();
    const quantity = body?.quantity ?? 1;
    const flavor = body?.flavor ?? 'Beef';

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
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
