'use client';

import { useNode } from '@craftjs/core';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ImageBlockProps {
  src?: string;
  alt?: string;
  fit?: 'contain' | 'cover' | 'fill';
  width?: string;
  height?: string;
  borderRadius?: number;
}

export function ImageBlock({
  src = '',
  alt = 'Image',
  fit = 'contain',
  width = '100%',
  height = '200px',
  borderRadius = 0,
}: ImageBlockProps) {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setProp((props: ImageBlockProps) => {
          props.src = dataUrl;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    if (!src) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${!src ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      style={{
        width,
        height,
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
      }}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: fit,
          }}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400 transition-colors">
          <Upload className="h-8 w-8 mb-2" />
          <span className="text-sm font-medium">Click to upload image</span>
          <span className="text-xs mt-1">or paste URL in settings</span>
        </div>
      )}
    </div>
  );
}

function ImageBlockSettings() {
  const {
    actions: { setProp },
    src,
    alt,
    fit,
    width,
    height,
    borderRadius,
  } = useNode((node) => ({
    src: node.data.props.src,
    alt: node.data.props.alt,
    fit: node.data.props.fit,
    width: node.data.props.width,
    height: node.data.props.height,
    borderRadius: node.data.props.borderRadius,
  }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setProp((props: ImageBlockProps) => {
          props.src = dataUrl;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProp((props: ImageBlockProps) => {
      props.src = '';
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div>
        <Label className="text-xs mb-2 block">Upload Image</Label>
        <div className="flex gap-2">
          <label className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full h-9 text-xs border-[var(--border)] hover:border-[var(--amber)] hover:text-[var(--amber)]"
              onClick={(e) => {
                e.preventDefault();
                (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
              }}
            >
              <Upload className="h-3.5 w-3.5 mr-2" />
              Choose File
            </Button>
          </label>
          {src && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 text-xs border-[var(--border)] hover:border-red-500 hover:text-red-500"
              onClick={handleRemoveImage}
            >
              Remove
            </Button>
          )}
        </div>
        {src && src.startsWith('data:') && (
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            ✓ Local image uploaded
          </p>
        )}
      </div>

      <div className="h-px bg-[var(--border)]" />

      <div>
        <Label className="text-xs">Image URL</Label>
        <Input
          type="text"
          value={src?.startsWith('data:') ? '' : src}
          placeholder="https://..."
          onChange={(e) =>
            setProp((props: ImageBlockProps) => {
              props.src = e.target.value;
            })
          }
        />
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Or paste an external image URL
        </p>
      </div>

      <div>
        <Label className="text-xs">Alt Text</Label>
        <Input
          type="text"
          value={alt}
          onChange={(e) =>
            setProp((props: ImageBlockProps) => {
              props.alt = e.target.value;
            })
          }
        />
      </div>

      <div>
        <Label className="text-xs">Fit</Label>
        <Select
          value={fit}
          onValueChange={(value) =>
            setProp((props: ImageBlockProps) => {
              props.fit = value as ImageBlockProps['fit'];
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contain">Contain</SelectItem>
            <SelectItem value="cover">Cover</SelectItem>
            <SelectItem value="fill">Fill</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Width</Label>
        <Input
          type="text"
          value={width}
          onChange={(e) =>
            setProp((props: ImageBlockProps) => {
              props.width = e.target.value;
            })
          }
        />
      </div>

      <div>
        <Label className="text-xs">Height</Label>
        <Input
          type="text"
          value={height}
          onChange={(e) =>
            setProp((props: ImageBlockProps) => {
              props.height = e.target.value;
            })
          }
        />
      </div>

      <div>
        <Label className="text-xs">Border Radius</Label>
        <Input
          type="number"
          value={borderRadius}
          onChange={(e) =>
            setProp((props: ImageBlockProps) => {
              props.borderRadius = parseInt(e.target.value) || 0;
            })
          }
          min={0}
        />
      </div>
    </div>
  );
}

ImageBlock.craft = {
  displayName: 'Image',
  props: {
    src: '',
    alt: 'Image',
    fit: 'contain',
    width: '100%',
    height: '200px',
    borderRadius: 0,
  },
  related: {
    settings: ImageBlockSettings,
  },
};
