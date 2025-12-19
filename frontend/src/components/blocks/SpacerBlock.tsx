'use client';

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SpacerBlockProps {
  height?: number;
}

export function SpacerBlock({ height = 40 }: SpacerBlockProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`${selected ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50' : 'bg-gray-50'}`}
      style={{
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span className="text-xs text-gray-400">{height}px</span>
    </div>
  );
}

function SpacerBlockSettings() {
  const {
    actions: { setProp },
    height,
  } = useNode((node) => ({
    height: node.data.props.height,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Height (px)</Label>
        <Input
          type="number"
          value={height}
          onChange={(e) =>
            setProp((props: SpacerBlockProps) => {
              props.height = parseInt(e.target.value) || 20;
            })
          }
          min={0}
          step={10}
        />
      </div>
    </div>
  );
}

SpacerBlock.craft = {
  displayName: 'Spacer',
  props: {
    height: 40,
  },
  related: {
    settings: SpacerBlockSettings,
  },
};
