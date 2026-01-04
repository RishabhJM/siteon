"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDetailsContext } from "@/context/UserDetailsContext";
import { UserButton, useAuth } from "@clerk/nextjs";
import axios from "axios";
import { Plus, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";

export function AppSidebar() {
  const [projectList, setProjectList] = useState<any>([]);
  const { userDetails, setUserDetails } = useContext(UserDetailsContext);
  const [loading, setLoading] = useState<boolean>(false);
  const { has } = useAuth();

  const hasUnlimitedAccess = has && has({ plan: "unlimited" });

  useEffect(() => {
    console.log("ALL projects called");
    getProjects();
  }, []);

  const getProjects = async () => {
    setLoading(true);
    const result = await axios.get("/api/get-all-projects");
    console.log(result?.data);
    setProjectList(result?.data);
    setLoading(false);
  };
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex gap-2 items-center">
          <Image src={"/logo.svg"} alt="Logo" width={48} height={48} />
          <h2 className="font-bold text-xl">Siteon</h2>
        </div>
        <Link href={"/workspace"} className="mt-5 w-full">
          <Button className="w-full">
            <Plus /> Create new project
          </Button>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          {!loading && projectList.length === 0 && (
            <h2 className="text-sm px-2 text-gray-500">No Projects found</h2>
          )}
          <div>
            {!loading && projectList.length > 0
              ? projectList.map((project: any, index: any) => (
                  <Link
                    href={`/playground/${project.projectId}?frameId=${project.frameId}`}
                    key={index}
                  >
                    <h3 className="line-clamp-1 p-1 my-2 rounded-lg border hover:bg-gray-200 cursor-pointer">
                      {project?.chats[0].chatMessage[0]?.content}
                    </h3>{" "}
                  </Link>
                ))
              : [1, 2, 3, 4, 5].map((_, index) => (
                  <Skeleton
                    className="w-full h-10 rounded-lg mt-2"
                    key={index}
                  ></Skeleton>
                ))}
          </div>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className="p-2">
        {!hasUnlimitedAccess && (
          <div className="p-3 border rounded-xl space-y-3 bg-secondary">
            <h2 className="flex justify-between items-center">
              Remaining Credits{" "}
              <span className="font-bold">{userDetails?.credits}</span>
            </h2>
            <Progress value={(userDetails?.credits/2)*100}></Progress>
            <Link href={"workspace/pricing"}>
              <Button className="w-full">Upgrade to Unlimited</Button>
            </Link>
          </div>
        )}
        <div className="flex items-center gap-2">
          <UserButton></UserButton>
          <User />
          <Button variant={"ghost"}>Settings</Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
