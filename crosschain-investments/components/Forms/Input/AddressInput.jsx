'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { useListContacts } from '@/app/hooks/contacts'
import { useAuthContext } from '@/app/hooks/auth'
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Loader2 } from "lucide-react"

export function AddressInput ({ onBlur, onChange, ...props }) {
  const supabase = createClientComponentClient()
  const { user } = useAuthContext()

  const { data, isLoading } = useListContacts(supabase, user?.id)
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)

  const filteredOptions = data?.filter((item) => 
    item.name.toLowerCase().includes(value.toLowerCase()) ||
    item.address.toLowerCase().includes(value.toLowerCase())
  ) || []

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          {...props}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            onChange(e.target.value)
          }}
          onBlur={() => {
            setOpen(false)
            onBlur()
          }}
          onClick={() => setOpen(true)}
        />
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search address..." />
          <CommandEmpty>No address found.</CommandEmpty>
          <CommandGroup>
            {isLoading ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              filteredOptions.map((item) => (
                <CommandItem
                  key={item.address}
                  onSelect={() => {
                    setValue(item.address)
                    onChange(item.address)
                    setOpen(false)
                  }}
                >
                  {item.name} ({item.address})
                </CommandItem>
              ))
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
