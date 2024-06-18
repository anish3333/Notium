import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles for React Quill

interface TextEditorProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  setContent: (content: string) => void;
  onSave: () => void;
}

const TextEditor: React.FC<TextEditorProps> = ({
  isOpen,
  onClose,
  content,
  setContent,
  onSave,
}) => {
  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, "bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
  ];

  const handleClose = () => {
    onSave();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="p-5 max-w-fit h-fit bg-gray-800 border-none overflow-hidden flex items-center justify-center">
        <div className="h-fit flex justify-center items-center p-5">
          
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            className="w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TextEditor;
