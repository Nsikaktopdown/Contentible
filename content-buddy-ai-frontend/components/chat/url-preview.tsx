import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

type URLPreviewProps = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  onClick: () => void;
};

export function URLPreview({ url, title, description, image, onClick }: URLPreviewProps) {
  return (
    <Card 
      className="overflow-hidden hover:bg-gray-50 transition-colors cursor-pointer mt-2"
      onClick={onClick}
    >
      <div className="flex items-start gap-4 p-4">
        {image && (
          <div className="w-24 h-24 flex-shrink-0">
            <img 
              src={image} 
              alt={title || url}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-gray-800 mb-1 truncate">
            {title || url}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <ExternalLink className="h-3 w-3" />
            <span className="truncate">{url}</span>
          </div>
        </div>
      </div>
    </Card>
  );
} 