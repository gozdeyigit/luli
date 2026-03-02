import { Request, Response } from 'express';
import { query } from '../config/database.js';

export const createWordList = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { name, words, audioRecordings } = req.body;

    const result = await query(
      `INSERT INTO word_lists (user_id, name, words, audio_recordings)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, name, words, audio_recordings, created_at, last_modified_at, last_practiced_at`,
      [req.user.userId, name, words, audioRecordings || {}]
    );

    const wordList = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: wordList.id,
        userId: wordList.user_id,
        name: wordList.name,
        words: wordList.words,
        audioRecordings: wordList.audio_recordings,
        createdAt: wordList.created_at,
        lastModifiedAt: wordList.last_modified_at,
        lastPracticedAt: wordList.last_practiced_at
      }
    });
  } catch (error: any) {
    console.error('Create word list error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({
        success: false,
        error: 'A word list with this name already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create word list'
      });
    }
  }
};

export const getWordLists = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const result = await query(
      `SELECT id, user_id, name, words, audio_recordings, created_at, last_modified_at, last_practiced_at
       FROM word_lists
       WHERE user_id = $1
       ORDER BY last_modified_at DESC`,
      [req.user.userId]
    );

    const wordLists = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      words: row.words,
      audioRecordings: row.audio_recordings,
      createdAt: row.created_at,
      lastModifiedAt: row.last_modified_at,
      lastPracticedAt: row.last_practiced_at
    }));

    res.json({
      success: true,
      data: wordLists
    });
  } catch (error) {
    console.error('Get word lists error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get word lists'
    });
  }
};

export const getWordList = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const result = await query(
      `SELECT id, user_id, name, words, audio_recordings, created_at, last_modified_at, last_practiced_at
       FROM word_lists
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Word list not found'
      });
      return;
    }

    const wordList = result.rows[0];

    res.json({
      success: true,
      data: {
        id: wordList.id,
        userId: wordList.user_id,
        name: wordList.name,
        words: wordList.words,
        audioRecordings: wordList.audio_recordings,
        createdAt: wordList.created_at,
        lastModifiedAt: wordList.last_modified_at,
        lastPracticedAt: wordList.last_practiced_at
      }
    });
  } catch (error) {
    console.error('Get word list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get word list'
    });
  }
};

export const updateWordList = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { name, words, audioRecordings } = req.body;

    const result = await query(
      `UPDATE word_lists
       SET name = $1, words = $2, audio_recordings = $3, last_modified_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING id, user_id, name, words, audio_recordings, created_at, last_modified_at, last_practiced_at`,
      [name, words, audioRecordings || {}, id, req.user.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Word list not found'
      });
      return;
    }

    const wordList = result.rows[0];

    res.json({
      success: true,
      data: {
        id: wordList.id,
        userId: wordList.user_id,
        name: wordList.name,
        words: wordList.words,
        audioRecordings: wordList.audio_recordings,
        createdAt: wordList.created_at,
        lastModifiedAt: wordList.last_modified_at,
        lastPracticedAt: wordList.last_practiced_at
      }
    });
  } catch (error: any) {
    console.error('Update word list error:', error);
    if (error.code === '23505') {
      res.status(409).json({
        success: false,
        error: 'A word list with this name already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update word list'
      });
    }
  }
};

export const deleteWordList = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const result = await query(
      'DELETE FROM word_lists WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Word list not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Word list deleted successfully'
    });
  } catch (error) {
    console.error('Delete word list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete word list'
    });
  }
};