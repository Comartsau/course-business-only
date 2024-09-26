import axios from "axios";
import Image from "next/image";
import React from "react";
import parse from "html-react-parser";
import NewsSidebar from "./newssidebar";
import SubCoursePath from "./subcoursepath"

interface PageProps {
  params: {
    id: string;
  };
}

const fetchData = async (id: String) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API}/api/homepage/courses/${id}`
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const SubCourse: React.FC<PageProps> = async ({ params }) => {
  const data = await fetchData(params.id);
  console.log(data);

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">
      {/* ส่วนข้อมูลหลัก */}
      <div className="lg:col-span-2">
        <div className="flex flex-col gap-10">
          <div className="bg-white shadow rounded-xl">
            <Image
              src={`${process.env.NEXT_PUBLIC_IMAGE_API}/images/${data?.product_image}`}
              alt={data?.product_title}
              width={2500}
              height={2500}
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>
          <div className="flex flex-col gap-5 px-10">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold">
                {data?.product_title}
              </h1>
              <h1 className="text-xl lg:text-2xl font-bold">
                {data?.product_id}
              </h1>
            </div>
            <div>{parse(data?.product_dec || "")}</div>
            <div className="flex w-full flex-wrap gap-3">
                    <p
                      className={`text-lg md:text-xl ${
                        data?.products_price_sale > 0
                          ? "text-red-500 font-semibold"
                          : "text-red-500 font-semibold"
                      } mb-2 pr-1`}
                    >
                      {data?.products_price_sale > 0
                        ? data?.products_price_sale?.toLocaleString()
                        : data?.products_price?.toLocaleString()}{" "}
                      บาท
                    </p>
                    {data?.products_price_sale > 0 && (
                      <p className="line-through mb-2 pr-1">
                        {data?.products_price.toLocaleString()}{" "}
                      </p>
                    )}
                  </div>
          </div>
        </div>

        {/* แสดงรายละเอียดบทเรียนโดยใช้ details และ summary */}
        <div className="mt-4 mb-10">
  
          <h1>รายละเอียดบทเรียน</h1>
          <div className="mt-5 bg-gray-50 rounded-b">
            {data?.result_list?.map((lesson: any, index: number) => (
              <div
                key={index}
                className="flex border-b last:border-none py-2 px-5 justify-between items-center hover:bg-gray-100 transition duration-200"
              >
                <h2 className="font-semibold text-gray-700">{lesson.title}</h2>
                <h2 className="text-gray-600">{lesson.video_count} บทเรียน</h2>
              </div>
            ))}
          </div>
        </div>
        
      </div>

      {/* ส่วนข้อมูลเพิ่มเติม */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <SubCoursePath data={data} />
        {/* ย้าย NewsSidebar ไปด้านขวา */}
        <NewsSidebar id={params.id} name="products" title="คลอสเรียน" />
      </div>
    </div>
  );
};

export default SubCourse;
