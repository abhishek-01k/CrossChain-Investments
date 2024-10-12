import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

export function FacebookIcon (props) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="facebook"
      className="w-4 h-4"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.8 90.69 226.4 209.3 245V327.7h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.3 482.4 504 379.8 504 256z"
      />
    </svg>
  )
}

export function FacebookButton (props) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const { toast } = useToast()

  const handleLoginWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: process.env.NEXT_PUBLIC_HOST
      }
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
    <div className="my-4">
      <Button
        variant="outline"
        className="w-full bg-[#4267b2] text-white hover:bg-[#3a5a9b]"
        onClick={handleLoginWithFacebook}
        {...props}
      >
        <FacebookIcon className="mr-2" />
        Login with Facebook
      </Button>
    </div>
  )
}
