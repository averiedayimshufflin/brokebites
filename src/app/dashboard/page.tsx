"use client";

import { useEffect, useState } from "react";
import AuthStatusCard from "@/components/AuthStatusCard";
import { getCurrentUser, getFriendlySupabaseError, type AuthCheck } from "@/lib/auth-state";
import { supabase } from "@/lib/supabase";

const quickFilters = [
  "Under 10 min",
  "Under $5",
  "Microwave only",
  "High protein",
  "Use my pantry",
];

type Recipe = {
  name: string;
  description: string;
  time: string;
  price: string;
  tags: string[];
  ingredients?: string[];
  steps?: string[];
};

type FoodProfile = {
  equipment: string[];
  goals: string[];
  dietary_needs: string[];
  stores: string[];
};

const recipeDetails: Record<string, Pick<Recipe, "ingredients" | "steps">> = {
  "Egg Fried Rice": {
    ingredients: ["1 cup cooked rice", "1 egg", "Frozen vegetables", "Soy sauce", "Oil or butter"],
    steps: [
      "Heat a pan or microwave-safe bowl with a little oil or butter.",
      "Scramble the egg, then mix in rice and frozen vegetables.",
      "Add soy sauce, stir well, and heat until everything is hot.",
    ],
  },
  "Ramen Egg Bowl": {
    ingredients: ["1 pack instant ramen", "1 egg", "Water", "Optional toppings"],
    steps: [
      "Cook ramen according to the package directions.",
      "Add the egg during the last minute and stir or let it poach.",
      "Add toppings like frozen vegetables, chili flakes, or leftover meat.",
    ],
  },
  "Peanut Noodles": {
    ingredients: ["Noodles", "1 spoon peanut butter", "Soy sauce", "Chili flakes", "Hot water"],
    steps: [
      "Cook the noodles and save a little hot noodle water.",
      "Mix peanut butter, soy sauce, chili flakes, and hot water into a sauce.",
      "Toss noodles with the sauce until coated.",
    ],
  },
  "Microwave Egg Rice": {
    ingredients: ["Cooked rice", "1 egg", "Soy sauce", "Frozen vegetables"],
    steps: [
      "Put rice and frozen vegetables in a microwave-safe bowl.",
      "Crack in the egg and stir well.",
      "Microwave in 45-second bursts, stirring until the egg is fully cooked.",
    ],
  },
  "Rice Cooker Egg Bowl": {
    ingredients: ["Rice", "1 egg", "Water", "Soy sauce", "Optional vegetables"],
    steps: [
      "Cook rice in your rice cooker.",
      "When the rice is almost done, crack an egg on top and close the lid.",
      "Season with soy sauce and add vegetables if you have them.",
    ],
  },
  "Spicy Peanut Ramen": {
    ingredients: ["1 pack ramen", "Peanut butter", "Soy sauce", "Chili flakes", "Hot water"],
    steps: [
      "Cook ramen and drain most of the water.",
      "Stir peanut butter, soy sauce, chili flakes, and a splash of hot water into a sauce.",
      "Mix the noodles into the sauce until creamy.",
    ],
  },
  "High-Protein Ramen": {
    ingredients: ["1 pack ramen", "1 egg or tuna", "Frozen vegetables", "Water"],
    steps: [
      "Cook ramen as usual.",
      "Add egg, tuna, or another protein near the end.",
      "Stir in frozen vegetables and heat until warm.",
    ],
  },
  "Microwave Potato Bowl": {
    ingredients: ["1 potato", "Cheese or beans", "Salt", "Pepper", "Optional sauce"],
    steps: [
      "Poke holes in the potato with a fork.",
      "Microwave for 5 to 8 minutes, flipping halfway through.",
      "Split it open and add toppings like beans, cheese, or sauce.",
    ],
  },
  "Tuna Rice Bowl": {
    ingredients: ["Cooked rice", "1 can tuna", "Soy sauce or mayo", "Optional vegetables"],
    steps: [
      "Warm the rice in a bowl.",
      "Drain tuna and place it on top.",
      "Add soy sauce, mayo, or whatever seasoning you have.",
    ],
  },
};

