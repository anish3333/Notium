// pages/index.tsx

"use client";
import React, { useEffect, useContext, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import Card from "@/components/Card";
import AddNote from "@/components/AddNote";
import SearchAndSort from "@/components/NavbarSearchAndSort";
import { NotesListContext } from "@/context/NotesListContext";
import { Note } from "@/types";
import { useRouter } from "next/navigation";
import { requestNotificationPermission } from "@/lib/notificationUtils";
import { checkReminders } from "@/lib/reminderUtils";
import PageSearchAndSort from "@/components/PageSearchAndSort";

type SortCriteria = "dateCreated" | "dateModified" | "title";

const Page: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const {
    reloadNotesList,
    selectedNotes,
    setSelectedNotes,
    pinnedNotes,
    setPinnedNotes,
    collaboratedNotes,
  } = useContext(NotesListContext);

  useEffect(() => {
    requestNotificationPermission();
    const intervalId = setInterval(() => {
      if (user?.id) checkReminders(user.id);
    }, 60000);
    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      reloadNotesList();
    }
  }, [user]);

  const handleSelectNote = (note: Note) => {
    const isSelected = selectedNotes.some((n) => n.id === note.id);
    if (isSelected) {
      setSelectedNotes(selectedNotes.filter((n) => n.id !== note.id));
    } else {
      setSelectedNotes([...selectedNotes, note]);
    }
  };

  const handlePinnedNote = (note: Note) => {
    const isPinned = pinnedNotes.some((n) => n.id === note.id);
    if (isPinned) {
      setPinnedNotes(pinnedNotes.filter((n) => n.id !== note.id));
    } else {
      setPinnedNotes([...pinnedNotes, note]);
    }
  };

  const renderNotes = (notes: Note[], isPinned: boolean): JSX.Element => (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-7 space-y-7 mx-auto">
      {notes.map((note) => (
        <Card
          key={note.id}
          note={note}
          onClick={() => router.push(`/note/${note.id}`)}
          handleSelectNote={handleSelectNote}
          handlePinnedNote={handlePinnedNote}
          isPinned={pinnedNotes.some((n) => n.id === note.id)}
          isSelected={selectedNotes.some((n) => n.id === note.id)}
          disabledOptions={{
            select: true,
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen w-full px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-center items-center">
        <div className="max-w-7xl mx-auto">
          {pinnedNotes.length > 0 && (
            <div className="mb-8  flex flex-col justify-center items-center">
              <h2 className="text-2xl font-bold text-white mb-4">PINNED</h2>
              {renderNotes(pinnedNotes, true)}
            </div>
          )}
          <h2 className="text-2xl font-bold text-white mb-4">COLLABORATIONS</h2>
          {renderNotes(
            collaboratedNotes.filter(
              (note) => !pinnedNotes.some((p) => p.id === note.id)
            ),
            false
          )}
        </div>
      </div>
      <div className="fixed bottom-4 right-4 sm:hidden">
        <AddNote />
      </div>
    </div>
  );
};

export default Page;
