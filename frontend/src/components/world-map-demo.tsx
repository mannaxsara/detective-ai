"use client";

import WorldMap from "@/components/ui/world-map";
import { motion } from "motion/react";

export default function WorldMapDemo() {
  return (
    <div className="py-20 bg-[#09090B] w-full">
      <div className="max-w-7xl mx-auto text-center px-4">
        <p className="font-bold text-xl md:text-3xl text-zinc-100 uppercase tracking-wide">
          Remote{" "}
          <span className="text-zinc-500">
            {"Connectivity".split("").map((word, idx) => (
              <motion.span
                key={idx}
                className="inline-block"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.04 }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </p>
        <p className="text-xs md:text-sm text-zinc-500 max-w-xl mx-auto py-4 font-semibold leading-relaxed">
          Break free from traditional boundaries. Work from anywhere, at the
          comfort of your own studio apartment. Perfect for Nomads and
          Travellers.
        </p>
      </div>
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <WorldMap
          dots={[
            {
              start: {
                lat: 64.2008,
                lng: -149.4937,
              },
              end: {
                lat: 34.0522,
                lng: -118.2437,
              },
            },
            {
              start: { lat: 64.2008, lng: -149.4937 },
              end: { lat: -15.7975, lng: -47.8919 },
            },
            {
              start: { lat: -15.7975, lng: -47.8919 },
              end: { lat: 38.7223, lng: -9.1393 },
            },
            {
              start: { lat: 51.5074, lng: -0.1278 },
              end: { lat: 28.6139, lng: 77.209 },
            },
            {
              start: { lat: 28.6139, lng: 77.209 },
              end: { lat: 43.1332, lng: 131.9113 },
            },
            {
              start: { lat: 28.6139, lng: 77.209 },
              end: { lat: -1.2921, lng: 36.8219 },
            },
          ]}
        />
      </div>
    </div>
  );
}
