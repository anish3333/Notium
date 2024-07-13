"use client";
import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  NotebookTabsIcon,
  Trash2,
  Pin,
  Package,
  Bell,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { NotesListContext } from "@/context/NotesListContext";
import { OrganizationContext } from "@/context/OrganisationContext";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import AddNote from "./AddNote";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Reminder } from "@/types";
import ReminderModal from "./ReminderModal";

const sidebarLinks = [
  { icon: <Home className="h-5 w-5" />, text: "Home", href: "/" },
  {
    icon: <Package className="h-5 w-5" />,
    text: "Organization",
    href: "/organisation",
  },
];

const Sidebar = () => {
  const { deleteSelectedNotes, pinSelectedNotes, selectedNotes } =
    useContext(NotesListContext);
  const { currentOrganization, pinAllOrgSelectedNotes } =
    useContext(OrganizationContext);
  const [hasSelectedNotes, setHasSelectedNotes] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const { user } = useUser();
  const userId = user?.id;

  const handleDeleteSelectedNotes = async () => {
    deleteSelectedNotes();
  };

  const handlePinSelectedNotes = async () => {
    if (currentOrganization) {
      pinAllOrgSelectedNotes();
    } else {
      await pinSelectedNotes();
    }
  };

  useEffect(() => {
    setHasSelectedNotes(selectedNotes.length > 0);
  }, [selectedNotes]);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "notes"),
      where("userId", "==", userId),
      where("reminderDate", "!=", null)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const remindersData: Reminder[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        remindersData.push({
          id: doc.id,
          content: data.content,
          reminderDate: data.reminderDate,
        });
      });
      setReminders(remindersData);
    });

    return () => unsubscribe();
  }, [userId]);

  const activeReminders = reminders.filter(
    (reminder) =>
      reminder.reminderDate.toDate() > new Date() &&
      reminder.reminderDate.toDate() <
        new Date(new Date().getTime() + 1000 * 60 * 60 * 24) &&
      !reminder.reminderSent
  ).length;

  const handleOpenReminderModal = () => {
    setIsReminderModalOpen(true);
  };

  return (
    <TooltipProvider>
      <aside className="fixed inset-y-0 left-0 z-10 flex w-16 flex-col border-r bg-white">
        <div className="flex h-16 items-center justify-center">
          <NotebookTabsIcon className="h-5 w-5 text-gray-500" />
        </div>
        <nav className="flex flex-1 flex-col items-center gap-4 p-2">
          {sidebarLinks.map((link, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  {link.icon}
                  <span className="sr-only">{link.text}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{link.text}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <div className="flex flex-col items-center gap-4 p-2">
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
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-red-500 hover:bg-red-100"
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
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-blue-500 hover:bg-blue-100"
                    onClick={handlePinSelectedNotes}
                  >
                    <Pin className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Pin Selected Notes</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
        <div className="flex flex-col items-center gap-4 p-2 mt-auto mb-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg text-blue-500 hover:bg-blue-100 relative"
                onClick={handleOpenReminderModal}
              >
                <Bell className="h-5 w-5" />
                {activeReminders > 0 && (
                  <div className="absolute flex items-center justify-center top-1 right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 text-center px-1 ">
                    {activeReminders}
                  </div>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Reminders</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/help"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <HelpCircle className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Help</TooltipContent>
          </Tooltip>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-5 w-5",
                },
              }}
            />
          </SignedIn>
        </div>
      </aside>

      <ReminderModal
        reminders={reminders}
        setIsReminderModalOpen={setIsReminderModalOpen}
        isReminderModalOpen={isReminderModalOpen}
      />
    </TooltipProvider>
  );
};

export default Sidebar;
