import { List, Skeleton } from "antd";
import debounce from "lodash.debounce";
import React, { useCallback } from "react";
import PerfectScrollBar from "react-perfect-scrollbar";
import Empty from "../Empty";

export default function LazyList({
  onEndReached,
  listHeight,
  listStyle,
  dataSource,
  renderItem,
  loading,
  skeletonProps,
  skeletonEntriesCount = 4,
  endReachedPercent = 80,
  debouncing = 800,
  bottomPadding = 150,
  containerStyle,
  emptyContent = <Empty />,
  ...props
}) {
  const _onEndReached = useCallback(
    debounce(onEndReached || (() => {}), debouncing, {
      leading: true,
      trailing: false,
    }),
    [onEndReached, debouncing]
  );

  const onScrollDown = useCallback(
    (e) => {
      const clientHeight = e.clientHeight;
      const currentScroll = e.scrollTop;
      const maxScroll = e.scrollHeight - clientHeight;
      const currentPercent = (currentScroll / maxScroll) * 100;

      if (currentPercent > endReachedPercent) _onEndReached(currentPercent);
    },
    [endReachedPercent, _onEndReached]
  );

  return (
    <PerfectScrollBar style={containerStyle} onScrollDown={onScrollDown}>
      {!loading && !dataSource.length ? (
        <>{emptyContent} </>
      ) : (
        <List
          itemLayout="horizontal"
          {...props}
          style={{
            height: listHeight,
            ...(listStyle || {}),
          }}
          dataSource={
            loading
              ? dataSource.concat(
                  ...Array(skeletonEntriesCount).fill({ loading: true })
                )
              : [...dataSource, false]
          }
          renderItem={(item, index) =>
            index === dataSource.length && !loading ? (
              <div style={{ height: bottomPadding }} />
            ) : (
              <Skeleton
                avatar
                title={false}
                active
                {...skeletonProps}
                loading={item?.loading}
              >
                {typeof renderItem === "function"
                  ? renderItem(item, index)
                  : null}
              </Skeleton>
            )
          }
        />
      )}
    </PerfectScrollBar>
  );
}
