"use client";

import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  NotebookTabsIcon,
  Trash2,
  Pin,
  Package,
  HelpCircle,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotesListContext } from "@/context/NotesListContext";
import { OrganizationContext } from "@/context/OrganisationContext";
import { SignedIn, UserButton } from "@clerk/nextjs";
import AddNote from "./AddNote";

const sidebarLinks = [
  { icon: <Home className="h-5 w-5" />, text: "Home", href: "/" },
  {
    icon: <Package className="h-5 w-5" />,
    text: "Organization",
    href: "/organisation",
  },
];

const Drawer = () => {
  const { deleteSelectedNotes, pinSelectedNotes, selectedNotes } =
    useContext(NotesListContext);
  const { currentOrganization, pinAllOrgSelectedNotes } =
    useContext(OrganizationContext);
  const [hasSelectedNotes, setHasSelectedNotes] = useState(false);

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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Menu className="h-5 w-5" color="white" />
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs bg-white">
        <nav className="flex flex-col h-full justify-between">
          <div className="flex flex-col gap-4 p-2">
          <div className="flex h-16 items-center justify-center">
            <h1>Notium.</h1>
          </div>
            {sidebarLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="flex items-center gap-2 text-gray-500 hover:bg-gray-100 rounded-lg p-2"
              >
                {link.icon}
                <span>{link.text}</span>
              </Link>
            ))}
          </div>
          <div>
            <div className="flex flex-col gap-4 mt-auto ">
              <AddNote />
              {hasSelectedNotes && (
                <div className="flex flex-col items-start justify-start gap-2">
                  <Button
                    className="flex gap-4 text-red-500 bg-white hover:bg-red-100"
                    onClick={handleDeleteSelectedNotes}
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>Delete Selected Notes</span>
                  </Button>
                  <Button
                    className="flex gap-4 text-blue-500 bg-white hover:bg-blue-100"
                    onClick={handlePinSelectedNotes}
                  >
                    <Pin className="h-5 w-5" />
                    <span>Pin Selected Notes</span>
                  </Button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4 p-2 mt-auto mb-5">
              <Link
                href="/help"
                className="flex items-center gap-2 text-gray-500 hover:bg-gray-100 rounded-lg p-2"
              >
                <HelpCircle className="h-5 w-5" />
                <span>Help</span>
              </Link>
              <div className="flex items-center gap-2 text-gray-500 hover:bg-gray-100 rounded-lg p-2">
                <SignedIn>
                  <UserButton
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "h-5 w-5",
                      },
                    }}
                  />
                </SignedIn>
                <span>Account</span>
              </div>
            </div>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default Drawer;
