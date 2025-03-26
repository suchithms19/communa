/**
 * Converts a list of column names into a record of column name to column name
 * This allows for type-safe column references
 * 
 * @param columns Array of column names
 * @returns Record with column names as keys and values
 */
export function listToColumn<T extends string>(columns: readonly T[]): Record<T, T> {
  return columns.reduce((acc, column) => {
    acc[column] = column;
    return acc;
  }, {} as Record<T, T>);
}
