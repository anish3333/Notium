"use client";
import React, { useEffect } from "react";
import { Note } from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

const Page = () => {
  const sampleNote = {
    content: "This is ANISH'S NOTE",
    createdAt: "2023-01-01T00:00:00.000Z",
    userId: "123",
    imageUrl: [],
    orgId: "123",
    reminderSent: false,
  };

  async function addNote() {
    const response = await fetch("/api/notes/addNoteToQueue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sampleNote),
    });
    console.log(response);
  };

  async function encodeNote(note : any) {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(note.content);
    console.log(result.embedding);

  }

  async function searchInPinecone(query : {q: string, userId: string}) {
    const results = fetch(`/api/search?q=${query.q}&userId=${query.userId}`, {  
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })
    .then(response => response.json())
    .then(data => console.log("data in client", data));

  }



  useEffect(() => {
    console.log("test");
    // addNote();
    searchInPinecone({
      q: "find me anishs notes",
      userId: "123",
    });
    // encodeNote(sampleNote);
  }, []);

  return <div>Page</div>;
};

export default Page;
