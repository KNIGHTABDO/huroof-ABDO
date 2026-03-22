import {
  createBoard,
  createGameState,
  getCenterHexId,
  getNeighbors,
  checkWin,
  assignPoint,
  selectHex,
  nextRound,
  registerBuzzer,
  clearBuzzer,
} from '../gameState';

describe('gameState core logic', () => {
  test('createBoard returns 25 hexes', () => {
    const board = createBoard();
    expect(board).toHaveLength(25);
    expect(board[0]).toMatchObject({ id: 0, owner: null });
  });

  test('initial game state uses center hex', () => {
    const state = createGameState();
    expect(state.activeHexId).toBe(getCenterHexId());
    expect(state.phase).toBe('questioning');
  });

  test('getNeighbors returns adjacent hexes', () => {
    const board = createBoard();
    const neighbors = getNeighbors(board, 12);
    expect(neighbors.length).toBeGreaterThan(0);
  });

  test('checkWin detects orange left-to-right path', () => {
    const board = createBoard();
    [10, 11, 12, 13, 14].forEach((id) => {
      board[id].owner = 'orange';
    });
    expect(checkWin(board, 'orange')).toBe(true);
  });

  test('assignPoint sets owner and selecting phase when no winner', () => {
    const state = createGameState();
    const updated = assignPoint(state, 'green', state.activeHexId);
    expect(updated.hexagons[state.activeHexId].owner).toBe('green');
    expect(['selecting', 'roundOver', 'gameOver']).toContain(updated.phase);
  });

  test('selectHex moves active hex and returns to questioning', () => {
    const state = createGameState();
    const updated = selectHex(state, 5);
    expect(updated.activeHexId).toBe(5);
    expect(updated.phase).toBe('questioning');
  });

  test('nextRound increments round', () => {
    const state = createGameState();
    const updated = nextRound(state);
    expect(updated.currentRound).toBe(state.currentRound + 1);
    expect(updated.phase).toBe('questioning');
  });

  test('registerBuzzer and clearBuzzer work', () => {
    const state = createGameState();
    const buzzed = registerBuzzer(state, 'orange', 'Abdo');
    expect(buzzed.buzzerInfo).toEqual({ team: 'orange', playerName: 'Abdo' });

    const cleared = clearBuzzer(buzzed);
    expect(cleared.buzzerInfo).toBeNull();
  });
});
