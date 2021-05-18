export function getRoutePath(basePath, currPath) {
  if (currPath.startsWith("/")) return currPath;
  return basePath + "/" + currPath;
}
