"use client"

import { useState } from "react";

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
export default function OnboardingPage(){
    const [equipment, setEquipment] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [dietaryNeeds, setDietaryNeeds] = useState<string[]>([]);
  const [stores, setStores] = useState<string[]>([]);

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
              You can change these later in settings.
            </p>

            <button
              onClick={() => {
                console.log({
                  equipment,
                  goals,
                  dietaryNeeds,
                  stores,
                });

                window.location.href = "/dashboard";
              }}
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Finish setup
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