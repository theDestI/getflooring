'use client';

import { useNode } from '@craftjs/core';
import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RowBlockProps {
  children?: ReactNode;
  gap?: number;
  alignment?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

export function RowBlock({
  children,
  gap = 16,
  alignment = 'stretch',
  justify = 'start',
}: RowBlockProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const justifyMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
  };

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${!children ? 'border-2 border-dashed border-gray-200' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: `${gap}px`,
        alignItems: alignment,
        justifyContent: justifyMap[justify],
        minHeight: '50px',
      }}
    >
      {children || (
        <div className="flex-1 text-center text-gray-400 text-sm py-4">
          Drop columns or blocks here
        </div>
      )}
    </div>
  );
}

function RowBlockSettings() {
  const {
    actions: { setProp },
    gap,
    alignment,
    justify,
  } = useNode((node) => ({
    gap: node.data.props.gap,
    alignment: node.data.props.alignment,
    justify: node.data.props.justify,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Gap (px)</Label>
        <Input
          type="number"
          value={gap}
          onChange={(e) =>
            setProp((props: RowBlockProps) => {
              props.gap = parseInt(e.target.value) || 0;
            })
          }
          min={0}
        />
      </div>

      <div>
        <Label className="text-xs">Vertical Alignment</Label>
        <Select
          value={alignment}
          onValueChange={(value) =>
            setProp((props: RowBlockProps) => {
              props.alignment = value as RowBlockProps['alignment'];
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Top</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">Bottom</SelectItem>
            <SelectItem value="stretch">Stretch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Horizontal Distribution</Label>
        <Select
          value={justify}
          onValueChange={(value) =>
            setProp((props: RowBlockProps) => {
              props.justify = value as RowBlockProps['justify'];
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Start</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">End</SelectItem>
            <SelectItem value="between">Space Between</SelectItem>
            <SelectItem value="around">Space Around</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

RowBlock.craft = {
  displayName: 'Row',
  isCanvas: true,
  props: {
    gap: 16,
    alignment: 'stretch',
    justify: 'start',
  },
  rules: {
    canMoveIn: () => true,
  },
  related: {
    settings: RowBlockSettings,
  },
};
