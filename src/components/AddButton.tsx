"use client";
import { CirclePlus } from "lucide-react";
import React from "react";

const AddButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <CirclePlus
      className="max-sm:fixed max-sm:bottom-0 max-sm:right-0
      max-sm:m-5 max-sm:text-white h-5 w-5 flex justify-center items-center text-gray-500 cursor-pointer rounded-full"
      onClick={onClick}
    />
  );
};

export default AddButton;
