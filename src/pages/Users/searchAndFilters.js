import { useDispatch } from "dva";
import React, { useCallback, useState } from "react";
import debounce from "lodash.debounce";
import { applyFilters, saveFilters } from "../../models/appUser";
import { Input } from "antd";
import RoleSelector from "./roleSelector";

function SearchAndFilters() {
  const [val, setVal] = useState("");
  const dispatch = useDispatch();

  const _onChange = useCallback(
    debounce((term) => {
      dispatch(saveFilters({ searchTerm: term }));
      dispatch(applyFilters(false));
    }, 800),
    []
  );

  const onChange = useCallback(
    (e) => {
      const val = e.target.value;
      setVal(val);
      _onChange(val);
    },
    [_onChange]
  );

  const onRoleChange = useCallback((role) => {
    dispatch(saveFilters({ role: role === "any-role" ? "" : role }));
    dispatch(applyFilters(false, true));
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 999,
      }}
    >
      <Input
        value={val}
        onChange={onChange}
        allowClear
        placeholder="Search by user's name, email, bio, uid"
      />
      <RoleSelector
        onChange={onRoleChange}
        allowAnySelection
        noRestrictions
        placeholder="Filter By Role"
        style={{ width: 150 }}
      />
    </div>
  );
}

export default SearchAndFilters;
