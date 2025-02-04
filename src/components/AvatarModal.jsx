import React, { useState } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { listAvatar } from "../utils/data";
import { UserAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const customStyles = {
  content: {
    position: "absolute",
    top: "4%",
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
    toast.success("Cập nhập hồ sơ thành công.");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      ariaHideApp={false}
      className="w-[94%] xl:w-[70%] 2xl:w-[50%] text-xs lg:text-lg outline-none "
    >
      <div className="p-[3%]">
        <div className="w-full flex flex-col items-center">
          <h1 className="text-xl md:text-3xl font-bold">Đổi ảnh đại diện</h1>
          <div className="flex gap-4 mt-5 flex-wrap items-center">
            {listAvatar.map((item) => (
              <img
                src={item}
                className={`w-[100px] rounded aspect-square object-cover cursor-pointer hover:outline-4 hover:outline ${
                  selectedAvatar === item ? "outline-4 outline" : ""
                }`}
                key={item}
                onClick={() => setSelectedAvatar(item)}
              ></img>
            ))}
          </div>
          <div className="flex justify-end w-full mt-3 mr-5">
            <button
              className="bg-[#e50914] px-5 py-1 rounded hover:bg-[#e50914]/80 transition-colors ease-linear"
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
