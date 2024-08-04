import { GoogleGenerativeAI } from '@google/generative-ai';
import { getPineconeClient, getPineconeIndex } from '../pinecone/pineconeClient';
import { Note } from '@/types';
import { db } from '@/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';


const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!);

const getNotesByIds = async (ids: string[]) => {
 const noteSnapshots = await Promise.all(
   ids.map(async (id) => {
     const docRef = doc(db, 'notes', id);
     const snapshot = await getDoc(docRef);
     return {
       id: snapshot.id,
       ...snapshot.data(),
     } as Note;
   })
 );
 return noteSnapshots;
};

async function encodeText(text: string) {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await model.embedContent(text);
  return result.embedding;
}

export async function semanticSearch(query: string, userId: string): Promise<Note[]> {

  console.log("entered semantic search fn");


  const queryEmbedding = await encodeText(query);
  const pineconeIndex = await getPineconeIndex(process.env.PINECONE_INDEX_NAME!);
  
  // console.log("query embedding", queryEmbedding);

  const searchResults = await pineconeIndex.query({
    vector: queryEmbedding.values,
    topK: 10,
    filter: { userId: userId },
    includeMetadata: true
  });
  
  // console.log("search results", searchResults);

  const vectorResultIds = searchResults.matches.map( match => match.metadata?.userId);
  const vectorResults = await getNotesByIds(vectorResultIds);
  
  // console.log("vector results", vectorResults);

  // const recentNotes = await getRecentUnprocessedNotes(userId);
  
  // Combine and deduplicate results
  // const allResults = [...vectorResults, ...recentNotes];
  const allResults = vectorResults;
  // const uniqueResults = Array.from(new Set(allResults.map(n => n.id)))
  //   .map(id => allResults.find(n => n.id === id)!);

  // return uniqueResults;

  return allResults;
}