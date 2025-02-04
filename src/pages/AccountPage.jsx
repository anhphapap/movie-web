import React from "react";
import { UserAuth } from "../context/AuthContext";

function AccountPage() {
  const { user } = UserAuth();
  return <div className="text-white text-center">{user.displayName}</div>;
}

export default AccountPage;
