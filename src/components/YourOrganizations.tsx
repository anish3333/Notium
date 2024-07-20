import { useContext } from "react";
import { OrganizationContext } from "@/context/OrganisationContext";
import Link from "next/link";
import { FiBriefcase, FiUsers, FiFileText } from "react-icons/fi";
import { useUser } from "@clerk/nextjs";

const YourOrganizations = () => {
  const { organizations, leaveOrganization, deleteOrganization } = useContext(OrganizationContext);
  const { user } = useUser();
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <FiBriefcase className="mr-2" /> Your Organizations
      </h2>
      {organizations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org, index) => (
            <Link href={`/organisation/${org.id}`}>
            <div
              key={index}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
            >
              <h3 className="text-xl font-medium mb-2">{org.name}</h3>
              <div className="flex items-center text-gray-400 mb-2">
                <FiUsers className="mr-1" /> {org.members.length} Members
              </div>
              <div className="flex justify-between items-center mt-4">
                <Link
                  href={`/organisation/${org.id}/details`}
                  className="text-blue-400 hover:text-blue-300 flex items-center"
                >
                  <FiFileText className="mr-1" /> View Details
                </Link>
                {
                org.author === user?.id ? (
                  <button
                    className="text-red-400 hover:text-red-300"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteOrganization(org.id);
                    }}
                  >
                    Delete
                  </button>
                ) : (
                  <button
                    className="text-blue-400 hover:text-blue-300"
                    onClick={(e) => {
                      e.preventDefault();
                      leaveOrganization(org.id);
                    }}
                  >
                    Leave
                  </button>
                )
              }
              </div>
            </div>
          </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 bg-gray-700 p-4 rounded-lg">
          You are not a member of any organizations yet.
        </p>
      )}
    </div>
  );
};

export default YourOrganizations;
