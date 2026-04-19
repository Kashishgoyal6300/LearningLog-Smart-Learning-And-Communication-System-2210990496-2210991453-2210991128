import api from "./axios";

export const getAllUsers = () => {
  return api.get("/admin/users");
};

export const changeRole = (email) => {
  return api.post("/admin/change-role", null, {
    params: { email },
  });
};
