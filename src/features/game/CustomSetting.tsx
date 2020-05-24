import React from "react";
import styles from "./CustomSetting.module.css";
import { SettingInput, InputNumber } from "./Setting";
import { pipe } from "fp-ts/lib/pipeable";
import { map } from "fp-ts/lib/Either";

type Props = {
  settings: SettingInput;
  disabled?: boolean;
  onChange: (value: SettingInput) => void;
};

function toNumber(newVal: string, oldVal: number) {
  const num = Number(newVal);
  if (!isNaN(num)) {
    return num;
  } else {
    return oldVal;
  }
}

export const CustomSetting: React.FC<Props> = ({
  settings,
  disabled = false,
  onChange,
}) => {
  return (
    <div className={styles.wrapper}>
      <label>
        <div>Height</div>
        <input
          type="text"
          value={settings.height}
          disabled={disabled}
          pattern="[0-9]{1,2}"
          onChange={(ev) =>
            pipe(
              InputNumber.decode(ev.target.value),
              map((height) =>
                onChange({
                  ...settings,
                  height,
                }),
              ),
            )
          }
        />
      </label>
      <label>
        <div>Width</div>
        <input
          type="text"
          value={settings.width}
          disabled={disabled}
          pattern="[0-9]{1,2}"
          onChange={(ev) =>
            pipe(
              InputNumber.decode(ev.target.value),
              map((width) =>
                onChange({
                  ...settings,
                  width,
                }),
              ),
            )
          }
        />
      </label>
      <label>
        <div>Mine Count</div>
        <input
          type="text"
          value={settings.mines}
          disabled={disabled}
          pattern="[0-9]{1,2}"
          onChange={(ev) =>
            pipe(
              InputNumber.decode(ev.target.value),
              map((mines) =>
                onChange({
                  ...settings,
                  mines,
                }),
              ),
            )
          }
        />
      </label>
    </div>
  );
};
