import express, { Application, Request, Response } from "express";
import Stripe from "stripe";
const app: Application = express();
app.use(express.json());

app.post("/checkout", async (req: Request, res: Response) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await req.body;
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: body.priceId,
        quantity: body.quantity,
      },
    ],
    mode: "payment",
    success_url: `https://homehaven-liard.vercel.app`,
    cancel_url: `https://homehaven-liard.vercel.app`,
  });
  res.json(session.url);
});

app.get("/getPrice", async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const productName = decodeURIComponent((req.query.name as string) || "");
  const products = await stripe.products.list();
  const product = products.data.find((o) => o.name === productName);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
  }
  if (!product!.default_price) {
    res.status(404).json({ error: "Price not found" });
  }
  const price = await stripe.prices.retrieve(product!.default_price as string);
  res.json({
    price_in_cents: price.unit_amount,
    price_id: price.id,
  });
});

app.get("/getProducts", async (req: Request, res: Response) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const products = await stripe.products.list();
  res.json(products);
});
