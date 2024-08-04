import { addNoteToQueue } from '@/lib/queue/noteQueue';
import { Note } from '@/types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, userId, imageUrl, orgId, reminderDate } = body;

    if (!content || !userId) {
      return NextResponse.json({ error: 'Content and userId are required' }, { status: 400 });
    }

    const newNote: Note = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date().toISOString(),
      userId,
      imageUrl: imageUrl || [],
      orgId,
      reminderDate,
      reminderSent: false,
    };

    await addNoteToQueue(newNote);

    return NextResponse.json({ message: 'Note added successfully', note: newNote }, { status: 201 });
  } catch (error) {
    console.error('Error adding note:', error);
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 });
  }
}