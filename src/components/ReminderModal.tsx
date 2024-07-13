
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Reminder } from "@/types";

interface ReminderModalProps {
  reminders: Reminder[];
  isReminderModalOpen: boolean;
  setIsReminderModalOpen: (isOpen: boolean) => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({
  reminders,
  isReminderModalOpen,
  setIsReminderModalOpen,
}) => {
  return (
    <Dialog open={isReminderModalOpen} onOpenChange={setIsReminderModalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reminders</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">
            Upcoming Reminders Due Today
          </h3>
          {reminders.filter((r) => r.reminderDate.toDate() > new Date())
            .length > 0 ? (
            <ul className="space-y-2">
              {reminders
                .filter((r) => r.reminderDate.toDate() > new Date())
                .map((reminder) => (
                  <li key={reminder.id} className="bg-blue-100 p-2 rounded">
                    <p className="font-medium">{reminder.content}</p>
                    <p className="text-sm text-gray-600">
                      {reminder.reminderDate.toDate().toLocaleString()}
                    </p>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500">No upcoming reminders</p>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Past Reminders</h3>
          {reminders.filter((r) => r.reminderDate.toDate() <= new Date())
            .length > 0 ? (
            <ul className="space-y-2">
              {reminders
                .filter((r) => r.reminderDate.toDate() <= new Date())
                .map((reminder) => (
                  <li key={reminder.id} className="bg-gray-100 p-2 rounded">
                    <p className="font-medium">{reminder.content}</p>
                    <p className="text-sm text-gray-600">
                      {reminder.reminderDate.toDate().toLocaleString()}
                    </p>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500">No past reminders</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderModal;
