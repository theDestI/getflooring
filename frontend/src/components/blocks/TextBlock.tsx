'use client';

import { useNode, useEditor } from '@craftjs/core';
import { useEditor as useTiptapEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TextBlockProps {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  lineHeight?: number;
}

export function TextBlock({
  text = '',
  fontSize = 16,
  fontFamily = 'Inter, sans-serif',
  textAlign = 'left',
  color = '#000000',
  lineHeight = 1.5,
}: TextBlockProps) {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const editor = useTiptapEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start typing...',
      }),
    ],
    content: text,
    editable: enabled,
    immediatelyRender: false, // Required for SSR/Next.js to avoid hydration mismatches
    onUpdate: ({ editor }) => {
      setProp((props: TextBlockProps) => {
        props.text = editor.getHTML();
      });
    },
  });

  useEffect(() => {
    if (editor && text !== editor.getHTML()) {
      editor.commands.setContent(text);
    }
  }, [text, editor]);

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`p-2 ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      style={{
        fontSize: `${fontSize}px`,
        fontFamily,
        textAlign,
        color,
        lineHeight,
      }}
    >
      <EditorContent editor={editor} className="outline-none" />
    </div>
  );
}

// Settings panel for the text block
function TextBlockSettings() {
  const {
    actions: { setProp },
    fontSize,
    fontFamily,
    textAlign,
    color,
    lineHeight,
  } = useNode((node) => ({
    fontSize: node.data.props.fontSize,
    fontFamily: node.data.props.fontFamily,
    textAlign: node.data.props.textAlign,
    color: node.data.props.color,
    lineHeight: node.data.props.lineHeight,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Font Size</Label>
        <Input
          type="number"
          value={fontSize}
          onChange={(e) =>
            setProp((props: TextBlockProps) => {
              props.fontSize = parseInt(e.target.value) || 16;
            })
          }
          min={8}
          max={72}
        />
      </div>

      <div>
        <Label className="text-xs">Font Family</Label>
        <Select
          value={fontFamily}
          onValueChange={(value) =>
            setProp((props: TextBlockProps) => {
              props.fontFamily = value;
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter, sans-serif">Inter</SelectItem>
            <SelectItem value="Georgia, serif">Georgia</SelectItem>
            <SelectItem value="monospace">Monospace</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Text Align</Label>
        <Select
          value={textAlign}
          onValueChange={(value) =>
            setProp((props: TextBlockProps) => {
              props.textAlign = value as TextBlockProps['textAlign'];
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
            <SelectItem value="justify">Justify</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Color</Label>
        <Input
          type="color"
          value={color}
          onChange={(e) =>
            setProp((props: TextBlockProps) => {
              props.color = e.target.value;
            })
          }
        />
      </div>

      <div>
        <Label className="text-xs">Line Height</Label>
        <Input
          type="number"
          value={lineHeight}
          onChange={(e) =>
            setProp((props: TextBlockProps) => {
              props.lineHeight = parseFloat(e.target.value) || 1.5;
            })
          }
          step={0.1}
          min={1}
          max={3}
        />
      </div>
    </div>
  );
}

TextBlock.craft = {
  displayName: 'Text',
  props: {
    text: '',
    fontSize: 16,
    fontFamily: 'Inter, sans-serif',
    textAlign: 'left',
    color: '#000000',
    lineHeight: 1.5,
  },
  related: {
    settings: TextBlockSettings,
  },
};
