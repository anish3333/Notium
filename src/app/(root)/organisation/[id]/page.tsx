'use client';

import Card from "@/components/Card";
import { OrganizationContext } from "@/context/OrganisationContext";
import { Note } from "@/types";
import { useRouter } from "next/navigation";
import React, { useContext } from "react";

const Page = () => {
  const router = useRouter();
  const { 
    currentOrganization, 
    orgNotes, 
    orgPinnedNotes, 
    orgSelectedNotes, 
    setOrgPinnedNotes, 
    setOrgSelectedNotes 
  } = useContext(OrganizationContext);

  const handleSelectNote = (note: Note) => {
    if (!currentOrganization) return;
    const orgId = currentOrganization.id;
    const currentSelected = orgSelectedNotes[orgId] || [];
    const isSelected = currentSelected.some(n => n.id === note.id);
    
    if (isSelected) {
      setOrgSelectedNotes(orgId, currentSelected.filter(n => n.id !== note.id));
    } else {
      setOrgSelectedNotes(orgId, [...currentSelected, note]);
    }
  };

  const handlePinnedNote = (note: Note) => {
    if (!currentOrganization) return;
    const orgId = currentOrganization.id;
    const currentPinned = orgPinnedNotes[orgId] || [];
    const isPinned = currentPinned.some(n => n.id === note.id);
    
    if (isPinned) {
      setOrgPinnedNotes(orgId, currentPinned.filter(n => n.id !== note.id));
    } else {
      setOrgPinnedNotes(orgId, [...currentPinned, note]);
    }
  };

  const pinnedNotes = currentOrganization 
    ? orgPinnedNotes[currentOrganization.id] || []
    : [];

  return (
    <div className="flex flex-col h-screen w-full px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center w-full">
        <div className="flex flex-col w-full max-w-7xl px-4 py-6">
          {pinnedNotes.length > 0 && (
            <div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">PINNED</h2>
              </div>
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 mb-10">
                {pinnedNotes.map((note) => (
                  <Card
                    isOpen={true}
                    key={note.id}
                    note={note}
                    onClick={() => router.push(`/note/${note.id}`)}
                    handleSelectNote={handleSelectNote}
                    handlePinnedNote={handlePinnedNote}
                    isPinned={true}
                    isSelected={currentOrganization && orgSelectedNotes[currentOrganization.id]?.some(n => n.id === note.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">NOTES</h2>
          </div>
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {orgNotes.length > 0 && orgNotes.map((note) => {
              if (currentOrganization && orgPinnedNotes[currentOrganization.id]?.some(n => n.id === note.id)) return null;
              return (
                <Card
                  isOpen={true}
                  key={note.id}
                  note={note}
                  onClick={() => router.push(`/note/${note.id}`)}
                  handleSelectNote={handleSelectNote}
                  handlePinnedNote={handlePinnedNote}
                  isPinned={false}
                  isSelected={currentOrganization && orgSelectedNotes[currentOrganization.id]?.some(n => n.id === note.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;