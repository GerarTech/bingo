'use client';

import { COLUMN_LABELS } from '../types';

interface BingoGridProps {
  card: number[][];
  drawnNumbers: number[];
  winningCells?: boolean[][];
  interactive?: boolean;
  onCellClick?: (row: number, col: number) => void;
}

export default function BingoGrid({
  card,
  drawnNumbers,
  winningCells,
  interactive = false,
  onCellClick,
}: BingoGridProps) {
  // card is 15 rows x 5 cols
  const isCalled = (num: number) => num === 0 || drawnNumbers.includes(num);
  const isWinning = (row: number, col: number) => winningCells?.[row]?.[col] ?? false;

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Column headers */}
      <div className="grid grid-cols-5 mb-1 px-1">
        {COLUMN_LABELS.map((label, idx) => (
          <div
            key={label}
            className={`text-center font-bold text-sm py-1 rounded-t-lg ${
              idx === 0 ? 'text-green-400' :
              idx === 1 ? 'text-yellow-400' :
              idx === 2 ? 'text-red-400' :
              idx === 3 ? 'text-blue-400' :
              'text-pink-400'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grid - 15 rows x 5 cols */}
      <div className="grid grid-cols-5 gap-1">
        {card.map((row, rowIdx) =>
          row.map((num, colIdx) => {
            const called = isCalled(num);
            const winning = isWinning(rowIdx, colIdx);
            const isFree = num === 0;

            return (
              <button
                key={`${rowIdx}-${colIdx}`}
                onClick={() => interactive && onCellClick?.(rowIdx, colIdx)}
                disabled={!interactive || isFree}
                className={`
                  w-full aspect-square flex items-center justify-center rounded
                  text-xs font-bold transition-all duration-150
                  ${called ? 'bg-gold/20 text-gold border border-gold/40' : 'bg-navy-card/60 text-white/80 border border-white/5'}
                  ${winning ? 'bg-gold/30 border-gold animate-pulse' : ''}
                  ${isFree ? 'bg-gold/10 border-gold/30 text-gold' : ''}
                  ${interactive && !called && !isFree ? 'cursor-pointer hover:border-gold/50' : ''}
                `}
              >
                {isFree ? '⭐' : num}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}