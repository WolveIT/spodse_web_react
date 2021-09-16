import { useHistory, useLocation } from "react-router-dom";

function getUpdateQuery(history) {
  const { location } = history;
  return (queryObj) => {
    const query = new URLSearchParams(location.search);
    Object.keys(queryObj).forEach((key) => {
      if (query.has(key)) query.delete(key);
      query.append(key, queryObj[key]);
    });
    history.push({
      search: "?" + query.toString(),
    });
  };
}

export function useQuery() {
  const history = useHistory();
  const location = useLocation();

  return [new URLSearchParams(location.search), getUpdateQuery(history)];
}
