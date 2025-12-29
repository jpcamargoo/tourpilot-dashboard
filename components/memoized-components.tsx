'use client';

import { useMemo } from 'react';

interface DataRow {
  [key: string]: any;
}

interface MemoizedTableProps {
  data: DataRow[];
  columns: Array<{
    key: string;
    header: string;
    render?: (value: any, row: DataRow) => React.ReactNode;
  }>;
  className?: string;
}

export function MemoizedTable({ data, columns, className = '' }: MemoizedTableProps) {
  const renderedRows = useMemo(() => {
    return data.map((row, rowIndex) => (
      <tr key={rowIndex} className="hover:bg-gray-50">
        {columns.map((col) => (
          <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {col.render ? col.render(row[col.key], row) : row[col.key]}
          </td>
        ))}
      </tr>
    ));
  }, [data, columns]);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">{renderedRows}</tbody>
      </table>
    </div>
  );
}

interface MemoizedCardGridProps {
  items: Array<{
    id: string | number;
    render: () => React.ReactNode;
  }>;
  className?: string;
}

export function MemoizedCardGrid({ items, className = '' }: MemoizedCardGridProps) {
  const renderedCards = useMemo(() => {
    return items.map((item) => (
      <div key={item.id}>
        {item.render()}
      </div>
    ));
  }, [items]);

  return <div className={className}>{renderedCards}</div>;
}
