import React from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Reminder } from "@/types";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  return (
    <Dialog open={isReminderModalOpen} onOpenChange={setIsReminderModalOpen}>
      <DialogContent className="flex flex-col w-full max-w-md max-h-[90vh] p-4 overflow-hidden">
        <div className="flex flex-col flex-grow overflow-hidden">
          <div className="flex-shrink-0 mb-4">
            <h3 className="text-lg font-semibold">
              Upcoming Reminders Due Today
            </h3>
          </div>
          <div className="flex-grow overflow-auto mb-4 gap-2">
            {reminders.filter((r) => r.reminderDate.toDate() >= new Date())
              .length > 0 ? (
              <>
                {reminders
                  .filter((r) => r.reminderDate.toDate() > new Date())
                  .map((reminder) => (
                    <div
                      onClick={() => {
                        setIsReminderModalOpen(false);
                        router.push(`/note/${reminder.id}`);
                      }}
                      key={reminder.id}
                      className="bg-blue-100 p-2 rounded"
                    >
                      <p className="font-medium">
                        {reminder.content.slice(0, 100) + "..."}
                      </p>
                      <p className="text-sm text-gray-600">
                        {reminder.reminderDate.toDate().toLocaleString()}
                      </p>
                    </div>
                  ))}
              </>
            ) : (
              <p className="text-gray-500">No upcoming reminders</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderModal;
