"use client";
import React from "react";
import Link from "next/link";
import {
  Home,
  LineChart,
  NotebookTabsIcon,
  Package,
  Package2,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { TooltipProvider } from "@radix-ui/react-tooltip";
import { SidebarLink } from "@/types";
import { SignedIn, UserButton } from "@clerk/nextjs";
import AddNote from "./AddNote";

// Define sidebar links data
export const sidebarLinks= [
  {
    icon: <NotebookTabsIcon className="h-5 w-5" />, // JSX element
    text: "Notium",
    href: "#",
    colorClass: "text-white",
    bgColorClass: "bg-primary",
  },

  // Add more sidebar links with the same structure
];

const Sidebar = () => {
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

          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
