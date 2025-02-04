import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const listAmount = [10000, 20000, 50000, 100000, 200000, 500000];

function DonatePage() {
  const [createdQR, setCreatedQR] = useState(false);
  const [imgQR, setImgQR] = useState("");

  const handleCreateQR = async () => {
    const amount = document.getElementById("amount").value;
    if (amount != 0) {
      const img = (await import.meta.env.VITE_API_DONATE) + "&amount=" + amount;
      setImgQR(img);
      setCreatedQR(true);
    }
  };

  const handleBack = () => {
    setCreatedQR(false);
    setImgQR("");
  };

  return (
    <div className="text-white flex flex-col items-center justify-center space-y-5 text-center px-[3%] mt-24">
      <h1 className="text-2xl sm:text-4xl font-bold">Donate</h1>
      <p>
        Để ủng hộ website & sử dụng tính năng VIP mode cho phim, hãy donate cho
        trang web
      </p>
      {(createdQR && (
        <>
          <p>Quét mã QR dưới đây trên app ngân hàng của bạn để chuyển tiền</p>
          <img src={imgQR} className="w-[500px]"></img>
          <button
            className="bg-black border-[1px] px-2 py-[1px] hover:bg-black/10"
            onClick={handleBack}
          >
            Quay lại
          </button>
        </>
      )) || (
        <>
          <select
            id="amount"
            className="bg-black border-[1px] pr-3 pl-1 py-[2px]"
            required
          >
            <option value={0}>Chọn số tiền</option>
            {listAmount.map((amount) => {
              return <option value={amount}>{amount.toLocaleString()}đ</option>;
            })}
          </select>
          <button
            className="bg-[#e50914] rounded px-3 py-1 hover:bg-[#e50914]/80 transition-colors ease-linear"
            onClick={handleCreateQR}
          >
            Tạo mã donate
          </button>
        </>
      )}
    </div>
  );
}

export default DonatePage;
