import { UserPreviewId } from "@clerk/types";
import { Timestamp } from "firebase/firestore";
import { LucideIcon } from "lucide-react";

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  userId: string; // Add userId field
  imageUrl: string[];
  orgId ?: string;
  reminderDate ?: Timestamp;
  reminderSent ?: boolean;
}

export interface UserDB {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatar: string;
  createdAt: string;
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

export interface Reminder {
  id: string;
  content: string;
  reminderDate: Timestamp;
  reminderSent ?: boolean;
}
