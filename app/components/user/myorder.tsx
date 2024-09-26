"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Input,
  Typography,
} from "@material-tailwind/react";
import axios from "axios";
import { HeaderAPI, HeaderMultiAPI } from "@/headerApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoAccessibility } from "react-icons/io5";

import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { FaSearch, FaEye } from "react-icons/fa";
import { MdFactCheck } from "react-icons/md";
import ModalOrder from "./modalorder";
import ModalCheck from "./modalcheck";
import CryptoJS from "crypto-js";

interface ReviewFormData {
  products_name: string;
  products_price: any;
  code: string;
  pay_image:""
  start_pay: string;
  end_pay: string;
  status: number;
  pay_id:number
}


interface ResponseData {
  data: ReviewFormData[];
  totalPages: number;
}

const MyOrder: React.FC = () => {
  const [data, setData] = useState<ResponseData>({ data: [], totalPages: 1 });
  const [item, setItem] = useState<ReviewFormData | null>(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const [image, setImage] = useState("");
  const [page, setPage] = useState(1);

  const [openModal, setOpenModal] = useState(false);
  const [openModal1, setOpenModal1] = useState(false);

  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY || "your_secret_key";

  const decryptData = (ciphertext: string) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const userId = decryptData(localStorage.getItem("Id") || "");

  const fetchData = useCallback(async () => {
    const requestData = {
      users_id: userId,
      page,
      search: searchQuery,
      full: true,
    };
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/pay/users`,
        requestData,
        {
          ...HeaderAPI(decryptData(localStorage.getItem("Token") || "")),
        }
      );
      console.log(res.data);
      if (res.status === 200) {
        setData(res.data);
      } else {
        toast.error("Error");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error");
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [page, searchQuery, fetchData]);


 // ฟังก์ชันใหม่ที่ใช้ในการตั้งค่า image และเปิด modal
 const openModalWithImage = (image: string) => {
    setImage(image);
    setOpenModal(true);
  };

  const openModalWithImage1 = (selectedItem: ReviewFormData) => {
    setItem(selectedItem); // ตั้งค่า item ด้วยข้อมูลที่เลือก
    setOpenModal1(true);
  };

    // ฟังก์ชันที่ใช้สำหรับปิด/เปิด modal โดยไม่มีพารามิเตอร์
    const handleModal = () => {
        setOpenModal(!openModal);
      };


    const handleModal1 = () => {
        setOpenModal1(!openModal1);
      };

      console.log(userId)

      const truncate = (text: string, maxLength: number = 150): string => {
        // เช็คว่าข้อความยาวเกินที่กำหนดหรือไม่ ถ้าเกินให้ตัดและใส่ ...
        return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
      };
    
  return (


    <div  className="flex flex-col items-center p-3 py-5">
    <ToastContainer autoClose={2000} theme="colored" />
    <Card className="w-full  2xl:max-w-[95rem] p-5 h-[85vh]">
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <IoAccessibility className="text-xl" />
          <Typography className="font-semibold text-lg sm:text-xl text-nowrap">
            จัดการข้อมูลกิจกรรม
          </Typography>
        </div>
        <Input
          label="ค้นหากิจกรรม"
          crossOrigin="anonymous"
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={() => setPage(1)}
          color="deep-purple"
          className="w-full sm:w-auto bg-purple-50"
          icon={<FaSearch className=" text-gray-500" />}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full mt-5">
          <thead>
            <tr className="text-sm sm:text-base">
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 w-1 whitespace-nowrap">
                ลำดับ
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 whitespace-nowrap">
                รหัส
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 whitespace-nowrap">
                ชื่อ
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 whitespace-nowrap">
                ราคา
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 whitespace-nowrap">
                วันเริ่มต้น
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 whitespace-nowrap">
                วันสิ้นสุด
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 whitespace-nowrap">
                สถานะ
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 w-1 whitespace-nowrap">
                ดู/ตรวจสอบ
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-5">
                  <Typography>...ไม่พบข้อมูล...</Typography>
                </td>
              </tr>
            ) : (
              data?.data?.map((item, index) => (
                <tr key={index} className="text-sm sm:text-base">
                  <td className="py-2 text-center">{index + 1}</td>
                  <td className="py-2 text-center">{item?.code}</td>
                  <td className="py-2 text-center">{item?.products_name}</td>
                  <td className="py-2 text-center">{item?.products_price}</td>
                  <td className="py-2 text-center">{item?.start_pay}</td>
                  <td className="py-2 text-center">{item?.end_pay}</td>
                  <td className="py-2 text-center">
                    {item?.status === 0 ? "ยังไม่จ่าย" : "จ่ายแล้ว"}
                  </td>
                  <td className="py-2 flex ps-7 gap-2">
                    <FaEye
                      className="h-5 w-5 text-purple-500 cursor-pointer"
                      onClick={() => openModalWithImage(item?.pay_image)}
                    />
                    <MdFactCheck
                      className={`h-5 w-5 text-purple-500 cursor-pointer ${
                        item?.status === 1 ? "hidden" : ""
                      }`}
                      onClick={() => openModalWithImage1(item)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end items-center gap-5 mt-5">
        <button
          className={`text-gray-400 text-2xl rounded-full border border-gray-300 shadow-md ${
            page === 1 ? "" : "hover:text-black"
          }`}
          disabled={page === 1}
          onClick={() => setPage((page) => Math.max(page - 1, 1))}
        >
          <IoIosArrowBack />
        </button>
        <span className="text-sm">
          หน้าที่ {page} / {data?.totalPages || 1}
        </span>
        <button
          className={`text-gray-400 text-2xl rounded-full border border-gray-300 shadow-md ${
            Number(data?.totalPages) - Number(page) < 1 ? "text-gray-400" : "hover:text-black"
          }`}
          disabled={Number(data?.totalPages) - Number(page) < 1}
          onClick={() => setPage((page) => page + 1)}
        >
          <IoIosArrowForward />
        </button>
      </div>
    </Card>

    <ModalOrder open={openModal} handleModal={handleModal} image={image} />
    <ModalCheck open={openModal1} handleModal1={handleModal1} item={item} fetchData={fetchData} />
  </div>
  );
};

export default MyOrder;
