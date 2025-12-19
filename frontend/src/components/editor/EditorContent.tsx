'use client';

import { useEditor } from '@craftjs/core';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import type { PageSettings } from '@/types/template';

const STORAGE_KEY = 'floorcraft-editor-state';
const AUTOSAVE_DELAY = 800;

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface EditorContentProps {
  templateId?: string;
  initialState?: string;
  pageSettings: PageSettings;
  onPageSettingsChange: (settings: PageSettings) => void;
}

export function EditorContent({
  templateId,
  initialState,
  pageSettings,
  onPageSettingsChange,
}: EditorContentProps) {
  const { query, actions, connectors } = useEditor((state, query) => ({
    enabled: state.options.enabled,
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousStateRef = useRef<string | null>(null);
  const previousSettingsRef = useRef<string | null>(null);

  const storageKey = templateId ? `${STORAGE_KEY}-${templateId}` : STORAGE_KEY;

  // Save function
  const save = useCallback(() => {
    try {
      const state = query.serialize();
      const settingsJson = JSON.stringify(pageSettings);

      // Skip if neither state nor settings changed
      if (state === previousStateRef.current && settingsJson === previousSettingsRef.current) {
        setSaveStatus('saved');
        return;
      }

      setSaveStatus('saving');

      const data = {
        state,
        pageSettings,
        updatedAt: new Date().toISOString(),
        version: 1,
      };

      localStorage.setItem(storageKey, JSON.stringify(data));
      previousStateRef.current = state;
      previousSettingsRef.current = settingsJson;
      setLastSaved(new Date());

      // Small delay to show "saving" status
      setTimeout(() => {
        setSaveStatus('saved');
      }, 300);
    } catch (error) {
      console.error('Failed to save editor state:', error);
      setSaveStatus('error');
    }
  }, [query, storageKey, pageSettings]);

  // Load from storage on mount
  useEffect(() => {
    if (isLoaded) return;

    try {
      // Try to load from provided initialState first
      if (initialState) {
        actions.deserialize(initialState);
        previousStateRef.current = initialState;
        setIsLoaded(true);
        return;
      }

      // Otherwise try localStorage
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { state, pageSettings: savedPageSettings } = JSON.parse(stored);
        if (state) {
          actions.deserialize(state);
          previousStateRef.current = state;
          if (savedPageSettings) {
            onPageSettingsChange(savedPageSettings);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load editor state:', error);
    }
    setIsLoaded(true);
  }, [actions, initialState, storageKey, isLoaded, onPageSettingsChange]);

  // Auto-save with debounce
  useEffect(() => {
    if (!isLoaded) return;

    const currentState = query.serialize();

    // Skip initial render
    if (previousStateRef.current === null) {
      previousStateRef.current = currentState;
      return;
    }

    // Check if state changed
    if (currentState !== previousStateRef.current) {
      setSaveStatus('unsaved');

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        save();
      }, AUTOSAVE_DELAY);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  });

  // Save page settings when they change
  useEffect(() => {
    if (isLoaded) {
      save();
    }
  }, [pageSettings, isLoaded, save]);

  const handleManualSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    save();
  }, [save]);

  return (
    <>
      {/* Toolbar */}
      <div className="relative z-20">
        <Toolbar
          templateId={templateId}
          pageSettings={pageSettings}
          onPageSettingsChange={onPageSettingsChange}
          onSave={handleManualSave}
          saveStatus={saveStatus}
          lastSaved={lastSaved}
        />
      </div>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar />

        {/* Canvas area - no wrapper div to avoid pointer event interception */}
        <Canvas pageSettings={pageSettings} />
      </div>
    </>
  );
}
