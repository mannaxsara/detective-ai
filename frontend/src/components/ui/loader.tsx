"use client";

import { motion } from "motion/react";
import React from "react";

export function LoaderOne() {
  return (
    <div className="flex items-center justify-center w-10 h-10">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-6 h-6 rounded-full border-2 border-t-transparent border-[#ea580c] shadow-[0_0_10px_rgba(234,88,12,0.3)]"
      />
    </div>
  );
}
export default LoaderOne;
