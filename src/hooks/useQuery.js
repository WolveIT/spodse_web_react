import { useHistory, useLocation } from "react-router-dom";

function getUpdateQuery(history, method) {
  const { location } = history;
  return (queryObj) => {
    const query = new URLSearchParams(location.search);
    Object.keys(queryObj).forEach((key) => {
      if (query.has(key)) query.delete(key);
      if (queryObj[key] !== undefined) query.append(key, queryObj[key]);
    });
    history[method]({
      search: "?" + query.toString(),
    });
  };
}

export function useQuery(method = "push") {
  const history = useHistory();
  const location = useLocation();

  return [
    new URLSearchParams(location.search),
    getUpdateQuery(history, method),
  ];
}
