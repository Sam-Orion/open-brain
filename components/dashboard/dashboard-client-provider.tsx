"use client";

import { useEffect, useState } from "react";
import CaptureModal from "@/components/dashboard/capture-modal";
import { GlobalShareModal } from "@/components/dashboard/global-share-modal";

export function DashboardClientProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGlobalShareOpen, setIsGlobalShareOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsModalOpen(true);
    const handleGlobalShareOpen = () => setIsGlobalShareOpen(true);
    
    window.addEventListener("openCaptureModal", handleOpen);
    window.addEventListener("openGlobalShareModal", handleGlobalShareOpen);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "i") { // Or maybe some other combo? Wait, instruction says Header.
        e.preventDefault();
        setIsModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("openCaptureModal", handleOpen);
      window.removeEventListener("openGlobalShareModal", handleGlobalShareOpen);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSubmit = (url: string, type: string, tags: string[]) => {
    // Dispatch to the thought grid
    window.dispatchEvent(
      new CustomEvent("addThoughtSubmit", {
        detail: { url, type, tags },
      })
    );
  };

  return (
    <>
      {children}
      <CaptureModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmit} 
      />
      <GlobalShareModal 
        isOpen={isGlobalShareOpen}
        onClose={() => setIsGlobalShareOpen(false)}
      />
    </>
  );
}