import React, { useContext, useMemo, useState } from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import Drawer from "./Drawer";
import { UserContext } from "@/context/UserContext";
import SearchAndSort from "./NavbarSearchAndSort";
import { SortCriteria } from "@/types";
import { NotesListContext } from "@/context/NotesListContext";
import NavbarSearchAndSort from "./NavbarSearchAndSort";

const Navbar = () => {
  const {
    searchTerm,
    setSearchTerm,
    sortCriteria,
    sortDirection,
    handleSortSelection,
    toggleSortDirection,
  } = useContext(NotesListContext);

  return (
    <div className=" flex justify-between w-full max-md:p-4 md:py-4 md:pr-4 bg-gray-900">
      <div className="md:hidden flex text-slate-300 items-center gap-2 text-xl font-bold shadow-white">
        <Drawer />
      </div>
      <div className="w-fit shadow-white">
        <NavbarSearchAndSort
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortCriteria={sortCriteria}
          sortDirection={sortDirection}
          handleSortSelection={handleSortSelection}
          toggleSortDirection={toggleSortDirection}
        />
      </div>
      <div className="flex items-center gap-2 ">
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-8 w-8",
              },
            }}
          />
        </SignedIn>
      </div>
    </div>
  );
};

export default Navbar;
