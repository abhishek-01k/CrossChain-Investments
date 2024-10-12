import { List, Title, Text } from '@mantine/core'

export function ContactList ({ contacts }) {
  return (
    <ul className="divide-y divide-gray-200">
      {contacts?.map((contact) => (
        <li
          key={contact.id}
          className="py-2 px-4 cursor-pointer hover:bg-gray-50"
        >
          <h4 className="text-lg font-semibold">{contact.name}</h4>
          <p className="text-sm text-gray-600">{contact.address}</p>
        </li>
      ))}
    </ul>
  )
}
