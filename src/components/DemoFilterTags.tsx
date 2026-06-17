"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function DemoFilterTags() {
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [visibleRecipeCount, setVisibleRecipeCount] = useState(0);
  const [cycle, setCycle] = useState(0);

  const demoTags = ["rice", "beans", "eggs"];

  const demoRecipes = [
    {
      title: "Egg Fried Rice",
      description: "Uses rice, eggs, and pantry basics.",
      tags: ["eggs", "rice"],
    },
    {
      title: "Bean & Rice Bowl",
      description: "A cheap filling meal with simple ingredients.",
      tags: ["beans", "rice"],
    },
    {
      title: "Budget Breakfast Scramble",
      description: "Eggs with whatever extras you have.",
      tags: ["eggs"],
    },
  ];

  useEffect(() => {
    let wordIndex = 0;
    let letterIndex = 0;

    setInputValue("");
    setTags([]);
    setVisibleRecipeCount(0);

    const wordInterval = setInterval(() => {
      const currentWord = demoTags[wordIndex];

      if (!currentWord) {
        clearInterval(wordInterval);
        return;
      }

      if (letterIndex < currentWord.length) {
        const currentLetter = currentWord.charAt(letterIndex);
        letterIndex += 1;

        setInputValue((prev) => prev + currentLetter);
        return;
      }

      setTags((currentTags) => [...currentTags, currentWord]);
      setInputValue("");

      wordIndex += 1;
      letterIndex = 0;
    }, 300);

    return () => clearInterval(wordInterval);
  }, [cycle]);

  useEffect(() => {
    if (tags.length !== demoTags.length) return;
    if (visibleRecipeCount >= demoRecipes.length) return;

    const timer = setTimeout(() => {
      setVisibleRecipeCount((count) => count + 1);
    }, 850);

    return () => clearTimeout(timer);
  }, [tags.length, visibleRecipeCount]);

  useEffect(() => {
    if (visibleRecipeCount !== demoRecipes.length) return;

    const resetTimer = setTimeout(() => {
      setCycle((currentCycle) => currentCycle + 1);
    }, 2300);

    return () => clearTimeout(resetTimer);
  }, [visibleRecipeCount]);

  function displayTags(recipeTags: string[]) {
    return (
      <div className="mt-3 flex min-h-8 flex-wrap gap-2">
        {recipeTags.map((recipeTag) => (
          <Badge
            key={recipeTag}
            variant="secondary"
            className="rounded-full bg-green-50 px-3 py-1 text-green-700"
          >
            {recipeTag}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <Card className="flex min-h-[760px] w-full max-w-xl flex-col overflow-visible rounded-2xl border-orange-100 bg-white/90 shadow-sm">
      <CardHeader className="shrink-0">
        <CardTitle className="text-xl font-semibold text-[#151515]">
          Find recipes from your pantry
        </CardTitle>

        <CardDescription>
          Add ingredients and BrokeBites filters meals instantly
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col space-y-4 overflow-visible pb-8">
        <div className="relative shrink-0">
          <Input
            placeholder="Enter ingredients here..."
            value={inputValue}
            readOnly
            className="rounded-full border-orange-100 bg-[#FFF8EF] px-5"
          />

          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-5 top-1/2 h-5 w-[2px] -translate-y-1/2 bg-[#FF7A1A]"
          />
        </div>

        <div className="flex min-h-8 shrink-0 flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {tags.map((tag) => (
              <motion.div
                key={`${cycle}-${tag}`}
                initial={{ opacity: 0, y: 16, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Badge
                  variant="secondary"
                  className="rounded-full bg-[#FF7A1A] px-3 py-1 text-white hover:bg-[#FF7A1A]"
                >
                  {tag} ×
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="min-h-[500px] flex-1 overflow-visible pb-8">
          <AnimatePresence mode="wait">
            {tags.length === demoTags.length && (
              <motion.div
                key={`results-${cycle}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="space-y-3"
              >
                {demoRecipes.slice(0, visibleRecipeCount).map((recipe) => (
                  <motion.div
                    key={`${cycle}-${recipe.title}`}
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <Card className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                      <h3 className="font-medium text-[#151515]">
                        {recipe.title}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {recipe.description}
                      </p>

                      {displayTags(recipe.tags)}
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}