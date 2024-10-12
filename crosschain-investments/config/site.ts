import { title } from "process"

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "CrossChain Investments",
  description: "Investment Strategies for the Investors powered by AI",
  mainNav: [
    {
      title : "Explore",
      href: "/getstarted",
    },
    {
      title: "Circle Wallet",
      href: "/wallet",
    },
    {
      title: "Portfolio",
      href: "/portfolio",
    },
    {
      title: "Create an AI Investment Bot",
      href: "/createaibot",
    },
    {
      title: "Bridge CrossChain",
      href: "/bridge",
    }
  ],
  links: {
    twitter: "https://x.com/0xkamal7",
  },
}
