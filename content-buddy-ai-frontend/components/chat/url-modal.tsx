import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";

type URLModalProps = {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
};

export function URLModal({ isOpen, onClose, url, title }: URLModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0">
        <DialogHeader className="px-4 py-2 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span className="text-sm font-medium truncate">{title || url}</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Open in new tab
            </a>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 h-full">
          <iframe
            src={url}
            title={title || url}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 