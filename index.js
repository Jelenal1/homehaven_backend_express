import express from "express";
import Stripe from "stripe";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: "*",
    preflightContinue: true,
  })
);
const PORT = process.env.PORT || 3000;

app.post("/checkout", async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.body;
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: body.priceId,
        quantity: body.quantity,
      },
    ],
    mode: "payment",
    success_url: body.succes_url,
    cancel_url: body.cancel_url,
  });
  res.status(200).json({ url: session.url });
});

app.get("/getPrice", async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const params = req.query;
  const productName = decodeURIComponent(params.name);
  try {
    const products = await stripe.products.list();
    const product = products.data.find((o) => o.name === productName);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
    }
    if (!product.default_price) {
      res.status(404).json({ error: "Price not found" });
    }
    const price = await stripe.prices.retrieve(product.default_price);
    res.json({
      price_in_cents: price.unit_amount,
      price_id: price.id,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

app.get("/getProducts", async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const products = await stripe.products.list();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
