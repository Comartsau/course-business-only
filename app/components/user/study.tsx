"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import { Button, Card, Typography } from "@material-tailwind/react";
import ReactPlayer from "react-player";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface PageProps {
  params: {
    id: string;
  };
}


interface Title {
  title_id: number;
  title: string;
  videos: any[]; 
}

interface ProductData {
  product_id: number;
  product_title: string;
  // titles: Title[];
}

interface ProductTitle {
  title_id : number;
  title : string
  videos: ProductVideos[];
}

interface ProductVideos {
  video_id : number
}



const Study: React.FC<PageProps> = ({ params }) => {
  const [data, setData] = useState<ProductData | null>(null); // Update state to hold a single object

  // นาย
  const [dataTitle, setDataTitle] = useState<ProductTitle[]>([]);

  const [dataVideo, setDataVideo] = useState<ProductVideos []>([])

  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY || "your_secret_key";

  const decryptData = (ciphertext: string) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/users/product/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${decryptData(
              localStorage.getItem("Token") || ""
            )}`,
          },
        }
      );
      if (res.status === 200) {
        // setData(res.data);
        setData({
          product_id : res.data[0].product_id , 
          product_title : res.data[0].product_title
        })
        setDataTitle(res.data[0].titles)
        // setDataVideo(res.data[0].title.videos)
    
        // const newData = res.data[0].titles.map((item : any, index : any) => {
        //   return item;
        // });

        // console.log({newData});
        
        
        
      } else {
        toast.error("Error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data from server.");
    }
  };

  const handleClick = (id : any)=>{
    const newData = dataTitle
    .filter((item) => item.title_id === id)  
    .map((item) => item.videos);  
  const flatVideos = newData.flat();
  setDataVideo(flatVideos)
  
  
     
  }

  useEffect(() => {
    fetchData();
  }, []);

  const videoRef = useRef<ReactPlayer>(null);

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.seekTo(seconds);
    }
  };

  // console.log(data?.titles)

  return (
    <div className="xl:h-[700px] overflow-auto">
      <ToastContainer autoClose={2000} theme="colored" />

      <h1>{data?.product_id} {data?.product_title}</h1>

   <ul>
   {dataTitle?.map((item : any, index : any)=> (
        <li onClick={()=>handleClick(item.title_id)} key={item.title_id}>{item.title}</li>
      ))}
  </ul>  


  <h2>VIDEOS</h2>
  <ul>
    {dataVideo?.map((item : any, index : any)=> (
      <li key={item.id}>{item.video_id}</li>
    ))}
  </ul>


      {/* <div className="flex flex-col w-full justify-center items-center lg:flex-row gap-5 pt-10 px-6 lg:px-36 overflow-auto">
        <div className="w-full md:w-3/5">
          <Card className="w-full overflow-auto gap-5 !bg-white">
            <div className="w-full flex justify-center bg-gray-300 rounded-sm">
              <ReactPlayer
                ref={videoRef}
                url="https://youtu.be/4_c5EBr0whM"
                controls
                width="100%"
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 ps-3">
                <div>
                  <Typography className="font-bold">
                    {data.product_title}:
                  </Typography>
                </div>
                <div className="flex gap-3">
                  <Typography className="font-bold">เหลือเวลา:</Typography>
                  <Typography>100 วัน</Typography>
                </div>
              </div>
              <div className="flex gap-2 ps-3 mb-3">
                <Typography className="font-bold">Dec:</Typography>
                <Typography className="pr-2">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Odio, sed. Ad veritatis voluptatibus reiciendis eius. Beatae
                  omnis officiis tempore vel!.
                </Typography>
              </div>
            </div>
          </Card>
        </div>
        <div className="w-full md:w-2/5">
          <Card className="w-full overflow-auto gap-5">
            {data?.titles?.map((item, index) => (
              <Button variant="text" key={index} className="w-full">
                {item?.title}
              </Button>
            ))}
          </Card>
        </div>
      </div> */}

    </div>
  );
};

export default Study;
