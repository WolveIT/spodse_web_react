import { DatePicker, DateTimePicker } from "@mui/lab";
import { Input } from "antd";
import React, { useEffect, useMemo } from "react";
import { randHashString } from "../../services/utils/utils";

function RenderInput({ inputProps, InputProps, inputRef, placeholder, id }) {
  useEffect(() => {
    const ip = document.getElementById(id);
    if (ip && typeof inputRef === "function") inputRef(ip);
  }, []);

  return (
    <Input
      {...inputProps}
      id={id}
      addonAfter={
        <div style={{ marginLeft: -19 }}>{InputProps?.endAdornment}</div>
      }
      placeholder={placeholder}
    />
  );
}

export function MuiDateTimePicker({ placeholder = "Enter Date", ...props }) {
  const id = useMemo(() => "ip_" + randHashString(6), []);
  return (
    <DateTimePicker
      ampm={false}
      renderInput={(props) => (
        <RenderInput {...props} placeholder={placeholder} id={id} />
      )}
      {...props}
      onChange={props.onChange}
    />
  );
}

export function MuiDatePicker({ placeholder = "Enter Date", ...props }) {
  const id = useMemo(() => "ip_" + randHashString(6), []);
  return (
    <DatePicker
      renderInput={(props) => (
        <RenderInput {...props} placeholder={placeholder} id={id} />
      )}
      {...props}
      onChange={props.onChange}
    />
  );
}

export default MuiDateTimePicker;
