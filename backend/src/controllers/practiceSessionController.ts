import { Request, Response } from 'express';
import { query, getClient } from '../config/database.js';

export const createPracticeSession = async (req: Request, res: Response): Promise<void> => {
  const client = await getClient();
  
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { listId, sessionType, attempts, score, durationSeconds, completed } = req.body;

    await client.query('BEGIN');

    // Verify word list belongs to user
    const listCheck = await client.query(
      'SELECT id FROM word_lists WHERE id = $1 AND user_id = $2',
      [listId, req.user.userId]
    );

    if (listCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({
        success: false,
        error: 'Word list not found'
      });
      return;
    }

    // Create practice session
    const sessionResult = await client.query(
      `INSERT INTO practice_sessions (user_id, list_id, session_type, attempts, score, duration_seconds, completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, list_id, session_type, attempts, score, duration_seconds, completed, session_date, created_at`,
      [req.user.userId, listId, sessionType, JSON.stringify(attempts), score, durationSeconds, completed]
    );

    const session = sessionResult.rows[0];

    // Update word list last practiced date
    await client.query(
      'UPDATE word_lists SET last_practiced_at = CURRENT_TIMESTAMP WHERE id = $1',
      [listId]
    );

    // Update progress records for each attempt
    if (sessionType === 'practice' && completed) {
      for (const attempt of attempts) {
        const progressResult = await client.query(
          `SELECT id, consecutive_correct FROM progress_records 
           WHERE user_id = $1 AND list_id = $2 AND word = $3`,
          [req.user.userId, listId, attempt.word]
        );

        if (progressResult.rows.length > 0) {
          // Update existing progress
          const currentProgress = progressResult.rows[0];
          const newConsecutive = attempt.isCorrect ? currentProgress.consecutive_correct + 1 : 0;
          const isMastered = newConsecutive >= 3;

          await client.query(
            `UPDATE progress_records
             SET total_attempts = total_attempts + 1,
                 correct_attempts = correct_attempts + $1,
                 consecutive_correct = $2,
                 is_mastered = $3,
                 last_practiced_at = CURRENT_TIMESTAMP
             WHERE id = $4`,
            [attempt.isCorrect ? 1 : 0, newConsecutive, isMastered, currentProgress.id]
          );
        } else {
          // Create new progress record
          await client.query(
            `INSERT INTO progress_records (user_id, list_id, word, total_attempts, correct_attempts, consecutive_correct, is_mastered)
             VALUES ($1, $2, $3, 1, $4, $5, $6)`,
            [req.user.userId, listId, attempt.word, attempt.isCorrect ? 1 : 0, attempt.isCorrect ? 1 : 0, attempt.isCorrect && 1 >= 3]
          );
        }
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        id: session.id,
        userId: session.user_id,
        listId: session.list_id,
        sessionType: session.session_type,
        attempts: session.attempts,
        score: session.score,
        durationSeconds: session.duration_seconds,
        completed: session.completed,
        sessionDate: session.session_date,
        createdAt: session.created_at
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create practice session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create practice session'
    });
  } finally {
    client.release();
  }
};

export const getPracticeSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { listId } = req.query;

    let queryText = `
      SELECT id, user_id, list_id, session_type, attempts, score, duration_seconds, completed, session_date, created_at
      FROM practice_sessions
      WHERE user_id = $1
    `;
    const params: any[] = [req.user.userId];

    if (listId) {
      queryText += ' AND list_id = $2';
      params.push(listId);
    }

    queryText += ' ORDER BY session_date DESC';

    const result = await query(queryText, params);

    const sessions = result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      listId: row.list_id,
      sessionType: row.session_type,
      attempts: row.attempts,
      score: row.score,
      durationSeconds: row.duration_seconds,
      completed: row.completed,
      sessionDate: row.session_date,
      createdAt: row.created_at
    }));

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Get practice sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get practice sessions'
    });
  }
};

export const getPracticeSession = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const result = await query(
      `SELECT id, user_id, list_id, session_type, attempts, score, duration_seconds, completed, session_date, created_at
       FROM practice_sessions
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Practice session not found'
      });
      return;
    }

    const session = result.rows[0];

    res.json({
      success: true,
      data: {
        id: session.id,
        userId: session.user_id,
        listId: session.list_id,
        sessionType: session.session_type,
        attempts: session.attempts,
        score: session.score,
        durationSeconds: session.duration_seconds,
        completed: session.completed,
        sessionDate: session.session_date,
        createdAt: session.created_at
      }
    });
  } catch (error) {
    console.error('Get practice session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get practice session'
    });
  }
};

export const deletePracticeSession = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const result = await query(
      'DELETE FROM practice_sessions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Practice session not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Practice session deleted successfully'
    });
  } catch (error) {
    console.error('Delete practice session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete practice session'
    });
  }
};