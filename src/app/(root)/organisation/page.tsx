"use client";

import { OrganizationContext } from "@/context/OrganisationContext";
import Link from "next/link";
import React, { useContext } from "react";

const page = () => {
  const { organizations } = useContext(OrganizationContext);
  // console.log(organizations);
  return (
    <div className="flex flex-col h-screen  w-full px-4 sm:px-6 lg:px-8 text-white">
      <div className="flex justify-center w-full">
        <div className="flex flex-col w-full max-w-7xl px-4 py-6">
          {organizations.length > 0 &&
            organizations.map((org, index) => (
              <div className="flex">
                <Link
                key={index}
                href={`/organisation/${org.id}`}
                className="bg-gray-800 p-6 rounded-lg shadow-lg text-white"
              >
                <h1>{org.name}</h1>
                <p>{org.author}</p>
              </Link>
              <Link
                key={index}
                href={`/organisation/${org.id}/details`}
                className="bg-gray-800 p-6 rounded-lg shadow-lg text-white"
              >
                <h1>Details</h1>
              </Link>
              
              </div>
              
            ))}
        </div>
      </div>
    </div>
  );
};

export default page;
