import { useRef } from "react";
import { FaCopy } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "./ui/use-toast";
import { getShareOptions } from "@/lib/shareOptions";

interface ShareModalProps {
  url: string;
  open: boolean;
  handleClose?: () => void;
  title: string;
  description: string;
}

export default function ShareModal({
  url,
  open,
  handleClose = () => {},
  title, 
  description,
}: ShareModalProps) {
  const shareOptions = getShareOptions(url);
  const inputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      inputRef.current?.select();
      toast({
        title: "Link copied to clipboard",
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full">
            <div
              id="share-icons-container"
              className="w-full flex flex-wrap md:gap-x-10 gap-x-5 gap-y-2 md:px-4 justify-center"
            >
              {shareOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={option.name}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <option.icon className="h-4 w-4" />
                  </Button>
                </a>
              ))}
            </div>
          </div>
          <div className="w-full flex gap-3">
            <Input
              type="text"
              value={url}
              readOnly
              ref={inputRef}
              className="flex-grow"
            />
            <Button
              onClick={copyToClipboard}
              className="flex items-center gap-2"
            >
              <FaCopy className="h-4 w-4" />
              <span>Copy</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
