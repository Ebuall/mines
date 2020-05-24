import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import styles from "./Board.module.css";
import { boardSlice, Point } from "./boardSlice";
import { gameSlice } from "./gameSlice";
import { SettingInput } from "./Setting";

type Props = {
  settings: SettingInput;
};

function range(n: number) {
  return Array.from(new Array(n), (_, i) => i);
}

export const Board: React.FC<Props> = ({ settings }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(boardSlice.actions.init(settings));
  }, [settings, dispatch]);
  const state = useSelector((state: RootState) => state.board);
  if (!state.map) return <div></div>;

  return (
    <div className={styles.wrapper} style={{}}>
      {range(+settings.height).map((row) => (
        <div key={row} className={styles.row}>
          {range(+settings.width).map((col) => {
            const box = state.map[row][col];
            if (!box.open) {
              return (
                <div
                  key={col}
                  className={styles.square}
                  onClick={() =>
                    dispatch(
                      boardSlice.actions.click({
                        settings,
                        click: Point(col, row),
                      }),
                    )
                  }
                ></div>
              );
            }
            return (
              <div
                draggable={false}
                key={col}
                className={
                  styles.square +
                  " " +
                  styles["m" + box.value] +
                  " " +
                  styles.open
                }
              >
                {box.value < 0 ? (
                  <img
                    src="mine.png"
                    width="50%"
                    height="50%"
                    style={{ margin: "4px auto" }}
                    alt=""
                  ></img>
                ) : (
                  box.value || ""
                )}
              </div>
            );
          })}
        </div>
      ))}
      <button onClick={() => dispatch(gameSlice.actions.exit())}>Exit</button>
    </div>
  );
};
