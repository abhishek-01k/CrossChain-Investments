import { useQuery } from '@tanstack/react-query'

export const useListWallets = () => {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/wallets`, {
        method: 'GET'
      })
      if (!response.ok) {
        throw new Error('Unable to list wallets')
      }
      return await response.json()
    },
    retry: false
  })
}

export const useGetWalletBalances = (id) => {
  return useQuery({
    queryKey: ['wallet', id, 'balances'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/wallets/${id}/balances`, {
        method: 'GET'
      })
      if (!response.ok) {
        throw new Error('Unable to get wallet info')
      }
      return await response.json()
    },
    retry: false
  })
}

export const useGetWalletNfts = (id) => {
  return useQuery({
    queryKey: ['wallet', id, 'nfts'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/wallets/${id}/nfts`, {
        method: 'GET'
      })
      if (!response.ok) {
        throw new Error('Unable to get wallet info')
      }
      return await response.json()
    },
    retry: false
  })
}
