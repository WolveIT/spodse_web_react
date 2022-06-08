import React, { useCallback, useEffect, useMemo, useState } from "react";
import LazySelect from ".";
import { globalErrorHandler } from "../../utils/errorHandler";
import FirestoreAlgoliaPaginatedList from "../../services/utils/paginated_list/firestoreAlgoliaPaginatedList";
import { useStateCallback } from "../../hooks/useStateCallback";
import debounce from "lodash.debounce";
import Firestore from "../../services/firestore";
import { db } from "../../services/utils/firebase_config";
import { arrayUniqueByKey, queryWithoutSort } from "../../utils";
import "./index.scss";

export default function FirestoreAlgoliaSelect({
  baseQuery,
  searchOptions,
  index,
  perBatch = 10,
  renderItem,
  valueResolver,
  idResolver,
  style,
  onChange,
  searchDebouncing = 800,
  value,
  labelResolver,
  ...props
}) {
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [noMore, setNoMore] = useStateCallback(false);
  const [searchTerm, setSearchTerm] = useState("");
  const listInstance = useMemo(
    () =>
      new FirestoreAlgoliaPaginatedList({
        baseQuery,
        searchTerm,
        searchOptions,
        index,
        perBatch,
      }),
    [searchTerm, searchOptions, index, perBatch, baseQuery]
  );
  const [opened, setOpened] = useState(false);

  const fetchMore = useCallback(
    (val) => {
      const _noMore = typeof val === "boolean" ? val : noMore;
      if (_noMore || loading) return;
      setLoading(true);
      listInstance
        .get_next()
        .then(async (newDocs) => {
          setDocs((docs) => arrayUniqueByKey(docs.concat(newDocs), "id"));
          if (newDocs.length < perBatch) setNoMore(true);
        })
        .catch(globalErrorHandler)
        .finally(() => setLoading(false));
    },
    [perBatch, listInstance, noMore, loading]
  );

  useEffect(() => {
    if (!opened) return;
    setDocs([]);
    setNoMore(false, fetchMore);
  }, [listInstance, opened]);

  useEffect(() => {
    if (value) {
      const values = Array.isArray(value) ? value : [value];

      const executor = async (value) => {
        const id = typeof idResolver === "function" ? idResolver(value) : value;
        const item = docs.find((item) => item.id === id);
        if (!item) {
          await Firestore.get_list(
            queryWithoutSort(baseQuery)
              .where(db.FieldPath.documentId(), "==", id)
              .limit(1)
          ).then((res) => {
            if (res.docs.length)
              setDocs((docs) =>
                !docs.find((item) => item.id === res.docs[0].id)
                  ? docs.concat(res.docs)
                  : docs
              );
          });
        }
      };

      Promise.all(values.map(executor)).catch(globalErrorHandler);
    }
  }, [value, docs, idResolver]);

  const search = useCallback(
    debounce(setSearchTerm || (() => {}), searchDebouncing),
    [searchDebouncing]
  );

  const onSearch = useCallback(
    (value) => {
      if (value.length > 0 && value.length < 3) return;
      search(value);
    },
    [search]
  );

  return (
    <LazySelect
      onChange={onChange}
      onEndReached={fetchMore}
      loading={loading}
      dataSource={docs}
      renderItem={renderItem}
      valueResolver={valueResolver}
      style={style}
      skeletonEntriesCount={3}
      onDropdownVisibleChange={(open) => open && !opened && setOpened(true)}
      showSearch
      onSearch={onSearch}
      value={value}
      idResolver={idResolver}
      labelResolver={labelResolver}
      {...props}
    />
  );
}
