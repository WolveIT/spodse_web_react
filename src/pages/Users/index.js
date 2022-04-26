import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "dva";
import { Table, Spin, Input } from "antd";
import moment from "moment";
import { applyFilters, fetchUsers } from "../../models/appUser";
import { throttle } from "lodash";
import { placeholderAvatar } from "../../utils";
import ServerImg from "../../components/ServerImg";
import RoleSelector from "./roleSelector";
import SearchAndFilters from "./searchAndFilters";
import Actions from "./actions";

export default function AllUsers() {
  const { users, _loading, filtersMode, filterResults, filtersLoading } =
    useSelector(({ appUser }) => ({
      users: appUser.list,
      _loading: appUser.loading.list,
      filtersMode: appUser.filtersMode,
      filterResults: appUser.filterResults,
      filtersLoading: appUser.loading.filters,
    }));
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers(true));
  }, []);

  useEffect(() => {
    const table = document.querySelector(".users-table");

    const onTableScroll = throttle((e) => {
      const clientHeight = e.target.clientHeight;
      const currentScroll = e.target.scrollTop;
      const maxScroll = e.target.scrollHeight - clientHeight;
      const delta = maxScroll - currentScroll;
      const remainingPercent = (delta / clientHeight) * 100;

      if (remainingPercent < 10)
        dispatch(filtersMode ? applyFilters(true) : fetchUsers());
    }, 500);

    table.addEventListener("scroll", onTableScroll);
    return () => table.removeEventListener("scroll", onTableScroll);
  }, [filtersMode]);

  const columns = [
    {
      title: "No.",
      key: "serialNo",
      render: (_, __, i) => <span>{i + 1}</span>,
    },
    {
      title: "Photo",
      dataIndex: "profilePicture",
      key: "profilePicture",
      render: (e) => {
        return (
          <ServerImg
            src={e}
            style={{ borderRadius: "50%", width: 30, height: 30 }}
            loader={{ shape: "circle", type: "skeleton" }}
            fallback={placeholderAvatar}
          />
        );
      },
    },
    {
      title: "Name",
      dataIndex: "displayName",
      key: "displayName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (e) => <a href={`mailto:${e}`}>{e}</a>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (e) => (
        <a style={{ display: "inline-block", minWidth: 100 }} href={`tel:${e}`}>
          {e}
        </a>
      ),
    },
    {
      title: "Bio",
      dataIndex: "bio",
      key: "bio",
      render: (e) => (
        <span style={{ display: "inline-block", minWidth: 100 }}>{e}</span>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role, user) => (
        <RoleSelector style={{ width: 150 }} role={role} user={user} />
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (e) => (
        <span style={{ display: "inline-block", minWidth: 70 }}>
          {e?.toDate() ? moment(e.toDate()).format("D MMM YY") : "-"}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      render: (_, user) => <Actions user={user} />,
    },
  ];

  const loading = filtersMode ? filtersLoading : _loading;

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <SearchAndFilters />
      <div
        className="users-table"
        style={{
          overflow: "auto",
          position: "absolute",
          bottom: 0,
          top: 44,
          left: 0,
          right: 0,
        }}
      >
        <Table
          style={{ width: "100%" }}
          sticky
          columns={columns}
          pagination={false}
          dataSource={filtersMode ? filterResults : users}
          footer={() => (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Spin
                style={{ visibility: loading ? "visible" : "hidden" }}
                tip="Loading..."
              />
            </div>
          )}
        />
      </div>
    </div>
  );
}
