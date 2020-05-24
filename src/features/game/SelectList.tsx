import React from "react";
import styles from "./SelectList.module.css";

type Props<Value = any> = {
  entries: { title: string; value: Value }[];
  selected: Value;
  onChange: (value: Value) => void;
};

export const SelectList = function <Value>(props: Props<Value>) {
  return (
    <div className={styles.wrapper}>
      {props.entries.map((entry) => (
        <div
          key={entry.title}
          className={entry.value === props.selected ? styles.selected : void 0}
          onClick={() => props.onChange(entry.value)}
        >
          {entry.title}
        </div>
      ))}
    </div>
  );
};
