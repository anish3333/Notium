'use client';
import { NotesListContext } from '@/context/NotesListContext';
import { useParams, useRouter } from 'next/navigation';
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const Page = () => {
  const { id } = useParams();
  const router = useRouter();
  const { notesList, deleteNote, saveNote, addImageToStorage, addNoteImage } = useContext(NotesListContext);
  const [note, setNote] = useState(notesList.find((note) => note.id === id));
  const [content, setContent] = useState(note?.content ?? '');
  const [imageUrl, setImageUrl] = useState(note?.imageUrl ?? []);

  useEffect(() => {
    const currentNote = notesList.find((note) => note.id === id);
    setNote(currentNote);
    setContent(currentNote?.content ?? '');
    setImageUrl(currentNote?.imageUrl ?? []);
  }, [notesList, id]);

  const handleSave = async () => {
    if (!note) return;
    note.content = content;
    await saveNote(note);
    router.push(`/`);
  };

  const handleDelete = async () => {
    if (!note) return;
    await deleteNote(note.id);
    router.push('/');
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      addImageToStorage(file)
        .then((url) => {
          if (note) {
            addNoteImage(note.id, url);
            setImageUrl((prevUrls) => [...prevUrls, url]);
          }
        });
    }
  }, [note, addImageToStorage, addNoteImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      
      <main className="container mx-auto p-4">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Image</label>
            <div className="flex flex-col space-y-4">
              <div className='flex gap-4'>
                {imageUrl.length > 0 && imageUrl.map((url, index) => (
                  <img key={index} src={url} alt="Note" className="w-32 h-32 object-cover rounded-md shadow-md" />
                ))}
              </div>
              

              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed p-4 rounded-md ${isDragActive ? 'border-blue-500' : 'border-gray-600'}`}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p className="text-center text-blue-400">Drop the files here...</p>
                ) : (
                  <p className="text-center text-gray-400">Drag & drop an image here, or click to select an image</p>
                )}
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2"> Content </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full mt-2 p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Delete</button>
            <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Save</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Page;
