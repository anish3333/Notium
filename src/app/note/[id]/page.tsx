'use client';
import TextEditor from '@/components/TextEditor';
import { NotesListContext } from '@/context/NotesListContext';
import { useParams, useRouter } from 'next/navigation';
import React, { useContext } from 'react';

const Page = () => {
  const { id } = useParams();
  const router = useRouter();

  const { notesList, reloadNotesList, deleteNote, saveNote } = useContext(NotesListContext);
  const note = notesList.find((note) => note.id === id);

  const setContent = async (content: string) => {
    if (!note) return;
    note.content = content;
  };

  const handleSave = async () => {
    if (!note) return;
    await saveNote(note);
  };

  const handleDelete = async () => {
    if (!note) return;
    await deleteNote(note.id);
    router.push('/');
  };

  return (
    <TextEditor
      isOpen={true}
      onClose={() => router.push('/')}
      content={note?.content ?? ''}
      setContent={setContent}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
};

export default Page;
