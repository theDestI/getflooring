'use client';

import { useNode } from '@craftjs/core';
import { ReactNode } from 'react';

interface ContainerProps {
  children?: ReactNode;
  background?: string;
  padding?: number;
}

export function Container({
  children,
  background = 'transparent',
  padding = 0,
}: ContainerProps) {
  const {
    connectors: { connect },
  } = useNode();

  // Check if we have actual children (not just empty)
  const hasChildren = children && (
    Array.isArray(children) ? children.length > 0 : true
  );

  return (
    <div
      ref={(ref) => { if (ref) connect(ref); }}
      className="craftjs-container"
      style={{
        background,
        padding: padding || 8,
        minHeight: '200px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {children}
      {/* Always show a drop zone at the bottom */}
      <div
        className="flex items-center justify-center text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded p-4 opacity-50 hover:opacity-100 hover:border-[var(--amber)] hover:text-[var(--amber)] transition-all"
        style={{ minHeight: hasChildren ? '40px' : '150px' }}
      >
        {hasChildren ? '+ Drop more blocks here' : 'Drop blocks here to start building'}
      </div>
    </div>
  );
}

Container.craft = {
  displayName: 'Container',
  isCanvas: true,
  props: {
    background: 'transparent',
    padding: 0,
  },
  rules: {
    canDrag: () => false,
    canMoveIn: () => true,
  },
};
