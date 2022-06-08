import { Select, Skeleton } from "antd";
import React, { useCallback } from "react";
import debounce from "lodash.debounce";

const { Option } = Select;

function LazySelect({
  style,
  dataSource,
  renderItem,
  onEndReached,
  skeletonEntriesCount = 4,
  endReachedPercent = 80,
  debouncing = 1000,
  loading,
  skeletonProps,
  optionContainerStyle,
  containerStyle,
  valueResolver, //how to get value from item when onChange is called
  idResolver, //how to get unique id from above value (valueResolver)
  optionProps,
  onChange,
  value,
  defaultValue,
  labelResolver,
  ...props
}) {
  const _onEndReached = useCallback(
    debounce(onEndReached || (() => {}), debouncing, { leading: true }),
    [debouncing, onEndReached]
  );

  const onScrollDown = useCallback(
    (e) => {
      e = e.target;
      const clientHeight = e.clientHeight;
      const currentScroll = e.scrollTop;
      const maxScroll = e.scrollHeight - clientHeight;
      const currentPercent = (currentScroll / maxScroll) * 100;

      if (currentPercent > endReachedPercent) _onEndReached(currentPercent);
    },
    [endReachedPercent, _onEndReached]
  );

  const _onChange = useCallback(
    (id) => {
      let multiple = true;
      if (!Array.isArray(id)) {
        id = [id];
        multiple = false;
      }

      const values = id.map((_id) => {
        const item = dataSource.find((item) => item.id === _id);
        return typeof valueResolver === "function" ? valueResolver(item) : item;
      });

      typeof onChange === "function" && onChange(multiple ? values : values[0]);
    },
    [dataSource, onChange, valueResolver]
  );

  const _idResolver = useCallback(
    (val) => {
      if (val === undefined) return val;

      let multiple = true;
      if (!Array.isArray(val)) {
        val = [val];
        multiple = false;
      }

      const values = val.map((_val) =>
        typeof idResolver === "function" && _val ? idResolver(_val) : _val
      );
      return multiple ? values : values[0];
    },
    [idResolver]
  );

  const data = loading
    ? dataSource.concat(...Array(skeletonEntriesCount).fill({ _loading: true }))
    : dataSource;

  return (
    <Select
      onPopupScroll={onScrollDown}
      onChange={_onChange}
      style={style}
      filterOption={false}
      value={_idResolver(value)}
      defaultValue={_idResolver(defaultValue)}
      {...props}
    >
      {data.map((item, ix) => {
        const value = item._loading ? ix + "" : item.id;
        const children =
          typeof renderItem === "function" && !item?._loading
            ? renderItem(item, ix)
            : null;

        if (!item?._loading && !children) return null;

        return (
          <Option
            key={value}
            style={optionContainerStyle}
            value={value}
            disabled={item?._loading || children?.disabled}
            label={
              typeof labelResolver === "function"
                ? labelResolver(item, ix)
                : value
            }
            {...optionProps}
          >
            <Skeleton
              title={false}
              paragraph={{ rows: 1 }}
              active
              {...skeletonProps}
              loading={item?._loading}
            >
              {children?.node || null}
            </Skeleton>
          </Option>
        );
      })}
    </Select>
  );
}

export default LazySelect;
