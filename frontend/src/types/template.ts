// Block type definitions for the visual editor

export type BlockType = 'text' | 'image' | 'table' | 'row' | 'column' | 'spacer' | 'divider';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number | string;
  height: number | string;
}

export interface Spacing {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface BlockStyle {
  margin?: Spacing;
  padding?: Spacing;
  backgroundColor?: string;
  borderRadius?: number;
  border?: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
}

// Data binding for dynamic content
export interface DataBinding {
  placeholder: string;      // e.g., "{{contact.name}}"
  fieldPath: string;        // e.g., "contact.name"
  dataSourceId?: string;
  fallback?: string;
  transform?: 'uppercase' | 'lowercase' | 'currency' | 'date' | 'number';
}

// Text block
export interface TextBlockData {
  type: 'text';
  content: string;          // HTML content from Tiptap
  formatting: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    color: string;
  };
  bindings?: DataBinding[];
}

// Image block
export interface ImageBlockData {
  type: 'image';
  source: {
    type: 'static' | 'dynamic';
    url?: string;
    fieldPath?: string;
    fallbackUrl?: string;
  };
  fit: 'contain' | 'cover' | 'fill';
  altText?: string;
}

// Table column definition
export interface TableColumn {
  id: string;
  header: string;
  fieldPath: string;
  width: string;
  align: 'left' | 'center' | 'right';
  format?: {
    type: 'text' | 'number' | 'currency' | 'date' | 'percentage';
    decimals?: number;
    dateFormat?: string;
  };
}

// Table block
export interface TableBlockData {
  type: 'table';
  columns: TableColumn[];
  dataBinding: {
    dataSourceId: string;
    arrayPath: string;
  };
  styling: {
    headerStyle: {
      backgroundColor: string;
      fontWeight: number;
      color: string;
    };
    rowStyle: {
      borderBottom: string;
    };
    alternateRowColor?: string;
  };
  showFooter?: boolean;
  footerFormulas?: {
    columnId: string;
    formula: 'SUM' | 'COUNT' | 'AVG';
  }[];
}

// Layout blocks
export interface RowBlockData {
  type: 'row';
  gap: number;
  alignment: 'start' | 'center' | 'end' | 'stretch';
}

export interface ColumnBlockData {
  type: 'column';
  width: string;
}

export interface SpacerBlockData {
  type: 'spacer';
  height: number;
}

export interface DividerBlockData {
  type: 'divider';
  thickness: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
}

export type BlockData =
  | TextBlockData
  | ImageBlockData
  | TableBlockData
  | RowBlockData
  | ColumnBlockData
  | SpacerBlockData
  | DividerBlockData;

// Page settings
export interface PageSettings {
  size: 'A4' | 'LETTER' | 'LEGAL';
  orientation: 'portrait' | 'landscape';
  margins: Spacing;
  header?: {
    enabled: boolean;
    height: number;
    content?: string;
  };
  footer?: {
    enabled: boolean;
    height: number;
    content?: string;
    showPageNumbers?: boolean;
  };
}

// Complete template
export interface PDFTemplate {
  id: string;
  name: string;
  description?: string;
  pageSettings: PageSettings;
  // Craft.js serialized state
  editorState: string;
  createdAt: string;
  updatedAt: string;
}

// Data source types
export type DataSourceType = 'hubspot' | 'rest_api' | 'ai_tool' | 'manual';

export interface FieldMapping {
  sourceField: string;
  templateField: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
}

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  config: Record<string, unknown>;
  fieldMappings: FieldMapping[];
  isActive: boolean;
  lastSyncedAt?: string;
}

// Generation request
export interface GenerateRequest {
  templateId: string;
  dataSourceId?: string;
  data?: Record<string, unknown>;
  options?: {
    pageSize?: string;
    orientation?: string;
    margins?: Spacing;
  };
}
