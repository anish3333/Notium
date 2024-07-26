import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SetReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetReminder: (date: Date) => void;
  currentDate: Date;
}

export function SetReminderModal({
  isOpen,
  onClose,
  onSetReminder,
  currentDate,
}: SetReminderModalProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  const handleSetReminder = (e : React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (selectedDate) {
      onSetReminder(selectedDate);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Set Reminder</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => {
              setSelectedDate(date);
            }}
            showTimeSelect
            timeIntervals={15}
            minDate={new Date(currentDate.getTime() + 60000)} // Set minimum date to 1 minute from now
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholderText="Select date and time"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={
            (e) => {
              e.stopPropagation();
              onClose();
            }
          }>
            Cancel
          </Button>
          <Button onClick={handleSetReminder} disabled={!selectedDate}>
            Set Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