const recommendedRecipes: Recipe[] = [
  {
    name: "Egg Fried Rice",
    description: "Uses eggs, rice, soy sauce, and frozen veggies.",
    time: "10 min",
    price: "$2.10",
    tags: ["Under $5", "High protein"],
  },
  {
    name: "Ramen Egg Bowl",
    description: "Instant ramen upgraded with egg and pantry toppings.",
    time: "8 min",
    price: "$1.75",
    tags: ["Under 10 min", "Microwave only"],
  },
  {
    name: "Peanut Noodles",
    description: "Noodles, peanut butter, soy sauce, and chili flakes.",
    time: "12 min",
    price: "$2.50",
    tags: ["Under $5", "Use my pantry"],
  },
].map((recipe) => ({ ...recipe, ...recipeDetails[recipe.name] }));

const savedMeals: Recipe[] = [
  {
    name: "Microwave Potato Bowl",
    description: "Cheap, filling, and easy after class.",
    time: "8 min",
    price: "$1.25",
    tags: ["Under 10 min", "Under $5", "Microwave only"],
  },
  {
    name: "Tuna Rice Bowl",
    description: "Good high-protein emergency meal.",
    time: "5 min",
    price: "$2.40",
    tags: ["Under 10 min", "Under $5", "High protein"],
  },
].map((recipe) => ({ ...recipe, ...recipeDetails[recipe.name] }));

function getProfileCacheKey(userId: string) {
  return `brokebites-food-profile:${userId}`;
}

function isFoodProfileEmpty(profile: FoodProfile) {
  return (
    profile.equipment.length === 0 &&
    profile.goals.length === 0 &&
    profile.dietary_needs.length === 0 &&
    profile.stores.length === 0
  );
}

function readCachedFoodProfile(userId: string): FoodProfile | null {
  try {
    const cachedProfile = window.localStorage.getItem(getProfileCacheKey(userId));

    if (!cachedProfile) {
      return null;
    }

    const parsedProfile = JSON.parse(cachedProfile) as FoodProfile;

    if (isFoodProfileEmpty(parsedProfile)) {
      return null;
    }

    return parsedProfile;
  } catch {
    return null;
  }
}

function cacheFoodProfile(userId: string, profile: FoodProfile) {
  if (isFoodProfileEmpty(profile)) {
    return;
  }

  try {
    window.localStorage.setItem(getProfileCacheKey(userId), JSON.stringify(profile));
  } catch {
    // Local backup failure should not block dashboard loading.
  }
}

