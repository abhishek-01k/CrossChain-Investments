import { useQuery } from '@tanstack/react-query'

export const useListContacts = (supabase, userId) => {
  return useQuery({
    queryKey: ['contacts', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name', { ascending: true })
      if (error) {
        throw new Error(error.message ?? 'Error fetching contacts')
      }
      return data
    }
  })
}
