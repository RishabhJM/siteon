"use client";
import React, { useRef, useState } from "react";
import {
  Image as ImageIcon,
  Crop,
  Expand,
  Image as ImageUpscale, // no lucide-react upscale, using Image icon
  ImageMinus,
  Loader2Icon,
  ImageDownIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ImageKit from "imagekit";
import axios from "axios";

type Props = {
  selectedEl: HTMLImageElement;
};

const transformOptions = [
  {
    label: "Smart Crop",
    value: "smartcrop",
    icon: <Crop />,
    transformation: "fo-auto",
  },
  // { label: "Resize", value: "resize", icon: <Expand />,transformation:"wh"},
  {
    label: "Upscale",
    value: "upscale",
    icon: <ImageUpscale />,
    transformation: "e-upscale",
  },
  {
    label: "BG Remove",
    value: "bgremove",
    icon: <ImageMinus />,
    transformation: "e-bgremove",
  },
  {
    label: "Drop Shadow",
    value: "dropshadow",
    icon: <ImageDownIcon />,
    transformation: "e-dropshadow",
  },
];

function ImageSettings({ selectedEl }: Props) {
  const [altText, setAltText] = useState(selectedEl.alt || "");
  const [width, setWidth] = useState<number>(selectedEl.width || 300);
  const [height, setHeight] = useState<number>(selectedEl.height || 200);
  const [borderRadius, setBorderRadius] = useState(
    selectedEl.style.borderRadius || "0px"
  );
  const [selectedImage, setSelectedImage] = useState<File>();
  const [loading, setLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState(selectedEl.src || "");
  const [activeTransforms, setActiveTransforms] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Toggle transform
  const toggleTransform = (value: string) => {
    setActiveTransforms((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveUploadedFile = async () => {
    if (!selectedImage) return;
    setLoading(true);
    const base64 = await fileToBase64(selectedImage);
    const result = await axios.post("/api/image", {
      selectedImage: base64,
    });
    setLoading(false);

    console.log(result?.data);
    selectedEl.setAttribute("src", result?.data.imageRef.url + "?tr=");
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const generateAiImage = () => {
    setLoading(true);
    const prompt = altText.replaceAll(" ", "-");
    const url = `https://ik.imagekit.io/imager/ik-genimg-prompt-${prompt}/${Date.now()}.png?tr=`;
    console.log(url);
    setPreview(url);
    selectedEl.setAttribute("src", url);
  };

  const applyTransformation = (trValue: string) => {
    if (!trValue) return;
    setLoading(true);
    let url = preview;

    if (!preview.includes(trValue)) {
      url = url + trValue + ",";
    }else{
        url = url.replaceAll(trValue+",","");
    }
    console.log("Transformation url", url);
    setPreview(url);
    selectedEl.setAttribute("src", url);
  };

  return (
    <div className="w-96 shadow p-4 space-y-4">
      <h2 className="flex gap-2 items-center font-bold">
        <ImageIcon /> Image Settings
      </h2>

      {/* Preview (clickable) */}
      <div className="flex justify-center">
        <img
          src={preview}
          alt={altText}
          className="max-h-40 object-contain border rounded cursor-pointer hover:opacity-80"
          onClick={openFileDialog}
          onLoad={() => setLoading(false)}
        />
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Upload Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={saveUploadedFile}
        disabled={loading}
      >
        {loading && <Loader2Icon className="animate-spin"></Loader2Icon>}Upload
        Image
      </Button>

      {/* Alt text */}
      <div>
        <label className="text-sm">Prompt</label>
        <Input
          type="text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Enter alt text"
          className="mt-1"
        />
      </div>

      <Button className="w-full" onClick={generateAiImage} disabled={loading}>
        {loading && <Loader2Icon className="animate-spin"></Loader2Icon>}{" "}
        Generate AI Image
      </Button>

      {/* Transform Buttons */}
      <div>
        <label className="text-sm mb-1 block">AI Transform</label>
        <div className="flex gap-2 flex-wrap">
          <TooltipProvider>
            {transformOptions.map((opt) => {
              const applied = activeTransforms.includes(opt.value);
              return (
                <Tooltip key={opt.value}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={
                        preview.includes(opt.transformation)
                          ? "default"
                          : "outline"
                      }
                      className="flex items-center justify-center p-2"
                      onClick={() => applyTransformation(opt.transformation)}
                    >
                      {opt.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {opt.label} {applied && "(Applied)"}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </div>

      {/* Conditional Resize Inputs */}
      {activeTransforms.includes("resize") && (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-sm">Width</label>
            <Input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm">Height</label>
            <Input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {/* Border Radius */}
      <div>
        <label className="text-sm">Border Radius</label>
        <Input
          type="text"
          value={borderRadius}
          onChange={(e) => setBorderRadius(e.target.value)}
          placeholder="e.g. 8px or 50%"
          className="mt-1"
        />
      </div>
    </div>
  );
}

export default ImageSettings;
