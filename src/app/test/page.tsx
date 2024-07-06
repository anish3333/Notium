'use client';
import { useUser } from '@clerk/nextjs';
import React, { use, useEffect } from 'react'

const fn = async (id: string) =>{
  const response = await fetch(`/api/getUserByid/${id}`);
  const data = await response.json();
  console.log(data);
}

const page = () => {
  const {user, isSignedIn} = useUser();
  useEffect(() => {
    if(isSignedIn)fn(user.id);
  }, [isSignedIn, user]);
  return (
    <div>page</div>
  )
}

export default page