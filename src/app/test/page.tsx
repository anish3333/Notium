'use client';
import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

const Page = () => {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL as string);

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>Page</div>;
};

export default Page;
