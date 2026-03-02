import { Request, Response } from 'express';
import { query } from '../config/database.js';

export const getProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { listId } = req.query;

    let queryText = `
      SELECT id, user_id, list_id, word, total_attempts, correct_attempts, 
             consecutive_correct, is_mastered, last_practiced_at, created_at, updated_at
      FROM progress_records
      WHERE user_id = $1
    `;
    const params: any[] = [req.user.userId];

    if (listId) {
      queryText += ' AND list_id = $2';
      params.push(listId);
    }

    queryText += ' ORDER BY last_practiced_at DESC';

    const result = await query(queryText, params);

    const progressRecords = result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      listId: row.list_id,
      word: row.word,
      totalAttempts: row.total_attempts,
      correctAttempts: row.correct_attempts,
      consecutiveCorrect: row.consecutive_correct,
      isMastered: row.is_mastered,
      lastPracticedAt: row.last_practiced_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      success: true,
      data: progressRecords
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get progress'
    });
  }
};

export const getProgressStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { listId } = req.params;

    // Get overall stats for the list
    const statsResult = await query(
      `SELECT 
         COUNT(*) as total_words,
         COUNT(*) FILTER (WHERE is_mastered = true) as mastered_words,
         COALESCE(AVG(CASE WHEN total_attempts > 0 THEN (correct_attempts::float / total_attempts * 100) END), 0) as avg_accuracy
       FROM progress_records
       WHERE user_id = $1 AND list_id = $2`,
      [req.user.userId, listId]
    );

    const stats = statsResult.rows[0];

    // Get word-level progress
    const progressResult = await query(
      `SELECT word, total_attempts, correct_attempts, consecutive_correct, is_mastered, last_practiced_at
       FROM progress_records
       WHERE user_id = $1 AND list_id = $2
       ORDER BY word`,
      [req.user.userId, listId]
    );

    const wordProgress = progressResult.rows.map((row: any) => ({
      word: row.word,
      totalAttempts: row.total_attempts,
      correctAttempts: row.correct_attempts,
      consecutiveCorrect: row.consecutive_correct,
      isMastered: row.is_mastered,
      accuracy: row.total_attempts > 0 ? (row.correct_attempts / row.total_attempts * 100).toFixed(1) : '0',
      lastPracticedAt: row.last_practiced_at
    }));

    res.json({
      success: true,
      data: {
        totalWords: parseInt(stats.total_words),
        masteredWords: parseInt(stats.mastered_words),
        averageAccuracy: parseFloat(stats.avg_accuracy).toFixed(1),
        masteryPercentage: stats.total_words > 0 
          ? ((stats.mastered_words / stats.total_words) * 100).toFixed(1)
          : '0',
        wordProgress
      }
    });
  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get progress stats'
    });
  }
};

export const resetProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { listId, word } = req.body;

    if (word) {
      // Reset progress for specific word
      const result = await query(
        `UPDATE progress_records
         SET total_attempts = 0,
             correct_attempts = 0,
             consecutive_correct = 0,
             is_mastered = false
         WHERE user_id = $1 AND list_id = $2 AND word = $3
         RETURNING id`,
        [req.user.userId, listId, word]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Progress record not found'
        });
        return;
      }

      res.json({
        success: true,
        message: `Progress reset for word: ${word}`
      });
    } else {
      // Reset progress for entire list
      await query(
        `UPDATE progress_records
         SET total_attempts = 0,
             correct_attempts = 0,
             consecutive_correct = 0,
             is_mastered = false
         WHERE user_id = $1 AND list_id = $2`,
        [req.user.userId, listId]
      );

      res.json({
        success: true,
        message: 'Progress reset for entire list'
      });
    }
  } catch (error) {
    console.error('Reset progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset progress'
    });
  }
};

export const deleteProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { listId } = req.params;

    await query(
      'DELETE FROM progress_records WHERE user_id = $1 AND list_id = $2',
      [req.user.userId, listId]
    );

    res.json({
      success: true,
      message: 'Progress deleted successfully'
    });
  } catch (error) {
    console.error('Delete progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete progress'
    });
  }
};