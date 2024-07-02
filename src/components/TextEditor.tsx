import React, { useState } from "react";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/firebase/firebaseConfig"; // Ensure you have this configured

interface TextEditorProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  setContent: (content: string) => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  onSave?: () => Promise<void>;
  onDelete?: () => Promise<void> | undefined;
}

const TextEditor: React.FC<TextEditorProps> = ({
  isOpen,
  onClose,
  content,
  setContent,
  imageUrl,
  setImageUrl,
  onSave,
  onDelete
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      () => {
        setUploading(true);
        setUploadError(null);
      },
      (error) => {
        setUploading(false);
        setUploadError(error.message);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setImageUrl(downloadURL);
        setUploading(false);
      }
    );
  };

  const handleSaveAndClose = async () => {
    if (onSave) {
      await onSave();
    }
    onClose();
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
    }
    onClose();
  };

  const handleRemoveImage = () => {
    setImageUrl("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleSaveAndClose}>
      <DialogContent className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 flex flex-col gap-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 p-2 border rounded-md"
            placeholder="Enter your note content..."
          />
          <input type="file" onChange={handleImageUpload} />
          {uploading && <p>Uploading image...</p>}
          {uploadError && <p className="text-red-500">{uploadError}</p>}
          {imageUrl && (
            <div className="relative">
              <img src={imageUrl} alt="Uploaded" className="w-full h-auto" />
              <button
                onClick={handleRemoveImage}
                className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded"
              >
                Remove
              </button>
            </div>
          )}
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={handleSaveAndClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TextEditor;
