import { chain, isRight } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";

interface DimensionBrand {
  readonly Dimension: unique symbol;
}
const Dimension = t.brand(
  t.number,
  (n): n is t.Branded<number, DimensionBrand> => n > 0 && n <= 50,
  "Dimension",
);

interface MineCountBrand {
  readonly MineCount: unique symbol;
}
const MineCount = t.brand(
  t.number,
  (n): n is t.Branded<number, MineCountBrand> => n > 0 && n < 2500,
  "MineCount",
);

type Setting = t.TypeOf<typeof Setting>;
const Setting = t.interface(
  {
    height: Dimension,
    width: Dimension,
    mines: MineCount,
  },
  "Setting",
);

interface InputNumberBrand {
  readonly InputNumber: unique symbol;
}
export const InputNumber = t.brand(
  t.string,
  (s): s is t.Branded<string, InputNumberBrand> => {
    const n = Number(s);
    return !isNaN(n) && n >= 0;
  },
  "InputNumber",
);

export type SettingInput = t.TypeOf<typeof SettingInput>;
export const SettingInput = t.interface({
  height: InputNumber,
  width: InputNumber,
  mines: InputNumber,
});

interface ValidatedSettingBrand {
  readonly ValidatedSetting: unique symbol;
}
export type ValidatedSetting = t.Branded<Setting, ValidatedSettingBrand>;
export const ValidatedSetting = new t.Type<
  ValidatedSetting,
  SettingInput,
  unknown
>(
  "ValidatedSetting",
  (i): i is ValidatedSetting => Setting.is(i) && validate(i),
  (i, c) => {
    return pipe(
      SettingInput.validate(i, c),
      chain((i) => {
        const height = Number(i.height);
        const width = Number(i.width);
        const mines = Number(i.mines);
        return Setting.validate({ height, width, mines }, c);
      }),
      chain((s) => {
        if (validate(s)) {
          return t.success(s as ValidatedSetting);
        } else {
          return t.failure(i, c);
        }
      }),
    );
  },
  ({ height, width, mines }) => {
    return {
      height: height.toString(),
      width: width.toString(),
      mines: mines.toString(),
    } as SettingInput;
  },
);

function validate(s: Setting) {
  return s.width * s.height > s.mines;
}

export function validateSettings(input: unknown) {
  return isRight(ValidatedSetting.decode(input));
}
