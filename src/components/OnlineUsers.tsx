import React from 'react';
import { UserDB } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OnlineUsersProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  users: UserDB[];
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({ isOpen, onOpenChange, users }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Online Users</DialogTitle>
        </DialogHeader>
        <ul className="space-y-2 mt-4">
          {users.length ? users.map(user => (
            <li key={user.id} className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{user.email}</span>
            </li>
          )) : <p>No users online</p>}
        </ul>
      </DialogContent>
    </Dialog>
  );
};

export default OnlineUsers;