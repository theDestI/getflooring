'use client';

import { useEditor } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Undo2,
  Redo2,
  Save,
  Eye,
  Download,
  Hammer,
  ChevronLeft,
  FileText,
  Maximize2,
  Check,
  Loader2,
  AlertCircle,
  Cloud,
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { PageSettings } from '@/types/template';
import type { SaveStatus } from './EditorContent';

interface ToolbarProps {
  templateId?: string;
  pageSettings: PageSettings;
  onPageSettingsChange: (settings: PageSettings) => void;
  onSave?: () => void;
  saveStatus?: SaveStatus;
  lastSaved?: Date | null;
}

function SaveStatusIndicator({ status, lastSaved }: { status: SaveStatus; lastSaved?: Date | null }) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  switch (status) {
    case 'saving':
      return (
        <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-xs">Saving...</span>
        </div>
      );
    case 'saved':
      return (
        <div className="flex items-center gap-1.5 text-emerald-500">
          <Cloud className="h-3 w-3" />
          <span className="text-xs">
            {lastSaved ? `Saved at ${formatTime(lastSaved)}` : 'Saved'}
          </span>
        </div>
      );
    case 'unsaved':
      return (
        <div className="flex items-center gap-1.5 text-[var(--amber)]">
          <div className="h-2 w-2 rounded-full bg-[var(--amber)] animate-pulse" />
          <span className="text-xs">Unsaved changes</span>
        </div>
      );
    case 'error':
      return (
        <div className="flex items-center gap-1.5 text-[var(--destructive)]">
          <AlertCircle className="h-3 w-3" />
          <span className="text-xs">Save failed</span>
        </div>
      );
    default:
      return null;
  }
}

export function Toolbar({
  templateId,
  pageSettings,
  onPageSettingsChange,
  onSave,
  saveStatus = 'saved',
  lastSaved,
}: ToolbarProps) {
  const { actions, query, canUndo, canRedo } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  const handlePreview = async () => {
    const state = query.serialize();
    console.log('Preview state:', state);
  };

  return (
    <div className="h-16 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-sm px-4 flex items-center justify-between relative">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--amber)]/30 to-transparent" />

      {/* Left section - Logo & Navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-lg hover:bg-[var(--amber)]/10 transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--amber)] transition-colors" />
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--amber)] to-[var(--copper)] flex items-center justify-center workshop-shadow-sm">
            <Hammer className="h-4 w-4 text-[var(--primary-foreground)]" />
          </div>
        </Link>

        <div className="h-8 w-px bg-[var(--border)]" />

        {/* Template name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--muted-foreground)]" />
            <span className="text-display font-semibold text-sm">
              {templateId ? 'Edit Template' : 'New Template'}
            </span>
          </div>

          {/* Save status */}
          <div className="pl-3 border-l border-[var(--border)]">
            <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} />
          </div>
        </div>
      </div>

      {/* Center section - Page Settings */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
        {/* Page Size */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted-foreground)] font-mono uppercase tracking-wider">Size</span>
          <Select
            value={pageSettings.size}
            onValueChange={(value) =>
              onPageSettingsChange({ ...pageSettings, size: value as PageSettings['size'] })
            }
          >
            <SelectTrigger className="w-24 h-8 text-xs bg-[var(--secondary)] border-[var(--border)] hover:border-[var(--amber)]/50 focus:ring-[var(--amber)] transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--card)] border-[var(--border)]">
              <SelectItem value="A4" className="text-xs">A4</SelectItem>
              <SelectItem value="LETTER" className="text-xs">Letter</SelectItem>
              <SelectItem value="LEGAL" className="text-xs">Legal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-4 w-px bg-[var(--border)]" />

        {/* Orientation */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted-foreground)] font-mono uppercase tracking-wider">Layout</span>
          <Select
            value={pageSettings.orientation}
            onValueChange={(value) =>
              onPageSettingsChange({
                ...pageSettings,
                orientation: value as PageSettings['orientation'],
              })
            }
          >
            <SelectTrigger className="w-28 h-8 text-xs bg-[var(--secondary)] border-[var(--border)] hover:border-[var(--amber)]/50 focus:ring-[var(--amber)] transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--card)] border-[var(--border)]">
              <SelectItem value="portrait" className="text-xs">
                <span className="flex items-center gap-2">
                  <Maximize2 className="h-3 w-3 rotate-0" />
                  Portrait
                </span>
              </SelectItem>
              <SelectItem value="landscape" className="text-xs">
                <span className="flex items-center gap-2">
                  <Maximize2 className="h-3 w-3 rotate-90" />
                  Landscape
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-1">
        {/* History controls */}
        <div className="flex items-center bg-[var(--secondary)] rounded-lg p-1 mr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => actions.history.undo()}
            disabled={!canUndo}
            className="h-7 w-7 hover:bg-[var(--amber)]/20 hover:text-[var(--amber)] disabled:opacity-30 transition-colors"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-4 bg-[var(--border)]" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => actions.history.redo()}
            disabled={!canRedo}
            className="h-7 w-7 hover:bg-[var(--amber)]/20 hover:text-[var(--amber)] disabled:opacity-30 transition-colors"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="h-8 w-px bg-[var(--border)] mx-1" />

        {/* Action buttons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePreview}
          className="h-8 text-xs hover:bg-[var(--amber)]/10 hover:text-[var(--amber)] transition-colors"
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          Preview
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs border-[var(--border)] hover:border-[var(--amber)] hover:text-[var(--amber)] hover:bg-[var(--amber)]/10 transition-colors"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export PDF
        </Button>

        <Button
          size="sm"
          onClick={onSave}
          disabled={saveStatus === 'saving'}
          className="h-8 text-xs bg-gradient-to-r from-[var(--amber)] to-[var(--copper)] hover:from-[var(--copper)] hover:to-[var(--amber)] text-[var(--primary-foreground)] font-medium workshop-shadow-sm transition-all duration-300 disabled:opacity-70"
        >
          {saveStatus === 'saving' ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : saveStatus === 'saved' ? (
            <Check className="h-3.5 w-3.5 mr-1.5" />
          ) : (
            <Save className="h-3.5 w-3.5 mr-1.5" />
          )}
          {saveStatus === 'saving' ? 'Saving...' : 'Save'}
        </Button>

        <div className="h-8 w-px bg-[var(--border)] mx-1" />
        <ThemeToggle />
      </div>
    </div>
  );
}
