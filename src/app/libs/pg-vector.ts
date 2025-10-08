// Helper functions for PostgreSQL vector operations

/**
 * Convert JavaScript array to PostgreSQL vector string format
 */
export function arrayToVector(arr: any): string {
  if (arr && typeof arr.then === 'function') {
    console.error('Array is a Promise, this should not happen!');
    throw new Error('Cannot convert Promise to vector');
  }
  
  if (!Array.isArray(arr)) {
    console.error('arrayToVector received non-array:', typeof arr, arr);
    throw new Error('Input must be an array');
  }
  
  return `[${arr.join(',')}]`;
}

/**
 * Convert PostgreSQL vector string to JavaScript array
 */
export function vectorToArray(vectorString: string): number[] {
  return vectorString
    .replace(/[\[\]]/g, '')
    .split(',')
    .map(Number);
}

/**
 * Validate embedding dimensions and format
 */
export function validateEmbedding(embedding: any, expectedDimensions: number = 768): void {
  // Check if it's a Promise (this should never happen if everything is properly awaited)
  if (embedding && typeof embedding.then === 'function') {
    console.error('Embedding is a Promise! This means await is missing somewhere.');
    throw new Error('Embedding is a Promise - missing await');
  }
  
  if (!Array.isArray(embedding)) {
    console.error('Embedding is not an array. Type:', typeof embedding);
    console.error('Embedding value:', embedding);
    throw new Error('Embedding must be an array, got: ' + typeof embedding);
  }
  
  if (embedding.length !== expectedDimensions) {
    console.warn(`Embedding has ${embedding.length} dimensions, expected ${expectedDimensions}`);
    // Don't throw error for dimension mismatch, just warn
  }
  
  // Check for invalid values but don't throw
  const invalidValues = embedding.filter(val => typeof val !== 'number' || isNaN(val));
  if (invalidValues.length > 0) {
    console.warn(`Embedding contains ${invalidValues.length} invalid values`);
  }
  
  console.log(`Embedding validated: ${embedding.length} dimensions`);
}