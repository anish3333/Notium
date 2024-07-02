"use client";
import React from "react";

const AddButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bg-yellow-400 w-12 h-12 rounded-full text-xl p-2 bottom-0 right-0 m-9"
    >
      +
    </button>
  );
};

export default AddButton;
