import React from 'react';
import { HouseholdData } from '../types';

interface DataTableProps {
  data: HouseholdData[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">No data available to display.</p>;
  }

  // Get all unique keys from all rows to create a complete set of headers.
  const headers = Array.from(data.reduce((acc, row) => {
    Object.keys(row).forEach(key => acc.add(key));
    return acc;
  }, new Set<string>()));
  
  const formatHeader = (header: string) => {
    return header
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  const renderCellContent = (value: any) => {
    if (value === null || typeof value === 'undefined') {
      return <span className="text-gray-400 italic">N/A</span>;
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'object') {
      // Pretty print object values for readability
      return <pre className="text-xs whitespace-pre-wrap bg-gray-100 dark:bg-gray-700 p-2 rounded">{JSON.stringify(value, null, 2)}</pre>;
    }
    return String(value);
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="px-6 py-3 whitespace-nowrap">
                {formatHeader(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              {headers.map((header) => (
                <td key={`${index}-${header}`} className="px-6 py-4 align-top">
                  {renderCellContent(row[header as keyof HouseholdData])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
