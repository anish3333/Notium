"use client";

import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import React, { ReactNode } from "react";

interface SecurityProviderProps {
  children: ReactNode;
}

const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { id } = useParams();
  const { user } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!user) {
      router.push(`/organisation`);
    }
  }, [user, router, id]);

  if (!user) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
};

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <SecurityProvider>
      <div>{children}</div>
    </SecurityProvider>
  );
};

export default layout;
