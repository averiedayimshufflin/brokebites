"use client";

import { motion } from "framer-motion";
import DemoFilterTags from "@/components/DemoFilterTags";
import SignUpComponent from "@/components/SignUpComponent";
import SpinningCard from "@/components/SpinningCard";

export default function Home() {
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

  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F4EC] font-sans text-[#151515]">
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

            <button
              type="button"
              className="rounded-full bg-[#101010] px-5 py-2 text-xs font-semibold text-white transition duration-300 hover:bg-[#238247]"
            >
              Start
            </button>
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
                className="font-display text-6xl font-semibold leading-[0.88] tracking-[-0.06em] text-white sm:text-7xl md:text-8xl lg:text-[9rem]"
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

      <section className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
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

              <h2 className="font-display text-4xl font-semibold leading-[0.95] tracking-[-0.045em] text-[#171717] sm:text-5xl">
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
          className="rounded-[2rem] border border-black/5 bg-[#EAF5EC] p-6 shadow-[0_24px_70px_rgba(35,130,71,0.12)] sm:p-8"
        >
          <div className="mb-10 flex items-start justify-between gap-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#FF7A1A]">
                Join the kitchen
              </p>

              <h2 className="font-display text-4xl font-semibold leading-[0.95] tracking-[-0.045em] text-[#171717] sm:text-5xl">
                Save meals, plan smarter, cook better
              </h2>
            </div>

            <div className="hidden rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#238247] shadow-sm sm:block">
              Fresh start
            </div>
          </div>

          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="rounded-[1.5rem] border border-green-100 bg-white p-5"
          >
            <SignUpComponent />
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}