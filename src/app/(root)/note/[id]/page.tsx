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
import { formatDate } from "@/lib/utils";
import OnlineUsers from "@/components/OnlineUsers";
import { Textarea } from "@/components/ui/textarea";

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
  const [textToSpeech, setTextToSpeech] = useState<string>("");

  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [isEditingReminder, setIsEditingReminder] = useState(false);
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
    setTextToSpeech("");
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

  return (<div className="min-h-screen bg-gray-900 text-gray-100">
    <main className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8 space-y-8">
          {/* Image Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">Images</h2>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                {imageUrl.length > 0 &&
                  imageUrl.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt="Note"
                        className="w-40 h-40 object-cover rounded-lg shadow-md transition-all duration-300 group-hover:scale-105"
                      />
                      <button
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={() => deleteNoteImage(id, url)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
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
                className={`border-2 border-dashed p-8 rounded-lg cursor-pointer transition-all duration-300 ${
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
          </section>
    
          {/* Content Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">
              Content
            </h2>
            <Textarea
              value={content}
              onChange={onContentChange}
              rows={10}
              className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none transition-colors"
              placeholder="Enter your note content here..."
            />
            <p className="text-right text-gray-400 mt-2 text-sm">
              {content.length} characters
            </p>
          </section>
    
          {/* Reminder Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">
              Reminder
            </h2>
            <div className="flex items-center space-x-4">
              {reminderDate ? (
                <div className="text-yellow-400 flex items-center bg-yellow-400 bg-opacity-10 px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5 mr-2" />
                  {formatDate(reminderDate)}
                </div>
              ) : (
                <span className="text-gray-400">No reminder set</span>
              )}
              <Button
                onClick={() => setIsEditingReminder(!isEditingReminder)}
                // variant="outline"
                size="sm"
                className="transition-colors hover:bg-blue-500 "
              >
                {isEditingReminder ? "Cancel" : "Set Reminder"}
              </Button>
            </div>
            {isEditingReminder && (
              <div className="mt-4">
                <DatePicker
                  selected={reminderDate}
                  onChange={handleReminderChange}
                  showTimeSelect
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="bg-gray-700  rounded p-3 w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholderText="Set reminder"
                  popperPlacement="bottom-start"
                  shouldCloseOnSelect={false}
                />
              </div>
            )}
          </section>
        </div>
    
        {/* Action Buttons */}
        <div className="bg-gray-750 p-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <SpeechToText
              onTextChange={(text) => setTextToSpeech(" " + text)}
              handleStopRecording={handleStopRecording}
            />
            <Button
              onClick={() => setOpenCollaboratorsList(true)}
              className="bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              Collaborators
            </Button>
            <Button
              onClick={() => setOnlineUsersModalOpen(true)}
              // variant="outline"
              className="border-gray-500 hover:bg-gray-700"
            >
              Online Users ({onlineUsers.length})
            </Button>
          </div>
          <OtherUsersBox
            users={users}
            value={userToCollaborate}
            setValue={setUserToCollaborate}
            placeholder="Choose collaborators"
          />
          <div className="flex space-x-4">
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 transition-colors"
            >
              Delete
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Save
            </Button>
          </div>
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
    </div>);
};



export default Page;
