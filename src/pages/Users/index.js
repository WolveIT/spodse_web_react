import React, { useEffect } from "react";
import { useDispatch, useSelector } from "dva";
import { Table, Spin } from "antd";
import moment from "moment";
import { fetchUsers } from "../../models/appUser";
import { throttle } from "lodash";
import { placeholderAvatar } from "../../utils";
import ServerImg from "../../components/ServerImg";

export default function AllUsers(props) {
  const { users, loading } = useSelector(({ appUser }) => ({
    users: appUser.list,
    loading: appUser.loading.list,
  }));
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers(true));
    const table = document.querySelector(".users-table");

    const onTableScroll = throttle((e) => {
      const clientHeight = e.target.clientHeight;
      const currentScroll = e.target.scrollTop;
      const maxScroll = e.target.scrollHeight - clientHeight;
      const delta = maxScroll - currentScroll;
      const remainingPercent = (delta / clientHeight) * 100;

      if (remainingPercent < 10) dispatch(fetchUsers());
    }, 500);

    table.addEventListener("scroll", onTableScroll);
    return () => table.removeEventListener("scroll", onTableScroll);
  }, []);

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
      render: (e) => <a href={`tel:${e}`}>{e}</a>,
    },
    {
      title: "Bio",
      dataIndex: "bio",
      key: "bio",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (e) => <span>{moment(e?.toDate()).format("D MMM YY")}</span>,
    },
  ];

  return (
    <div
      className="users-table"
      style={{
        overflow: "auto",
        position: "absolute",
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <Table
        style={{ width: "100%" }}
        sticky
        columns={columns}
        pagination={false}
        loading={loading && users}
        dataSource={users}
        footer={() => (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spin
              style={{ visibility: props.loading ? "visible" : "hidden" }}
              tip="Loading..."
            />
          </div>
        )}
      />
    </div>
  );
}
