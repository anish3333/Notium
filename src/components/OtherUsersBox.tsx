"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "@clerk/clerk-sdk-node";
import { useUser } from "@clerk/nextjs";

export default function OtherUsersBox({value, setValue, users}: {value: User | null, setValue: any, users: User[]}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between text-gray-950"
        >
          {value
            ? users.find((user) => user.username === value.username)?.username
            : "Select user..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Collaborate with others..." />
          <CommandList>
            {/* <CommandEmpty>No user found.</CommandEmpty> */}
            <CommandGroup>
              {users.length && users?.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.username || ""}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value?.username ? null : user);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.username === user.username ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {user.username}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
