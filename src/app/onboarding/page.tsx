"use client"
import AuthStatusCard from "@/components/AuthStatusCard";
import { getCurrentUser, getFriendlySupabaseError, type AuthCheck } from "@/lib/auth-state";
import { checkClientRateLimit, getRateLimitMessage } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const equipmentOptions = [
  "Microwave",
  "Stove",
  "Oven",
  "Air fryer",
  "Blender",
  "Rice cooker",
];

const goalOptions = [
  "Save money",
  "Eat high protein",
  "Lose weight",
  "Bulk",
  "Eat healthier",
  "Survive finals week",
];

const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Halal",
  "Gluten-free",
  "Dairy-free",
  "Nut allergy",
];

const storeOptions = [
  "Aldi",
  "Trader Joe’s",
  "Walmart",
  "Target",
  "Costco",
  "Lidls",
];

type FoodProfile = {
  equipment: string[];
  goals: string[];
  dietary_needs: string[];
  stores: string[];
};

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
    // A local backup helps recovery, but Supabase remains the source of truth.
  }
}
export default function OnboardingPage(){
    const [equipment, setEquipment] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [dietaryNeeds, setDietaryNeeds] = useState<string[]>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);
  const [profileLoadFailed, setProfileLoadFailed] = useState(false);
  const [authState, setAuthState] = useState<AuthCheck | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(()=>{
    async function checkUser() {
        const userCheck = await getCurrentUser();

        if(!userCheck.ok){
            setAuthState(userCheck);
            setCheckingUser(false);
            return;
        }

        try {
            const { data: profileData, error } = await supabase
                .from("profiles")
                .select("equipment, goals, dietary_needs, stores")
                .eq("id", userCheck.user.id)
                .maybeSingle();

            if (error) {
                setProfileLoadFailed(true);
                setNotice(getFriendlySupabaseError(error));
                setCheckingUser(false);
                return;
            }

            if (profileData) {
                const savedProfile = {
                    equipment: profileData.equipment ?? [],
                    goals: profileData.goals ?? [],
                    dietary_needs: profileData.dietary_needs ?? [],
                    stores: profileData.stores ?? [],
                };
                const cachedProfile = readCachedFoodProfile(userCheck.user.id);
                const profileToUse =
                    isFoodProfileEmpty(savedProfile) && cachedProfile
                        ? cachedProfile
                        : savedProfile;

                setEquipment(profileToUse.equipment);
                setGoals(profileToUse.goals);
                setDietaryNeeds(profileToUse.dietary_needs);
                setStores(profileToUse.stores);
                cacheFoodProfile(userCheck.user.id, profileToUse);

                if (isFoodProfileEmpty(savedProfile) && cachedProfile) {
                    setNotice(
                        "Your saved profile looked empty, so BrokeBites restored the last profile saved in this browser."
                    );
                }
            }

            setCheckingUser(false);
        } catch {
            setProfileLoadFailed(true);
            setNotice(
                "Supabase did not respond, so your existing food profile was not loaded. Please refresh before saving changes."
            );
            setCheckingUser(false);
        }
    }

    checkUser();
  },[])
    function toggleOption(
    value: string,
    selectedValues: string[],
    setSelectedValues: (values: string[]) => void
  ) {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((item) => item !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  }
  async function handleFinishSetup() {
  if (profileLoadFailed) {
    setNotice(
      "Your existing food profile could not be loaded. Please refresh before saving so your preferences are not overwritten."
    );
    return;
  }

  setSaving(true);
  setNotice("");

  const userCheck = await getCurrentUser();

  if (!userCheck.ok) {
    setAuthState(userCheck);
    setSaving(false);
    return;
  }

  try {
    const nextProfile = {
      equipment,
      goals,
      dietary_needs: dietaryNeeds,
      stores,
    };

    if (isFoodProfileEmpty(nextProfile)) {
      setSaving(false);
      setNotice("Pick at least one food profile option before saving.");
      return;
    }

    const rateLimit = checkClientRateLimit({
      key: `profile-save:${userCheck.user.id}`,
      maxAttempts: 8,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      setSaving(false);
      setNotice(getRateLimitMessage("saving your profile", rateLimit.retryAfterSeconds));
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: userCheck.user.id,
      email: userCheck.user.email,
      ...nextProfile,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      setNotice(getFriendlySupabaseError(error));
      return;
    }

    cacheFoodProfile(userCheck.user.id, nextProfile);
  } catch {
    setSaving(false);
    setNotice("Supabase did not respond. Please try saving again in a moment.");
    return;
  }

  window.location.href = "/dashboard";
}
if (authState && !authState.ok) {
  return <AuthStatusCard title={authState.title} message={authState.message} />;
}
if (checkingUser) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50 px-6">
      <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-orange-600">BrokeBites</p>

        <h1 className="mt-2 text-2xl font-bold text-gray-950">
          Checking your account...
        </h1>
      </section>
    </main>
  );
}
return (
    <main className="min-h-screen bg-orange-50 px-6 py-10">
      <section className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            BrokeBites Setup
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-950">
            Tell us your food situation.
          </h1>

          <p className="mt-4 max-w-2xl text-gray-600">
            This helps BrokeBites recommend cheap meals that actually work with
            your kitchen, budget, goals, and dietary needs.
          </p>

          <div className="mt-10 space-y-10">
            <QuestionSection
              title="What equipment do you have?"
              description="We’ll only suggest meals you can realistically cook."
              options={equipmentOptions}
              selectedOptions={equipment}
              onToggle={(option) =>
                toggleOption(option, equipment, setEquipment)
              }
            />

            <QuestionSection
              title="What are your goals?"
              description="Pick anything that matters to you right now."
              options={goalOptions}
              selectedOptions={goals}
              onToggle={(option) => toggleOption(option, goals, setGoals)}
            />

            <QuestionSection
              title="Any dietary needs?"
              description="We’ll avoid meals that do not fit your needs."
              options={dietaryOptions}
              selectedOptions={dietaryNeeds}
              onToggle={(option) =>
                toggleOption(option, dietaryNeeds, setDietaryNeeds)
              }
            />

            <QuestionSection
              title="Where do you shop?"
              description="This helps estimate prices and suggest realistic ingredients."
              options={storeOptions}
              selectedOptions={stores}
              onToggle={(option) => toggleOption(option, stores, setStores)}
            />
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              {notice || "You can change these later in settings."}
            </p>

           <button
  onClick={handleFinishSetup}
  disabled={saving || profileLoadFailed}
  className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
>
  {saving ? "Saving..." : "Finish setup"}
</button>
          </div>
        </div>
      </section>
    </main>
  );
}

function QuestionSection({
  title,
  description,
  options,
  selectedOptions,
  onToggle,
}: {
  title: string;
  description: string;
  options: string[];
  selectedOptions: string[];
  onToggle: (option: string) => void;
}) {
  return (
    <section>
      <div>
        <h2 className="text-xl font-bold text-gray-950">{title}</h2>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                isSelected
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}
