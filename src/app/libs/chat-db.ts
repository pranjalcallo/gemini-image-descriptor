import { pool } from './db-config';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
  created_at: string;
}

// Get or create the default conversation
async function getDefaultConversationId(): Promise<string> {
  const client = await pool.connect();
  try {
    // Try to get existing conversation
    const result = await client.query(
      `SELECT id FROM conversations ORDER BY created_at ASC LIMIT 1`
    );
    
    if (result.rows.length > 0) {
      return result.rows[0].id;
    }

    // Create new conversation if none exists
    const newConversation = await client.query(
      `INSERT INTO conversations (title) VALUES ($1) RETURNING id`,
      ['Image Search Chat']
    );

    return newConversation.rows[0].id;
  } finally {
    client.release();
  }
}

// Get all messages from the conversation
export async function getMessages(): Promise<Message[]> {
  const client = await pool.connect();
  try {
    const conversationId = await getDefaultConversationId();
    
    const result = await client.query(
      `SELECT id, role, content, metadata, created_at 
       FROM messages 
       WHERE conversation_id = $1 
       ORDER BY created_at ASC`,
      [conversationId]
    );
    
    return result.rows;
  } finally {
    client.release();
  }
}

// Add message to the conversation
export async function addMessage(
  role: 'user' | 'assistant', 
  content: string, 
  metadata?: any
): Promise<Message> {
  const client = await pool.connect();
  try {
    const conversationId = await getDefaultConversationId();
    
    const result = await client.query(
      `INSERT INTO messages (conversation_id, role, content, metadata) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, role, content, metadata, created_at`,
      [conversationId, role, content, metadata || {}]
    );

    // Update conversation updated_at timestamp
    await client.query(
      `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
      [conversationId]
    );

    return result.rows[0];
  } finally {
    client.release();
  }
}

// Clear all messages
export async function clearMessages(): Promise<void> {
  const client = await pool.connect();
  try {
    const conversationId = await getDefaultConversationId();
    await client.query(
      `DELETE FROM messages WHERE conversation_id = $1`,
      [conversationId]
    );
  } finally {
    client.release();
  }
}