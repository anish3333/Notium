"use client";

import YourOrganizations from "@/components/YourOrganizations";
import RequestJoinOrg from "@/components/RequestJoinOrg";
import JoinRequests from "@/components/JoinRequests";
import { OrgForm } from "@/components/OrgForm";
import { useUser } from "@clerk/nextjs";
import { FiActivity } from "react-icons/fi";
import OrgStats from "@/components/OrgStats";

const Dashboard = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gray-800 rounded-lg p-6 flex items-center space-x-4">
          <img
            src={user?.imageUrl}
            alt="Profile"
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.firstName}!</h1>
            <p className="text-gray-400">
              Manage your organizations and collaborations here.
            </p>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-2 lg:col-span-3 space-y-6">
            <YourOrganizations />
          </div>
          <div>
            <RequestJoinOrg />
          </div>
          <div className="space-y-6 lg:col-span-2">
            <OrgForm />
          </div>
          <div className="space-y-6 md:col-span-2">
            <OrgStats />
          </div>
          <div className="md:col-span-2 lg:col-span-4">
            <JoinRequests />
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentActivity = () => (
  <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-full">
    <h2 className="text-xl font-semibold mb-4 flex items-center">
      <FiActivity className="mr-2" /> Recent Activity
    </h2>
    <ul className="space-y-2">
      <li className="bg-gray-700 p-3 rounded-lg">
        Joined "Tech Innovators" organization
      </li>
      <li className="bg-gray-700 p-3 rounded-lg">
        Created "Project Alpha" in "Data Science Group"
      </li>
      <li className="bg-gray-700 p-3 rounded-lg">
        Invited 3 new members to "AI Research Team"
      </li>
    </ul>
  </div>
);

export default Dashboard;
