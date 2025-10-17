import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string); // no apiVersion
    const { quantity, flavor } = await req.json();

    // derive origin from request headers (works on Netlify/Next)
    const origin = new URL(req.headers.get('referer') || '').origin || process.env.NEXT_PUBLIC_BASE_URL || '';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          // simple price_data for now ($5); you can swap to real Price IDs later
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Digital Empanada Print — ${flavor}`,
              description: `Never frozen, always digital.`,
            },
            unit_amount: 500, // $5
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
