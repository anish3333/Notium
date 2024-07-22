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
    <div className="md:hidden flex justify-between w-full p-4 z-10 mr-[4rem]">
      <div className="flex text-slate-300 items-center gap-2 text-xl font-bold">
        <Drawer />
      </div>
      <div className="w-full">
        <NavbarSearchAndSort
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortCriteria={sortCriteria}
          sortDirection={sortDirection}
          handleSortSelection={handleSortSelection} 
          toggleSortDirection={toggleSortDirection}
        />
      </div>
      <div className="flex items-center gap-2">
        <SignedIn>
          <UserButton />
        </SignedIn>
        </div>
    </div>
  );
};

export default Navbar;
