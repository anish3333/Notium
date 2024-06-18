"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Sidebar = ({ onClick }: { onClick: () => void }) => {
  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between bg-dark-1 p-6  text-white border-r border-white ">
      <div className="flex flex-1 flex-col gap-6">
        <button className="flex items-center gap-2 text-xl font-bold">
          Logo
        </button>

        <button
          onClick={onClick}
          className="bg-yellow-400 w-12 h-12 rounded-full text-xl p-2"
        >
          +
        </button>
      </div>
    </section>
  );
};

export default Sidebar;
