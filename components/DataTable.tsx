import React from 'react';

interface DataTableProps {
  data: Record<string, any>[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 p-4 sm:p-8">No data available to display.</p>;
  }

  const headers = Object.keys(data[0]);
  
  const formatHeader = (header: string) => {
    return header
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  const formatCellValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  return (
    <div className="w-full">
      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3">
        {data.map((row, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            {headers.map((header) => (
              <div key={`${index}-${header}`} className="flex justify-between items-start py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 pr-2 min-w-0 flex-1">
                  {formatHeader(header)}:
                </span>
                <span className="text-xs text-gray-900 dark:text-gray-200 text-right flex-shrink-0 max-w-[60%]">
                  {formatCellValue(row[header])}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full text-xs sm:text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
              <tr>
                {headers.map((header) => (
                  <th key={header} scope="col" className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 whitespace-nowrap font-medium">
                    <div className="truncate max-w-[120px] sm:max-w-[150px] lg:max-w-none" title={formatHeader(header)}>
                      {formatHeader(header)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  {headers.map((header) => (
                    <td key={`${index}-${header}`} className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
                      <div className="truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-[200px]" title={String(row[header])}>
                        {formatCellValue(row[header])}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataTable;