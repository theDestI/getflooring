'use client';

import { useEditor } from '@craftjs/core';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Type,
  Image,
  Table2,
  Columns,
  Rows3,
  Minus,
  Square,
  Wrench,
  Layers,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import { TextBlock } from '../blocks/TextBlock';
import { ImageBlock } from '../blocks/ImageBlock';
import { TableBlock } from '../blocks/TableBlock';
import { RowBlock } from '../blocks/RowBlock';
import { ColumnBlock } from '../blocks/ColumnBlock';
import { SpacerBlock } from '../blocks/SpacerBlock';
import { DividerBlock } from '../blocks/DividerBlock';
import { Button } from '@/components/ui/button';

interface BlockItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  component: React.ReactElement;
}

function BlockItem({ icon, label, description, component }: BlockItemProps) {
  const { connectors } = useEditor();

  return (
    <div
      ref={(ref) => { if (ref) connectors.create(ref, component); }}
      className="group relative p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary)]/50 cursor-grab hover:border-[var(--amber)]/40 hover:bg-gradient-to-br hover:from-[var(--amber)]/5 hover:to-[var(--copper)]/5 transition-all duration-200 tool-block"
    >
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[var(--amber)]/0 group-hover:border-[var(--amber)]/40 transition-colors rounded-tr-lg" />

      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-md bg-[var(--muted)] flex items-center justify-center group-hover:bg-[var(--amber)]/10 transition-colors">
          <div className="text-[var(--muted-foreground)] group-hover:text-[var(--amber)] transition-colors">
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-display block">{label}</span>
          {description && (
            <span className="text-xs text-[var(--muted-foreground)] block mt-0.5 truncate">
              {description}
            </span>
          )}
        </div>
      </div>

      {/* Drag indicator */}
      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-0.5">
          <div className="w-1 h-1 rounded-full bg-[var(--amber)]/40" />
          <div className="w-1 h-1 rounded-full bg-[var(--amber)]/40" />
        </div>
        <div className="flex gap-0.5 mt-0.5">
          <div className="w-1 h-1 rounded-full bg-[var(--amber)]/40" />
          <div className="w-1 h-1 rounded-full bg-[var(--amber)]/40" />
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { selected, actions, query } = useEditor((state, query) => {
    const selectedNodeIds = Array.from(state.events.selected);
    if (selectedNodeIds.length === 0) return { selected: null };

    const selectedNode = state.nodes[selectedNodeIds[0]];
    return {
      selected: selectedNode
        ? {
            id: selectedNodeIds[0],
            name: selectedNode.data.displayName || selectedNode.data.name,
            settings: selectedNode.related?.settings,
            props: selectedNode.data.props,
            isDeletable: query.node(selectedNodeIds[0]).isDeletable(),
          }
        : null,
    };
  });

  const handleDelete = () => {
    if (selected?.id && selected.isDeletable) {
      actions.delete(selected.id);
    }
  };

  return (
    <div className="w-72 border-r border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[var(--amber)]/10 flex items-center justify-center">
            <Wrench className="h-3.5 w-3.5 text-[var(--amber)]" />
          </div>
          <span className="text-sm font-semibold text-display">Toolbox</span>
        </div>
      </div>

      <Tabs defaultValue="blocks" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-[var(--border)] bg-transparent p-0 h-auto">
          <TabsTrigger
            value="blocks"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--amber)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--amber)] py-3 text-sm font-medium transition-all"
          >
            <Layers className="h-4 w-4 mr-2" />
            Blocks
          </TabsTrigger>
          <TabsTrigger
            value="properties"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--amber)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--amber)] py-3 text-sm font-medium transition-all"
          >
            <Wrench className="h-4 w-4 mr-2" />
            Properties
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="flex-1 p-4 overflow-y-auto m-0">
          <div className="space-y-6">
            {/* Content blocks */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-xs font-mono text-[var(--muted-foreground)] uppercase tracking-wider">
                  Content
                </span>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>
              <div className="space-y-2">
                <BlockItem
                  icon={<Type className="h-4 w-4" />}
                  label="Text Block"
                  description="Rich text content"
                  component={<TextBlock text="Add your text here..." />}
                />
                <BlockItem
                  icon={<Image className="h-4 w-4" />}
                  label="Image"
                  description="Logo, photo, or graphic"
                  component={<ImageBlock />}
                />
                <BlockItem
                  icon={<Table2 className="h-4 w-4" />}
                  label="Table"
                  description="Data grid with rows"
                  component={<TableBlock />}
                />
              </div>
            </div>

            {/* Layout blocks */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-xs font-mono text-[var(--muted-foreground)] uppercase tracking-wider">
                  Layout
                </span>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>
              <div className="space-y-2">
                <BlockItem
                  icon={<Rows3 className="h-4 w-4" />}
                  label="Row"
                  description="Horizontal layout"
                  component={<RowBlock />}
                />
                <BlockItem
                  icon={<Columns className="h-4 w-4" />}
                  label="Column"
                  description="Vertical container"
                  component={<ColumnBlock />}
                />
              </div>
            </div>

            {/* Decorative blocks */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-xs font-mono text-[var(--muted-foreground)] uppercase tracking-wider">
                  Spacing
                </span>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>
              <div className="space-y-2">
                <BlockItem
                  icon={<Square className="h-4 w-4" />}
                  label="Spacer"
                  description="Add vertical space"
                  component={<SpacerBlock height={40} />}
                />
                <BlockItem
                  icon={<Minus className="h-4 w-4" />}
                  label="Divider"
                  description="Horizontal line"
                  component={<DividerBlock />}
                />
              </div>
            </div>
          </div>

          {/* Tip section */}
          <div className="mt-8 p-3 rounded-lg bg-[var(--amber)]/5 border border-[var(--amber)]/20">
            <p className="text-xs text-[var(--muted-foreground)]">
              <span className="text-[var(--amber)] font-medium">Tip:</span> Drag blocks onto the canvas to build your template layout.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="flex-1 p-4 overflow-y-auto m-0">
          {selected ? (
            <div className="space-y-6">
              {/* Selected element header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-[var(--amber)]/10 flex items-center justify-center">
                    <Layers className="h-4 w-4 text-[var(--amber)]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-display text-sm">{selected.name}</h3>
                    <p className="text-xs text-[var(--muted-foreground)] font-mono">
                      #{selected.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs border-[var(--border)] hover:border-[var(--amber)] hover:text-[var(--amber)]"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={!selected.isDeletable}
                  className="h-8 text-xs border-[var(--border)] hover:border-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 disabled:opacity-30"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {/* Divider */}
              <div className="h-px bg-[var(--border)]" />

              {/* Settings from component */}
              {selected.settings && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                    <span className="text-xs font-mono text-[var(--muted-foreground)] uppercase tracking-wider">
                      Settings
                    </span>
                  </div>
                  <selected.settings />
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-[var(--muted)] flex items-center justify-center mb-4">
                <Layers className="h-8 w-8 text-[var(--muted-foreground)]/50" />
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mb-1">
                No element selected
              </p>
              <p className="text-xs text-[var(--muted-foreground)]/70">
                Click on a block in the canvas to edit its properties
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
