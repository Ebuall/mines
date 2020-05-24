import { createSlice } from "@reduxjs/toolkit";
import { validateSettings, SettingInput, ValidatedSetting } from "./Setting";

const settingList = [
  {
    height: 8,
    width: 8,
    mines: 10,
  },
  {
    height: 16,
    width: 16,
    mines: 40,
  },
  {
    height: 16,
    width: 30,
    mines: 99,
  },
] as ValidatedSetting[];

const initialState = {
  mode: "menu" as "menu" | "game",
  settings: ValidatedSetting.encode(settingList[0]),
  setting: 0,
};

type ActionWith<T> = {
  payload: T;
};
export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    start: (state) => {
      if (validateSettings(state.settings)) {
        state.mode = "game";
      }
    },
    exit: (state) => {
      console.log("exit triggers here");
      state.mode = "menu";
    },
    selectDifficulty: (state, action: ActionWith<number>) => {
      const buildin = settingList[action.payload];
      if (buildin) {
        state.settings = ValidatedSetting.encode(buildin);
      }
      state.setting = action.payload;
    },
    updateSettings: (state, action: ActionWith<SettingInput>) => {
      state.settings = action.payload;
      state.setting = 3;
    },
  },
});
