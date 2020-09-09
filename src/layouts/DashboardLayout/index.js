import React, { useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Layout } from "antd";
import { connect } from "dva";
import { toggleSidebarCollapsed } from "../../models/router";

const { Content } = Layout;

function DashboardLayout({ children, collapsed, toggleCollapsed }) {
  return (
    <Layout style={{ height: "100vh" }}>
      <Header collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
      <Layout>
        <Sidebar collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
        <Layout>
          <Content style={{ position: "relative" }}>{children}</Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default connect(
  ({ router }) => ({
    collapsed: router.sidebarCollapsed,
  }),
  { toggleCollapsed: toggleSidebarCollapsed }
)(DashboardLayout);
