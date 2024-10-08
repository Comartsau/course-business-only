"use client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

interface Activity {
  id: number;
  image_title: string;
  title: string;
  dec: string;
  category_name: string;
  price: number;
  price_sale: number;
}

const PortfolioPage = () => {
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    const requestData = {
      page: page,
      search: "",
      full: false,
      home: false,
    };

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/homepage/news`,
        requestData
      );
      if (res.status === 200) {
        setData(res.data);
        setTotalPages(res.data.totalPages || 1);
      } else {
        console.error("Error fetching data");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  // ฟังก์ชันสำหรับตัดข้อความ
  const truncate = (text: string, maxLength: number = 100): string => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <div className="p-6 md:p-12 flex flex-col">
      <div className="w-full">
        <div className="flex flex-col md:flex-row items-center justify-between mt-5 md:mt-10">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              กิจกรรม <span className="text-blue-500 font-bold">ทั้งหมด</span>
            </h1>
            <p className="text-gray-600">
              ผลลัพท์การค้นหา{" "}
              <span className="font-semibold">
                {data?.data?.length || 0} กิจกรรม
              </span>
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <select
              className="p-2 border px-5 border-gray-300 rounded-md shadow-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out"
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
            >
              {Array.from({ length: totalPages }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  หน้าที่ {index + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2  gap-20 mt-10 2xl:px-36">
          {data?.data.map((activity: Activity, index: number) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col 2xl:flex-row justify-between"
            >
              <Link href={`/home/activity/${activity?.id}`}>
                <Image
                  src={`${process.env.NEXT_PUBLIC_IMAGE_API}/images/${activity?.image_title}`}
                  alt={activity?.image_title}
                  width={500}
                  height={500}
                  className="rounded-t-2xl object-cover w-full h-52"
                />
              </Link>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-200 text-purple-600 text-sm px-2 py-1 rounded-full">
                    {activity.category_name || "หมวดหมู่"}
                  </span>
                </div>
                <h2 className="text-md md:text-lg font-semibold text-gray-800">
                  {activity?.title}
                </h2>
                <p className="text-gray-600 text-sm">{truncate(activity?.dec)}</p>
                <div className="flex justify-between items-center mt-4">
                  <Link
                    href={`/home/activity/${activity?.id}`}
                    className="text-purple-500 hover:text-purple-600 text-sm flex items-center gap-1"
                  >
                    ดูรายละเอียด{" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.25 5.25l6 6m0 0l-6 6m6-6H4.75"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
