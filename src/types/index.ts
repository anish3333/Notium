import { UserPreviewId } from "@clerk/types";
import { LucideIcon } from "lucide-react";

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  userId: string; // Add userId field
  imageUrl: string[];
  // pinned: false;
}

export interface SidebarLink {
  icon: LucideIcon;
  text: string;
  href: string;
  colorClass: string;
  bgColorClass: string; 
}

export interface Collaboration {
  author: string;
  collaborators: string[];
}