import { map } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";
import styles from "./CustomSetting.module.css";
import { InputNumber, SettingInput } from "./Setting";

type Props = {
  settings: SettingInput;
  disabled?: boolean;
  onChange: (value: SettingInput) => void;
};

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
          pattern="[0-9]{1,3}"
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
