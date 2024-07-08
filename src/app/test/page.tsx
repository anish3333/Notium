'use client';
import { OrgForm } from '@/components/OrgForm';
import { useUser } from '@clerk/nextjs';
import React, { use, useEffect } from 'react'

// const fn = async (id: string) =>{
//   const response = await fetch(`/api/getUserByid/${id}`);
//   const data = await response.json();
//   console.log(data);
// }

const page = () => {
  const {user} = useUser();
  console.log(user);
  return (
    <div>
      <OrgForm />
    </div>
  )
}

export default page