'use client';

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DividerBlockProps {
  thickness?: number;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  margin?: number;
}

export function DividerBlock({
  thickness = 1,
  color = '#e0e0e0',
  style = 'solid',
  margin = 16,
}: DividerBlockProps) {
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
        margin: `${margin}px 0`,
      }}
    >
      <hr
        style={{
          border: 'none',
          borderTop: `${thickness}px ${style} ${color}`,
        }}
      />
    </div>
  );
}

function DividerBlockSettings() {
  const {
    actions: { setProp },
    thickness,
    color,
    style,
    margin,
  } = useNode((node) => ({
    thickness: node.data.props.thickness,
    color: node.data.props.color,
    style: node.data.props.style,
    margin: node.data.props.margin,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Thickness (px)</Label>
        <Input
          type="number"
          value={thickness}
          onChange={(e) =>
            setProp((props: DividerBlockProps) => {
              props.thickness = parseInt(e.target.value) || 1;
            })
          }
          min={1}
          max={10}
        />
      </div>

      <div>
        <Label className="text-xs">Color</Label>
        <Input
          type="color"
          value={color}
          onChange={(e) =>
            setProp((props: DividerBlockProps) => {
              props.color = e.target.value;
            })
          }
        />
      </div>

      <div>
        <Label className="text-xs">Style</Label>
        <Select
          value={style}
          onValueChange={(value) =>
            setProp((props: DividerBlockProps) => {
              props.style = value as DividerBlockProps['style'];
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Vertical Margin (px)</Label>
        <Input
          type="number"
          value={margin}
          onChange={(e) =>
            setProp((props: DividerBlockProps) => {
              props.margin = parseInt(e.target.value) || 0;
            })
          }
          min={0}
        />
      </div>
    </div>
  );
}

DividerBlock.craft = {
  displayName: 'Divider',
  props: {
    thickness: 1,
    color: '#e0e0e0',
    style: 'solid',
    margin: 16,
  },
  related: {
    settings: DividerBlockSettings,
  },
};
