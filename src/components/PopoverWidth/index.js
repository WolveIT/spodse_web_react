import React, { useEffect, useState } from "react";

let setCssFromOutside;

export function setPopoverWidth(width) {
  setCssFromOutside(`
    .ant-popover {
        width: ${width};
      }      
    `);
}

export function openFile({ accept, multiple = true, onChange }) {
  const ip = document.getElementById("global_file_input");
  if (accept) ip.setAttribute("accept", accept);
  if (multiple) ip.setAttribute("multiple", multiple);
  if (onChange) ip.onchange = (e) => onChange && onChange(e.target.files);
  ip.click();
}

export default function PopoverWidth() {
  const [css, setCss] = useState();

  useEffect(() => {
    setCssFromOutside = setCss;
  }, []);

  return (
    <>
      {css ? <style>{css}</style> : null}
      <input id="global_file_input" type="file" style={{ display: "none" }} />
    </>
  );
}
