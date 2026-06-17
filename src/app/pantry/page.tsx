"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Plus,
  Trash2,
  Search,
  ShoppingBasket,
  ChefHat,
  Clock,
  DollarSign,
  MapPin,
  X,
  Eye,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

type PantryItem = {
  id: number
  name: string
  category: string
}

type Recipe = {
  id: number
  title: string
  description: string
  time: string
  price: string
  difficulty: string
  ingredients: string[]
  steps: string[]
}

const starterPantry: PantryItem[] = [
  { id: 1, name: "rice", category: "Grain" },
  { id: 2, name: "eggs", category: "Protein" },
  { id: 3, name: "beans", category: "Protein" },
  { id: 4, name: "pasta", category: "Grain" },
  { id: 5, name: "butter", category: "Dairy" },
]

const recipes: Recipe[] = [
  {
    id: 1,
    title: "Lazy Egg Fried Rice",
    description: "A cheap dorm-friendly meal using rice, eggs, and basic seasonings.",
    time: "15 min",
    price: "$2.50",
    difficulty: "Beginner",
    ingredients: ["rice", "eggs", "soy sauce", "frozen vegetables", "butter"],
    steps: [
      "Heat butter in a pan on medium heat.",
      "Add cooked rice and stir until warm.",
      "Push rice to the side and scramble eggs in the pan.",
      "Mix everything together.",
      "Add soy sauce and frozen vegetables.",
      "Cook until vegetables are hot.",
    ],
  },
  {
    id: 2,
    title: "Bean & Cheese Quesadilla",
    description: "A filling meal with barely any prep and very little cleanup.",
    time: "10 min",
    price: "$1.75",
    difficulty: "Beginner",
    ingredients: ["tortilla", "beans", "cheese", "hot sauce"],
    steps: [
      "Spread beans on one half of a tortilla.",
      "Add cheese on top.",
      "Fold the tortilla in half.",
      "Cook in a pan until crispy on both sides.",
      "Add hot sauce before serving.",
    ],
  },
  {
    id: 3,
    title: "Creamy Butter Pasta",
    description: "Simple comfort food for when you only have pantry basics.",
    time: "12 min",
    price: "$2.00",
    difficulty: "Beginner",
    ingredients: ["pasta", "butter", "garlic powder", "parmesan", "black pepper"],
    steps: [
      "Boil pasta until soft.",
      "Save a little pasta water before draining.",
      "Add butter to the warm pasta.",
      "Mix in garlic powder, parmesan, and black pepper.",
      "Add a splash of pasta water to make it creamy.",
    ],
  },
  {
    id: 4,
    title: "Microwave Rice Bowl",
    description: "A fast meal for students with limited kitchen access.",
    time: "8 min",
    price: "$3.00",
    difficulty: "No-stove",
    ingredients: ["rice", "beans", "cheese", "salsa", "corn"],
    steps: [
      "Add rice and beans to a microwave-safe bowl.",
      "Microwave until hot.",
      "Top with cheese, salsa, and corn.",
      "Microwave again for 30 seconds if you want it melted.",
    ],
  },
]

const categories = [
  "Grain",
  "Protein",
  "Vegetable",
  "Fruit",
  "Dairy",
  "Sauce",
  "Seasoning",
  "Snack",
  "Other",
]

