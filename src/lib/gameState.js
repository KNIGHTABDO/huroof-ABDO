import { getLettersForBoard } from './arabicLetters';
import { getRandomQuestion } from './questions';

/**
 * Board layout — 5x5 hex grid matching the reference image exactly.
 * All rows have 5 hexes. Odd rows (1,3) are offset right by half a hex width.
 * This creates the classic parallelogram/diamond shape.
 * Total: 25 hexes
 * 
 * Team paths:
 *   Orange: connects LEFT edge to RIGHT edge (horizontal)
 *   Green: connects TOP edge to BOTTOM edge (vertical)
 */
const BOARD_ROWS = 5;
const BOARD_COLS = 5;
const TOTAL_HEXES = BOARD_ROWS * BOARD_COLS; // 25

/**
 * Build the initial board of hexagons.
 */
export function createBoard() {
  const letters = getLettersForBoard(TOTAL_HEXES);
  const hexagons = [];
  let id = 0;

  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      hexagons.push({
        id: id,
        letter: letters[id],
        owner: null, // null | 'orange' | 'green'
        row: row,
        col: col,
        isOffset: row % 2 === 1, // odd rows are offset
      });
      id++;
    }
  }

  return hexagons;
}

/**
 * Find the center hexagon ID (the middle hex of the board).
 * Row 2, Col 2 => index = 2*5 + 2 = 12
 */
export function getCenterHexId() {
  return Math.floor(TOTAL_HEXES / 2); // = 12 (row 2, col 2)
}

/**
 * Create initial game state.
 */
export function createGameState() {
  const hexagons = createBoard();
  const centerHexId = getCenterHexId();

  return {
    hexagons,
    currentRound: 1,
    totalRounds: 5,
    scores: { orange: 0, green: 0 },
    roundScores: { orange: 0, green: 0 },
    activeHexId: centerHexId,
    controllingTeam: null,
    phase: 'questioning',
    currentQuestion: getRandomQuestion(hexagons[centerHexId].letter),
    winner: null,
  };
}

/**
 * Get neighbors of a hex in a 5x5 grid with offset odd rows.
 * Flat-top hexagons with odd rows shifted right.
 */
export function getNeighbors(hexagons, hexId) {
  const hex = hexagons.find(h => h.id === hexId);
  if (!hex) return [];

  const { row, col, isOffset } = hex;
  const neighbors = [];

  // Same row: left and right
  const left = hexagons.find(h => h.row === row && h.col === col - 1);
  const right = hexagons.find(h => h.row === row && h.col === col + 1);
  if (left) neighbors.push(left);
  if (right) neighbors.push(right);

  // Row above and below
  // Pointy-top hexes with odd rows shifted RIGHT:
  //   If current row is ODD (shifted right): diagonal neighbors at col and col+1
  //   If current row is EVEN (not shifted): diagonal neighbors at col-1 and col
  const adjCols = isOffset ? [col, col + 1] : [col - 1, col];

  for (const adjRow of [row - 1, row + 1]) {
    if (adjRow < 0 || adjRow >= BOARD_ROWS) continue;
    for (const adjCol of adjCols) {
      if (adjCol < 0 || adjCol >= BOARD_COLS) continue;
      const n = hexagons.find(h => h.row === adjRow && h.col === adjCol);
      if (n) neighbors.push(n);
    }
  }

  return neighbors;
}

/**
 * Check if a team has won (connected their path).
 * Orange connects LEFT (col 0) to RIGHT (col 4) — horizontal.
 * Green connects TOP (row 0) to BOTTOM (row 4) — vertical.
 */
export function checkWin(hexagons, team) {
  const teamHexes = hexagons.filter(h => h.owner === team);
  if (teamHexes.length === 0) return false;

  if (team === 'green') {
    // Green: need path from row 0 to row 4
    const startHexes = teamHexes.filter(h => h.row === 0);
    return bfsPathExists(hexagons, startHexes, h => h.row === BOARD_ROWS - 1);
  } else {
    // Orange: need path from col 0 to col 4
    const startHexes = teamHexes.filter(h => h.col === 0);
    return bfsPathExists(hexagons, startHexes, h => h.col === BOARD_COLS - 1);
  }
}

function bfsPathExists(allHexagons, startHexes, isTarget) {
  if (startHexes.length === 0) return false;

  const visited = new Set();
  const queue = [...startHexes];

  for (const h of queue) {
    visited.add(h.id);
  }

  while (queue.length > 0) {
    const current = queue.shift();
    if (isTarget(current)) return true;

    const neighbors = getNeighbors(allHexagons, current.id);
    for (const n of neighbors) {
      if (!visited.has(n.id) && n.owner === current.owner) {
        visited.add(n.id);
        queue.push(n);
      }
    }
  }

  return false;
}

/**
 * Assign a point: mark hex as owned, check win, update state.
 */
export function assignPoint(state, team, hexId) {
  const newState = JSON.parse(JSON.stringify(state));
  const hex = newState.hexagons.find(h => h.id === hexId);
  if (!hex) return newState;

  hex.owner = team;
  newState.controllingTeam = team;
  newState.phase = 'selecting';

  // Check win
  if (checkWin(newState.hexagons, team)) {
    newState.scores[team]++;

    if (newState.scores[team] >= 3) {
      newState.phase = 'gameOver';
      newState.winner = team;
    } else {
      newState.phase = 'roundOver';
    }
  }

  return newState;
}

/**
 * Select the next hex to question (player picks a letter).
 */
export function selectHex(state, hexId) {
  const newState = JSON.parse(JSON.stringify(state));
  const hex = newState.hexagons.find(h => h.id === hexId);
  if (!hex || hex.owner) return newState;

  newState.activeHexId = hexId;
  newState.currentQuestion = getRandomQuestion(hex.letter);
  newState.phase = 'questioning';

  return newState;
}

/**
 * Start a new round.
 */
export function nextRound(state) {
  const newState = JSON.parse(JSON.stringify(state));
  newState.hexagons = createBoard();
  newState.currentRound++;
  newState.activeHexId = getCenterHexId();
  newState.controllingTeam = null;
  newState.phase = 'questioning';
  newState.currentQuestion = getRandomQuestion(newState.hexagons[getCenterHexId()].letter);
  newState.winner = null;
  return newState;
}

/**
 * Reset entire game.
 */
export function resetGame() {
  return createGameState();
}

/**
 * Get board dimensions.
 */
export function getBoardDimensions() {
  return { rows: BOARD_ROWS, cols: BOARD_COLS };
}
