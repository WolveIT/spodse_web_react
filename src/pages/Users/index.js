import React from "react";
import { useParams } from "react-router-dom";
import PlaceholderPage from "../../components/PlaceholderPage";

export default function Users() {
  const { username } = useParams();
  return <PlaceholderPage title={`User - ${username}`} />;
}
