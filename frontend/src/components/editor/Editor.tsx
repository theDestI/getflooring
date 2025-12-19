'use client';

import { Editor as CraftEditor } from '@craftjs/core';
import { useState } from 'react';
import { TextBlock } from '../blocks/TextBlock';
import { ImageBlock } from '../blocks/ImageBlock';
import { TableBlock } from '../blocks/TableBlock';
import { RowBlock } from '../blocks/RowBlock';
import { ColumnBlock } from '../blocks/ColumnBlock';
import { SpacerBlock } from '../blocks/SpacerBlock';
import { DividerBlock } from '../blocks/DividerBlock';
import { Container } from '../blocks/Container';
import { EditorContent } from './EditorContent';
import type { PageSettings } from '@/types/template';

interface EditorProps {
  templateId?: string;
  initialState?: string;
  pageSettings?: PageSettings;
}

const defaultPageSettings: PageSettings = {
  size: 'A4',
  orientation: 'portrait',
  margins: { top: 40, right: 40, bottom: 40, left: 40 },
};

// Register all block components with Craft.js
const resolver = {
  TextBlock,
  ImageBlock,
  TableBlock,
  RowBlock,
  ColumnBlock,
  SpacerBlock,
  DividerBlock,
  Container,
};

export function TemplateEditor({
  templateId,
  initialState,
  pageSettings = defaultPageSettings,
}: EditorProps) {
  const [settings, setSettings] = useState<PageSettings>(pageSettings);

  return (
    <div className="h-screen flex flex-col bg-[var(--background)] overflow-hidden">
      {/* Subtle grid overlay for the entire editor */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <div className="w-full h-full blueprint-dots" />
      </div>

      <CraftEditor resolver={resolver}>
        <EditorContent
          templateId={templateId}
          initialState={initialState}
          pageSettings={settings}
          onPageSettingsChange={setSettings}
        />
      </CraftEditor>

      {/* Corner decorations */}
      <div className="fixed bottom-4 left-4 z-30 pointer-events-none">
        <div className="flex items-center gap-2 text-[var(--muted-foreground)]/40 text-xs font-mono">
          <div className="w-2 h-2 border-l-2 border-b-2 border-[var(--amber)]/30" />
          <span>FloorCraft Studio</span>
        </div>
      </div>
    </div>
  );
}
