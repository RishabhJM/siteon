"use client";

import { Button } from "@/components/ui/button";
import { UserDetailsContext } from "@/context/UserDetailsContext";
import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import {
  ArrowUp,
  HomeIcon,
  ImagePlus,
  Key,
  LayoutDashboard,
  Loader2Icon,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const suggestion = [
  {
    label: "Dashboard",
    prompt:
      "Create an analytics dashboard to track customers and revenue data for a SaaS",
    icon: LayoutDashboard,
  },
  {
    label: "SignUp Form",
    prompt:
      "Create a modern sign up form with email/password fields, Google and Github login options, and terms checkbox",
    icon: Key,
  },
  {
    label: "Hero",
    prompt:
      "Create a modern header and centered hero section for a productivity SaaS. Include a badge for feature announcement, a title with a subtle gradient effect, subtitle, CTA, small social proof and an image.",
    icon: HomeIcon,
  },
  {
    label: "User Profile Card",
    prompt:
      "Create a modern user profile card component for a social media website",
    icon: User,
  },
];

function Hero() {
  const [userInput, setUserInput] = useState<string>("");
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useUser();
  const { userDetails, setUserDetails } = useContext(UserDetailsContext);
  const { has } = useAuth();

  const hasUnlimitedAccess = has && has({ plan: "unlimited" });

  const CreateNewProject = async () => {
    if(!hasUnlimitedAccess && userDetails.credits! <= 0 ){
      toast.error("You have no credits left. Please upgrade to continue.");
      return;
    }
    const projectId = uuidv4();
    const frameId = Math.floor(Math.random() * 10000);
    const messages = [
      {
        role: "user",
        content: userInput,
      },
    ];
    try {
      setLoading(true);
      const result = await axios.post("/api/projects", {
        projectId: projectId,
        frameId: frameId,
        messages: messages,
        credits:userDetails?.credits
      });
      console.log(result.data);
      toast.success("Project created successfully!");
      setUserDetails((prev:any)=> ({
        ...prev,
        credits:prev.credits! -1
      }))
      //Navigate to Playground
      router.push(`/playground/${projectId}?frameId=${frameId}`);
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-[90vh]">
      <div>
        <h2 className="font-bold text-6xl">What are you shipping today?</h2>
        <p className="mt-2 text-xl text-gray-500 text-center">
          Build the website of your dreams, with just a few clicks
        </p>
      </div>
      <div className="w-full max-w-2xl p-5 border mt-5 rounded-2xl">
        <textarea
          placeholder="Describe the design of your page"
          className="w-full h-24 focus:outline-none focus:ring-0 resize-none"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        ></textarea>
        <div className="flex justify-between items-center">
          <Button variant={"outline"}>
            <ImagePlus></ImagePlus>
          </Button>
          {!user ? (
            <SignInButton mode="redirect" forceRedirectUrl={"/workspace"}>
              <Button disabled={!userInput}>
                <ArrowUp className="h-4 w-4" />
              </Button>
            </SignInButton>
          ) : (
              <Button
                disabled={!userInput || userInput.length === 0 || loading}
                onClick={CreateNewProject}
              >
                {loading ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        {suggestion.map((option, index) => (
          <Button
            key={index}
            variant={"outline"}
            onClick={() => setUserInput(option.prompt)}
          >
            <option.icon />
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default Hero;
