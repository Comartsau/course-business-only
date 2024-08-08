"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  Input,
  Typography,
  IconButton,
  Select,
  Option,
} from "@material-tailwind/react";
import axios from "axios";
import { HeaderAPI, HeaderMultiAPI } from "@/headerApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  MdDelete,
  MdEdit,
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";

import { LuArrowRightSquare, LuArrowLeftSquare } from "react-icons/lu";
import { FaAward, FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import Image from "next/image";
import AddEditModalReview from "./addEditModalReview";

interface ReviewFormData {
  id: number;
  title: string;
  image_title: string;
  dec: string;
  coverFile: File | null;
  albumFiles: File[];
  type: number;
}

interface ReviewImage {
  id: number;
  image: string;
}

interface ResponseData {
  data: ReviewFormData[];
  totalPages: number;
}

const ManageReviews: React.FC = () => {
  const [data, setData] = useState<ResponseData>({ data: [], totalPages: 1 });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("");
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState<ReviewFormData>({
    id: 0,
    title: "",
    image_title: "",
    dec: "",
    coverFile: null,
    albumFiles: [],
    type: 0,
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [albumFiles, setAlbumFiles] = useState<File[]>([]);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [dataEdit, setDataEdit] = useState<ReviewFormData | null>(null);
  const [openModalView, setOpenModalView] = useState(false);
  const [dataView, setDataView] = useState<ReviewFormData | null>(null);
  const [reviewImages, setReviewImages] = useState<ReviewImage[]>([]);
  const [deletedImages, setDeletedImages] = useState<
    { id: number; image: string }[]
  >([]);

  const fetchReviews = useCallback(async () => {
    const requestData = {
      page,
      search: searchQuery,
      type: searchType,
    };
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/reviews`,
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
  }, [page, searchQuery, searchType]);

  useEffect(() => {
    fetchReviews();
  }, [page, searchQuery, searchType, fetchReviews]);

  const openAddModal = () => {
    resetFormData();
    setReviewImages([]);
    setAlbumFiles([]);
    setOpenModalAdd(true);
  };

  const openEditModal = async (item: ReviewFormData) => {
    setDataEdit(item);
    console.log(item);
    fetchImage(item);
    setOpenModalAdd(true);
  };

  const fetchImage = async (item: any) => {
    console.log(item);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/reviews/images/${item.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
      );
      console.log(res.data);
      if (res.status === 200) {
        setReviewImages(res.data);
      } else {
        // toast.error("Error fetching images");
      }
    } catch (error) {
      console.error(error);
      // toast.error("Error fetching images");
    }
  };

  const handleModalAdd = () => {
    setOpenModalAdd(!openModalAdd);
    setDataEdit(null);
    resetFormData();
  };

  const resetFormData = () => {
    setFormData({
      id: 0,
      title: "",
      image_title: "",
      dec: "",
      coverFile: null,
      albumFiles: [],
      type: 0,
    });
    setReviewImages([]);
    setDeletedImages([]);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === "type" ? parseInt(value, 10) : value,
    }));
  };

  const handleAddReview = async () => {
    const logFormData = (formData: FormData) => {
      console.log("FormData contents:");
      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });
    };

    if (dataEdit) {
      const updateData = new FormData();
      updateData.append("id", dataEdit.id ? dataEdit.id.toString() : "");
      updateData.append("title", formData.title || "");
      updateData.append("dec", formData.dec || "");
      updateData.append(
        "type",
        formData.type !== undefined ? formData.type.toString() : "0"
      );

      console.log(dataEdit);
      if (coverFile) {
        updateData.append("cover", coverFile);
      }
      // updateData.append("cover", coverFile? coverFile : dataEdit?.image_title  );

      // for (let i = 0; i < albumFiles.length; i++) {
      //   updateData.append("album", albumFiles[i]);
      // }

      for (let i = 0; i < albumFiles.length; i++) {
        updateData.append("album", albumFiles[i]);
      }

      if (deletedImages.length > 0) {
        updateData.append("delete_image", JSON.stringify(deletedImages));
      }

      logFormData(updateData);

      try {
        const res = await axios.put(
          `${process.env.NEXT_PUBLIC_API}/api/reviews`,
          updateData,
          { ...HeaderMultiAPI(localStorage.getItem("Token")) }
        );
        console.log(res);
        if (res.status === 200) {
          fetchReviews();
          toast.success("ข้อมูลถูกแก้ไขเรียบร้อยแล้ว");
          fetchImage(dataEdit);
          handleModalAdd();
        } else {
          toast.error("เกิดข้อผิดพลาด");
        }
      } catch (err) {
        console.log(err);
        const error = err as { response: { data: { message: string } } };
        toast.error(error.response.data.message);
      }
    } else {
      const data = new FormData();
      data.append("title", formData.title || "");
      data.append("dec", formData.dec || "");
      data.append(
        "type",
        formData.type !== undefined ? formData.type.toString() : "0"
      );
      if (coverFile) {
        data.append("cover", coverFile);
      }
      for (let i = 0; i < albumFiles.length; i++) {
        data.append("album", albumFiles[i]);
      }

      logFormData(data);

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API}/api/reviews/add`,
          data,
          { ...HeaderMultiAPI(localStorage.getItem("Token")) }
        );
        if (res.status === 200) {
          fetchReviews();
          toast.success(res.data.message);
          handleModalAdd();
        } else {
          toast.error("เกิดข้อผิดพลาด");
        }
      } catch (err) {
        handleModalAdd();
        const error = err as { response: { data: { message: string } } };
        toast.error(error.response.data.message);
      }
    }
  };

  const handleRemoveImage = (
    index: number,
    imageId: number | null,
    imageName: string | null
  ) => {
    const updatedImages = reviewImages.filter((_, i) => i !== index);
    setReviewImages(updatedImages);
    const updatedFiles = albumFiles.filter((_, i) => i !== index);
    setAlbumFiles(updatedFiles);

    if (imageId !== null && imageName !== null) {
      setDeletedImages((prevImages) => [
        ...prevImages,
        { id: imageId, image: imageName },
      ]);
    }
  };

  const handleDelete = async (customer: ReviewFormData) => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่ ?",
      text: "คุณจะไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
      background: "#f9f9f9",
      width: "350px",
      padding: "1em",
      backdrop: `
        rgba(0,0,0,0.4)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
      `,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(
            `${process.env.NEXT_PUBLIC_API}/api/reviews/${customer.id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("Token")}`,
              },
            }
          );
          if (res.status === 200) {
            fetchReviews();
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
    <div className="flex justify-center gap-3">
      <ToastContainer autoClose={2000} theme="colored" />
      <Card className="flex w-full px-5 h-[85vh]">
        <div className="flex flex-col sm:flex-row mt-3 sm:justify-between gap-3 lg:items-center">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 ">
              <FaAward className="text-xl" />
              <Typography className="font-semibold">
                จัดการข้อมูลผลงาน
              </Typography>
            </div>
            <div>
              <Input
                label="ค้นหาผลงาน"
                crossOrigin="anonymous"
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={() => setPage(1)}
                icon={<FaSearch className=" text-gray-500" />}
              />
            </div>
            <div>
              <Select
                label="ค้นหาประเภท"
                onChange={(e) => setSearchType(e || "")}
              >
                <Option value="">ทั้งหมด</Option>
                <Option value="1">รีวิว</Option>
                <Option value="0">สัมมนา</Option>
              </Select>
            </div>
            <div>
              <Button
                size="sm"
                className="bg-indigo-500 text-sm w-full text-white hover:bg-blue-700 whitespace-nowrap"
                onClick={() => [setSearchQuery(""), setSearchType("")]}
              >
                รีเซท
              </Button>
            </div>
          </div>
          <div>
            <Button
              size="sm"
              className="w-full bg-indigo-500 text-sm text-white hover:bg-blue-700 whitespace-nowrap"
              onClick={openAddModal}
            >
              เพิ่มข้อมูล
            </Button>
          </div>
        </div>
        <div className="overflow-auto lg:h-[100%]">
          <Card className="mt-5 h-[35vh] sm:h-[48vh] md:h-[58vh] lg:h-[60vh] overflow-auto mb-3 border-2">
            <table className="w-full min-w-max">
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
                  <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 w-1 whitespace-nowrap">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-bold leading-none opacity-70"
                    >
                      ประเภท
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
                      <td className="py-2">
                        <div className="flex items-center justify-center">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {item?.type === 0 ? "สัมมนา" : "รีวิว"}{" "}
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
                        <div className="flex justify-center gap-2">
                          <MdEdit
                            className="h-5 w-5 text-purple-500 cursor-pointer"
                            onClick={() => openEditModal(item)}
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
          </Card>
          <div className="flex justify-end gap-2 mt-3 px-2 items-center">
            <button
              className={`text-gray-400 text-xl whitespace-nowrap ${
                page == 1 ? "" : "hover:text-black"
              }`}
              disabled={page == 1}
              onClick={() => setPage((page) => Math.max(page - 1, 1))}
            >
              <LuArrowLeftSquare />
            </button>
            <span style={{ whiteSpace: "nowrap" }} className="text-xs">
              หน้าที่ {page} / {data?.totalPages || 1}{" "}
            </span>
            <button
              className={`text-gray-400 text-xl whitespace-nowrap ${
                Number(data?.totalPages) - Number(page) < 1
                  ? true
                  : false
                  ? ""
                  : "hover:text-black"
              }`}
              disabled={Number(data?.totalPages) - Number(page) < 1}
              onClick={() => setPage((page) => page + 1)}
            >
              <LuArrowRightSquare />
            </button>
          </div>
        </div>
      </Card>

      <AddEditModalReview
        open={openModalAdd}
        handleModalAdd={handleModalAdd}
        formData={formData}
        setFormData={setFormData}
        handleChange={handleChange}
        handleAddReview={handleAddReview}
        dataEdit={dataEdit}
        coverFile={coverFile}
        setCoverFile={setCoverFile}
        albumFiles={albumFiles}
        setAlbumFiles={setAlbumFiles}
        initialReviewImages={reviewImages}
        handleRemoveImage={handleRemoveImage} // pass the handleRemoveImage function
      />
    </div>
  );
};

export default ManageReviews;
