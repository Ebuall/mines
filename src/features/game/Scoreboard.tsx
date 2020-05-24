import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { BoxState, GameState } from "./boardSlice";
import styles from "./Scoreboard.module.css";

export const Scoreboard: React.FC = () => {
  const s = useSelector((state: RootState) => {
    const {
      board,
      game: {
        settings: { mines: mineCount },
      },
    } = state;
    return { board, mineCount };
  });
  if (s.board.gameState === GameState.Over) {
    return <div>Game Over 🙁</div>;
  }
  if (s.board.gameState === GameState.Win) {
    return <div>You Won 🎉</div>;
  }
  const flagged = s.board.map.reduce(
    (count, row) =>
      count +
      row.reduce(
        (count, box) => count + (box.state === BoxState.Flagged ? 1 : 0),
        0,
      ),
    0,
  );
  return (
    <div className={styles.wrappper}>🚩 {Number(s.mineCount) - flagged}</div>
  );
};
