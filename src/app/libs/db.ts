import { pool } from './db-config';
import { ImageRecord, SearchResult } from '../types';
import { arrayToVector, validateEmbedding } from './pg-vector';

export async function storeImage(
  filename: string,
  description: string,
  embedding: number[],
  imageUrl?: string
): Promise<string> {
  validateEmbedding(embedding, 768);

  const client = await pool.connect();
  try {
    const vectorString = arrayToVector(embedding);
    const result = await client.query(
      `INSERT INTO images (filename, description, embedding, image_url)
       VALUES ($1, $2, $3::vector, $4)
       RETURNING id`,
      [filename, description, vectorString, imageUrl]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('Database error in storeImage:', error);
    throw new Error('Failed to store image in the database.');
  } finally {
    client.release();
  }
}

export async function searchSimilarImages(
  queryEmbedding: number[],
  limit: number = 5
): Promise<SearchResult[]> {
  validateEmbedding(queryEmbedding, 768);

  const client = await pool.connect();
  try {
    const vectorString = arrayToVector(queryEmbedding);
    const result = await client.query(
      `SELECT
        id,
        filename,
        description,
        image_url,
        embedding,
        1 - (embedding <=> $1::vector) as similarity,
        uploaded_at
      FROM images
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT $2`,
      [vectorString, limit]
    );
    return result.rows.map((row) => ({
      id: row.id,
      filename: row.filename,
      description: row.description,
      imageUrl: row.image_url,
      embedding: Array.isArray(row.embedding) ? row.embedding : JSON.parse(row.embedding),
      similarity: parseFloat(row.similarity),
      uploaded_at: row.uploaded_at,
    }));
  } catch (error) {
    console.error('Database error in searchSimilarImages:', error);
    throw new Error('Failed to search images.');
  } finally {
    client.release();
  }
}

export async function getAllImages(): Promise<ImageRecord[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT id, filename, description, image_url, uploaded_at FROM images ORDER BY uploaded_at DESC`);
    return result.rows;
  } catch (error) {
     console.error('Database error in getAllImages:', error);
     throw new Error('Failed to get all images.');
  } finally {
    client.release();
  }
}