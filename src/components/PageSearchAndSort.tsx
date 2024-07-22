// components/PageSearchAndSort.tsx
import React from "react";
import { Search, SortDescIcon, ArrowUpDown } from "lucide-react";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
} from "@radix-ui/react-dropdown-menu";
import { SortCriteria } from "@/types";

interface PageSearchAndSortProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortCriteria: SortCriteria;
  sortDirection: "asc" | "desc";
  handleSortSelection: (criteria: SortCriteria) => void;
  toggleSortDirection: () => void;
}

const PageSearchAndSort: React.FC<PageSearchAndSortProps> = ({
  searchTerm,
  setSearchTerm,
  sortCriteria,
  sortDirection,
  handleSortSelection,
  toggleSortDirection,
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded-md w-full shadow-lg">
      <div className="flex items-center gap-4 flex-grow">
        <div className="relative flex flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 bg-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors duration-200">
            <span className="mr-2">Sort By</span>
            <SortDescIcon className="w-5 h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white/20 backdrop-blur-md text-white rounded-lg shadow-lg mt-2">
            <DropdownMenuItem
              onClick={() => handleSortSelection("dateCreated")}
              className="px-4 py-2 hover:bg-white/30 transition-colors duration-200"
            >
              Created {sortCriteria === "dateCreated" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSortSelection("dateModified")}
              className="px-4 py-2 hover:bg-white/30 transition-colors duration-200"
            >
              Modified {sortCriteria === "dateModified" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSortSelection("title")}
              className="px-4 py-2 hover:bg-white/30 transition-colors duration-200"
            >
              Title {sortCriteria === "title" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          onClick={toggleSortDirection}
          className="flex items-center px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors duration-200"
        >
          <span className="mr-2">{sortDirection === "asc" ? "Ascending" : "Descending"}</span>
          <ArrowUpDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PageSearchAndSort;