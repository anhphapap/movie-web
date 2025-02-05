import { React, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import AvatarModal from "../components/AvatarModal";

function AccountPage() {
  const { user, updateUserProfile } = UserAuth();
  const [change, setChange] = useState(false);
  const [newName, setNewName] = useState(user.displayName || "");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChangeName = async (name) => {
    if (!newName.trim()) {
      toast.error("Tên không được phép rỗng.");
      return;
    }
    await updateUserProfile({ displayName: newName });
    toast.success("Cập nhật hồ sơ thành công.");
    setChange(false);
  };

  return (
    <>
      <AvatarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="relative flex flex-col items-center text-white h-screen">
        <img
          className="h-1/3 w-full object-cover z-0"
          src="https://assets.nflxext.com/ffe/siteui/vlv3/fb5cb900-0cb6-4728-beb5-579b9af98fdd/web/VN-vi-20250127-TRIFECTA-perspective_46fb4fd1-c238-4c60-a06b-41c9fe968c1b_large.jpg"
        ></img>
        <div className="absolute top-0 left-0 w-full h-1/3 bg-black/50 z-1"></div>
        <img
          src={user.photoURL}
          onClick={() => setIsModalOpen(true)}
          title="Đổi ảnh đại diện"
          className="w-[120px] md:w-[200px] aspect-square object-cover rounded-md absolute top-1/3 left-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer transition-all ease-linear hover:scale-105"
        ></img>
        <div className="mt-[80px] md:mt-[120px] text-center space-y-4">
          {change ? (
            <div>
              <input
                type="text"
                className="bg-black border-[1px] outline-none px-2 py-1 w-[120px] md:w-[200px]"
                defaultValue={user.displayName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              ></input>
              <button
                className="bg-white hover:bg-white/90 text-black border-y-[1px] outline-none px-2 py-1 transition-all ease-linear"
                onClick={handleChangeName}
              >
                Cập nhật
              </button>
              <button
                className="bg-black hover:bg-white/20 border-[1px] outline-none px-2 py-1 transition-all ease-linear"
                onClick={() => setChange(false)}
              >
                Hủy
              </button>
            </div>
          ) : (
            <p
              className="ml-5 space-x-1 cursor-pointer"
              title="Đổi tên hiển thị"
              onClick={() => setChange(true)}
            >
              <span className="font-bold text-xl md:text-3xl">
                {user.displayName}
              </span>
              <FontAwesomeIcon icon="fa-solid fa-pen" />
            </p>
          )}
          <p>
            Ngày gia nhập:{" "}
            <span className=" font-bold">
              {new Date(user.metadata.creationTime).toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
              })}
            </span>
          </p>
          <p>
            Email: <span className=" font-bold">{user.email}</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default AccountPage;
