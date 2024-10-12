'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from '@mantine/form'

import { AnonOnly, FacebookButton } from '@/app/components/Auth'
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Login () {
  const form = useForm({
    initialValues: {
      email: '',
      password: ''
    }
  })
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const handleLogin = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      toast({
        variant: "destructive",
        title: "Error logging in",
        description: error.message,
      })
    }
    router.refresh()
  }

  return (
    <AnonOnly>
      <div className="max-w-sm mx-auto mt-[30vh]">
        <form onSubmit={form.onSubmit(handleLogin)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.getInputProps('email')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...form.getInputProps('password')}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Login</Button>
          </div>
        </form>
        <FacebookButton />
        <p className="text-center mt-4">
          Don&apos;t have an account?{' '}
          <Link
            className="text-blue-600 underline"
            href={'/register'}
          >
            Register here
          </Link>
        </p>
      </div>
    </AnonOnly>
  )
}
