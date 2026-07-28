"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
  Camera,
  ScanLine,
  Loader2,
  Store,
} from "lucide-react"
import { motion } from "framer-motion"

import AuthStatusCard from "@/components/AuthStatusCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  getCurrentUser,
  getFriendlySupabaseError,
  type AuthCheck,
} from "@/lib/auth-state"
import { checkClientRateLimit, getRateLimitMessage } from "@/lib/rate-limit"
import { supabase } from "@/lib/supabase"

type PantryItem = {
  id: string
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

type BarcodeDetectorResult = {
  rawValue: string
}

type BarcodeDetectorInstance = {
  detect: (image: CanvasImageSource) => Promise<BarcodeDetectorResult[]>
}

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[]
}) => BarcodeDetectorInstance

type OpenFoodFactsLookup = {
  name: string
  brand: string
  category: string
  error?: string
}

type StoreLocation = {
  id: string
  name: string
  lat: number
  lon: number
  shopType: string
  distanceMiles: number
  address: string
  openingHours: string
  website: string
  phone: string
  googleMapsUri: string
  rating: number | null
  userRatingCount: number | null
  availability: string
  availabilitySource: string
}

const buttonMotion = {
  whileHover: { scale: 1.03, y: -1 },
  whileTap: { scale: 0.97, y: 0 },
  transition: { type: "spring", stiffness: 420, damping: 28 },
} as const

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor
  }
}

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
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([])
  const [newItem, setNewItem] = useState("")
  const [category, setCategory] = useState("Other")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingPantry, setLoadingPantry] = useState(true)
  const [savingPantry, setSavingPantry] = useState(false)
  const [notice, setNotice] = useState("")
  const [authState, setAuthState] = useState<AuthCheck | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannerStatus, setScannerStatus] = useState("")
  const [manualBarcode, setManualBarcode] = useState("")
  const [scanningProduct, setScanningProduct] = useState(false)
  const [radiusMiles, setRadiusMiles] = useState(5)
  const [storeFinderIngredient, setStoreFinderIngredient] = useState("")
  const [storeFinderStatus, setStoreFinderStatus] = useState("")
  const [storeFinderLoading, setStoreFinderLoading] = useState(false)
  const [nearbyStores, setNearbyStores] = useState<StoreLocation[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanFrameRef = useRef<number | null>(null)

  useEffect(() => {
    async function loadUserPantry() {
      const userCheck = await getCurrentUser()

      if (!userCheck.ok) {
        setAuthState(userCheck)
        setLoadingPantry(false)
        return
      }

      setUserId(userCheck.user.id)

      try {
        await loadPantryItems(userCheck.user.id)
      } catch (error) {
        setNotice(getFriendlySupabaseError(error))
      } finally {
        setLoadingPantry(false)
      }
    }

    loadUserPantry()
  }, [])

  useEffect(() => {
    if (!scannerOpen) {
      stopBarcodeScanner()
      return
    }

    startBarcodeScanner()

    return () => stopBarcodeScanner()
  }, [scannerOpen])

  function stopBarcodeScanner() {
    if (scanFrameRef.current) {
      window.cancelAnimationFrame(scanFrameRef.current)
      scanFrameRef.current = null
    }

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  async function startBarcodeScanner() {
    setScannerStatus("")

    if (!window.BarcodeDetector) {
      setScannerStatus(
        "Camera scanning is not supported in this browser. Enter the barcode below instead."
      )
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerStatus("Camera access is not available. Enter the barcode below instead.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      const detector = new window.BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e"],
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      const scanFrame = async () => {
        if (!videoRef.current || scanningProduct) {
          scanFrameRef.current = window.requestAnimationFrame(scanFrame)
          return
        }

        try {
          const barcodes = await detector.detect(videoRef.current)
          const barcode = barcodes[0]?.rawValue

          if (barcode) {
            const productWasAdded = await lookupAndAddBarcode(barcode)

            if (!productWasAdded) {
              scanFrameRef.current = window.requestAnimationFrame(scanFrame)
            }

            return
          }
        } catch {
          setScannerStatus("Could not read the barcode. Try centering it in the frame.")
        }

        scanFrameRef.current = window.requestAnimationFrame(scanFrame)
      }

      scanFrameRef.current = window.requestAnimationFrame(scanFrame)
    } catch {
      setScannerStatus("Camera permission was blocked. Enter the barcode below instead.")
    }
  }

  async function loadPantryItems(nextUserId: string) {
    const { data, error } = await supabase
      .from("pantry_items")
      .select("id, name, category")
      .eq("user_id", nextUserId)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    setPantryItems(data ?? [])
  }

  const normalizedPantry = useMemo(
    () => pantryItems.map((item) => item.name.toLowerCase()),
    [pantryItems]
  )

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
  }, [normalizedPantry])

  async function savePantryItem(itemName: string, itemCategory = category) {
    const trimmedItem = itemName.trim().toLowerCase()

    if (!trimmedItem) return false

    if (!userId) {
      setNotice("Sign in with Google before saving pantry items.")
      return false
    }

    const alreadyExists = pantryItems.some(
      (item) => item.name.toLowerCase() === trimmedItem
    )

    if (alreadyExists) {
      setNewItem("")
      setNotice("That ingredient is already in your pantry.")
      return false
    }

    const rateLimit = checkClientRateLimit({
      key: `pantry-add:${userId}`,
      maxAttempts: 12,
      windowMs: 60_000,
    })

    if (!rateLimit.allowed) {
      setNotice(getRateLimitMessage("adding pantry items", rateLimit.retryAfterSeconds))
      return false
    }

    setSavingPantry(true)
    setNotice("")

    const { data, error } = await supabase
      .from("pantry_items")
      .insert({
        user_id: userId,
        name: trimmedItem,
        item_key: trimmedItem,
        category: itemCategory,
      })
      .select("id, name, category")
      .single()

    setSavingPantry(false)

    if (error) {
      setNotice(
        error.code === "23505"
          ? "That ingredient is already in your pantry."
          : getFriendlySupabaseError(error)
      )
      return false
    }

    setPantryItems((prev) => [data, ...prev])
    return true
  }

  async function addPantryItem() {
    const saved = await savePantryItem(newItem, category)

    if (!saved) return

    setNewItem("")
    setCategory("Other")
  }

  async function lookupAndAddBarcode(barcode: string) {
    const cleanBarcode = barcode.trim()

    if (!cleanBarcode || scanningProduct) return false

    const lookupLimit = checkClientRateLimit({
      key: `barcode-lookup:${userId ?? "guest"}`,
      maxAttempts: 10,
      windowMs: 60_000,
    })

    if (!lookupLimit.allowed) {
      setScannerStatus(
        getRateLimitMessage("scanning barcodes", lookupLimit.retryAfterSeconds)
      )
      return false
    }

    setScanningProduct(true)
    setScannerStatus(`Looking up barcode ${cleanBarcode}...`)

    try {
      const response = await fetch(`/api/open-food-facts/${encodeURIComponent(cleanBarcode)}`)
      const data = (await response.json()) as OpenFoodFactsLookup

      if (!response.ok || data.error) {
        setScannerStatus(data.error || "Could not find that product.")
        setScanningProduct(false)
        return false
      }

      const saved = await savePantryItem(data.name, data.category || "Other")

      if (saved) {
        setNotice(`${data.name} was added to your pantry from OpenFoodFacts.`)
        setManualBarcode("")
        setScannerOpen(false)
        return true
      } else {
        setScannerStatus("That product was found, but it was not added.")
        return false
      }
    } catch {
      setScannerStatus("Could not look up that barcode. Try again in a moment.")
      return false
    } finally {
      setScanningProduct(false)
    }
  }

  async function removePantryItem(id: string) {
    if (!userId) {
      setNotice("Sign in with Google before changing pantry items.")
      return
    }

    const rateLimit = checkClientRateLimit({
      key: `pantry-remove:${userId}`,
      maxAttempts: 20,
      windowMs: 60_000,
    })

    if (!rateLimit.allowed) {
      setNotice(getRateLimitMessage("removing pantry items", rateLimit.retryAfterSeconds))
      return
    }

    const previousItems = pantryItems
    setPantryItems((prev) => prev.filter((item) => item.id !== id))

    const { error } = await supabase
      .from("pantry_items")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      setPantryItems(previousItems)
      setNotice(getFriendlySupabaseError(error))
    }
  }

  function getStoreSearchUrl(ingredient: string) {
    return `https://www.google.com/maps/search/${encodeURIComponent(
      ingredient + " near me"
    )}`
  }

  function openRecipe(recipe: Recipe) {
    setSelectedRecipe(recipe)
    setStoreFinderIngredient("")
    setStoreFinderStatus("")
    setNearbyStores([])
    setSelectedStoreId(null)
  }

  async function findNearbyStores(ingredient: string) {
    if (!navigator.geolocation) {
      setStoreFinderStatus("Location is not available in this browser.")
      return
    }

    const lookupLimit = checkClientRateLimit({
      key: `store-map:${userId ?? "guest"}`,
      maxAttempts: 8,
      windowMs: 60_000,
    })

    if (!lookupLimit.allowed) {
      setStoreFinderStatus(
        getRateLimitMessage("loading nearby stores", lookupLimit.retryAfterSeconds)
      )
      return
    }

    setStoreFinderIngredient(ingredient)
    setStoreFinderLoading(true)
    setStoreFinderStatus(`Finding stores near you for ${ingredient}...`)
    setNearbyStores([])
    setSelectedStoreId(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const params = new URLSearchParams({
            lat: String(position.coords.latitude),
            lon: String(position.coords.longitude),
            radiusMiles: String(radiusMiles),
            ingredient,
          })
          const response = await fetch(`/api/ingredient-stores?${params.toString()}`)
          const data = (await response.json()) as {
            stores?: StoreLocation[]
            error?: string
          }

          if (!response.ok || data.error) {
            setStoreFinderStatus(data.error || "Could not load nearby stores.")
            return
          }

          setNearbyStores(data.stores ?? [])
          setSelectedStoreId(data.stores?.[0]?.id ?? null)
          setStoreFinderStatus(
            data.stores?.length
              ? `Showing likely places to find ${ingredient}. Stock is not live.`
              : `No food stores found within ${radiusMiles} miles. Try a wider radius.`
          )
        } catch {
          setStoreFinderStatus("Could not load nearby stores. Try again in a moment.")
        } finally {
          setStoreFinderLoading(false)
        }
      },
      () => {
        setStoreFinderStatus("Allow location access to find nearby ingredients.")
        setStoreFinderLoading(false)
      },
      {
        enableHighAccuracy: false,
        maximumAge: 300_000,
        timeout: 8_000,
      }
    )
  }

  if (authState && !authState.ok) {
    return <AuthStatusCard title={authState.title} message={authState.message} />
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
                  {loadingPantry ? "..." : pantryItems.length}
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
                  disabled={savingPantry || loadingPantry}
                  className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {savingPantry ? "Saving..." : "Add item"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScannerOpen((open) => !open)}
                  disabled={loadingPantry}
                  className="w-full rounded-2xl border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                >
                  <ScanLine className="mr-2 h-4 w-4" />
                  {scannerOpen ? "Close scanner" : "Scan barcode"}
                </Button>

                {notice && (
                  <p className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-800">
                    {notice}
                  </p>
                )}
              </CardContent>
            </Card>

            {scannerOpen && (
              <Card className="rounded-3xl border-emerald-100 bg-white/80 shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-left-4 duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-emerald-600" />
                    Barcode scanner
                  </CardTitle>
                  <CardDescription>
                    Scan packaged food and BrokeBites will add it from OpenFoodFacts.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="overflow-hidden rounded-3xl border border-zinc-100 bg-zinc-950">
                    <video
                      ref={videoRef}
                      muted
                      playsInline
                      className="aspect-video w-full object-cover"
                    />
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                    {scanningProduct
                      ? "Reading product..."
                      : scannerStatus ||
                        "Point your camera at the barcode. Mac and cheese boxes work great here."}
                  </div>

                  <div className="space-y-3 rounded-2xl border border-zinc-100 bg-white p-4">
                    <p className="text-sm font-medium text-zinc-700">
                      Enter barcode manually
                    </p>
                    <div className="flex gap-2">
                      <Input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={manualBarcode}
                        onChange={(event) => setManualBarcode(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") lookupAndAddBarcode(manualBarcode)
                        }}
                        placeholder="Example: 021000658434"
                        className="rounded-2xl"
                      />
                      <Button
                        type="button"
                        onClick={() => lookupAndAddBarcode(manualBarcode)}
                        disabled={scanningProduct}
                        className="rounded-2xl bg-emerald-600 px-4 hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Scan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                  {loadingPantry ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
                      Loading your saved pantry...
                    </div>
                  ) : filteredPantry.length > 0 ? (
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
                              <span
                                key={ingredient}
                                className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium capitalize text-orange-700"
                              >
                                <MapPin className="h-3 w-3" />
                                {ingredient}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                              You have everything
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => openRecipe(recipe)}
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
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
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

            {selectedRecipe.ingredients.some(
              (ingredient) => !normalizedPantry.includes(ingredient.toLowerCase())
            ) && (
              <div className="mt-6 rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-zinc-950">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      Find missing ingredients nearby
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">
                      Choose a radius, then map stores that may carry the ingredient.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                    Radius
                    <select
                      value={radiusMiles}
                      onChange={(event) => setRadiusMiles(Number(event.target.value))}
                      className="h-9 rounded-full border border-emerald-200 bg-white px-3 text-xs outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    >
                      {[3, 5, 10, 15, 25].map((radius) => (
                        <option key={radius} value={radius}>
                          {radius} mi
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedRecipe.ingredients
                    .filter(
                      (ingredient) =>
                        !normalizedPantry.includes(ingredient.toLowerCase())
                    )
                    .map((ingredient) => (
                      <Button
                        key={ingredient}
                        type="button"
                        variant="outline"
                        onClick={() => findNearbyStores(ingredient)}
                        className="h-9 rounded-full border-emerald-200 bg-white px-3 text-xs font-semibold capitalize text-emerald-700 hover:bg-emerald-100"
                      >
                        <Store className="h-3 w-3" />
                        Map {ingredient}
                      </Button>
                    ))}
                </div>

                {storeFinderStatus && (
                  <div className="mt-4 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm leading-6 text-emerald-800">
                    {storeFinderLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {storeFinderStatus}
                      </span>
                    ) : (
                      storeFinderStatus
                    )}
                  </div>
                )}

                {nearbyStores.length > 0 && (
                  <div className="mt-4">
                    <IngredientStoreMap
                      ingredient={storeFinderIngredient}
                      stores={nearbyStores}
                      selectedStoreId={selectedStoreId}
                      onSelectStore={setSelectedStoreId}
                      getStoreSearchUrl={getStoreSearchUrl}
                    />
                  </div>
                )}
              </div>
            )}

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

function IngredientStoreMap({
  ingredient,
  stores,
  selectedStoreId,
  onSelectStore,
  getStoreSearchUrl,
}: {
  ingredient: string
  stores: StoreLocation[]
  selectedStoreId: string | null
  onSelectStore: (storeId: string) => void
  getStoreSearchUrl: (ingredient: string) => string
}) {
  const selectedStore =
    stores.find((store) => store.id === selectedStoreId) ?? stores[0]
  const latitudes = stores.map((store) => store.lat)
  const longitudes = stores.map((store) => store.lon)
  const minLat = Math.min(...latitudes)
  const maxLat = Math.max(...latitudes)
  const minLon = Math.min(...longitudes)
  const maxLon = Math.max(...longitudes)
  const latRange = maxLat - minLat || 0.01
  const lonRange = maxLon - minLon || 0.01

  function getMarkerPosition(store: StoreLocation) {
    return {
      left: `${8 + ((store.lon - minLon) / lonRange) * 84}%`,
      top: `${92 - ((store.lat - minLat) / latRange) * 84}%`,
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5_0%,#f8fafc_52%,#fff7ed_100%)]">
        <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(16,185,129,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
          Fast store map
        </div>

        {stores.map((store) => {
          const isSelected = store.id === selectedStore.id

          return (
            <motion.button
              {...buttonMotion}
              key={store.id}
              type="button"
              onClick={() => onSelectStore(store.id)}
              className={`absolute z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-lg transition hover:scale-110 ${
                isSelected
                  ? "border-emerald-700 bg-emerald-600 text-white"
                  : "border-white bg-orange-500 text-white"
              }`}
              style={getMarkerPosition(store)}
              aria-label={`Show ${store.name}`}
            >
              <Store className="h-5 w-5" />
            </motion.button>
          )
        })}

        {selectedStore && (
          <div className="absolute bottom-4 left-4 right-4 z-20 rounded-3xl border border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-zinc-950">{selectedStore.name}</p>
                <p className="mt-1 text-xs capitalize text-zinc-500">
                  {selectedStore.shopType} • {selectedStore.distanceMiles} mi away
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                likely
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-600">
              {selectedStore.availability}
            </p>
            <p className="mt-2 text-xs font-medium text-zinc-500">
              Source: {selectedStore.availabilitySource}
            </p>
            <a
              href={
                selectedStore.googleMapsUri ||
                getStoreSearchUrl(`${ingredient} ${selectedStore.name}`)
              }
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-full bg-zinc-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-500"
            >
              Open directions
            </a>
          </div>
        )}
      </div>

      <div className="flex max-h-[320px] flex-col gap-3 overflow-y-auto pr-1">
        {stores.map((store) => (
          <motion.button
            {...buttonMotion}
            key={store.id}
            type="button"
            onClick={() => onSelectStore(store.id)}
            className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
              store.id === selectedStore.id
                ? "border-emerald-200 bg-emerald-50"
                : "border-zinc-100 bg-white hover:border-orange-100 hover:bg-orange-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-950">{store.name}</p>
                <p className="mt-1 text-xs capitalize text-zinc-500">
                  {store.shopType} • {store.distanceMiles} mi
                </p>
                {store.rating ? (
                  <p className="mt-1 text-xs text-amber-700">
                    {store.rating} stars
                    {store.userRatingCount ? ` • ${store.userRatingCount} reviews` : ""}
                  </p>
                ) : null}
              </div>
              <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
            </div>

            {store.address && (
              <p className="mt-2 text-xs leading-5 text-zinc-500">{store.address}</p>
            )}
            {store.openingHours && (
              <p className="mt-2 text-xs leading-5 text-emerald-700">
                Hours: {store.openingHours}
              </p>
            )}
            {store.phone && (
              <p className="mt-2 text-xs leading-5 text-zinc-500">Phone: {store.phone}</p>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
