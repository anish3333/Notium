import { OrganizationContext } from '@/context/OrganisationContext';
import React, { useContext } from 'react'
import { FiActivity } from 'react-icons/fi'

const OrgStats = () => {
  const { organizations, joinRequests } = useContext(OrganizationContext);
  const orgMemebersCount = organizations.reduce((acc, org) => {
    return acc + (org.members.length - 1);
  }, 0);

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-full flex flex-col gap-4">
    <h2 className="text-xl font-semibold mb-4 flex items-center">
      <FiActivity className="mr-2" /> Quick Stats
    </h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gray-700 p-4 rounded-lg text-center text-wrap flex flex-col items-center">
        <p className="text-2xl font-bold">{organizations.length}</p>
        <p className="text-sm text-gray-400 text-wrap">Organizations</p>
      </div>
      <div className="bg-gray-700 p-4 rounded-lg text-center flex flex-col items-center">
        <p className="text-2xl font-bold">{orgMemebersCount}</p>
        <p className="text-sm text-gray-400">Members</p>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gray-700 p-4 rounded-lg text-center text-wrap flex flex-col items-center">
        <p className="text-2xl font-bold">{joinRequests.length}</p>
        <p className="text-sm text-gray-400 text-wrap">Join Reqs</p>
      </div>
    </div>
  </div>
  )
}


export default OrgStats