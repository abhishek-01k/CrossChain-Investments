import { title } from "process"

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Alvara Xchain Investments",
  description: "Investment Strategies for the Future powered by AI",
  mainNav: [
    {
      title : "Explore",
      href: "/getstarted",
    },
    {
      title: "Alva Chart",
      href: "/charts",
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
