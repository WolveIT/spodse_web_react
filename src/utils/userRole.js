import { useSelector } from "dva";

const types = {
  ADMIN: "admin",
  SUPER_ADMIN: "super-admin",
  BUSINESS: "business",
  NORMAL: "normal",
};

const is_admin = (role) => role === types.ADMIN;
const is_super_admin = (role) => role === types.SUPER_ADMIN;
const is_business = (role) => role === types.BUSINESS;
const is_normal = (role) => role === types.NORMAL;
const is_allowed = (role) =>
  is_business(role) || is_admin(role) || is_super_admin(role);

export const useRole = () => {
  const role = useSelector((state) => state.auth.role);
  return role;
};

export const useIsAllowedRole = () => {
  const role = useSelector((state) => state.auth.role);
  return is_allowed(role);
};

export const useIsAdminRole = () => {
  const role = useSelector((state) => state.auth.role);
  return is_admin(role);
};

export const useIsSuperAdminRole = () => {
  const role = useSelector((state) => state.auth.role);
  return is_super_admin(role);
};

export const useIsBusinessRole = () => {
  const role = useSelector((state) => state.auth.role);
  return is_business(role);
};

export const useIsNormalRole = () => {
  const role = useSelector((state) => state.auth.role);
  return is_normal(role);
};

const Role = {
  types,
  is_admin,
  is_super_admin,
  is_business,
  is_normal,
  is_allowed,
  useRole,
  useIsAllowedRole,
  useIsAdminRole,
  useIsSuperAdminRole,
  useIsBusinessRole,
  useIsNormalRole,
};

export default Role;
