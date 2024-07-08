"use client";
import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { Home, NotebookTabsIcon, Trash2, Pin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { NotesListContext } from "@/context/NotesListContext";
import { SignedIn, UserButton } from "@clerk/nextjs";
import AddNote from "./AddNote";
import { Note } from "@/types";

export const sidebarLinks = [
  {
    icon: <NotebookTabsIcon className="h-5 w-5" />,
    text: "Notium",
    href: "#",
    colorClass: "text-white",
    bgColorClass: "bg-primary",
  },
  // Add more sidebar links with the same structure
];

const Sidebar = () => {
  const {
    deleteSelectedNotes,
    pinSelectedNotes,
  } = useContext(NotesListContext);

  const {selectedNotes} = useContext(NotesListContext); 
  const [hasSelectedNotes, setHasSelectedNotes] = useState(false);

  const handleDeleteSelectedNotes = async () => {
    await deleteSelectedNotes();
  };

  useEffect(() => {
    setHasSelectedNotes(selectedNotes.length > 0);
  }, [selectedNotes]);

  return (
    <TooltipProvider>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          {sidebarLinks.map((link, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${link.colorClass} transition-colors hover:text-foreground md:h-8 md:w-8 ${link.bgColorClass}`}
                >
                  {link.icon}
                  <span className="sr-only">{link.text}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{link.text}</TooltipContent>
            </Tooltip>
          ))}

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <AddNote />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">Add Note</TooltipContent>
          </Tooltip>

          {hasSelectedNotes && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white bg-red-500 transition-colors hover:text-foreground md:h-8 md:w-8"
                    onClick={handleDeleteSelectedNotes}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Delete Selected Notes
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white bg-blue-500 transition-colors hover:text-foreground md:h-8 md:w-8"
                    onClick={pinSelectedNotes}
                  >
                    <Pin className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Pin Selected Notes</TooltipContent>
              </Tooltip>
            </>
          )}

          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
