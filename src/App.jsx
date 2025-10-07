import { useState } from 'react';
import './App.css';

function Square({ value, onSquareClick, highlight }) {
  return (
    <button
      className={`square ${highlight ? 'highlight' : ''}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

const BOARD_SIZE = 3;

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares, BOARD_SIZE) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares, i);
  }

  const winnerInfo = calculateWinner(squares, BOARD_SIZE);
  const winner = winnerInfo ? winnerInfo.winner : null;
  const winningLine = winnerInfo ? winnerInfo.line : [];
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (squares.every(Boolean)) {
    status = "It's a draw!";
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="status-bar">{status}</div>
      {Array(BOARD_SIZE).fill(null).map((_, row) => (
        <div className="board-row" key={row}>
          {Array(BOARD_SIZE).fill(null).map((_, col) => {
            const index = row * BOARD_SIZE + col;
            return (
              <Square
                key={col}
                value={squares[index]}
                onSquareClick={() => handleClick(index)}
                highlight={winningLine.includes(index)}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([{
    squares: Array(BOARD_SIZE * BOARD_SIZE).fill(null),
    moveIndex: null
  }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares, moveIndex) {
    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      { squares: nextSquares, moveIndex }
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function toggleSortOrder() {
    setIsAscending(!isAscending);
  }

  const moves = history.map((step, move) => {
    let description;
    if (move > 0 && Number.isInteger(step.moveIndex) && step.moveIndex >= 0) {
      const index = step.moveIndex;
      const row = Math.floor(index / BOARD_SIZE) + 1;
      const col = (index % BOARD_SIZE) + 1;
      description = `Go to move #${move} (${row}, ${col})`;
    } else {
      description = 'Go to game start';
    }

    return (
      <li key={move}>
        { move === currentMove
          ? (
            <span className='current-move'>
              You are at move #{move}
            </span>
          ) 
          : (
            <button onClick={() => jumpTo(move)}>
              {description}
            </button>
          )}
      </li>
    );
  });

  const sortedMoves = isAscending ? moves : [...moves].reverse();

  return (
    <div className='game-container'>
      <div className="game">
        <div className="game-board">
          <Board 
            xIsNext={xIsNext}
            squares={currentSquares}
            onPlay={handlePlay} 
          />
        </div>

        <div className="game-info">
          <button className="toggle-sort" onClick={toggleSortOrder}>
            Sort {isAscending ? 'Descending' : 'Ascending'}
          </button>
          <ol>{sortedMoves}</ol>
        </div>
      </div>
    </div>
  );
}

function calculateWinner(squares, boardSize = 3) {
  const lines = [];

  // Rows
  for (let r = 0; r < boardSize; r++) {
    const row = Array.from({ length: boardSize }, (_, c) => r * boardSize + c);
    lines.push(row);
  }

  // Columns
  for (let c = 0; c < boardSize; c++) {
    const col = Array.from({ length: boardSize }, (_, r) => r * boardSize + c);
    lines.push(col);
  }

  // Diagonals
  lines.push(Array.from({ length: boardSize }, (_, i) => i * boardSize + i));
  lines.push(Array.from({ length: boardSize }, (_, i) => i * boardSize + (boardSize - 1 - i)));

  for (let line of lines) {
    const [first, ...rest] = line;
    if (squares[first] && rest.every(idx => squares[idx] === squares[first])) {
      return { winner: squares[first], line };
    }
  }
  return null;
}

