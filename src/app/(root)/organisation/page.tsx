"use client";

import { Button } from "@/components/ui/button";
import { OrganizationContext } from "@/context/OrganisationContext";
import Link from "next/link";
import React, { useContext } from "react";

const Page = () => {
  const { organizations, leaveOrganization } = useContext(OrganizationContext);
  return (
    <div className="container mx-auto px-8 py-8 bg-gray-900 rounded-lg shadow-lg mt-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">
        Your Organizations
      </h1>
      {organizations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  {org.name}
                </h2>
                <div className="flex justify-between items-center">
                  <Link
                    href={`/organisation/${org.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-600 font-medium"
                  >
                    Notes
                  </Link>
                  <Link
                    href={`/organisation/${org.id}/details`}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-600 font-medium"
                  >
                    Details
                  </Link>
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-6 py-4">
                <Button
                  variant="outline"
                  className="w-full text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-600 border-red-600 dark:border-red-400 hover:border-red-800 dark:hover:border-red-600"
                  onClick={() => leaveOrganization(org.id)}
                >
                  Leave Organization
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">
          You are not a member of any organizations yet.
        </p>
      )}
    </div>
  );
};

export default Page;
