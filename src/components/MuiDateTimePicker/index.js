import DateTimePicker from "@mui/lab/DateTimePicker";
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

function MuiDateTimePicker({ placeholder = "Enter Date", ...props }) {
  const id = useMemo(() => "ip_" + randHashString(6), []);
  return (
    <DateTimePicker
      renderInput={(props) => (
        <RenderInput {...props} placeholder={placeholder} id={id} />
      )}
      {...props}
      onChange={props.onChange}
    />
  );
}

export default MuiDateTimePicker;
