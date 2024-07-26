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
  PlusCircle,
  Users,
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
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Reminder } from "@/types";
import ReminderModal from "./ReminderModal";

const sidebarLinks = [
  {
    icon: <Home className="h-5 w-5" />,
    text: "Home",
    href: "/",
  },
  {
    icon: <Package className="h-5 w-5" />,
    text: "Organization",
    href: "/organisation",
  },
  {
    icon: <Users className="h-5 w-5" />,
    text: "Collaborations",
    href: "/collaboration",
  }
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
    <aside className="fixed inset-y-0 left-0 flex flex-col w-64 bg-gray-900 text-white">
      <div className="flex items-center justify-center h-[68px] shadow-border-gray-700 ">
        <NotebookTabsIcon className="h-8 w-8 text-blue-400" />
        <span className="ml-2 text-xl font-semibold">Notium</span>
      </div>

      <nav className="flex-grow flex flex-col gap-2 p-4">
        {sidebarLinks.map((link, index) => (
          <Link
            href={link.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
          >
            {link.icon}
            <span>{link.text}</span>
          </Link>
        ))}
        <button
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200 relative"
          onClick={handleOpenReminderModal}
        >
          <Bell className="h-5 w-5" />
          <span>Reminders</span>
          {activeReminders > 0 && (
            <div className="w-5 h-4 rounded-full bg-red-500 text-white text-xs">
            <span className="m-auto p-auto">{activeReminders}</span>
          </div>
          )}
        </button>
        <div>
          <AddNote />
        </div>

        {hasSelectedNotes && (
          <>
            <button
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors duration-200"
              onClick={handleDeleteSelectedNotes}
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete Selected</span>
            </button>

            <button
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-blue-400 hover:bg-gray-800 hover:text-blue-300 transition-colors duration-200"
              onClick={handlePinSelectedNotes}
            >
              <Pin className="h-5 w-5" />
              <span>Pin Selected</span>
            </button>
          </>
        )}
      </nav>



      <div className="flex flex-col gap-2 p-4  mt-auto border-t border-gray-700">
        

        <Link
          href="/help"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
        >
          <HelpCircle className="h-5 w-5" />
          <span>Help</span>
        </Link>

        
      </div>

      <ReminderModal
        reminders={reminders}
        setIsReminderModalOpen={setIsReminderModalOpen}
        isReminderModalOpen={isReminderModalOpen}
      />
    </aside>
  );
};

export default Sidebar;


