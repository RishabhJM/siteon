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
      "Create a modern header and centered hero section for a productivity SaaS...",
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
  const [userInput, setUserInput] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { userDetails, setUserDetails } = useContext(UserDetailsContext);
  const { has } = useAuth();

  const hasUnlimitedAccess = has && has({ plan: "unlimited" });

  const CreateNewProject = async () => {
    if (!hasUnlimitedAccess && userDetails.credits! <= 0) {
      toast.error("You have no credits left. Please upgrade to continue.");
      return;
    }

    const projectId = uuidv4();
    const frameId = Math.floor(Math.random() * 10000);

    try {
      setLoading(true);
      await axios.post("/api/projects", {
        projectId,
        frameId,
        messages: [{ role: "user", content: userInput }],
        credits: userDetails?.credits,
      });

      toast.success("Project created successfully!");
      setUserDetails((prev: any) => ({
        ...prev,
        credits: prev.credits! - 1,
      }));

      router.push(`/playground/${projectId}?frameId=${frameId}`);
    } catch {
      toast.error("Failed to create project. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10vh)] px-4 sm:px-6 py-8">


      {/* Heading */}
      <div className="text-center">
        <h2 className="font-bold text-4xl md:text-6xl leading-tight">
          What are you shipping today?
        </h2>
        <p className="mt-2 text-base md:text-xl text-gray-500">
          Build the website of your dreams, with just a few clicks
        </p>
      </div>

      {/* Input box */}
      <div className="w-full max-w-2xl p-4 md:p-5 border mt-5 rounded-2xl">
        <textarea
          placeholder="Describe the design of your page"
          className="w-full h-24 text-sm md:text-base focus:outline-none resize-none"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />

        <div className="flex justify-between items-center mt-2">
          <Button variant="outline" size="icon">
            <ImagePlus />
          </Button>

          {!user ? (
            <SignInButton mode="redirect" forceRedirectUrl="/workspace">
              <Button disabled={!userInput}>
                <ArrowUp className="h-4 w-4" />
              </Button>
            </SignInButton>
          ) : (
            <Button
              disabled={!userInput || loading}
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

      {/* Suggestions */}
      <div className="mt-4 flex flex-wrap justify-center gap-2 md:gap-3">
        {suggestion.map((option, index) => (
          <Button
            key={index}
            variant="outline"
            className="flex items-center gap-2 text-sm"
            onClick={() => setUserInput(option.prompt)}
          >
            <option.icon className="h-4 w-4" />
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default Hero;
