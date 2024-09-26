"use client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

// กำหนดโครงสร้างของข้อมูลคอร์ส
interface Course {
  id: number;
  image: string;
  title: string;
  category_name: string;
  price: number;
  price_sale: number;
}

const CoursesPage: React.FC = () => {
  // กำหนดชนิดข้อมูลให้กับ state
  const [filterPrice, setFilterPrice] = useState<number>(1);
  const [coursesData, setCoursesData] = useState<Course[]>([]);

  // ฟังก์ชันดึงข้อมูลจาก API โดยรับชนิดข้อมูลที่ชัดเจน
  const fetchData = async (): Promise<{ data: Course[] } | undefined> => {
    const requestData = {
      search: "",
      page: "",
      full: true,
      filter_price: filterPrice,
    };
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/homepage/courses`,
        requestData
      );
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };

  // เรียกใช้เมื่อ component โหลดขึ้นมาครั้งแรกหรือเมื่อ filterPrice เปลี่ยนแปลง
  useEffect(() => {
    const fetchCourses = async () => {
      const data = await fetchData();
      setCoursesData(data?.data || []);
    };
    fetchCourses();
  }, [filterPrice]);

  // ฟังก์ชันเปลี่ยนค่า filter
  const handleFilterChange = (value: number) => {
    setFilterPrice(value);
  };

  // ฟังก์ชันรีเซ็ต filter
  const resetFilters = () => {
    setFilterPrice(1);
  };

  return (
    <div className="p-5 md:p-10 2xl:px-10 flex flex-col md:flex-row xl:mt-10">
      {/* Sidebar Filters */}
      <div className="w-full md:w-4/12 p-4 lg:w-3/12 2xl:w-2/12 bg-white shadow-md rounded-lg mb-5 md:mb-0 md:mr-4">
        <div className="flex flex-col mb-3 gap-3">
          <h2 className="font-light">คอร์เรียนใหม่</h2>
          <h2 className="text-[#3e8df3] font-light">คอร์เรียนทั้งหมด</h2>
          <hr />
        </div>
        <div className="flex justify-between">
          <h2 className="text-lg md:text-sm font-bold mb-4">
            ตัวกรองคอร์สเรียน
          </h2>
          <button
            className="text-lg md:text-sm text-red-500 font-light mb-4"
            onClick={resetFilters}
          >
            ล้างตัวกรอง
          </button>
        </div>

        {/* Radio Buttons for Price Filter */}

        <label className="flex items-center w-1/2   cursor-pointer">
          <input
            type="radio"
            name="price"
            value="1"
            checked={filterPrice === 1}
            onChange={() => handleFilterChange(1)}
            className="mr-2 w-auto "
          />
          น้อยไปหามาก
        </label>

        <label className="flex items-center  w-1/2 mt-2 cursor-pointer">
          <input
            type="radio"
            name="price"
            value="2"
            checked={filterPrice === 2}
            onChange={() => handleFilterChange(2)}
            className="mr-2 cursor-pointer"
          />
          มากไปหาน้อย
        </label>
      </div>

      {/* Courses Display */}
      <div className="w-full md:w-8/12 lg:w-9/12 2xl:w-10/12 2xl:px-10">
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row items-center mb-4">
          <input
            type="text"
            placeholder="ค้นหา"
            className="flex-grow p-2 border rounded-md md:rounded-l-md mb-2 md:mb-0 md:mr-2"
          />
          <button className="bg-purple-500 text-white px-4 py-2 rounded-md md:rounded-r-md">
            ค้นหา
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mt-5 md:mt-10">
          <div>
            <p className="text-xl md:text-2xl font-bold">
              คอร์สเรียน{" "}
              <span className="text-[#3e8df3] font-bold">ทั้งหมด</span>
            </p>
            <p className="mb-4">
              ผลลัพท์การค้นหา <span>{coursesData.length} คอร์ส </span>
            </p>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 mt-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10">
          {coursesData.map((course) => (
            <div 
              key={course.id}
              className="bg-white pb-3 shadow-md rounded-2xl flex flex-col justify-between"
            >
              <Link href={`/home/course/${course.id}`}>
                <Image
                  src={`${process.env.NEXT_PUBLIC_IMAGE_API}/images/${course.image}`}
                  alt={course.title}
                  width={500}
                  height={500}
                  className="rounded-t-lg mb-4 object-cover h-48 w-full"
                />
                <div className="px-2 md:px-5">
                  <h2 className="text-md md:text-lg font-semibold">
                    {course.title}
                  </h2>
                  <p className="text-gray-600">{course.category_name}</p>
                  <div className="flex w-full flex-wrap gap-3">
                    <p
                      className={`text-lg md:text-xl ${
                        course.price_sale > 0
                          ? "text-red-500 font-semibold"
                          : "text-red-500 font-semibold"
                      } mb-2 pr-1`}
                    >
                      {course.price_sale > 0
                        ? course.price_sale.toLocaleString()
                        : course.price.toLocaleString()}{" "}
                      บาท
                    </p>
                    {course.price_sale > 0 && (
                      <p className="line-through mb-2 pr-1">
                        {course.price.toLocaleString()}{" "}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-auto px-5">
                  {course.price === 0 ? (
                    <button className="bg-green-500 text-white px-4 py-2 rounded-md w-full">
                      ดูคอร์สเรียนนี้
                    </button>
                  ) : (
                    <button className="bg-[#184785] text-white px-4 py-2 rounded-md w-full">
                      ซื้อคอร์สเรียนนี้
                    </button>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
