'use client';

import { useNode } from '@craftjs/core';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      style={{
        width,
        height,
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
      }}
    >
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
        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
          <ImageIcon className="h-8 w-8 mb-2" />
          <span className="text-sm">Add image URL or upload</span>
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

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Image URL</Label>
        <Input
          type="text"
          value={src}
          placeholder="https://..."
          onChange={(e) =>
            setProp((props: ImageBlockProps) => {
              props.src = e.target.value;
            })
          }
        />
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
