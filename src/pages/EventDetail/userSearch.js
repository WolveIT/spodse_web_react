import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, Select, Spin, Tag, Tooltip } from "antd";
import debounce from "lodash.debounce";
import ServerImg from "../../components/ServerImg";
import { placeholderAvatar } from "../../utils";
import Algolia from "../../services/algolia";
import { isValidEmail, isValidUid } from "../../utils/validations";
import { UploadOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { openFile } from "../../components/PopoverWidth";
import Papa from "papaparse";
import { globalErrorHandler } from "../../utils/errorHandler";
import styles from "./index.module.scss";

function DebounceSelect({
  fetchOptions,
  debounceTimeout = 800,
  renderOptions,
  ...props
}) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const fetchRef = useRef(0);
  const debounceFetcher = useMemo(() => {
    const loadOptions = (value) => {
      if (value?.length < 3) return;
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);
  return (
    <Select
      onBlur={() => setOptions([])}
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
    >
      {options.map(renderOptions)}
    </Select>
  );
}

const UserSearch = ({
  style,
  loading,
  onSubmit,
  submitText,
  exclusions,
  maxLength = 499,
  dataKey = "email", //email or uid
}) => {
  const [value, setValue] = useState([]);

  function tagRender(props) {
    const { value, closable, onClose } = props;
    const onPreventMouseDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 4 }}
      >
        {dataKey === "email" ? value : JSON.parse(value).email}
      </Tag>
    );
  }

  useEffect(() => {
    if (value > maxLength) setValue(value.slice(0, maxLength));
    const unique = [...new Set(value)];
    if (unique.length < value.length) setValue(unique);
  }, [value]);

  const fetchUserList = useCallback(
    (val) => {
      return Algolia.users
        .search(val, {
          hitsPerPage: 6,
          page: 0,
        })
        .then((res) => {
          const users = res.hits.map((hit) => ({
            ...hit,
            id: hit.objectID,
            value: dataKey === "email" ? hit.email : hit.objectID,
          }));

          if (
            dataKey === "email" &&
            isValidEmail(val) &&
            !users.find((e) => e.email === val)
          )
            users.push({
              id: val,
              value: val,
              email: val,
              profilePicture: null,
              displayName: "Not a member yet",
            });

          return users.filter((e) => !exclusions.includes(e.value));
        })
        .catch(globalErrorHandler);
    },
    [exclusions]
  );

  const onOpenFile = useCallback(() => {
    openFile({
      multiple: false,
      accept: ".xlsx,.xls,.txt,.csv",
      onChange: (files) =>
        Papa.parse(files[0], {
          complete: (parsed) =>
            setValue([
              ...value,
              ...parsed.data
                .map((row) => row[0])
                .filter(
                  (str) =>
                    str.length &&
                    (dataKey === "email" ? isValidEmail(str) : isValidUid(str))
                ),
            ]),
          error: globalErrorHandler,
        }),
    });
  }, [value]);

  const onClear = useCallback(() => {
    setValue([]);
  }, []);

  const onButtonClick = useCallback(() => {
    onSubmit(
      dataKey === "email" ? value : value.map((item) => JSON.parse(item).id),
      () => setValue([])
    );
  }, [value]);

  return (
    <div style={{ display: "flex", ...(style || {}) }}>
      {dataKey === "email" && (
        <Tooltip title={`Upload Emails File`}>
          <Button
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            onClick={onOpenFile}
            icon={<UploadOutlined />}
          />
        </Tooltip>
      )}
      <DebounceSelect
        mode="multiple"
        placeholder="Enter name or email to invite"
        fetchOptions={fetchUserList}
        tagRender={tagRender}
        disabled={value.length >= maxLength}
        renderOptions={(user) => {
          return (
            <Select.Option
              key={user.id}
              value={
                dataKey === "email"
                  ? user.value
                  : JSON.stringify({ email: user.email, id: user.id })
              }
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <ServerImg
                  src={user.profilePicture}
                  style={{ borderRadius: "50%", width: 32, height: 32 }}
                  loader={{ shape: "circle", type: "skeleton" }}
                  fallback={placeholderAvatar}
                />
                <div
                  style={{
                    marginLeft: 10,
                    fontSize: 12,
                    color: "#6a6a6a",
                  }}
                >
                  <div style={{ marginTop: 5, fontWeight: 500 }}>
                    {user.displayName}
                  </div>
                  <div style={{ marginTop: -5 }}>{user.email}</div>
                </div>
              </div>
            </Select.Option>
          );
        }}
        className={styles.select}
        value={value}
        onChange={setValue}
        allowClear={true}
        onClear={onClear}
      />
      <Button
        type="primary"
        loading={loading}
        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
        icon={<UsergroupAddOutlined />}
        onClick={onButtonClick}
      >
        {submitText}
      </Button>
    </div>
  );
};

export default UserSearch;
