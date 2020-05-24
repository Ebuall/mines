import { createSlice } from "@reduxjs/toolkit";
import { map } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { gameSlice } from "./gameSlice";
import { SettingInput, ValidatedSetting } from "./Setting";

export type Point = ReturnType<typeof Point>;
export function Point(x: number, y: number) {
  return { x, y };
}
export enum BoxState {
  Closed,
  Open,
  Flagged,
}
export type Box = ReturnType<typeof Box>;
export function Box(value = 0, state = BoxState.Closed) {
  return { value, state };
}
Box.isMine = function (box: Box) {
  return box.value < 0;
};
Box.forEachNeighbor = function (
  map: Box[][],
  { x, y }: Point,
  fn: (box: Box, point: Point) => void,
) {
  const width = map[0].length;
  const height = map.length;
  if (y < height - 1) {
    fn(map[y + 1][x], { x: x, y: y + 1 });
    if (x < width - 1) {
      fn(map[y + 1][x + 1], { x: x + 1, y: y + 1 });
    }
  }
  if (x < width - 1) {
    fn(map[y][x + 1], { x: x + 1, y: y });
    if (y > 0) {
      fn(map[y - 1][x + 1], { x: x + 1, y: y - 1 });
    }
  }
  if (y > 0) {
    fn(map[y - 1][x], { x: x, y: y - 1 });
    if (x > 0) {
      fn(map[y - 1][x - 1], { x: x - 1, y: y - 1 });
    }
  }
  if (x > 0) {
    fn(map[y][x - 1], { x: x - 1, y: y });
    if (y < height - 1) {
      fn(map[y + 1][x - 1], { x: x - 1, y: y + 1 });
    }
  }
};

function range(n: number) {
  return Array.from(new Array(n), (_, i) => i);
}

/**
 * From MDN
 *
 * The maximum is exclusive and the minimum is inclusive
 */
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function shuffle(arr: any[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const target = getRandomInt(0, i + 1);
    [arr[i], arr[target]] = [arr[target], arr[i]];
  }
}

function emptyMap({ height, width }: ValidatedSetting) {
  return range(height).map((_) => range(width).map((_) => Box()));
}

function populatedMap(
  { height, width, mines }: ValidatedSetting,
  click: Point,
) {
  const flattenedMap = Array.from(new Array(height * width - 1), (_) => Box());
  for (let i = 0; i < mines; i++) {
    flattenedMap[i].value = -10;
  }
  shuffle(flattenedMap);
  flattenedMap.splice(click.y * width + click.x, 0, Box(0, BoxState.Open));

  const map: Box[][] = new Array(height);
  for (let row = 0; row < map.length; row++) {
    const rowStart = row * width;
    map[row] = flattenedMap.slice(rowStart, rowStart + width);
  }

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (Box.isMine(map[y][x])) {
        Box.forEachNeighbor(map, Point(x, y), (box) => box.value++);
      }
    }
  }

  return map;
}

export enum GameState {
  Init,
  Progress,
  Over,
  Win,
}

type ActionWith<T> = {
  payload: T;
};
export const boardSlice = createSlice({
  name: "board",
  initialState: {
    map: (undefined as unknown) as Box[][],
    gameState: GameState.Init,
  },
  reducers: {
    init: (state, action: ActionWith<SettingInput>) => {
      pipe(
        ValidatedSetting.decode(action.payload),
        map((s) => {
          state.map = emptyMap(s);
        }),
      );
    },
    click: (
      state,
      {
        payload: { settings, click },
      }: ActionWith<{ settings: SettingInput; click: Point }>,
    ) => {
      console.log("clicked", click);
      if (state.gameState === GameState.Over) {
        return;
      }
      if (state.gameState === GameState.Init) {
        pipe(
          ValidatedSetting.decode(settings),
          map((s) => {
            state.map = populatedMap(s, click);
            state.gameState = GameState.Progress;
          }),
        );
      } else {
        const clicked = state.map[click.y][click.x];
        clicked.state = BoxState.Open;
        if (Box.isMine(clicked)) {
          state.gameState = GameState.Over;
        }
      }
      function openAroundZero(map: Box[][], pt: Point) {
        if (map[pt.y][pt.x].value === 0) {
          Box.forEachNeighbor(map, pt, (box, point) => {
            if (box.state === BoxState.Open) return;
            if (box.value >= 0) {
              box.state = BoxState.Open;
              console.log("opening around", point);
              openAroundZero(map, point);
            }
          });
        }
      }
      openAroundZero(state.map, click);
      const boxesLeftToOpen = state.map.reduce(
        (count, row) =>
          count +
          row.reduce(
            (count, box) =>
              count +
              (!Box.isMine(box) && box.state === BoxState.Closed ? 1 : 0),
            0,
          ),
        0,
      );
      if (boxesLeftToOpen === 0) {
        state.gameState = GameState.Win;
      }
    },
    flag: (state, { payload: { x, y } }: ActionWith<Point>) => {
      if (state.gameState === GameState.Progress) {
        state.map[y][x].state = BoxState.Flagged;
      }
    },
    unflag: (state, { payload: { x, y } }: ActionWith<Point>) => {
      if (state.gameState === GameState.Progress) {
        state.map[y][x].state = BoxState.Closed;
      }
    },
  },
  extraReducers: {
    [gameSlice.actions.exit().type]: (state) => {
      console.log("exit triggers here too");
      state.map = undefined as any;
      state.gameState = GameState.Init;
    },
  },
});
