'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { Combobox, InputBase, useCombobox, Loader } from '@mantine/core'
import { useListContacts } from '@/app/hooks/contacts'
import { useAuthContext } from '@/app/hooks/auth'

export function AddressInput ({ onBlur, onChange, ...props }) {
  const supabase = createClientComponentClient()
  const { user } = useAuthContext()
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption()
  })

  const { data, isLoading } = useListContacts(supabase, user?.id)
  const [value, setValue] = useState(null)
  const [search, setSearch] = useState('')

  const exactOptionMatch = data?.some((item) => item.name.toLowerCase() === (search.name || search).toLowerCase().trim())
  const filteredOptions = data?.filter((item) => item.name.toLowerCase().includes((search.name || search).toLowerCase().trim()))

  const options = filteredOptions.map((item) => (
    <Combobox.Option value={item} key={item.address}>
      {item.name}
    </Combobox.Option>
  ))

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        if (val === '$custom') {
          setValue({ name: search, address: search })
        } else {
          setValue(val)
          setSearch(val)
        }
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        <InputBase
          rightSection={isLoading ? <Loader size={18} /> : <Combobox.Chevron />}
          placeholder="Search value"
          rightSectionPointerEvents="none"
          {...props}
          value={search.name || search}
          onBlur={() => {
            combobox.closeDropdown()
            setSearch(value?.name || value || '')
            onChange(value?.address || '')
            onBlur()
          }}
          onChange={(event) => {
            combobox.openDropdown()
            combobox.updateSelectedOptionIndex()
            setSearch(event.currentTarget.value)
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options}
          {!exactOptionMatch && search.trim().length > 0 && (
            <Combobox.Option value="$custom">{search}</Combobox.Option>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
