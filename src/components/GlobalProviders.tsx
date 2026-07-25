import type React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const GlobalProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    {children}
  </TooltipProvider>
);

export default GlobalProviders;