export default function DashboardPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [authState, setAuthState] = useState<AuthCheck | null>(null);
  const [profileIsEmpty, setProfileIsEmpty] = useState(false);

  const [profile, setProfile] = useState<FoodProfile | null>(null);

  useEffect(() => {
    async function checkUser() {
      const userCheck = await getCurrentUser();

      if (!userCheck.ok) {
        setAuthState(userCheck);
        setLoading(false);
        return;
      }

      setEmail(userCheck.user.email ?? null);

      try {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("equipment, goals, dietary_needs, stores, onboarding_completed")
          .eq("id", userCheck.user.id)
          .maybeSingle();

        if (error) {
          setAuthState({
            ok: false,
            reason: "unavailable",
            title: "Could not load your profile",
            message: getFriendlySupabaseError(error),
          });
          setLoading(false);
          return;
        }

        if (!profileData?.onboarding_completed) {
          window.location.href = "/onboarding";
          return;
        }

        const savedProfile = {
          equipment: profileData.equipment ?? [],
          goals: profileData.goals ?? [],
          dietary_needs: profileData.dietary_needs ?? [],
          stores: profileData.stores ?? [],
        };
        const cachedProfile = readCachedFoodProfile(userCheck.user.id);
        const nextProfile =
          isFoodProfileEmpty(savedProfile) && cachedProfile
            ? cachedProfile
            : savedProfile;

        setProfile(nextProfile);
        setProfileIsEmpty(isFoodProfileEmpty(nextProfile));
        cacheFoodProfile(userCheck.user.id, nextProfile);

        setLoading(false);
      } catch {
        setAuthState({
          ok: false,
          reason: "unavailable",
          title: "Could not load your dashboard",
          message:
            "Supabase did not respond. Your recipes are safe; try refreshing in a moment.",
        });
        setLoading(false);
      }
    }

    checkUser();
  }, []);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } finally {
      window.location.href = "/sign-in";
    }
  }

  function handleFindMeals() {
    const typedIngredients = ingredients.toLowerCase();

    let results = recommendedRecipes;

    if (typedIngredients.includes("egg") || typedIngredients.includes("rice")) {
      results = [
        {
          name: "Egg Fried Rice",
          description: "Uses eggs, rice, soy sauce, and frozen veggies.",
          time: "10 min",
          price: "$2.10",
          tags: ["Under $5", "High protein"],
        },
        {
          name: "Microwave Egg Rice",
          description: "A fast bowl with rice, egg, and simple seasoning.",
          time: "6 min",
          price: "$1.90",
          tags: ["Under 10 min", "Microwave only", "Under $5"],
        },
        {
          name: "Rice Cooker Egg Bowl",
          description: "A low-effort meal if you have a rice cooker.",
          time: "12 min",
          price: "$2.25",
          tags: ["Under $5", "Use my pantry"],
        },
      ];
    }

    if (typedIngredients.includes("ramen")) {
      results = [
        {
          name: "Ramen Egg Bowl",
          description: "Instant ramen upgraded with egg and pantry toppings.",
          time: "8 min",
          price: "$1.75",
          tags: ["Under 10 min", "Microwave only"],
        },
        {
          name: "Spicy Peanut Ramen",
          description: "Ramen mixed with peanut butter, soy sauce, and chili.",
          time: "9 min",
          price: "$2.20",
          tags: ["Under 10 min", "Under $5", "Use my pantry"],
        },
        {
          name: "High-Protein Ramen",
          description: "Ramen with egg or tuna to make it more filling.",
          time: "10 min",
          price: "$2.80",
          tags: ["Under 10 min", "High protein"],
        },
      ];
    }

    results = results.map((recipe) => ({ ...recipe, ...recipeDetails[recipe.name] }));

    if (activeFilter) {
      results = results.filter((recipe) => recipe.tags.includes(activeFilter));
    }

    setSearchResults(results);
    setHasSearched(true);
  }

  const baseRecipes = hasSearched ? searchResults : recommendedRecipes;

  const filteredRecipes = activeFilter
    ? baseRecipes.filter((recipe) => recipe.tags.includes(activeFilter))
    : baseRecipes;

  if (authState && !authState.ok) {
    return (
      <AuthStatusCard title={authState.title} message={authState.message} />
    );
  }

  return (
    <main className="min-h-screen bg-orange-50 px-6 py-8">
      <section className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-600">BrokeBites</p>

            <h1 className="mt-2 text-3xl font-bold text-gray-950 sm:text-4xl">
              What do you have today?
            </h1>

            {loading ? (
              <p className="mt-2 text-gray-600">Checking your account...</p>
            ) : (
              <p className="mt-2 text-gray-600">
                Signed in as <span className="font-semibold text-gray-950">{email}</span>
              </p>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Log out
          </button>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <label className="text-sm font-medium text-gray-700">
            Enter ingredients you already have
          </label>

          <div className="mt-3 flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              placeholder="eggs, rice, ramen, peanut butter"
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-orange-500"
              value={ingredients}
              onChange={(event) => setIngredients(event.target.value)}
            />

            <button
              onClick={handleFindMeals}
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Find meals
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {quickFilters.map((filter) => {
              const isActive = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    setActiveFilter(isActive ? null : filter);
                  }}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-950">
                    {hasSearched ? "Meals you can make" : "Recommended for you"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    {hasSearched
                      ? `Based on: ${ingredients || "your ingredients"}`
                      : "Based on cheap, fast meals that fit your setup."}
                  </p>
                </div>

                {activeFilter && (
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                    {activeFilter}
                  </span>
                )}
              </div>

              {filteredRecipes.length > 0 ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.name}
                      recipe={recipe}
                      onView={() => setSelectedRecipe(recipe)}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-6 text-center">
                  <h3 className="font-semibold text-gray-950">No meals found yet.</h3>

                  <p className="mt-2 text-sm text-gray-600">
                    Try removing a filter or typing ingredients like eggs, rice, ramen, tuna, or pasta.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-950">Saved meals</h2>

                  <p className="mt-1 text-sm text-gray-600">
                    Meals you liked or want to make again.
                  </p>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {savedMeals.length} saved
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {savedMeals.map((meal) => (
                  <div
                    key={meal.name}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                  >
                    <h3 className="font-semibold text-gray-950">{meal.name}</h3>

                    <p className="mt-2 text-sm text-gray-600">{meal.description}</p>

                    <button
                      type="button"
                      onClick={() => setSelectedRecipe(meal)}
                      className="mt-4 text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                      View recipe
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-orange-200 bg-orange-500 p-6 text-white shadow-sm">
              <p className="text-sm font-semibold text-orange-100">Survival Mode</p>

              <h2 className="mt-2 text-2xl font-bold">Broke, busy, or exhausted?</h2>

              <p className="mt-3 text-sm text-orange-50">
                Get the cheapest and easiest meal possible using whatever you already have.
              </p>

              <button className="mt-5 w-full rounded-xl bg-white px-4 py-3 font-semibold text-orange-600 transition hover:bg-orange-50">
                Start Survival Mode
              </button>
            </section>

            {profile && (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-gray-950">Your food profile</h2>

                  <button
                    onClick={() => {
                      window.location.href = "/onboarding";
                    }}
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Edit
                  </button>
                </div>

                {profileIsEmpty ? (
                  <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 p-4">
                    <p className="text-sm font-semibold text-gray-950">
                      Your saved food profile is empty.
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      Rebuild it once and BrokeBites will protect it from blank saves.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = "/onboarding";
                      }}
                      className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                      Rebuild profile
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    <MiniPreference title="Equipment" items={profile.equipment} />
                    <MiniPreference title="Goals" items={profile.goals} />
                    <MiniPreference title="Dietary needs" items={profile.dietary_needs} />
                    <MiniPreference title="Stores" items={profile.stores} />
                  </div>
                )}
              </section>
            )}
          </aside>
        </div>
      </section>

      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </main>
  );
}

function RecipeCard({
  recipe,
  onView,
}: {
  recipe: Recipe;
  onView: () => void;
}) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-gray-950">{recipe.name}</h3>

        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
          {recipe.price}
        </span>
      </div>

      <p className="mt-3 text-sm text-gray-600">{recipe.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
          {recipe.time}
        </span>

        {recipe.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700"
          >
            {tag}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onView}
        className="mt-5 w-full rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        View recipe
      </button>
    </article>
  );
}

function RecipeModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-orange-600">Recipe details</p>
            <h2 className="mt-1 text-3xl font-bold text-gray-950">{recipe.name}</h2>
            <p className="mt-2 text-gray-600">{recipe.description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-600 transition hover:bg-gray-200"
            aria-label="Close recipe details"
          >
            X
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {recipe.time}
          </span>
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            {recipe.price}
          </span>
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-bold text-gray-950">Ingredients</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {(recipe.ingredients ?? ["Use the ingredients listed in the meal description."]).map((item) => (
                <li key={item} className="rounded-xl bg-orange-50 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-950">Steps</h3>
            <ol className="mt-3 space-y-2 text-sm text-gray-700">
              {(recipe.steps ?? ["Combine ingredients, heat until cooked, and season to taste."]).map(
                (step, index) => (
                  <li key={step} className="rounded-xl bg-gray-50 px-3 py-2">
                    <span className="font-semibold text-gray-950">{index + 1}. </span>
                    {step}
                  </li>
                ),
              )}
            </ol>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          Done
        </button>
      </section>
    </div>
  );
}

function MiniPreference({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-950">{title}</p>

      {items.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.slice(0, 4).map((item) => (
            <span
              key={item}
              className="rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700"
            >
              {item}
            </span>
          ))}

          {items.length > 4 && (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              +{items.length - 4}
            </span>
          )}
        </div>
      ) : (
        <p className="mt-1 text-sm text-gray-500">Nothing selected.</p>
      )}
    </div>
  );
}
