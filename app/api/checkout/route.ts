// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    const { quantity, flavor } = await req.json();

    // safest way to get the site origin in an API route
    const { origin } = new URL(req.url);

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
          quantity: quantity ?? 1,
        },
      ],
      success_url: `${origin}/success`,
      cancel_url: `${origin}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
