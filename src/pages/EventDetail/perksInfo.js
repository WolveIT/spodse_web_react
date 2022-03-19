import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Input, Popover } from "antd";
import React, { useCallback, useState } from "react";
import CustomIcon from "../../components/Icon";
import { globalErrorHandler } from "../../utils/errorHandler";
import { FieldValue } from "./peopleTabs";

export default function PerksInfo({ perks, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleEditing = useCallback(() => {
    setEditing((editing) => !editing);
  }, []);

  const [_perks, setPerks] = useState(perks);

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setPerks((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        allotted: +value,
      },
    }));
  }, []);

  const onSubmit = useCallback(() => {
    setLoading(true);
    typeof onEdit === "function" &&
      onEdit(_perks)
        .then(toggleEditing)
        .catch(globalErrorHandler)
        .finally(() => {
          setLoading(false);
        });
  }, [_perks]);

  return (
    <Popover
      trigger="click"
      content={
        <div>
          {Object.entries(perks || {})
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([perk, val]) => (
              <FieldValue
                key={perk}
                field={perk}
                value={
                  editing ? (
                    <Input
                      min={+_perks[perk].consumed || 0}
                      value={+_perks[perk].allotted}
                      onChange={onChange}
                      name={perk}
                    />
                  ) : (
                    `${
                      Number.isInteger(val?.consumed)
                        ? val.consumed + " / "
                        : ""
                    }${val?.allotted}`
                  )
                }
              />
            ))}
          {editing && (
            <Button onClick={onSubmit} loading={loading} type="primary">
              Submit
            </Button>
          )}
          <div
            style={{
              position: "absolute",
              top: 4,
              right: 12,
              display: typeof onEdit === "function" ? "unset" : "none",
            }}
          >
            {editing ? (
              <CloseOutlined onClick={toggleEditing} />
            ) : (
              <EditOutlined onClick={toggleEditing} />
            )}
          </div>
        </div>
      }
      title="Coupons"
    >
      <CustomIcon style={{ fontSize: 16 }} type="icon-06tags" />
    </Popover>
  );
}
