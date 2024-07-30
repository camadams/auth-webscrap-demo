"use client";

import { User } from "lucia";
import Navbar from "../navbar";
import { useEffect, useState } from "react";
import { validateRequest } from "@/lib/validate-request";
import { redirect } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getProduct } from "./action";
import { Product } from "@lemonsqueezy/lemonsqueezy.js";

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProduct, setLoadingProduct] = useState<boolean>(true);

  const fetchProducts = async () => {
    const response = await fetch("apiUrl");
    return (await response.text()) as string;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["getproducts"],
    queryFn: getProduct,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await validateRequest();
        setUser(user);
      } catch (error) {
        console.error("Failed to validate request:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchProduct = async () => {
      try {
        // const fetchProductResp = await fetch(
        //   `${
        //     process.env.NODE_ENV === "development"
        //       ? "https//localhost:3000"
        //       : "https://bnbnotifiter.com"
        //   }/api/getproduct`
        // );

        const product = await getProduct();
        setProduct((prev) => product.product);
      } catch (error) {
        console.error("Failed to get user email:", error);
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchUser();
    fetchProduct();
  }, []);

  if (loading) {
    return "loading";
  }
  if (!user) {
    return redirect("/login");
  }
  return (
    <>
      <Navbar user={user} />
      {/* <div className="flex flex-col items-center justify-center"> */}
      <div className="py-16 px-40 space-y-6">
        <h1 className="text-4xl ">Hi {user.username} !</h1>
        {/* {data ? <p>data is truthy {data.user_email}</p> : <p>data is falsey</p>} */}
        <p>You have {1} notifications left</p>
        {product && (
          <a
            target="_"
            className="mt-8 bg-red-400 px-3 py-1 rounded-full hover:bg-red-200"
            href={`${product.data.attributes.buy_now_url}?checkout[custom][userId]=${user.id}`}
          >
            Get Notifications
          </a>
        )}
      </div>
    </>
  );
}
