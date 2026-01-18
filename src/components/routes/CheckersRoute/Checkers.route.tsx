import {
  doMoves,
  selectAvailableMoves,
  selectPiece,
  selectSquares,
  type DoMovesPayload,
  type Move,
} from "@/features/checkers";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useState } from "react";

export const CheckersRoute = () => {
  const dispatch = useAppDispatch();
  const checkers = useAppSelector(selectSquares);
  const rows = checkers.length;
  const cols = checkers[0].length;

  const [selectedPieceCoords, setSelectedPieceCoords] = useState({
    row: null,
    col: null,
  } as {
    row: number | null;
    col: number | null;
  });

  const selectedPiece = useAppSelector((state) =>
    selectPiece(state, selectedPieceCoords.row, selectedPieceCoords.col),
  );

  const [selectedMoves, setSelectedMoves] = useState([] as Move[]);

  const availableMoves = useAppSelector((state) =>
    selectAvailableMoves(
      state,
      selectedPieceCoords.row,
      selectedPieceCoords.col,
      selectedPiece,
      [],
    ),
  );

  const availableMovesFromLastSelectedMove = useAppSelector((state) =>
    selectAvailableMoves(
      state,
      selectedMoves[selectedMoves.length - 1]?.row ?? null,
      selectedMoves[selectedMoves.length - 1]?.col ?? null,
      selectedPiece,
      selectedMoves,
    ),
  );

  return (
    <section>
      <button
        className="bg-white cursor-pointer p-2 mb-4"
        onClick={() => {
          if (
            selectedPieceCoords.row !== null &&
            selectedPieceCoords.col !== null &&
            selectedMoves.length > 0
          ) {
            dispatch(
              doMoves({
                row: selectedPieceCoords.row,
                col: selectedPieceCoords.col,
                moves: selectedMoves,
              } as DoMovesPayload),
            );
            setSelectedMoves([]);
            setSelectedPieceCoords({ row: null, col: null });
          }
        }}
      >
        Do moves
      </button>
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
              const isFirstMove = selectedMoves.length === 0;
              const isLastMoveCapture =
                selectedMoves.length !== 0 &&
                selectedMoves[selectedMoves.length - 1].effect.kind ===
                  "capture";

              const selectedMove = selectedMoves.find(
                (selectedMove) =>
                  selectedMove.row === i && selectedMove.col === j,
              );
              const isPositionOfSelectedMove = selectedMove !== undefined;

              const isSelectedPiece =
                i === selectedPieceCoords.row && j === selectedPieceCoords.col;

              const move = isFirstMove
                ? availableMoves.find(
                    (availableMove) =>
                      availableMove.row === i && availableMove.col === j,
                  )
                : availableMovesFromLastSelectedMove.find(
                    (availableMove) =>
                      availableMove.row === i && availableMove.col === j,
                  );
              const isAvailableMove = move !== undefined;

              const canMoveHere =
                !isSelectedPiece &&
                isAvailableMove &&
                (isFirstMove || isLastMoveCapture);

              if (canMoveHere) {
                console.log("foo");
              }

              const style =
                square.piece === undefined
                  ? `${
                      canMoveHere || isPositionOfSelectedMove
                        ? "bg-emerald-500"
                        : "bg-gray-500"
                    }`
                  : square.piece.player === "PLAYER_1"
                    ? `${isSelectedPiece ? "bg-rose-500" : "bg-amber-300"}`
                    : `${isSelectedPiece ? "bg-rose-500" : "bg-blue-400"}`;

              return (
                <div
                  className={`${style} w-12 h-12`}
                  onClick={
                    square.piece !== undefined
                      ? () => {
                          setSelectedMoves([]);
                          setSelectedPieceCoords({ row: i, col: j });
                        }
                      : canMoveHere
                        ? () => setSelectedMoves([...selectedMoves, move])
                        : () => {
                            setSelectedMoves([]);
                            setSelectedPieceCoords({ row: null, col: null });
                          }
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
