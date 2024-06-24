export interface Note {
  id: string;
  content: string;
  createdAt: string;
  userId: string; // Add userId field
  // pinned: false;
}