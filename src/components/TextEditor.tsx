import React from "react";
import { Dialog, DialogContent, DialogOverlay } from "@radix-ui/react-dialog";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles for React Quill

interface TextEditorProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  setContent: (content: string) => void;
  onSave: () => Promise<void>;
  onDelete?: () => Promise<void> | undefined;
}

const TextEditor: React.FC<TextEditorProps> = ({
  isOpen,
  onClose,
  content,
  setContent,
  onSave,
  onDelete
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

  const handleSaveAndClose = async () => {
    await onSave();
    onClose();
  };

  const handleDelete = async () => {
    if(onDelete) {
      await onDelete();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleSaveAndClose}>
      {/* <DialogOverlay className="fixed inset-0 bg-black bg-opacity-30 justify-center w-fit h-fit" /> */}
      <DialogContent className="fixed inset-0 flex items-center justify-center p-4 w-fit h-fit m-auto ">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 flex flex-col gap-9">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            className="w-full h-[10rem]"
          />
          <div className="flex justify-end mt-4 gap-4">
            <button
              onClick={handleSaveAndClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
            {
              onDelete && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              )
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TextEditor;
