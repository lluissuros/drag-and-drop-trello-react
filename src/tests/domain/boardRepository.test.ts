import { describe, expect, it, beforeEach } from 'vitest';
import { BoardRepository } from '../../infra/storage/BoardRepository';
import { createBoard } from '../../domain/services/createBoard';

describe('BoardRepository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads boards', () => {
    const board = createBoard();
    board.columns[0].cards.push({ id: 'a', text: 'Persist me' });

    BoardRepository.save(board);
    const loaded = BoardRepository.load();

    expect(loaded?.columns[0].cards[0].text).toBe('Persist me');
  });

  it('returns null on invalid data', () => {
    localStorage.setItem('tasks-board', '{invalid json');
    expect(BoardRepository.load()).toBeNull();
  });
});
