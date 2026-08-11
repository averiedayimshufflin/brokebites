"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import DemoFilterTags from "@/components/DemoFilterTags";
import SignUpComponent from "@/components/SignUpComponent";
import SpinningCard from "@/components/SpinningCard";
import { chooseAutomaticRoute } from "@/lib/route-choice";

export default function Home() {
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function redirectSignedInUser() {
      const routeChoice = await chooseAutomaticRoute();

      if (routeChoice.ok && routeChoice.route !== "/sign-in") {
        window.location.href = routeChoice.route;
        return;
      }

      setCheckingSession(false);
    }

    redirectSignedInUser();
  }, []);

  const fadeUp = {
    hidden: {
      opacity: 0,
      y: 36,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F4EC] px-6 font-[family-name:var(--font-raleway)] text-[#151515]">
        <section className="rounded-[2rem] bg-white p-8 text-center shadow-[0_24px_70px_rgba(0,0,0,0.06)]">
          <p className="text-sm font-semibold text-[#FF7A1A]">BrokeBites</p>
          <h1 className="mt-2 text-2xl font-bold">Checking your session...</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F4EC] font-[family-name:var(--font-raleway)] text-[#151515]">
      <section className="mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2rem] bg-[#FF7A1A] px-6 py-8 shadow-[0_30px_80px_rgba(255,122,26,0.25)] sm:px-10 lg:px-14"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.28),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(35,130,71,0.35),transparent_30%)]" />

          <nav className="relative z-10 mb-20 flex items-center justify-between rounded-full bg-white/90 px-5 py-3 shadow-sm backdrop-blur-md">
            <p className="text-sm font-semibold tracking-tight text-[#151515]">
              BrokeBites
            </p>

            <div className="hidden items-center gap-8 text-xs font-medium text-neutral-600 md:flex">
              <span>Recipes</span>
              <span>Pantry</span>
              <span>Budget</span>
              <span>Smartbot</span>
            </div>

            <Link
              href="/sign-in"
              className="rounded-full bg-[#151515] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#238247]"
            >
              Sign in
            </Link>
          </nav>

          <div className="relative z-10 grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="mb-5 w-fit rounded-full bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white backdrop-blur"
              >
                Budget recipe planner
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.75, ease: "easeOut" }}
                className="font-[family-name:var(--font-raleway)] text-6xl font-semibold leading-[0.88] tracking-[-0.06em] text-white sm:text-7xl md:text-8xl lg:text-[9rem]"
              >
                Eat Smart.
                <br />
                Spend Less.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.75, ease: "easeOut" }}
                className="mt-8 max-w-xl text-sm font-medium leading-7 text-white/85 sm:text-base"
              >
                Discover affordable meals, filter by what you already have, and
                make cooking feel simple, fresh, and intentional.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.75, ease: "easeOut" }}
              className="rounded-[1.75rem] border border-white/30 bg-white/20 p-4 shadow-2xl backdrop-blur-md"
            >
              <div className="rounded-[1.35rem] bg-[#F8F4EC] p-5">
                <SpinningCard />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto grid w-full max-w-[1440px] items-start gap-8 px-4 pb-24 pt-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.55, duration: 0.7, ease: "easeOut" }}
          className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)] sm:p-8"
        >
          <div className="mb-10 flex items-start justify-between gap-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#238247]">
                Browse meals
              </p>

              <h2 className="font-[family-name:var(--font-raleway)] text-4xl font-semibold leading-[0.95] tracking-[-0.045em] text-[#171717] sm:text-5xl">
                Pick the food that fits your pantry
              </h2>
            </div>

            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FF7A1A] text-xl font-semibold text-white shadow-lg shadow-orange-500/25 sm:flex">
              +
            </div>
          </div>

          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="rounded-[1.5rem] border border-orange-100 bg-[#FFF7ED] p-5"
          >
            <DemoFilterTags />
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7, duration: 0.7, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-[#EAF5EC] p-6 shadow-[0_24px_70px_rgba(35,130,71,0.12)] sm:p-8"
        >
          
          <div className="absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-[#238247]/10 blur-3xl" />
          <div className="absolute bottom-[-90px] left-[-90px] h-64 w-64 rounded-full bg-[#FF7A1A]/10 blur-3xl" />
          
          <div className="relative z-10 mb-10 flex items-start justify-between gap-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#FF7A1A]">
                BrokeBites plan
              </p>

              <h2 className="font-[family-name:var(--font-raleway)] text-4xl font-semibold leading-[0.95] tracking-[-0.045em] text-[#171717] sm:text-5xl">
                Plan smarter meals with what you already have
              </h2>

              <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-[#3f4f43]">
                BrokeBites helps students and budget-conscious cooks turn
                pantry items into affordable recipe ideas, save favorites, and
                get quick help from a smart recipe assistant.
              </p>
            </div>

            <div className="hidden rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#238247] shadow-sm sm:block">
              Fresh start
            </div>
          </div>

          <div className="relative z-10 mb-8 grid gap-4 sm:grid-cols-2">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="rounded-2xl border border-green-100 bg-white/80 p-4 shadow-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#238247] text-sm font-bold text-white">
                1
              </div>

              <h3 className="font-semibold text-[#151515]">
                Pantry-first recipes
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#5b665d]">
                Enter ingredients like rice, beans, or eggs and see meals that
                match what you already own.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="rounded-2xl border border-green-100 bg-white/80 p-4 shadow-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FF7A1A] text-sm font-bold text-white">
                2
              </div>

              <h3 className="font-semibold text-[#151515]">
                Budget meal planning
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#5b665d]">
                Focus on cheap, filling meals that are practical for students,
                roommates, and busy weekly routines.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="rounded-2xl border border-green-100 bg-white/80 p-4 shadow-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#238247] text-sm font-bold text-white">
                3
              </div>

              <h3 className="font-semibold text-[#151515]">Smartbot help</h3>

              <p className="mt-2 text-sm leading-6 text-[#5b665d]">
                Ask for meal ideas, substitutions, or quick recipe suggestions
                based on your pantry and preferences.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="rounded-2xl border border-green-100 bg-white/80 p-4 shadow-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FF7A1A] text-sm font-bold text-white">
                4
              </div>

              <h3 className="font-semibold text-[#151515]">
                Save and reuse meals
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#5b665d]">
                Keep track of reliable recipes so you can come back to meals
                that work for your budget.
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 mb-8 rounded-[1.5rem] border border-green-100 bg-white/75 p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#238247]">
                  How it works
                </p>

                <h3 className="mt-2 text-xl font-semibold text-[#151515]">
                  From pantry to plate
                </h3>
              </div>

              <div className="hidden rounded-full bg-[#EAF5EC] px-4 py-2 text-xs font-semibold text-[#238247] sm:block">
                Simple flow
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 rounded-2xl bg-[#F8F4EC] p-4">
                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#FF7A1A]" />
                <div>
                  <h4 className="text-sm font-semibold text-[#151515]">
                    Add pantry ingredients
                  </h4>
                  <p className="mt-1 text-sm leading-6 text-[#5b665d]">
                    Users enter what they already have so the app can avoid
                    suggesting meals that require too many extra groceries.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl bg-[#F8F4EC] p-4">
                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#238247]" />
                <div>
                  <h4 className="text-sm font-semibold text-[#151515]">
                    Filter by preferences
                  </h4>
                  <p className="mt-1 text-sm leading-6 text-[#5b665d]">
                    Meals can be narrowed down by ingredients, budget needs,
                    saved favorites, and simple cooking preferences.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl bg-[#F8F4EC] p-4">
                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#FF7A1A]" />
                <div>
                  <h4 className="text-sm font-semibold text-[#151515]">
                    Get affordable ideas
                  </h4>
                  <p className="mt-1 text-sm leading-6 text-[#5b665d]">
                    BrokeBites turns simple ingredients into realistic meals
                    designed for saving money and reducing food waste.
                  </p>
                </div>
              </div>
            </div>
          </div>

         
        </motion.div>
      </section>
    </main>
  );
}
