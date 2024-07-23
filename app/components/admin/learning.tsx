"use client";
import { Card, ThemeProvider } from "@material-tailwind/react";
import axios from "axios";
import { HeaderAPI, HeaderMultiAPI } from "@/headerApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import dynamic from "next/dynamic";
import LearningShow from "./learningShow";
import LearningADD from "./learningAdd";
import LearningTitle from "./learningTitel";
import LearningVedio from "./learningVedio";

const MySwal = withReactContent(Swal);

const theme = {
  input: {
    styles: {
      base: {
        container: {
          width: "w-auto",
          minWidth: "min-w-[100px]",
        },
      },
    },
  },
};

interface Category {
  id: number;
  name: string;
}

interface Course {
  category_id: string;
  id: number;
  image: string;
  price: number;
  price_sale: number;
  title: string;
  video: string;
  videoFile: File;
  dec: string;
  lesson: string;
}

const LearningPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusEdit, setStatusEdit] = useState(0); // เพิ่มสถานะนี้
  const [page, setPage] = useState<number>(0);
  const [pageTitle, setPageTitle] = useState<number>(1);
  const [pageVideo, setPageVideo] = useState<number>(1);
  const [courseSelect, setCourseSelect] = useState<number | undefined>(
    undefined
  );
  const [dataTitle, setDataTitle] = useState<any[]>([]);
  const [titleId, setTitleId] = useState(0);
  const [dataVideo, setDataVideo] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    category_id: "",
    image: null as string | null,
    videoFile: null as File | null,
    videoUrl: "",
    dec: "",
    title: "",
    lesson: "",
    regularPrice: 0,
    discountPrice: 0,
  });

  const [learningAdd, setLearningAdd] = useState(0);

  const fetchCategory = useCallback(async () => {
    const requestData = { page, full: true };
    try {
      console.log(requestData);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/category`,
        requestData,
        { ...HeaderAPI(localStorage.getItem("Token")) }
      );
      // console.log(res)
      if (res.status === 200) {
        setCategories(res.data.data);
      } else {
        toast.error("error");
      }
    } catch (err) {
      const error = err as { response: { data: { message: string } } };
      toast.error(error.response.data.message);
    }
  }, [page]);

  const fetchTitle = useCallback(
    async (id: number) => {
      const data = {
        products_id: id,
        page: pageTitle,
      };
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API}/api/product/title`,
          data,
          { ...HeaderAPI(localStorage.getItem("Token")) }
        );
        if (res.status === 200) {
          setDataTitle(res.data);
        } else {
          toast.error("error");
        }
      } catch (err) {
        const error = err as { response: { data: { message: string } } };
        toast.error(error.response.data.message);
      }
    },
    [pageTitle]
  );

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory, page]);

  const handleFormSubmit = async (formData: any, statusEdit: number) => {
    MySwal.fire({
      title: "กำลังส่งข้อมูล...",
      allowOutsideClick: false,
      width: "350px",
      padding: "35px",
      didOpen: () => {
        MySwal.showLoading();
      },
    });

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("title", formData.title);
    formDataToSubmit.append("price", formData.regularPrice.toString());
    formDataToSubmit.append("price_sale", formData.discountPrice.toString());
    formDataToSubmit.append("category_id", formData.category_id.toString());
    if (statusEdit === 1) {
      formDataToSubmit.append("id", formData.id.toString());
    }
    if (formData.image) {
      formDataToSubmit.append("image", formData.image);
    }
    if (formData.videoFile) {
      formDataToSubmit.append("video", formData.videoFile);
    } else if (formData.videoUrl) {
      formDataToSubmit.append("video_url", formData.videoUrl);
    }
    formDataToSubmit.append("dec", formData.dec);

    try {
      let res;
      if (statusEdit === 0) {
        res = await axios.post(
          `${process.env.NEXT_PUBLIC_API}/api/product/add`,
          formDataToSubmit,
          { ...HeaderMultiAPI(localStorage.getItem("Token")) }
        );
      } else {
        res = await axios.put(
          `${process.env.NEXT_PUBLIC_API}/api/product`,
          formDataToSubmit,
          { ...HeaderMultiAPI(localStorage.getItem("Token")) }
        );
      }

      if (res.status === 200) {
        toast.success(res.data.message);
        fetchTitle(res.data.id);
        setCourseSelect(res.data.id);
        resetForm();
        MySwal.close();
      } else {
        toast.error("Form submission failed!");
        MySwal.close();
      }
    } catch (err) {
      console.log(err);
      MySwal.close();
      const error = err as { response: { data: { message: string } } };
      toast.error(error.response.data.message);
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      category_id: "",
      image: null,
      videoFile: null,
      videoUrl: "",
      dec: "",
      title: "",
      lesson: "",
      regularPrice: 0,
      discountPrice: 0,
    });
    setStatusEdit(0); // รีเซ็ตสถานะ
    fetchTitle(0); // เรียกใช้ fetchTitle เมื่อกดปุ่มแก้ไข
    setCourseSelect(undefined)
    setTitleId(0)

    // Reset file inputs
    const imageInput = document.getElementById(
      "imageInput"
    ) as HTMLInputElement;
    const videoInput = document.getElementById(
      "videoInput"
    ) as HTMLInputElement;

    if (imageInput) {
      imageInput.value = "";
    }

    if (videoInput) {
      videoInput.value = "";
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const handleEdit = (data: Course) => {
    setFormData({
      id: data.id,
      category_id: data?.category_id.toString() || "",
      image: data.image,
      videoFile: null,
      videoUrl: data.video,
      dec: data.dec,
      title: data.title,
      lesson: "",
      regularPrice: data.price,
      discountPrice: data.price_sale,
    });
    setLearningAdd(1);
    setStatusEdit(1); // ตั้งสถานะเป็นแก้ไข
    setPageTitle(1); // ตั้งหน้าเป็นหน้า 1 เสมอ
    fetchTitle(data.id); // เรียก fetchTitle เมื่อกดปุ่มแก้ไข
    setCourseSelect(data.id);
  };

  return (
    <ThemeProvider value={theme}>
      <div className="flex flex-col xl:flex-row justify-center gap-2 overflow-auto">
        <ToastContainer autoClose={2000} theme="colored" />
        {learningAdd === 0 ? (
          <div className="w-full">
            <Card className="flex overflow-auto">
              <LearningShow
                showToast={showToast}
                onEdit={handleEdit}
                setLearningAdd={setLearningAdd}
                learningAdd={learningAdd}
              />
            </Card>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row w-full  gap-2">
            <div>
              <LearningADD
                categories={categories}
                onFormSubmit={handleFormSubmit}
                onResetForm={resetForm}
                formData={formData}
                setFormData={setFormData}
                statusEdit={statusEdit}
                setLearningAdd={setLearningAdd}
              />
            </div>
            <div className="flex flex-col gap-3">
              <LearningTitle
                courseSelect={courseSelect}
                formData={formData}
                setFormData={setFormData}
                pageTitle={pageTitle}
                setPageTitle={setPageTitle}
                setDataTitle={setDataTitle}
                setTitleId={setTitleId}
                dataTitle={dataTitle}
              />
              <LearningVedio
                showToast={showToast}
                titleId={titleId}
                pageVideo={pageVideo}
                setPageVideo={setPageVideo}
                setDataVideo={setDataVideo}
                dataVideo={dataVideo}
              />
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default LearningPage;
