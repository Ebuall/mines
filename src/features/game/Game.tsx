import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { Board } from "./Board";
import { CustomSetting } from "./CustomSetting";
import styles from "./Game.module.css";
import { gameSlice } from "./gameSlice";
import { SelectList } from "./SelectList";

const entries = [
  { title: "Easy", value: 0 },
  { title: "Medium", value: 1 },
  { title: "Hard", value: 2 },
  { title: "Custom", value: 3 },
];

export const Game: React.FC = () => {
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state.game);
  return (
    <div className={styles.wrapper} onContextMenu={(ev) => ev.preventDefault()}>
      {state.mode === "game" && <Board settings={state.settings}></Board>}
      {state.mode === "menu" && (
        <>
          <div className={styles.menu}>
            <div className={styles.flex}>
              <div className={styles.padded}>
                <SelectList
                  entries={entries}
                  selected={state.setting}
                  onChange={(value) =>
                    dispatch(gameSlice.actions.selectDifficulty(value))
                  }
                ></SelectList>
              </div>
              <div className={styles.padded}>
                <CustomSetting
                  settings={state.settings}
                  onChange={(c) =>
                    dispatch(gameSlice.actions.updateSettings(c))
                  }
                ></CustomSetting>
              </div>
            </div>
            <button
              className={styles.start}
              onClick={() => dispatch(gameSlice.actions.start())}
            >
              Start
            </button>
          </div>
        </>
      )}
    </div>
  );
};
