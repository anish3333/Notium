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
import { ArrowBigLeft, ChevronLeft, Clock, Dot, Upload } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import socket from "@/lib/socket";
import debounce from "lodash/debounce";
import { cn, formatDate } from "@/lib/utils";
import OnlineUsers from "@/components/OnlineUsers";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { SetReminderModal } from "@/components/SetReminderModal";

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
  const [userToCollaborate, setUserToCollaborate] = useState<UserDB | null>(
    null
  );
  const [collaboration, setCollaboration] = useState<Collaboration | null>(
    null
  );
  const [users, setUsers] = useState<UserDB[]>([]);
  const [openCollaboratorsList, setOpenCollaboratorsList] = useState(false);
  // const [textToSpeech, setTextToSpeech] = useState<string>("");

  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [isEditingReminder, setIsEditingReminder] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<UserDB[]>([]);
  const [onlineUsersModalOpen, setOnlineUsersModalOpen] = useState(false);

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

  const handleReminderChange = (date: Date | null) => {
    if (date && note) {
      setReminderDate(date);
      handleSetReminder(note, date);
    }
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // socket connection

  useEffect(() => {
    if (note && user) {
      socket.on("online-users-update", (users: UserDB[]) => {
        setOnlineUsers(users);
      });

      socket.emit("authenticate", { userId: user.id, noteId: note.id });

      socket.on("content-update", (updatedContent: string) => {
        setContent(updatedContent);
      });

      socket.on("collaborator-joined", (collaboratorId: string) => {
        console.log(`Collaborator ${collaboratorId} joined the note`);
        // Update UI to show new collaborator
      });

      socket.on("collaborator-left", (collaboratorId: string) => {
        console.log(`Collaborator ${collaboratorId} left the note`);
        // Update UI to remove collaborator
      });

      return () => {
        socket.emit("leave-note", { userId: user.id, noteId: note.id });
        socket.off("user-joined");
        socket.off("online-users-update");
        socket.off("content-update");
        socket.off("collaborator-joined");
        socket.off("collaborator-left");
      };
    }
  }, [note, user]);

  const handleContentChange = useCallback(
    debounce(async (newContent: string) => {
      if (note) {
        await updateDoc(doc(db, "notes", note.id), { content: newContent });
      }
    }, 500),
    [note]
  );

  const debouncedContentChange = useCallback(
    debounce((newContent: string) => {
      socket.emit("content-change", { noteId: note?.id, content: newContent });
      handleContentChange(newContent);
    }, 500),
    [note, socket, handleContentChange]
  );

  const onContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    debouncedContentChange(newContent);
  };

  const notifyCollaboratorAdded = useCallback(
    (collaboratorId: string) => {
      socket.emit("collaborator-added", { noteId: note?.id, collaboratorId });
    },
    [note]
  );

  const notifyCollaboratorRemoved = useCallback(
    (collaboratorId: string) => {
      socket.emit("collaborator-removed", { noteId: note?.id, collaboratorId });
    },
    [note]
  );

  function handleStopRecording(text: string) {
    const newContent = content + " " + text;
    setContent(newContent);
    debouncedContentChange(newContent);
  }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <main className="container mx-auto py-12 px-6 max-w-7xl">
        <div className="flex items-center justify-between pb-4">
          <div className="text-gray-100 hover:text-blue-300 text-sm flex items-center justify-center w-fit">
            <Link href="/">
              <div className="flex">
                <ChevronLeft className="w-4 h-4 mr-2" />
                <p> Back to Notes</p>
              </div>
            </Link>
          </div>

          <div
            onClick={() => setOnlineUsersModalOpen(true)}
            className="flex items-center justify-center cursor-pointer text-sm"
          >
            <p className="pl-2">Online Users ({onlineUsers.length})</p>
            <Dot
              className={cn("w-10 h-10 ", {
                "text-green-500 shadow-white": onlineUsers.length > 0,
                "text-gray-400": onlineUsers.length === 0,
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Content, Controls, and Reminder */}
          <div className="lg:col-span-2 space-y-8">
            {/* Content Section with Controls */}
            <section className="bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-100">Content</h2>
              <Textarea
                value={content}
                onChange={onContentChange}
                rows={15}
                className="custom-scrollbar w-full p-4 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-white resize-none transition-colors mb-4"
                placeholder="Enter your note content here..."
              />
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">
                  {content.length} characters
                </p>
                <div className="flex items-center space-x-2">
                  <SpeechToText handleStopRecording={handleStopRecording} />
                  <span className="text-sm text-gray-400">
                    Click mic to start/stop recording
                  </span>
                </div>
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Delete
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Save
                </Button>
              </div>
            </section>

            {/* Reminder Section */}
            <section className="bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-100">
                Reminder
              </h2>
              <div className="flex items-center space-x-4 mb-4">
                {reminderDate ? (
                  <div className="text-yellow-300 flex items-center bg-yellow-400 bg-opacity-10 px-4 py-2 rounded-full">
                    <Clock className="w-5 h-5 mr-2" />
                    {formatDate(reminderDate)}
                  </div>
                ) : (
                  <span className="text-gray-400">No reminder set</span>
                )}
                <Button
                  onClick={() => setIsReminderModalOpen(true)}
                  size="sm"
                  className="transition-colors hover:bg-blue-500 bg-blue-600"
                >
                  {reminderDate ? "Edit Reminder" : "Set Reminder"}
                </Button>
              </div>
              <SetReminderModal
                isOpen={isReminderModalOpen}
                onClose={() => setIsReminderModalOpen(false)}
                onSetReminder={handleReminderChange}
                currentDate={new Date()}
              />
            </section>
          </div>

          {/* Right Column: Images and Collaboration */}
          <div className="space-y-8">
            {/* Collaboration Section */}
            <section className="bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-100">
                Collaboration
              </h2>
              <div className="space-y-4">
                <div
                  className="flex items-center justify-center flex-wrap mb-4 gap-2
                "
                >
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => setOpenCollaboratorsList(true)}
                      className="bg-purple-600 hover:bg-purple-700 transition-colors"
                    >
                      Manage collaborators (
                      {collaboration?.collaborators?.length || 0})
                    </Button>
                  </div>

                  <div>
                    <OtherUsersBox
                      users={users}
                      value={userToCollaborate}
                      setValue={setUserToCollaborate}
                      placeholder="Add new collaborator"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Image Section */}
            <section className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2 text-gray-100">
                  Images
                </h2>
                <p className="text-gray-400 mb-4">
                  Add or manage images for your note
                </p>
              </div>
              <div className="px-6 pb-6">
                <div className="grid gap-4">
                  {imageUrl.length > 0 ? (
                    <div className="relative group">
                      <img
                        alt="Main note image"
                        className="w-full rounded-md object-cover"
                        src={imageUrl[0]}
                        style={{ height: "300px" }}
                      />
                      <button
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={() => deleteNoteImage(id, imageUrl[0])}
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
                  ) : (
                    <div className="aspect-square w-full rounded-md bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">No main image</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    {imageUrl.slice(1, 3).map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          alt={`Note image ${index + 2}`}
                          className="w-full rounded-md object-cover"
                          src={url}
                          style={{ height: "84px" }}
                        />
                        <button
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
                    <div
                      {...getRootProps()}
                      className="flex aspect-square w-full items-center justify-center rounded-md border-2 border-dashed border-gray-600 hover:border-gray-500 cursor-pointer transition-colors"
                    >
                      <input {...getInputProps()} />
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <CollaboratorsList
          open={openCollaboratorsList}
          handleClose={() => setOpenCollaboratorsList(false)}
          collaborators={collaboration?.collaborators}
          removeCollaborator={removeCollaborator}
        />

        <OnlineUsers
          isOpen={onlineUsersModalOpen}
          onOpenChange={setOnlineUsersModalOpen}
          users={onlineUsers}
        />
      </main>
    </div>
  );
};

export default Page;
