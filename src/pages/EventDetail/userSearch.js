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
import { isValidEmail } from "../../utils/validations";
import { UploadOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { openFile } from "../../components/PopoverWidth";
import Papa from "papaparse";
import { globalErrorHandler } from "../../utils/errorHandler";
import styles from "./index.module.scss";
import { connect } from "dva";
import { fetchInvited, inviteUsers } from "../../models/event";

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
      {value}
    </Tag>
  );
}

const UserSearch = ({
  style,
  loading,
  inviteUsers,
  fetchInvited,
  eventId,
  exclusions,
}) => {
  const [value, setValue] = useState([]);

  useEffect(() => {
    if (value > 500) setValue(value.slice(0, 500));
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
            value: hit.email,
          }));
          if (isValidEmail(val) && !users.find((e) => e.email === val))
            users.push({
              value: val,
              email: val,
              profilePicture: null,
              displayName: "Not a member yet",
            });

          return users.filter((e) => !exclusions.includes(e.email));
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
                .filter((str) => str.length && isValidEmail(str)),
            ]),
          error: globalErrorHandler,
        }),
    });
  }, [value]);

  const onClear = useCallback(() => {
    setValue([]);
  }, []);

  const onInvite = useCallback(() => {
    inviteUsers(eventId, value, () => {
      setValue([]);
      fetchInvited(eventId, true);
    });
  }, [value]);

  return (
    <div style={{ display: "flex", ...(style || {}) }}>
      <Tooltip title="Upload Emails File">
        <Button
          style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          onClick={onOpenFile}
          icon={<UploadOutlined />}
        />
      </Tooltip>
      <DebounceSelect
        mode="multiple"
        placeholder="Enter name or email to invite"
        fetchOptions={fetchUserList}
        tagRender={tagRender}
        disabled={value.length >= 500}
        renderOptions={(user) => {
          return (
            <Select.Option value={user.value}>
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
        onClick={onInvite}
      >
        Invite
      </Button>
    </div>
  );
};

export default connect(
  ({ event }) => ({
    loading: event.loading.inviteUsers,
    eventId: event.current?.id,
    exclusions: [
      ...new Set([
        ...event.invitedList.map((e) => e.inviteeDetails?.email),
        ...event.goingList.map((e) => e.email),
      ]),
    ],
  }),
  { inviteUsers, fetchInvited }
)(UserSearch);
