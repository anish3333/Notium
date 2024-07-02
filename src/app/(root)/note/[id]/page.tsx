'use client';
import TextEditor from '@/components/TextEditor';
import { NotesListContext } from '@/context/NotesListContext';
import { useParams, useRouter } from 'next/navigation';
import React, { useContext, useState, useEffect } from 'react';

const Page = () => {
  const { id } = useParams();
  const router = useRouter();
  const { notesList, reloadNotesList, deleteNote, saveNote } = useContext(NotesListContext);
  const [note, setNote] = useState(notesList.find((note) => note.id === id));
  const [content, setContent] = useState(note?.content ?? '');
  const [imageUrl, setImageUrl] = useState(note?.imageUrl ?? '');

  useEffect(() => {
    setNote(notesList.find((note) => note.id === id));
  }, [notesList, id]);

  const handleSave = async () => {
    if (!note) return;
    note.content = content;
    note.imageUrl = imageUrl;
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
      content={content}
      setContent={setContent}
      imageUrl={imageUrl}
      setImageUrl={setImageUrl}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
};

export default Page;
