"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Sidebar = () => {
  const pathName = usePathname();
  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between bg-dark-1 p-6 pt-28 text-white max-sm:hidden lg:w-[264px]">
      <div className="flex flex-1 flex-col gap-6">
        <button
          className="btn"
          // onClick={() => setSetShowCard(!showCard)}
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>
    </section>
  );
};

export default Sidebar;
