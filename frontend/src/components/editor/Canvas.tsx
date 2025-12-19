'use client';

import { Frame, Element } from '@craftjs/core';
import { useState } from 'react';
import { Container } from '../blocks/Container';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PageSettings } from '@/types/template';

interface CanvasProps {
  pageSettings: PageSettings;
}

// Page dimensions in pixels (96 DPI)
const PAGE_SIZES = {
  A4: { width: 794, height: 1123 },
  LETTER: { width: 816, height: 1056 },
  LEGAL: { width: 816, height: 1344 },
};

export function Canvas({ pageSettings }: CanvasProps) {
  const [zoom, setZoom] = useState(0.75);

  const dimensions = PAGE_SIZES[pageSettings.size];
  const isLandscape = pageSettings.orientation === 'landscape';
  const width = isLandscape ? dimensions.height : dimensions.width;
  const height = isLandscape ? dimensions.width : dimensions.height;

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 1.5));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.25));
  const handleResetZoom = () => setZoom(0.75);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Canvas toolbar */}
      <div className="h-10 border-b border-[var(--border)] bg-[var(--secondary)]/50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] font-mono">
          <span className="px-2 py-0.5 rounded bg-[var(--muted)] border border-[var(--border)]">
            {pageSettings.size}
          </span>
          <span className="text-[var(--border)]">/</span>
          <span className="capitalize">{pageSettings.orientation}</span>
          <span className="text-[var(--border)]">/</span>
          <span>{width} x {height}px</span>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="h-7 w-7 hover:bg-[var(--amber)]/10 hover:text-[var(--amber)]"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <button
            onClick={handleResetZoom}
            className="px-2 py-0.5 text-xs font-mono text-[var(--muted-foreground)] hover:text-[var(--amber)] transition-colors min-w-[48px] text-center"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="h-7 w-7 hover:bg-[var(--amber)]/10 hover:text-[var(--amber)]"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-4 bg-[var(--border)] mx-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetZoom}
            className="h-7 w-7 hover:bg-[var(--amber)]/10 hover:text-[var(--amber)]"
            title="Reset zoom"
          >
            <Maximize className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Canvas area with grid background */}
      <div className="flex-1 overflow-auto canvas-workspace relative">
        {/* Ruler marks - horizontal */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-[var(--secondary)]/80 border-b border-[var(--border)] flex items-end z-10">
          <div className="h-4 flex-1 ruler-marks ml-6" />
        </div>

        {/* Ruler marks - vertical */}
        <div className="absolute top-6 left-0 bottom-0 w-6 bg-[var(--secondary)]/80 border-r border-[var(--border)] flex items-start z-10">
          <div className="w-4 flex-1 ruler-marks-vertical mt-0" />
        </div>

        {/* Canvas container */}
        <div className="absolute top-6 left-6 right-0 bottom-0 overflow-auto p-8">
          <div className="flex justify-center items-start min-h-full">
            {/* Paper shadow layers for depth - using CSS zoom instead of transform scale */}
            {/* transform: scale() breaks drag-and-drop coordinate calculations */}
            <div
              className="relative"
              style={{
                zoom: zoom,
              }}
            >
              {/* Shadow layers */}
              <div
                className="absolute bg-black/5 rounded-sm pointer-events-none"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  transform: 'translate(8px, 8px)',
                }}
              />
              <div
                className="absolute bg-black/5 rounded-sm pointer-events-none"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  transform: 'translate(4px, 4px)',
                }}
              />

              {/* Main document */}
              <div
                className="document-paper relative"
                style={{
                  width: `${width}px`,
                  minHeight: `${height}px`,
                  padding: `${pageSettings.margins.top}px ${pageSettings.margins.right}px ${pageSettings.margins.bottom}px ${pageSettings.margins.left}px`,
                }}
              >
                {/* Page corner fold effect */}
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
                  <div
                    className="absolute top-0 right-0 w-[140%] h-[140%] bg-gradient-to-bl from-gray-200/50 to-transparent origin-top-right"
                    style={{ transform: 'rotate(-45deg) translate(50%, -50%)' }}
                  />
                </div>

                {/* Margin guides (visible on hover) */}
                <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                  <div
                    className="absolute border border-dashed border-[var(--amber)]/20"
                    style={{
                      top: `${pageSettings.margins.top}px`,
                      right: `${pageSettings.margins.right}px`,
                      bottom: `${pageSettings.margins.bottom}px`,
                      left: `${pageSettings.margins.left}px`,
                    }}
                  />
                </div>

                {/* Content frame - CraftJS drop target */}
                <Frame>
                  <Element
                    is={Container}
                    canvas
                    custom={{ displayName: 'Page' }}
                  />
                </Frame>
              </div>
            </div>
          </div>

          {/* Zoom indicator */}
          <div className="fixed bottom-6 right-6 z-20">
            <div className="px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] workshop-shadow-sm">
              <span className="text-xs font-mono text-[var(--muted-foreground)]">
                {Math.round(zoom * 100)}% zoom
              </span>
            </div>
          </div>
        </div>

        {/* Corner indicator */}
        <div className="absolute top-0 left-0 w-6 h-6 bg-[var(--secondary)] border-r border-b border-[var(--border)] flex items-center justify-center z-20">
          <div className="w-2 h-2 border-l border-b border-[var(--amber)]/40" />
        </div>
      </div>
    </div>
  );
}
