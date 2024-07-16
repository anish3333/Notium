"use client";
import CollaboratorsList from "@/components/CollaboratorsList";
import OtherUsersBox from "@/components/OtherUsersBox";
import SpeechToText from "@/components/SpeechToText";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { NotesListContext } from "@/context/NotesListContext";
import { db } from "@/firebase/firebaseConfig";
import { Collaboration, UserDB } from "@/types";
import { useUser } from "@clerk/nextjs";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import React, { useContext, useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Clock } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import socket from "@/lib/socket";
import debounce from "lodash/debounce";



const Page = () => {
  const { id }: { id: string } = useParams();
  const router = useRouter();
  const {
    notesList,
    deleteNote,
    saveNote,
    addImageToStorage,
    addNoteImage,
    handleSetReminder,
    deleteNoteImage,
  } = useContext(NotesListContext);
  const { isSignedIn, user } = useUser();
  const [note, setNote] = useState(() =>
    notesList.find((note) => note.id === id)
  );
  const [content, setContent] = useState(note?.content ?? "");
  const [imageUrl, setImageUrl] = useState(note?.imageUrl ?? []);
  const [userToCollaborate, setUserToCollaborate] = useState<UserDB | null>(null);
  const [collaboration, setCollaboration] = useState<Collaboration | null>(
    null
  );
  const [users, setUsers] = useState<UserDB[]>([]);
  const [openCollaboratorsList, setOpenCollaboratorsList] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState<string>("");

  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [isEditingReminder, setIsEditingReminder] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const usersQuery = query(
        collection(db, "users"),
        where("userId", "!=", user.id)
      );
      const querySnapshot = await getDocs(usersQuery);
      const usersData = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as UserDB)
      );

      // console.log("Users:", usersData);
      const filteredUsers = usersData.filter(
        (u: UserDB) => !collaboration?.collaborators.includes(u.userId)
      );
      setUsers(filteredUsers as UserDB[]);
      console.log("Users:", filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const currentNote = notesList.find((note) => note.id === id);
    setNote(currentNote);
    setContent(currentNote?.content ?? "");
    setImageUrl(currentNote?.imageUrl ?? []);
  }, [notesList, id]);

  useEffect(() => {
    if (note?.reminderDate && note.reminderDate instanceof Timestamp) {
      setReminderDate(note.reminderDate.toDate());
    } else {
      setReminderDate(null);
    }
  }, [note?.reminderDate]);


  const formatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const handleReminderChange = (date: Date | null) => {
    if (date && note) {
      setReminderDate(date);
      handleSetReminder(note, date);
    }
    setIsEditingReminder(false);
  };

  const handleSave = async () => {
    if (!note) return;
    note.content = content;
    await saveNote(note);
    router.push(`/`);
  };

  const handleDelete = async () => {
    if (!note) return;
    await deleteNote(note.id);
    router.push("/");
  };

  const fetchCollaboration = useCallback(async () => {
    if (!note) return;
    const collabDocRef = doc(db, "collaborations", note.id);
    const collabDocSnapshot = await getDoc(collabDocRef);
    if (collabDocSnapshot.exists()) {
      const collabData = collabDocSnapshot.data() as Collaboration;
      setCollaboration(collabData);
      setUsers((prevUsers) =>
        prevUsers.filter((user) => !collabData.collaborators.includes(user.id))
      );
    }
  }, [note]);

  // const handleCollaborate = useCallback(async () => {
  //   if (!note || !userToCollaborate) return;

  //   const collabDocRef = doc(db, "collaborations", note.id);
  //   const collabDocSnapshot = await getDoc(collabDocRef);

  //   if (collabDocSnapshot.exists()) {
  //     await updateDoc(collabDocRef, {
  //       collaborators: arrayUnion(userToCollaborate.id),
  //     });
  //   } else {
  //     await setDoc(collabDocRef, {
  //       author: note.userId, // clerk user id
  //       collaborators: [userToCollaborate.id], // id of the user doc in the usrs collection
  //     });
  //   }

  //   toast({
  //     title: `${userToCollaborate.name} is a collaborator`,
  //   });

  //   setUsers((prevUsers) =>
  //     prevUsers.filter((u) => u.id !== userToCollaborate.id)
  //   ); // remove
  //   setUserToCollaborate(null);
  //   fetchCollaboration();
  // }, [note, userToCollaborate, fetchCollaboration]);

  // const removeCollaborator = async (userId: string) => {
  //   if (!note) return;

  //   const collabDocRef = doc(db, "collaborations", note.id);
  //   const collabDocSnapshot = await getDoc(collabDocRef);

  //   if (collabDocSnapshot.exists()) {
  //     await updateDoc(collabDocRef, {
  //       collaborators: arrayRemove(userId),
  //     });
  //   }
  //   fetchUsers();
  //   fetchCollaboration();
  // };

  

  useEffect(() => {
    fetchCollaboration();
  }, [fetchCollaboration]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        addImageToStorage(file).then((url) => {
          if (note) {
            addNoteImage(note.id, url);
            setImageUrl((prevUrls) => [...prevUrls, url]);
          }
        });
      }
    },
    [note, addImageToStorage, addNoteImage]
  );

  function handleStopRecording(text: string) {
    if (text.length === 0) return;
    setContent((prev) => prev + " " + text);
    setTextToSpeech("");
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // socket connection

  useEffect(() => {
    if (note && user) {
      socket.emit('authenticate', { userId: user.id, noteId: note.id });

      socket.on('content-update', (updatedContent: string) => {
        setContent(updatedContent);
      });

      socket.on('collaborator-joined', (collaboratorId: string) => {
        console.log(`Collaborator ${collaboratorId} joined the note`);
        // Update UI to show new collaborator
      });

      socket.on('collaborator-left', (collaboratorId: string) => {
        console.log(`Collaborator ${collaboratorId} left the note`);
        // Update UI to remove collaborator
      });

      return () => {
        socket.off('content-update');
        socket.off('collaborator-joined');
        socket.off('collaborator-left');
      };
    }
  }, [note, user]);

  const handleContentChange = useCallback(
    debounce(async (newContent: string) => {
      if (note) {
        await updateDoc(doc(db, 'notes', note.id), { content: newContent });
      }
    }, 500),
    [note]
  );

  const debouncedContentChange = useCallback(
    debounce((newContent: string) => {
      socket.emit('content-change', { noteId: note?.id, content: newContent });
      handleContentChange(newContent);
    }, 500),
    [note, socket, handleContentChange]
  );
  
  const onContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    debouncedContentChange(newContent);
  };

  const notifyCollaboratorAdded = useCallback((collaboratorId: string) => {
    socket.emit('collaborator-added', { noteId: note?.id, collaboratorId });
  }, [note]);

  const notifyCollaboratorRemoved = useCallback((collaboratorId: string) => {
    socket.emit('collaborator-removed', { noteId: note?.id, collaboratorId });
  }, [note]);

  const handleCollaborate = useCallback(async () => {
    if (!note || !userToCollaborate) return;

    const collabDocRef = doc(db, "collaborations", note.id);
    const collabDocSnapshot = await getDoc(collabDocRef);

    if (collabDocSnapshot.exists()) {
      await updateDoc(collabDocRef, {
        collaborators: arrayUnion(userToCollaborate.id),
      });
    } else {
      await setDoc(collabDocRef, {
        author: note.userId,
        collaborators: [userToCollaborate.id],
      });
    }

    notifyCollaboratorAdded(userToCollaborate.id);

    toast({
      title: `${userToCollaborate.name} is a collaborator`,
    });

    setUsers((prevUsers) =>
      prevUsers.filter((u) => u.id !== userToCollaborate.id)
    );
    setUserToCollaborate(null);
    fetchCollaboration();
  }, [note, userToCollaborate, notifyCollaboratorAdded, fetchCollaboration]);

  const removeCollaborator = async (userId: string) => {
    if (!note) return;

    const collabDocRef = doc(db, "collaborations", note.id);
    const collabDocSnapshot = await getDoc(collabDocRef);

    if (collabDocSnapshot.exists()) {
      await updateDoc(collabDocRef, {
        collaborators: arrayRemove(userId),
      });
    }

    notifyCollaboratorRemoved(userId);

    fetchUsers();
    fetchCollaboration();
  };




  useEffect(() => {
    if (userToCollaborate) {
      handleCollaborate();
    }
  }, [userToCollaborate, handleCollaborate]);

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white">
        <main className="container mx-auto p-4 max-w-4xl">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
            {/* Image Section */}
            <div>
              <label className="block text-gray-400 mb-2 font-semibold">
                Image
              </label>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  {imageUrl.length > 0 &&
                    imageUrl.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt="Note"
                          className="w-32 h-32 object-cover rounded-md shadow-md transition-transform group-hover:scale-105"
                        />
                        <button
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteNoteImage(id, url)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                </div>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed p-6 rounded-md cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-blue-500 bg-blue-500 bg-opacity-10"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                >
                  <input {...getInputProps()} />
                  <p className="text-center text-gray-400">
                    {isDragActive
                      ? "Drop the files here..."
                      : "Drag & drop an image here, or click to select an image"}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div>
              <label className="block text-gray-400 mb-2 font-semibold">
                Content
              </label>
              <textarea
                value={content}
                onChange={onContentChange}
                rows={10}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none transition-colors"
                placeholder="Enter your note content here..."
              />
              <p className="text-right text-gray-400 mt-1 text-sm">
                {content.length} characters
              </p>
            </div>

            {/* Reminder Section */}
            <div>
              <label className="block text-gray-400 mb-2 font-semibold">
                Reminder
              </label>
              <div className="flex items-center space-x-4">
                {reminderDate ? (
                  <div className="text-yellow-400 flex items-center bg-yellow-400 bg-opacity-10 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatDate(reminderDate)}
                  </div>
                ) : (
                  <span className="text-gray-400">No reminder set</span>
                )}
                <Button
                  onClick={() => setIsEditingReminder(!isEditingReminder)}
                  variant="outline"
                  size="sm"
                  className="transition-colors hover:bg-blue-500 hover:text-white"
                >
                  {isEditingReminder ? "Cancel" : "Set Reminder"}
                </Button>
              </div>
              {isEditingReminder && (
                <div className="mt-2">
                  <DatePicker
                    selected={reminderDate}
                    onChange={handleReminderChange}
                    showTimeSelect
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="bg-gray-700 text-white rounded p-2 w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholderText="Set reminder"
                    popperPlacement="bottom-start"
                    shouldCloseOnSelect={false}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center space-x-4">
                <SpeechToText
                  onTextChange={(text) => setTextToSpeech(" " + text)}
                  handleStopRecording={handleStopRecording}
                />
                <Button
                  onClick={() => setOpenCollaboratorsList(true)}
                  className="bg-purple-500 hover:bg-purple-600 transition-colors"
                >
                  Collaborators
                </Button>
              </div>
              <OtherUsersBox
                users={users}
                value={userToCollaborate}
                setValue={setUserToCollaborate}
                placeholder="Choose collaborators"
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
          <CollaboratorsList
            open={openCollaboratorsList}
            handleClose={() => setOpenCollaboratorsList(false)}
            collaborators={collaboration?.collaborators}
            removeCollaborator={removeCollaborator}
          />
        </main>
      </div>
    </>
  );
};

export default Page;
