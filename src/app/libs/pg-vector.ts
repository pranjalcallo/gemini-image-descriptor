export function validateEmbedding(embedding: any, expectedDim: number): void {
  if (!Array.isArray(embedding)) {
    throw new Error('Embedding must be an array.');
  }
  if (embedding.length !== expectedDim) {
    throw new Error(`Embedding has ${embedding.length} dimensions, expected ${expectedDim}`);
  }
  console.log(`Embedding validated: ${embedding.length} dimensions`);
}

export function arrayToVector(array: number[]): string {
  return '[' + array.join(',') + ']';
}