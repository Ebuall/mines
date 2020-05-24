import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import styles from "./Board.module.css";
import { boardSlice, Box, BoxState, GameState, Point } from "./boardSlice";
import { gameSlice } from "./gameSlice";
import { Scoreboard } from "./Scoreboard";
import { SettingInput } from "./Setting";

type Props = {
  settings: SettingInput;
};

function range(n: number) {
  return Array.from(new Array(n), (_, i) => i);
}

const Open: React.FC<{ value?: number }> = (props) => (
  <div
    draggable={false}
    className={
      styles.square + " " + styles["m" + props.value] + " " + styles.open
    }
  >
    {props.children}
  </div>
);

const Mine: React.FC = () => <Open>💣</Open>;

const Flag: React.FC<Point> = (props) => {
  const dispatch = useDispatch();
  return (
    <div
      className={styles.square}
      onContextMenu={(ev) => {
        ev.preventDefault();
        dispatch(boardSlice.actions.unflag(props));
      }}
    >
      🚩
    </div>
  );
};

const Closed: React.FC<Point & { settings: SettingInput }> = ({
  settings,
  children: _,
  ...click
}): JSX.Element => {
  const dispatch = useDispatch();
  return (
    <div
      key={click.x}
      className={styles.square}
      onClick={() =>
        dispatch(
          boardSlice.actions.click({
            settings,
            click,
          }),
        )
      }
      onContextMenu={(ev) => {
        ev.preventDefault();
        dispatch(boardSlice.actions.flag(click));
      }}
    ></div>
  );
};

export const Board: React.FC<Props> = ({ settings }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(boardSlice.actions.init(settings));
  }, [settings, dispatch]);
  const state = useSelector((state: RootState) => state.board);
  if (!state.map) return <div></div>;

  return (
    <div className={styles.wrapper} style={{}}>
      <Scoreboard></Scoreboard>
      {range(+settings.height).map((row) => (
        <div key={row} className={styles.row}>
          {range(+settings.width).map((col) => {
            const box = state.map[row][col];
            if (Box.isMine(box)) {
              if (
                box.state === BoxState.Open ||
                state.gameState === GameState.Over ||
                state.gameState === GameState.Win
              ) {
                return <Mine key={col}></Mine>;
              }
            }
            if (box.state === BoxState.Closed) {
              return (
                <Closed key={col} settings={settings} x={col} y={row}></Closed>
              );
            }
            if (box.state === BoxState.Flagged) {
              return <Flag key={col} x={col} y={row}></Flag>;
            }
            return (
              <Open key={col} value={box.value}>
                {box.value || ""}
              </Open>
            );
          })}
        </div>
      ))}
      <button onClick={() => dispatch(gameSlice.actions.exit())}>Exit</button>
    </div>
  );
};
