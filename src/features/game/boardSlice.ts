import { createSlice, Action } from "@reduxjs/toolkit";
import { gameSlice } from "./gameSlice";
import { SettingInput, ValidatedSetting } from "./Setting";
import { pipe } from "fp-ts/lib/pipeable";
import { map } from "fp-ts/lib/Either";

export type Point = ReturnType<typeof Point>;
export function Point(x: number, y: number) {
  return { x, y };
}
type Box = ReturnType<typeof Box>;
function Box(value = 0, open = false) {
  return { value, open };
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
  flattenedMap.splice(click.y * width + click.x, 0, Box(0, true));

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
        clicked.open = true;
        if (Box.isMine(clicked)) {
          state.gameState = GameState.Over;
          for (const row of state.map) {
            for (const box of row) {
              if (Box.isMine(box)) {
                box.open = true;
              }
            }
          }
        }
      }
      function openAroundZero(map: Box[][], pt: Point) {
        if (map[pt.y][pt.x].value === 0) {
          Box.forEachNeighbor(map, pt, (box, point) => {
            if (box.open) return;
            if (box.value >= 0) {
              box.open = true;
              console.log("opening around", point);
              openAroundZero(map, point);
            }
          });
        }
      }
      openAroundZero(state.map, click);
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
