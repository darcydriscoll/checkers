import { selectAvailableMoves, selectSquares } from "@/features/checkers";
import { useAppSelector } from "@/hooks";
import { useEffect, useState } from "react";

export const CheckersRoute = () => {
  const checkers = useAppSelector(selectSquares);
  const rows = checkers.length;
  const cols = checkers[0].length;

  const [selected, setSelected] = useState({ row: null, col: null } as {
    row: number | null;
    col: number | null;
  });

  const availableMoves = useAppSelector((state) =>
    selectAvailableMoves(state, selected.row, selected.col)
  );

  return (
    <section>
      <div
        style={
          {
            "--rows": `repeat(${rows}, minmax(0, 1fr))`,
            "--cols": `repeat(${cols}, minmax(0, 1fr))`,
          } as React.CSSProperties
        }
        className={`grid grid-rows-(--rows) grid-cols-(--cols) gap-4 m-auto`}
      >
        {checkers
          .map((row, i) => {
            return row.map((square, j) => {
              const isSelected = i === selected.row && j === selected.col;
              const squareIsAvailable = availableMoves.some(
                (move) => move.row === i && move.col === j
              );
              const style =
                square.piece === undefined
                  ? `${squareIsAvailable ? "bg-emerald-500" : "bg-gray-500"}`
                  : square.piece.player === "PLAYER_1"
                  ? `${isSelected ? "bg-rose-500" : "bg-amber-300"}`
                  : `${isSelected ? "bg-rose-500" : "bg-blue-400"}`;
              return (
                <div
                  className={`${style} w-12 h-12`}
                  onClick={
                    square.piece !== undefined
                      ? () => setSelected({ row: i, col: j })
                      : undefined
                  }
                ></div>
              );
            });
          })
          .flat(1)}
      </div>
    </section>
  );
};
