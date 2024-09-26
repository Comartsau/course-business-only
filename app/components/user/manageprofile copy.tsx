"use client";
import {
  Button,
  Card,
  Input,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import CryptoJS from "crypto-js";
import { HeaderAPI } from "@/headerApi";
import { useEffect, useCallback, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Profile {
  id: number;
  email: string;
  address: string;
  phone: string;
  trade: string;
  username: string;
  name: string;
  password: string;
}

export default function ManageProfile() {
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const router = useRouter();

  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY || "your_secret_key";

  const decryptData = (ciphertext: string) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const userId = decryptData(localStorage.getItem("Id") || "");

  const getProfile = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/login/user/${userId}`,
        {
          ...HeaderAPI(decryptData(localStorage.getItem("Token") || "")),
        }
      );
      if (res.status === 200) {
        setUserProfile(res.data);
      } else {
        toast.error("Error fetching user data");
      }
    } catch (err) {
      const error = err as { response: { data: { message: string } } };
      toast.error(error.response.data.message);
    }
  }, [userId]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserProfile((prevProfile) => {
      if (!prevProfile) return null;
      return {
        ...prevProfile,
        [name]: value,
      };
    });
  };

  const handleUpdate = async () => {
    if (userProfile) {
      const data = {
        id: userProfile.id,
        username: userProfile.username || "",
        password: userProfile.password || "",
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        trade: userProfile.trade || "",
        address: userProfile.address || "",
      };

      try {
        const res = await axios.put(
          `${process.env.NEXT_PUBLIC_API}/api/login/user`,
          data,
          {
            ...HeaderAPI(decryptData(localStorage.getItem("Token") || "")),
          }
        );
        if (res.status === 200) {
          toast.success("อัพเดทข้อมูลสำเร็จ");
          if (res.data.statusPassword === 1) {
            router.push("/home");
            localStorage.clear();
          }
        } else {
          toast.error("Error updating profile");
        }
      } catch (err) {
        const error = err as { response: { data: { message: string } } };
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <div className="flex flex-col items-center h-full p-5 bg-gray-100">
      <ToastContainer autoClose={2000} theme="colored" />
      <Card className="flex flex-col items-center w-full max-w-2xl p-6 my-10 shadow-md gap-5 bg-white bg-opacity-90 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-2 text-center">
          <Typography className="text-xl font-semibold">
            จัดการข้อมูลผู้ใช้:
          </Typography>
          <Typography className="text-xl font-semibold">
            {userProfile?.username}
          </Typography>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
          <Input
            type="text"
            label="ชื่อผู้ใช้"
            name="username"
            value={userProfile?.username || ""}
            onChange={handleChange}
            crossOrigin="anonymous"
          />
          <Input
            type="password"
            label="รหัสผ่าน"
            name="password"
            value={userProfile?.password || ""}
            onChange={handleChange}
            crossOrigin="anonymous"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
          <Input
            type="text"
            label="ชื่อ-สกุล"
            name="name"
            value={userProfile?.name || ""}
            onChange={handleChange}
            crossOrigin="anonymous"
          />
          <Input
            type="email"
            label="อีเมล์"
            name="email"
            value={userProfile?.email || ""}
            onChange={handleChange}
            crossOrigin="anonymous"
          />
          <Input
            type="tel"
            label="เบอร์โทรศัพท์"
            name="phone"
            value={userProfile?.phone || ""}
            onChange={handleChange}
            crossOrigin="anonymous"
          />
        </div>
        <Input
          type="text"
          label="บัญชีเทรด"
          name="trade"
          value={userProfile?.trade || ""}
          onChange={handleChange}
          crossOrigin="anonymous"
        />
        <Textarea
          label="ที่อยู่"
          name="address"
          value={userProfile?.address || ""}
          onChange={handleChange}
          className="w-full"
        />
        <div className="flex flex-col lg:flex-row gap-5 w-full justify-center lg:justify-end">
          <Button
            variant="outlined"
            onClick={() => router.push("/user/shopcourse")}
            color="red"
            className="w-full lg:w-auto"
          >
            ยกเลิก
          </Button>
          <Button
            color="purple"
            className="w-full lg:w-auto"
            onClick={handleUpdate}
          >
            อัพเดท
          </Button>
        </div>
      </Card>
    </div>
  );
}
