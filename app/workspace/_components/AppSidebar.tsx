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
import { FileText, Folder, Menu, Plus, Settings, Sparkles, X } from "lucide-react";
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
        aria-label="Open navigation"
        className="fixed left-4 top-4 z-50 flex size-10 items-center justify-center rounded-xl border border-border bg-background/95 text-foreground shadow-sm backdrop-blur md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-4" />
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
          <div className="absolute left-0 top-0 h-full w-[88%] max-w-sm border-r border-sidebar-border bg-sidebar shadow-2xl">
            <button
              aria-label="Close navigation"
              className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-lg text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </button>
            <SidebarWrapper
              projectList={projectList}
              loading={loading}
              hasUnlimitedAccess={hasUnlimitedAccess}
              userDetails={userDetails}
              onNavigate={() => setOpen(false)}
              mobile
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
  mobile = false,
}: any) {
  return (
    <Sidebar
      collapsible={mobile ? "none" : "offcanvas"}
      className={mobile ? "h-full w-full border-r border-sidebar-border" : "border-r border-sidebar-border"}
    >
      <SidebarHeader className="gap-6 p-5 pb-3">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Siteon" width={36} height={36} className="rounded-xl" />
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">Siteon</h2>
            <p className="text-xs text-sidebar-foreground/50">AI website studio</p>
          </div>
        </div>

        <Link href="/workspace" className="w-full" onClick={onNavigate}>
          <Button className="h-11 w-full justify-center gap-2 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm transition hover:opacity-90">
            <Plus className="size-4" />
            <span>New project</span>
          </Button>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <SidebarGroup className="p-2">
          <SidebarGroupLabel className="mb-2 h-7 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/45">
            Your projects
          </SidebarGroupLabel>

          {!loading && projectList.length === 0 && (
            <div className="rounded-xl border border-dashed border-sidebar-border px-3 py-8 text-center">
              <Folder className="mx-auto mb-2 size-5 text-sidebar-foreground/35" />
              <p className="text-xs text-sidebar-foreground/50">Your projects will appear here</p>
            </div>
          )}

          <div className="space-y-1.5">
            {!loading
              ? projectList.map((project: any, index: number) => (
                <div key={project.projectId ?? index}>
                  <Link
                    href={`/playground/${project.projectId}?frameId=${project.frameId}`}
                    onClick={onNavigate}
                    className="group/project flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-sidebar-foreground/75 transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar/70 text-sidebar-foreground/45 transition-colors group-hover/project:border-sidebar-accent group-hover/project:bg-sidebar-primary group-hover/project:text-sidebar-primary-foreground">
                      <FileText className="size-3.5" />
                    </span>
                    <h3 className="line-clamp-2 min-w-0 text-[13px] leading-5">
                      {project?.chats?.[0]?.chatMessage?.[0]?.content || "Untitled project"}
                    </h3>
                  </Link>
                </div>
                ))
              : [1, 2, 3, 4].map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-xl" />
                ))}
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 border-t border-sidebar-border/70 p-4">
        {!hasUnlimitedAccess && (
          <div className="space-y-3 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Sparkles className="size-3.5 text-sidebar-primary" />
                <span>Credits</span>
              </div>
              <span className="text-xs font-semibold tabular-nums text-sidebar-foreground/70">{userDetails?.credits ?? 0} left</span>
            </div>
            <Progress value={Math.min(100, ((userDetails?.credits ?? 0) / 2) * 100)} className="h-1.5" />
            <Link href="/workspace/pricing" onClick={onNavigate}>
              <Button size="sm" variant="outline" className="h-8 w-full rounded-lg text-xs">
                Upgrade plan
              </Button>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-xl px-1 py-1">
          <UserButton />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{userDetails?.name || "Your account"}</p>
            <p className="text-[11px] text-sidebar-foreground/45">Personal workspace</p>
          </div>
          <Button asChild size="icon" variant="ghost" className="size-8 rounded-lg text-sidebar-foreground/55 hover:text-sidebar-foreground">
            <Link href="/workspace/settings" onClick={onNavigate} aria-label="Settings">
              <Settings className="size-4" />
            </Link>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
