"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  ChefHat,
  Home,
  Refrigerator,
  ShoppingBasket,
  Bot,
  User,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Recipes",
    href: "/recipes",
    icon: ChefHat,
  },
  {
    name: "Pantry",
    href: "/pantry",
    icon: Refrigerator,
  },
  {
    name: "Shopping",
    href: "/shopping",
    icon: ShoppingBasket,
  },
  {
    name: "SmartBot",
    href: "/smartbot",
    icon: Bot,
  },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: -8, scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-sm"
          >
            <ChefHat size={22} />
          </motion.div>

          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight">
              BrokeBites
            </span>
            <span className="text-xs text-muted-foreground">
              cheap eats, easy cooking
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-orange-600"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={17} />
                  {item.name}

                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-orange-100"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User size={19} />
            </Button>
          </Link>

          <Link href="/recipes">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button className="rounded-full bg-orange-500 px-5 hover:bg-orange-600">
                Find meals
              </Button>
            </motion.div>
          </Link>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu size={22} />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-72">
              <div className="mt-8 flex flex-col gap-3">
                <Link href="/" className="mb-4 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-white">
                    <ChefHat size={22} />
                  </div>
                  <div>
                    <p className="font-bold">BrokeBites</p>
                    <p className="text-xs text-muted-foreground">
                      cook cheap, eat better
                    </p>
                  </div>
                </Link>

                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-orange-100 text-orange-600"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon size={18} />
                      {item.name}
                    </Link>
                  )
                })}

                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <User size={18} />
                  Profile
                </Link>

                <Link href="/recipes" className="mt-4">
                  <Button className="w-full rounded-full bg-orange-500 hover:bg-orange-600">
                    Find budget meals
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}