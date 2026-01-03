"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailsContext } from "@/context/UserDetailsContext";
function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {user, isLoaded, isSignedIn} = useUser();
  const [userDetails,setUserDetails] =  useState<any>();
  useEffect(() => {
    console.log("USER",user);
    console.log("isLoaded:",isLoaded,"isSignedIn:",isSignedIn);
    if(isLoaded && isSignedIn && user) {
      CreateNewUser();
    }
  }, [isLoaded, isSignedIn, user]);
  const CreateNewUser = async () => {
    try {
      const result = await axios.post("/api/users", {}, {
        withCredentials: true
      });
      console.log("RESULT DATA:", result.data);
      setUserDetails(result.data?.user);
    } catch (error: any) {
      console.error("ERROR:", error.response?.status, error.response?.data);
      console.error("FULL ERROR:", error);
    }
  };
  return <div><UserDetailsContext.Provider value={{userDetails,setUserDetails}}>{children}</UserDetailsContext.Provider></div>;
}

export default Provider;
