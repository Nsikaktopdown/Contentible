"use client"

import React from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ExternalLink, Image as ImageIcon, Globe, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface URLMetadata {
  url: string
  title?: string
  description?: string
  image?: string
  favicon?: string
}

interface URLPreviewProps {
  metadata: URLMetadata
}

export function URLPreview({ metadata }: URLPreviewProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [imageError, setImageError] = React.useState(false)
  const [faviconError, setFaviconError] = React.useState(false)

  const hostname = React.useMemo(() => {
    try {
      return new URL(metadata.url).hostname
    } catch (e) {
      return metadata.url
    }
  }, [metadata.url])

  return (
    <div className="w-full max-w-md">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div 
          onClick={() => setIsOpen(true)}
          className="flex cursor-pointer items-start space-x-4 rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex-shrink-0">
            {metadata.image && !imageError ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-md bg-gray-100">
                <Image
                  src={metadata.image}
                  alt={metadata.title || 'URL preview'}
                  width={64}
                  height={64}
                  className="object-cover"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">
              {metadata.title || hostname}
            </h4>
            {metadata.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {metadata.description}
              </p>
            )}
            <div className="mt-2 flex items-center space-x-1 text-sm text-gray-500">
              {metadata.favicon && !faviconError ? (
                <Image
                  src={metadata.favicon}
                  alt=""
                  width={16}
                  height={16}
                  className="rounded-sm"
                  onError={() => setFaviconError(true)}
                  unoptimized
                />
              ) : (
                <Globe className="h-4 w-4 text-gray-400" />
              )}
              <span className="truncate">{hostname}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </div>
          </div>
        </div>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogHeader className="flex items-center justify-between p-4 border-b">
            <DialogTitle className="flex items-center space-x-2 text-base">
              {!faviconError && metadata.favicon && (
                <Image
                  src={metadata.favicon}
                  alt=""
                  width={16}
                  height={16}
                  className="rounded-sm"
                  onError={() => setFaviconError(true)}
                  unoptimized
                />
              )}
              <span className="truncate">{metadata.title || hostname}</span>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => window.open(metadata.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="relative w-full h-[80vh]">
            <iframe
              src={metadata.url}
              title={metadata.title || 'URL preview'}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 