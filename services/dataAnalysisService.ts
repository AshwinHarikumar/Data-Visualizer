import { GenericDataset, GenericDataRow, DataColumnInfo, DatasetMetadata, ChartType } from '../types';

/**
 * Generic Data Analysis Service
 * Provides utilities for analyzing and working with any type of tabular data
 */

// Detect data type of a column based on its values
export const detectColumnType = (values: any[]): 'string' | 'number' | 'boolean' | 'date' | 'unknown' => {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'unknown';
  
  // Check for boolean
  const booleanValues = nonNullValues.filter(v => 
    typeof v === 'boolean' || 
    (typeof v === 'string' && ['true', 'false', 'yes', 'no', '1', '0'].includes(v.toLowerCase()))
  );
  if (booleanValues.length / nonNullValues.length > 0.8) return 'boolean';
  
  // Check for numbers
  const numericValues = nonNullValues.filter(v => 
    typeof v === 'number' || 
    (typeof v === 'string' && !isNaN(parseFloat(v)) && isFinite(parseFloat(v)))
  );
  if (numericValues.length / nonNullValues.length > 0.8) return 'number';
  
  // Check for dates
  const dateValues = nonNullValues.filter(v => {
    const date = new Date(v);
    return !isNaN(date.getTime());
  });
  if (dateValues.length / nonNullValues.length > 0.8) return 'date';
  
  // Default to string
  return 'string';
};

// Analyze dataset structure and metadata
export const analyzeDataset = (data: GenericDataset): DatasetMetadata => {
  if (!data || data.length === 0) {
    return {
      columns: [],
      rowCount: 0,
      dataType: 'generic',
      suggestedChartTypes: []
    };
  }
  
  const firstRow = data[0];
  const columnNames = Object.keys(firstRow);
  
  const columns: DataColumnInfo[] = columnNames.map(name => {
    const values = data.map(row => row[name]);
    const type = detectColumnType(values);
    const uniqueValues = [...new Set(values)];
    const hasNullValues = values.some(v => v === null || v === undefined || v === '');
    
    return {
      name,
      type,
      uniqueValues: uniqueValues.slice(0, 50), // Limit for performance
      hasNullValues,
      isNumerical: type === 'number',
      isCategorical: type === 'string' || type === 'boolean' || (type === 'number' && uniqueValues.length <= 20)
    };
  });
  
  // Detect if this is household data based on column names
  const householdIndicators = ['unitname', 'familymembers', 'housetype', 'monthlyBill', 'energy'];
  const isHouseholdData = householdIndicators.some(indicator => 
    columnNames.some(col => col.toLowerCase().includes(indicator.toLowerCase()))
  );
  
  // Suggest appropriate chart types
  const categoricalColumns = columns.filter(col => col.isCategorical);
  const numericalColumns = columns.filter(col => col.isNumerical);
  
  const suggestedChartTypes: ChartType[] = [];
  if (categoricalColumns.length > 0) {
    suggestedChartTypes.push('pie', 'bar');
  }
  if (numericalColumns.length >= 2) {
    suggestedChartTypes.push('scatter');
  }
  if (numericalColumns.length > 0) {
    suggestedChartTypes.push('line');
  }
  
  return {
    columns,
    rowCount: data.length,
    dataType: isHouseholdData ? 'household' : 'generic',
    suggestedChartTypes
  };
};

// Get categorical columns suitable for pie charts
export const getCategoricalColumns = (metadata: DatasetMetadata): DataColumnInfo[] => {
  return metadata.columns.filter(col => 
    col.isCategorical && 
    col.uniqueValues && 
    col.uniqueValues.length > 1 && 
    col.uniqueValues.length <= 20 // Reasonable limit for pie charts
  );
};

// Get numerical columns suitable for aggregation
export const getNumericalColumns = (metadata: DatasetMetadata): DataColumnInfo[] => {
  return metadata.columns.filter(col => col.isNumerical);
};

// Prepare data for pie chart visualization
export const preparePieChartData = (
  data: GenericDataset, 
  column: string, 
  aggregationColumn?: string,
  aggregationType: 'count' | 'sum' | 'average' | 'min' | 'max' = 'count'
): { name: string; value: number }[] => {
  if (!data || data.length === 0) return [];
  
  if (aggregationType === 'count' || !aggregationColumn) {
    // Count occurrences of each category
    const counts = data.reduce((acc, row) => {
      const value = String(row[column] || 'Unknown');
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }
  
  // Aggregate numerical data by category
  const groups = data.reduce((acc, row) => {
    const category = String(row[column] || 'Unknown');
    const numValue = parseFloat(row[aggregationColumn]) || 0;
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(numValue);
    return acc;
  }, {} as { [key: string]: number[] });
  
  return Object.entries(groups).map(([name, values]) => {
    let aggregatedValue: number;
    
    switch (aggregationType) {
      case 'sum':
        aggregatedValue = values.reduce((sum, val) => sum + val, 0);
        break;
      case 'average':
        aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
        break;
      case 'min':
        aggregatedValue = Math.min(...values);
        break;
      case 'max':
        aggregatedValue = Math.max(...values);
        break;
      default:
        aggregatedValue = values.length;
    }
    
    return { name, value: aggregatedValue };
  }).sort((a, b) => b.value - a.value);
};

// Format column names for display
export const formatColumnName = (columnName: string): string => {
  return columnName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
    .trim();
};

// Validate if a column can be used for pie charts
export const isValidPieChartColumn = (data: GenericDataset, columnName: string): boolean => {
  if (!data || data.length === 0 || !columnName) return false;
  
  const values = data.map(row => row[columnName]).filter(v => v !== null && v !== undefined);
  const uniqueValues = new Set(values);
  
  // Should have at least 2 unique values but not too many for a readable pie chart
  return uniqueValues.size >= 2 && uniqueValues.size <= 15;
};

// Get summary statistics for a column
export const getColumnSummary = (data: GenericDataset, columnName: string): {
  total: number;
  unique: number;
  nullCount: number;
  mostCommon?: { value: any; count: number };
} => {
  if (!data || data.length === 0) {
    return { total: 0, unique: 0, nullCount: 0 };
  }
  
  const values = data.map(row => row[columnName]);
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  const nullCount = values.length - nonNullValues.length;
  
  // Count occurrences
  const counts = nonNullValues.reduce((acc, val) => {
    const key = String(val);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  const uniqueCount = Object.keys(counts).length;
  
  // Find most common value
  let mostCommon: { value: any; count: number } | undefined;
  if (uniqueCount > 0) {
    const [value, count] = Object.entries(counts).reduce((max, [val, cnt]) => 
      cnt > max[1] ? [val, cnt] : max
    );
    mostCommon = { value, count: count as number };
  }
  
  return {
    total: values.length,
    unique: uniqueCount,
    nullCount,
    mostCommon
  };
};
