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
import { Menu, Plus, Settings, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";

export function AppSidebar() {
  const [projectList, setProjectList] = useState<any[]>([]);
  const { userDetails } = useContext(UserDetailsContext);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { has } = useAuth();

  const hasUnlimitedAccess = has && has({ plan: "unlimited" });

  useEffect(() => {
    getProjects();
  }, []);

  const getProjects = async () => {
    setLoading(true);
    const result = await axios.get("/api/get-all-projects");
    setProjectList(result?.data || []);
    setLoading(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setOpen(true)}
      >
        <Menu />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarWrapper
          projectList={projectList}
          loading={loading}
          hasUnlimitedAccess={hasUnlimitedAccess}
          userDetails={userDetails}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden">
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-xs bg-background shadow-lg">
            <button
              className="absolute right-4 top-4"
              onClick={() => setOpen(false)}
            >
              <X />
            </button>

            <SidebarWrapper
              projectList={projectList}
              loading={loading}
              hasUnlimitedAccess={hasUnlimitedAccess}
              userDetails={userDetails}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

/* Extracted reusable sidebar layout */
function SidebarWrapper({
  projectList,
  loading,
  hasUnlimitedAccess,
  userDetails,
  onNavigate,
}: any) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex gap-2 items-center">
          <Image src="/logo.svg" alt="Logo" width={40} height={40} />
          <h2 className="font-bold text-lg">Siteon</h2>
        </div>

        <Link href="/workspace" className="mt-4 w-full" onClick={onNavigate}>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>

          {!loading && projectList.length === 0 && (
            <p className="text-sm text-gray-500 px-2">No projects found</p>
          )}

          <div className="space-y-2">
            {!loading
              ? projectList.map((project: any, index: number) => (
                  <Link
                    key={index}
                    href={`/playground/${project.projectId}?frameId=${project.frameId}`}
                    onClick={onNavigate}
                  >
                    <h3 className="text-sm line-clamp-1 p-2 rounded-lg border hover:bg-muted">
                      {project?.chats[0]?.chatMessage[0]?.content}
                    </h3>
                  </Link>
                ))
              : [1, 2, 3, 4].map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-lg" />
                ))}
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-3">
        {!hasUnlimitedAccess && (
          <div className="p-3 border rounded-xl bg-secondary space-y-2">
            <div className="flex justify-between text-sm">
              <span>Credits</span>
              <span className="font-bold">{userDetails?.credits}</span>
            </div>
            <Progress value={(userDetails?.credits / 2) * 100} />
            <Link href="/workspace/pricing" onClick={onNavigate}>
              <Button size="sm" className="w-full">
                Upgrade
              </Button>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2">
          <UserButton />
          <User className="h-4 w-4" />
          <Button size="sm" variant="ghost">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
