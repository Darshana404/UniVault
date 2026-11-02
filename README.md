This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Semantic search on Vercel

Configure an embedding provider in the Vercel project settings. OpenAI is
recommended because it avoids loading the local ONNX model on each new
serverless instance:

```text
EMBEDDING_PROVIDER=openai
EMBEDDING_API_KEY=<your OpenAI API key>
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
```

If `EMBEDDING_PROVIDER` is omitted, the application automatically selects
OpenAI when `EMBEDDING_API_KEY` or `OPENAI_API_KEY` is present. Without an API
key, it uses the vendored local model as a fallback. Keep the provider and
embedding dimensions consistent with the vectors already stored in Supabase;
changing providers requires re-generating document embeddings and a compatible
pgvector column. If a serverless deployment cannot preserve the bundled model
binary, the same model is loaded from its public Hugging Face repository.
