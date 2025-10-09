import { pool } from './db-config';
import { Message } from '../types';

async function getDefaultConversationId(): Promise<string> {
  const client = await pool.connect();
  try {
    let res = await client.query(`SELECT id FROM conversations ORDER BY created_at ASC LIMIT 1`);
    if (res.rows.length > 0) {
      return res.rows[0].id;
    }
    res = await client.query(`INSERT INTO conversations (title) VALUES ('Default Chat') RETURNING id`);
    return res.rows[0].id;
  } finally {
    client.release();
  }
}

export async function getMessages(): Promise<Message[]> {
  const client = await pool.connect();
  try {
    const conversationId = await getDefaultConversationId();
    const result = await client.query(`SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`, [conversationId]);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function addMessage(role: 'user' | 'assistant', content: string, metadata?: any): Promise<Message> {
  const client = await pool.connect();
  try {
    const conversationId = await getDefaultConversationId();
    const result = await client.query(
      `INSERT INTO messages (conversation_id, role, content, metadata) VALUES ($1, $2, $3, $4) RETURNING *`,
      [conversationId, role, content, metadata || {}]
    );
    await client.query(`UPDATE conversations SET updated_at = NOW() WHERE id = $1`, [conversationId]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function clearMessages(): Promise<void> {
  const client = await pool.connect();
  try {
    const conversationId = await getDefaultConversationId();
    await client.query(`DELETE FROM messages WHERE conversation_id = $1`, [conversationId]);
  } finally {
    client.release();
  }
}