import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import debounce from "lodash.debounce";
import { useDispatch } from "dva";
import { resetSearchPeople, searchPeople } from "../../models/event";

export default function TabSearch({ tab, eventId, getSearchFunc }) {
  const [expanded, setExpanded] = useState(false);
  const [val, setVal] = useState("");
  const ref = useRef();
  const dispatch = useDispatch();

  const toggleExpanded = useCallback(() => {
    setExpanded((expanded) => !expanded);
    setVal("");
    dispatch(resetSearchPeople());
  }, []);

  const _onChange = useCallback(
    debounce((term) => {
      if (term?.length >= 3) {
        dispatch(searchPeople({ eventId, term, tab }));
      } else dispatch(resetSearchPeople());
    }, 800),
    [tab, eventId]
  );

  useEffect(() => {
    setVal("");
    dispatch(resetSearchPeople());
  }, [tab, eventId]);

  useEffect(() => {
    if (ref.current && eventId && tab) {
      getSearchFunc((paginate) => {
        dispatch(
          searchPeople({
            eventId,
            term: ref.current.state.value,
            tab,
            paginate,
          })
        );
      });
    }
  }, [eventId, tab]);

  const onChange = useCallback(
    (e) => {
      const val = e.target.value;
      setVal(val);
      _onChange(val);
    },
    [_onChange]
  );

  return (
    <div className={styles.tab_search_container}>
      <Input
        ref={ref}
        value={val}
        onChange={onChange}
        style={{
          opacity: expanded ? 1 : 0,
          pointerEvents: !expanded && "none",
        }}
        allowClear
        placeholder={`search in ${tab}`}
      />
      {expanded ? (
        <CloseOutlined className={styles.icon} onClick={toggleExpanded} />
      ) : (
        <SearchOutlined className={styles.icon} onClick={toggleExpanded} />
      )}
    </div>
  );
}
