import React from "react";
import PlaceholderPage from "../../components/PlaceholderPage";
import { useLocation } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();
  return (
    <PlaceholderPage
      style={{ height: "100vh" }}
      title={`Oops! No match for ${location.pathname}`}
    />
  );
}
