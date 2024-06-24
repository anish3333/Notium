'use client';
import { useUser } from "@clerk/nextjs";
import { createContext, useEffect, useState, ReactNode } from "react";

// Define the shape of the context value
interface UserContextValue {
  user: any;
  setUser: (user: any) => void;
}

// Create the UserContext with an initial value
const UserContext = createContext<UserContextValue>({
  user: null,
  setUser: () => {},
});

const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser(); 
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]); 

  const updateUser = (user: any) => {
    setCurrentUser(user);
  };

  return (
    <UserContext.Provider value={{ user: currentUser, setUser: updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
export { UserContext };
