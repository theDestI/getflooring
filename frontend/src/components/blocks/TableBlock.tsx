'use client';

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface TableColumn {
  id: string;
  header: string;
  key: string;
  width: string;
  align: 'left' | 'center' | 'right';
}

interface TableBlockProps {
  columns?: TableColumn[];
  dataPath?: string; // e.g., "{{lineItems}}"
  headerBg?: string;
  headerColor?: string;
  borderColor?: string;
  showBorders?: boolean;
  sampleRows?: number;
}

const defaultColumns: TableColumn[] = [
  { id: '1', header: 'Item', key: 'name', width: '40%', align: 'left' },
  { id: '2', header: 'Qty', key: 'quantity', width: '15%', align: 'center' },
  { id: '3', header: 'Price', key: 'price', width: '20%', align: 'right' },
  { id: '4', header: 'Total', key: 'total', width: '25%', align: 'right' },
];

export function TableBlock({
  columns = defaultColumns,
  dataPath = '{{lineItems}}',
  headerBg = '#f5f5f5',
  headerColor = '#000000',
  borderColor = '#e0e0e0',
  showBorders = true,
  sampleRows = 3,
}: TableBlockProps) {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  // Generate sample data for preview
  const sampleData = Array.from({ length: sampleRows }, (_, i) => ({
    name: `Sample Item ${i + 1}`,
    quantity: Math.floor(Math.random() * 10) + 1,
    price: `$${(Math.random() * 100).toFixed(2)}`,
    total: `$${(Math.random() * 500).toFixed(2)}`,
  }));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
    >
      <table
        className="w-full border-collapse"
        style={{
          border: showBorders ? `1px solid ${borderColor}` : 'none',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: headerBg }}>
            {columns.map((col) => (
              <th
                key={col.id}
                style={{
                  width: col.width,
                  textAlign: col.align,
                  padding: '8px 12px',
                  color: headerColor,
                  fontWeight: 600,
                  borderBottom: showBorders ? `1px solid ${borderColor}` : 'none',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sampleData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => (
                <td
                  key={col.id}
                  style={{
                    textAlign: col.align,
                    padding: '8px 12px',
                    borderBottom: showBorders ? `1px solid ${borderColor}` : 'none',
                  }}
                >
                  {row[col.key as keyof typeof row] || `{{${col.key}}}`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-1 text-xs text-gray-400 text-center">
        Data source: {dataPath}
      </div>
    </div>
  );
}

function TableBlockSettings() {
  const {
    actions: { setProp },
    columns,
    dataPath,
    headerBg,
    headerColor,
    borderColor,
    showBorders,
    sampleRows,
  } = useNode((node) => ({
    columns: node.data.props.columns,
    dataPath: node.data.props.dataPath,
    headerBg: node.data.props.headerBg,
    headerColor: node.data.props.headerColor,
    borderColor: node.data.props.borderColor,
    showBorders: node.data.props.showBorders,
    sampleRows: node.data.props.sampleRows,
  }));

  const updateColumn = (id: string, field: keyof TableColumn, value: string) => {
    setProp((props: TableBlockProps) => {
      const col = props.columns?.find((c) => c.id === id);
      if (col) {
        (col as unknown as Record<string, string>)[field] = value;
      }
    });
  };

  const addColumn = () => {
    setProp((props: TableBlockProps) => {
      props.columns = [
        ...(props.columns || []),
        {
          id: Date.now().toString(),
          header: 'New Column',
          key: 'newField',
          width: '20%',
          align: 'left',
        },
      ];
    });
  };

  const removeColumn = (id: string) => {
    setProp((props: TableBlockProps) => {
      props.columns = props.columns?.filter((c) => c.id !== id);
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Data Source Path</Label>
        <Input
          type="text"
          value={dataPath}
          placeholder="{{lineItems}}"
          onChange={(e) =>
            setProp((props: TableBlockProps) => {
              props.dataPath = e.target.value;
            })
          }
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs">Columns</Label>
          <Button variant="ghost" size="sm" onClick={addColumn}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {columns?.map((col: TableColumn) => (
            <div key={col.id} className="flex items-center gap-1">
              <Input
                className="flex-1 h-8 text-xs"
                value={col.header}
                onChange={(e) => updateColumn(col.id, 'header', e.target.value)}
                placeholder="Header"
              />
              <Input
                className="w-20 h-8 text-xs"
                value={col.key}
                onChange={(e) => updateColumn(col.id, 'key', e.target.value)}
                placeholder="Key"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => removeColumn(col.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs">Header Background</Label>
        <Input
          type="color"
          value={headerBg}
          onChange={(e) =>
            setProp((props: TableBlockProps) => {
              props.headerBg = e.target.value;
            })
          }
        />
      </div>

      <div>
        <Label className="text-xs">Sample Rows</Label>
        <Input
          type="number"
          value={sampleRows}
          onChange={(e) =>
            setProp((props: TableBlockProps) => {
              props.sampleRows = parseInt(e.target.value) || 3;
            })
          }
          min={1}
          max={10}
        />
      </div>
    </div>
  );
}

TableBlock.craft = {
  displayName: 'Table',
  props: {
    columns: defaultColumns,
    dataPath: '{{lineItems}}',
    headerBg: '#f5f5f5',
    headerColor: '#000000',
    borderColor: '#e0e0e0',
    showBorders: true,
    sampleRows: 3,
  },
  related: {
    settings: TableBlockSettings,
  },
};
