import React, { useState } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { listAvatar } from "../utils/data";
import { UserAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const customStyles = {
  content: {
    position: "absolute",
    top: "10%",
    left: "50%",
    bottom: "auto",
    transform: "translate(-50%)",
    backgroundColor: "#141414",
    boxShadow: "2px solid black",
    color: "white",
    padding: 0,
    overflow: "visible",
    border: "none",
  },
};

function AvatarModal({ isOpen, onClose }) {
  const { user, updateUserProfile } = UserAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(user.photoURL);

  const handleChangeAvatar = async () => {
    await updateUserProfile({ photoURL: selectedAvatar });
    toast.success("Cập nhật hồ sơ thành công.");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      ariaHideApp={false}
      className="w-[94%] xl:w-[60%] 2xl:w-[50%] text-xs lg:text-lg outline-none "
    >
      <div className="p-[3%]">
        <div className="w-full flex flex-col items-center">
          <h1 className="text-xl md:text-3xl font-bold">Đổi ảnh đại diện</h1>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 2xl:grid-cols-9 gap-4 mt-5 ">
            {user.providerData[0].providerId === "google.com" && (
              <div
                className="relative group cursor-pointer w-auto"
                onClick={() => setSelectedAvatar(user.providerData[0].photoURL)}
                key={user.providerData[0].photoURL}
              >
                <div
                  className={`absolute top-0 left-0 w-full h-full group-hover:bg-transparent transition-all ease-linear duration-75 ${
                    selectedAvatar === user.providerData[0].photoURL
                      ? "bg-transparent"
                      : "bg-black/40"
                  }`}
                />
                <img
                  src={user.providerData[0].photoURL}
                  className={`rounded aspect-square object-cover group-hover:outline-4 group-hover:outline transition-all ease-linear duration-75 ${
                    selectedAvatar === user.providerData[0].photoURL
                      ? "outline-4 outline"
                      : ""
                  }`}
                ></img>
              </div>
            )}
            {listAvatar.map((item) => (
              <div
                className="relative group cursor-pointer"
                onClick={() => setSelectedAvatar(item)}
                key={item}
              >
                <div
                  className={`absolute top-0 left-0 w-full h-full group-hover:bg-transparent transition-all ease-linear duration-100 ${
                    selectedAvatar === item ? "bg-transparent" : "bg-black/40"
                  }`}
                />
                <img
                  src={item}
                  className={`w-[100px] rounded aspect-square object-cover group-hover:outline-4 group-hover:outline transition-all ease-linear duration-100 ${
                    selectedAvatar === item ? "outline-4 outline" : ""
                  }`}
                ></img>
              </div>
            ))}
          </div>
          <div className="flex justify-center w-full mt-5">
            <button
              className="bg-[#e50914] px-5 py-1 rounded hover:bg-[#e50914]/80 transition-colors ease-linear font-bold"
              onClick={handleChangeAvatar}
            >
              Lưu
            </button>
          </div>
        </div>
        <button
          className="aspect-square w-7 rounded-full absolute right-3 top-3 z-10 flex items-center justify-center"
          onClick={onClose}
        >
          <FontAwesomeIcon icon="fa-solid fa-xmark" />
        </button>
      </div>
    </Modal>
  );
}

export default AvatarModal;
