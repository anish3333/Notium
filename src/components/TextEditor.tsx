import React, { useState, useContext } from "react";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import { NotesListContext } from "@/context/NotesListContext";

interface TextEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string, imageUrl: string[]) => Promise<void>;
}

const TextEditor: React.FC<TextEditorProps> = ({ isOpen, onClose, onSave }) => {
  const [content, setContent] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const { addImageToStorage } = useContext(NotesListContext);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setImageFiles((prevFiles) => [...prevFiles, ...files]);
      const urls = files.map((file) => URL.createObjectURL(file));
      setImageUrl((prevUrls) => [...prevUrls, ...urls]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setImageUrl((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  const handleSaveAndClose = async () => {
    setUploading(true);
    try {
      const uploadedUrls = await Promise.all(
        imageFiles.map((file) => addImageToStorage(file))
      );
      await onSave(content, uploadedUrls);
      setImageFiles([]);
      setImageUrl([]);
      setContent("");
      setUploading(false);
      onClose();
    } catch (error: any) {
      setUploadError(error.message);
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleSaveAndClose}>
      <DialogContent
        asChild
        className="fixed max-w-md p-6"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 flex flex-col gap-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 p-2 border rounded-md"
            placeholder="Enter your note content..."
          />

          <input type="file" multiple onChange={handleImageUpload} />
          <div className="max-h-96 overflow-y-auto">
            {uploading && <p>Uploading image...</p>}
            {uploadError && <p className="text-red-500">{uploadError}</p>}
            {imageUrl.length > 0 &&
              imageUrl.map((url, index) => (
                <div className="relative" key={index}>
                  <img src={url} alt="Uploaded" className="w-full h-auto" />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={handleSaveAndClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={uploading}
            >
              Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TextEditor;