export default function PantryPage() {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(starterPantry)
  const [newItem, setNewItem] = useState("")
  const [category, setCategory] = useState("Other")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  const normalizedPantry = pantryItems.map((item) => item.name.toLowerCase())

  const filteredPantry = pantryItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const recipeMatches = useMemo(() => {
    return recipes.map((recipe) => {
      const owned = recipe.ingredients.filter((ingredient) =>
        normalizedPantry.includes(ingredient.toLowerCase())
      )

      const missing = recipe.ingredients.filter(
        (ingredient) => !normalizedPantry.includes(ingredient.toLowerCase())
      )

      const matchPercent = Math.round(
        (owned.length / recipe.ingredients.length) * 100
      )

      return {
        ...recipe,
        owned,
        missing,
        matchPercent,
      }
    })
  }, [pantryItems])

  function addPantryItem() {
    const trimmedItem = newItem.trim().toLowerCase()

    if (!trimmedItem) return

    const alreadyExists = pantryItems.some(
      (item) => item.name.toLowerCase() === trimmedItem
    )

    if (alreadyExists) {
      setNewItem("")
      return
    }

    setPantryItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: trimmedItem,
        category,
      },
    ])

    setNewItem("")
    setCategory("Other")
  }

  function removePantryItem(id: number) {
    setPantryItems((prev) => prev.filter((item) => item.id !== id))
  }

  function getStoreSearchUrl(ingredient: string) {
    return `https://www.google.com/maps/search/${encodeURIComponent(
      ingredient + " near me"
    )}`
  }

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-emerald-50 px-4 py-8 text-zinc-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-white/80 p-8 shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
                <Sparkles className="h-4 w-4" />
                BrokeBites Pantry
              </div>

              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                Cook with what you already have.
              </h1>

              <p className="mt-4 text-lg text-zinc-600">
                Add your pantry items, discover cheap beginner recipes, and find
                missing ingredients near you.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button className="rounded-full bg-orange-500 px-6 hover:bg-orange-600">
                  <ChefHat className="mr-2 h-4 w-4" />
                  Find recipes
                </Button>

                <Link href="/">
                  <Button
                    variant="outline"
                    className="rounded-full border-orange-200 bg-white/70 px-6"
                  >
                    Back home
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="w-full max-w-sm rounded-3xl border-orange-100 bg-white/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBasket className="h-5 w-5 text-orange-500" />
                  Pantry score
                </CardTitle>
                <CardDescription>
                  More pantry items means better recipe matches.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="text-5xl font-bold text-orange-500">
                  {pantryItems.length}
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  ingredients saved
                </p>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-orange-100">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all duration-700"
                    style={{
                      width: `${Math.min(pantryItems.length * 10, 100)}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="flex flex-col gap-6">
            <Card className="rounded-3xl border-orange-100 bg-white/80 shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-left-4 duration-700">
              <CardHeader>
                <CardTitle>Add pantry item</CardTitle>
                <CardDescription>
                  Start with simple things like rice, eggs, pasta, beans, or sauce.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Input
                  value={newItem}
                  onChange={(event) => setNewItem(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addPantryItem()
                  }}
                  placeholder="Example: rice"
                  className="rounded-2xl"
                />

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                >
                  {categories.map((categoryOption) => (
                    <option key={categoryOption} value={categoryOption}>
                      {categoryOption}
                    </option>
                  ))}
                </select>

                <Button
                  onClick={addPantryItem}
                  className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add item
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-orange-100 bg-white/80 shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-left-4 duration-700">
              <CardHeader>
                <CardTitle>Your pantry</CardTitle>
                <CardDescription>
                  Remove items when you run out.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search pantry"
                    className="rounded-2xl pl-10"
                  />
                </div>

                <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
                  {filteredPantry.length > 0 ? (
                    filteredPantry.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                      >
                        <div>
                          <p className="font-medium capitalize">{item.name}</p>
                          <p className="text-xs text-zinc-500">
                            {item.category}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePantryItem(item.id)}
                          className="rounded-full text-zinc-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
                      No pantry items found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold">Recipe matches</h2>
              <p className="mt-1 text-zinc-600">
                BrokeBites ranks recipes by what you already own.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {recipeMatches
                .sort((a, b) => b.matchPercent - a.matchPercent)
                .map((recipe) => (
                  <Card
                    key={recipe.id}
                    className="group overflow-hidden rounded-3xl border-orange-100 bg-white/80 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4"
                  >
                    <CardHeader>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                          {recipe.matchPercent}% match
                        </span>

                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                          {recipe.difficulty}
                        </span>
                      </div>

                      <CardTitle>{recipe.title}</CardTitle>
                      <CardDescription>{recipe.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 rounded-2xl bg-zinc-50 p-3">
                          <Clock className="h-4 w-4 text-zinc-500" />
                          {recipe.time}
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl bg-zinc-50 p-3">
                          <DollarSign className="h-4 w-4 text-zinc-500" />
                          {recipe.price}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-sm font-medium text-zinc-700">
                          You have
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {recipe.owned.length > 0 ? (
                            recipe.owned.map((ingredient) => (
                              <span
                                key={ingredient}
                                className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700"
                              >
                                {ingredient}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-zinc-400">
                              Nothing yet
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-sm font-medium text-zinc-700">
                          Missing
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {recipe.missing.length > 0 ? (
                            recipe.missing.map((ingredient) => (
                              <a
                                key={ingredient}
                                href={getStoreSearchUrl(ingredient)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium capitalize text-orange-700 transition hover:bg-orange-100"
                              >
                                <MapPin className="h-3 w-3" />
                                {ingredient}
                              </a>
                            ))
                          ) : (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                              You have everything
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => setSelectedRecipe(recipe)}
                        className="w-full rounded-2xl bg-zinc-900 transition duration-300 hover:bg-orange-500"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View recipe
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </section>
      </div>

      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedRecipe(null)}
              className="absolute right-4 top-4 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="pr-10">
              <span className="mb-3 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                BrokeBites Recipe
              </span>

              <h3 className="text-3xl font-bold">{selectedRecipe.title}</h3>
              <p className="mt-2 text-zinc-600">{selectedRecipe.description}</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-zinc-50 p-4">
                <p className="text-xs text-zinc-500">Time</p>
                <p className="font-semibold">{selectedRecipe.time}</p>
              </div>

              <div className="rounded-2xl bg-zinc-50 p-4">
                <p className="text-xs text-zinc-500">Cost</p>
                <p className="font-semibold">{selectedRecipe.price}</p>
              </div>

              <div className="rounded-2xl bg-zinc-50 p-4">
                <p className="text-xs text-zinc-500">Level</p>
                <p className="font-semibold">{selectedRecipe.difficulty}</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold">Ingredients</h4>

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedRecipe.ingredients.map((ingredient) => {
                  const isOwned = normalizedPantry.includes(
                    ingredient.toLowerCase()
                  )

                  return (
                    <span
                      key={ingredient}
                      className={
                        isOwned
                          ? "rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium capitalize text-emerald-700"
                          : "rounded-full bg-orange-50 px-3 py-1 text-sm font-medium capitalize text-orange-700"
                      }
                    >
                      {ingredient}
                    </span>
                  )
                })}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold">Steps</h4>

              <ol className="mt-3 space-y-3">
                {selectedRecipe.steps.map((step, index) => (
                  <li
                    key={step}
                    className="flex gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm text-zinc-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}