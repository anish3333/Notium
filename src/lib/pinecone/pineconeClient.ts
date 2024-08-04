import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;

export async function getPineconeClient() {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.NEXT_PINECONE_API_KEY!,
    })
  }
  return pineconeClient;
}

export async function getPineconeIndex(indexName: string) {
  const client = await getPineconeClient();
  return client.index(indexName);
}