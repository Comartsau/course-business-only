"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  Input,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import axios from "axios";
import { HeaderAPI, HeaderMultiAPI } from "@/headerApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  MdDelete,
  MdEdit,

} from "react-icons/md";

import { IoIosArrowForward,IoIosArrowBack  } from "react-icons/io";
import { FaRegSave, FaSearch } from "react-icons/fa";
import { VscNotebook } from "react-icons/vsc";
import Swal from "sweetalert2";
import Image from "next/image";

interface ReviewFormData {
  id: number;
  title: string;
  image_title: string;
  dec: string;
  coverFile: File | null;
  link: string;
}

interface ReviewImage {
  id: number;
  image: string;
}

interface ResponseData {
  data: ReviewFormData[];
  totalPages: number;
}

const ManageEbook: React.FC = () => {
  const [data, setData] = useState<ResponseData>({ data: [], totalPages: 1 });
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState<ReviewFormData>({
    id: 0,
    title: "",
    image_title: "",
    dec: "",
    coverFile: null,
    link: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [dataEdit, setDataEdit] = useState<ReviewFormData | null>(null);

  const fetchEbook = useCallback(async () => {
    const requestData = {
      page,
      search: searchQuery,
    };
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/ebook`,
        requestData,
        {
          ...HeaderAPI(localStorage.getItem("Token")),
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
    fetchEbook();
  }, [page, searchQuery, fetchEbook]);

  useEffect(() => {
    if (dataEdit) {
      setFormData(dataEdit);
      setCoverFile(null); // Reset cover file
    } else {
      resetFormData();
    }
  }, [dataEdit]);

  const resetFormData = () => {
    setDataEdit(null);
    setFormData({
      id: 0,
      title: "",
      image_title: "",
      dec: "",
      coverFile: null,
      link: "",
    });

    // Reset file inputs
    const imageInput = document.getElementById(
      "imageInput"
    ) as HTMLInputElement;

    if (imageInput) {
      imageInput.value = "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "coverFile") {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files[0]) {
        setCoverFile(fileInput.files[0]);
      }
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleAddEbook = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("dec", formData.dec);
    formDataToSend.append("link", formData.link);
    if (coverFile) {
      formDataToSend.append("cover", coverFile);
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/ebook/add`,
        formDataToSend,
        { ...HeaderMultiAPI(localStorage.getItem("Token")) }
      );
      if (res.status === 200) {
        fetchEbook();
        toast.success("เพิ่มข้อมูลเรียบร้อยแล้ว");
        resetFormData();
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    } catch (err) {
      const error = err as { response: { data: { message: string } } };
      toast.error(error.response.data.message);
    }
  };

  const handleEditEbook = async () => {
    const logFormData = (formData: FormData) => {
      console.log("FormData contents:");
      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });
    };

    const formDataToSend = new FormData();
    formDataToSend.append("id", formData.id.toString());
    formDataToSend.append("title", formData.title);
    formDataToSend.append("dec", formData.dec);
    formDataToSend.append("link", formData.link);
    if (coverFile) {
      formDataToSend.append("cover", coverFile);
    } else {
      formDataToSend.append("cover", "");
      formDataToSend.append("old_image", formData.image_title);
    }
    try {
      logFormData(formDataToSend);
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API}/api/ebook`,
        formDataToSend,
        { ...HeaderMultiAPI(localStorage.getItem("Token")) }
      );
      if (res.status === 200) {
        fetchEbook();
        toast.success("แก้ไขข้อมูลเรียบร้อยแล้ว");
        resetFormData();
        setDataEdit(null);
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    } catch (err) {
      const error = err as { response: { data: { message: string } } };
      toast.error(error.response.data.message);
    }
  };

  const handleDelete = async (item: ReviewFormData) => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณจะไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8d80d0",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(
            `${process.env.NEXT_PUBLIC_API}/api/ebook/${item.id}`,
            { ...HeaderMultiAPI(localStorage.getItem("Token")) }
          );
          if (res.status === 200) {
            fetchEbook();
            Swal.fire({
              text: "ข้อมูลของคุณถูกลบแล้ว.",
              icon: "success",
              width: "400px",
              background: "#f9f9f9",
              timer: 1000,
              timerProgressBar: true,
              backdrop: `
              rgba(0,0,0,0.4)
              url("/images/nyan-cat.gif")
              left top
              no-repeat
            `,
            });
          } else {
            toast.error("เกิดข้อผิดพลาด");
          }
        } catch (err) {
          const error = err as { response: { data: { message: string } } };
          toast.error(error.response.data.message);
        }
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center gap-3">
      <ToastContainer autoClose={2000} theme="colored" />
      <div className="w-full lg:w-4/12">
        <Card className="flex gap-5 w-full px-5  py-5">
          <div className="flex items-center gap-2 ">
            <VscNotebook className="text-xl" />
            <Typography className="font-semibold">
              จัดการข้อมูล Ebook
            </Typography>
          </div>
          <div className="flex flex-col gap-5">
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              color="deep-purple"
              label="หัวข้อ"
              style={{ backgroundColor: "#f4f2ff" }}
              crossOrigin
            />
            <Input
              name="dec"
              value={formData.dec}
              onChange={handleChange}
              color="deep-purple"
              label="รายละเอียด"
              style={{ backgroundColor: "#f4f2ff" }}
              crossOrigin
            />
            <Input
              type="file"
              name="coverFile"
              label="เลือกรูปปก"
              id="imageInput"
              color="deep-purple"
              onChange={(e) => handleChange(e)}
              style={{ backgroundColor: "#f4f2ff" }}
              crossOrigin
            />
            <Input
              name="link"
              color="deep-purple"
              style={{ backgroundColor: "#f4f2ff" }}
              value={formData.link}
              onChange={handleChange}
              label="ลิ้งค์"
              crossOrigin
            />
          </div>
          <div className="flex flex-col lg:flex-row w-full justify-end gap-2">
            <Button
              size="sm"
              variant="outlined"
              color="purple"
              onClick={resetFormData}
              className="flex text-sm mr-1"
            >
              เคลียร์ค่า
            </Button>
            <Button
              size="sm"
              onClick={dataEdit ? handleEditEbook : handleAddEbook}
              className="text-sm  rounded-lg md:w-[100px] "
              style={{ backgroundColor: "#8d80d0" }}
            >
              {dataEdit ? "อัพเดท" : "บันทึก"}
            </Button>
          </div>
        </Card>
      </div>
      <div className="w-full lg:w-8/12">
        <Card className="flex w-full px-5 h-[85vh]">
          <div className="flex flex-col sm:flex-row mt-3 sm:justify-between gap-3 lg:items-center">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div>
                <Input
                  label="ค้นหา Ebook"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={() => setPage(1)}
                  color="deep-purple"
                  style={{ backgroundColor: "#f4f2ff" }}
                  crossOrigin
                  icon={<FaSearch className=" text-gray-500" />}
                />
              </div>
            </div>
          </div>
          <div className="overflow-auto lg:h-[100%]">
              {/* <Card className="mt-5 h-[35vh] sm:h-[48vh] md:h-[58vh] lg:h-[69vh] overflow-auto mb-3 border-2"> */}
              <table className="w-full min-w-max mt-5 overflow-auto">
                <thead>
                  <tr>
                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 w-1 whitespace-nowrap">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-bold leading-none opacity-70"
                      >
                        ลำดับ
                      </Typography>
                    </th>
                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 whitespace-nowrap">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-bold leading-none opacity-70"
                      >
                        ปก
                      </Typography>
                    </th>
                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 whitespace-nowrap">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-bold leading-none opacity-70"
                      >
                        ชื่อ
                      </Typography>
                    </th>
                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 whitespace-nowrap">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-bold leading-none opacity-70"
                      >
                        รายละเอียด
                      </Typography>
                    </th>
                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 whitespace-nowrap">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-bold leading-none opacity-70"
                      >
                        ลิ้งค์
                      </Typography>
                    </th>
                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 w-1 whitespace-nowrap">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-bold leading-none opacity-70"
                      >
                        แก้ไข/ลบ
                      </Typography>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center pt-5">
                        <Typography>...ไม่พบข้อมูล...</Typography>
                      </td>
                    </tr>
                  ) : (
                    data?.data?.map((item, index) => (
                      <tr key={item.id} style={{ marginTop: "3px" }}>
                        <td className="py-2">
                          <div className="flex items-center justify-center">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {index + 1}
                            </Typography>
                          </div>
                        </td>
                        <td className="py-2 flex justify-center">
                          <div className="flex w-8 h-8 justify-stretch">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_IMAGE_API}/images/${item?.image_title}`}
                              alt=""
                              width={40}
                              height={40}
                              className="rounded-md"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center justify-center">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {item?.title}
                            </Typography>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center justify-center">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {item?.dec}
                            </Typography>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center justify-center">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 "
                              >
                                {item.link}
                              </a>
                            </Typography>
                          </div>
                        </td>
                        <td>
                          <div className="flex justify-center gap-2">
                            <MdEdit
                              className="h-5 w-5 text-purple-500 cursor-pointer"
                              onClick={() => setDataEdit(item)}
                            />
                            <MdDelete
                              className="h-5 w-5 text-purple-500 cursor-pointer"
                              onClick={() => handleDelete(item)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
      
            <div className="flex justify-end gap-2 mt-3 px-2 items-center">
              <button
                className={`text-gray-400 text-2xl whitespace-nowrap rounded-full border border-gray-300 shadow-md ${
                  page == 1 ? "" : "hover:text-black"
                }`}
                disabled={page == 1}
                onClick={() => setPage((page) => Math.max(page - 1, 1))}
              >
                <IoIosArrowBack />
              </button>
              <span style={{ whiteSpace: "nowrap" }} className="text-sm">
                หน้าที่ {page} / {data?.totalPages || 1}{" "}
              </span>
              <button
                className={`text-gray-400 text-2xl whitespace-nowrap rounded-full border border-gray-300 shadow-md
                  ${
                  Number(data?.totalPages) - Number(page) < 1  ? "" : 'hover:text-black'
                 
                }`}
                disabled={Number(data?.totalPages) - Number(page) < 1}
                onClick={() => setPage((page) => page + 1)}
              >
                <IoIosArrowForward />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManageEbook;
