import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { gameSlice } from "../features/game/gameSlice";
import { boardSlice } from "../features/game/boardSlice";

export const store = configureStore({
  reducer: {
    game: gameSlice.reducer,
    board: boardSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
