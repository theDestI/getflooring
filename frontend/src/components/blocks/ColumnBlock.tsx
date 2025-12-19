'use client';

import { useNode } from '@craftjs/core';
import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ColumnBlockProps {
  children?: ReactNode;
  width?: string;
  padding?: number;
  background?: string;
}

export function ColumnBlock({
  children,
  width = '50%',
  padding = 8,
  background = 'transparent',
}: ColumnBlockProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`min-h-[50px] ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${!children ? 'border-2 border-dashed border-gray-200' : ''}`}
      style={{
        width,
        padding: `${padding}px`,
        background,
        flex: width === 'auto' ? 1 : undefined,
      }}
    >
      {children || (
        <div className="text-center text-gray-400 text-sm py-4">
          Drop blocks here
        </div>
      )}
    </div>
  );
}

function ColumnBlockSettings() {
  const {
    actions: { setProp },
    width,
    padding,
    background,
  } = useNode((node) => ({
    width: node.data.props.width,
    padding: node.data.props.padding,
    background: node.data.props.background,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Width</Label>
        <Input
          type="text"
          value={width}
          placeholder="50% or auto"
          onChange={(e) =>
            setProp((props: ColumnBlockProps) => {
              props.width = e.target.value;
            })
          }
        />
      </div>

      <div>
        <Label className="text-xs">Padding (px)</Label>
        <Input
          type="number"
          value={padding}
          onChange={(e) =>
            setProp((props: ColumnBlockProps) => {
              props.padding = parseInt(e.target.value) || 0;
            })
          }
          min={0}
        />
      </div>

      <div>
        <Label className="text-xs">Background</Label>
        <Input
          type="color"
          value={background === 'transparent' ? '#ffffff' : background}
          onChange={(e) =>
            setProp((props: ColumnBlockProps) => {
              props.background = e.target.value;
            })
          }
        />
      </div>
    </div>
  );
}

ColumnBlock.craft = {
  displayName: 'Column',
  isCanvas: true,
  props: {
    width: '50%',
    padding: 8,
    background: 'transparent',
  },
  rules: {
    canMoveIn: () => true,
  },
  related: {
    settings: ColumnBlockSettings,
  },
};
