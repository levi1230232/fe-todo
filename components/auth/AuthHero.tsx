"use client";

import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";

export default function AuthHero() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center px-12 text-white">
      <motion.h1
        className="text-4xl font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <TypeAnimation
          sequence={[
            "Manage your tasks easier",
            2000,
            "Boost your productivity",
            2000,
            "Work smarter together",
            2000,
          ]}
          speed={50}
          repeat={Infinity}
        />
      </motion.h1>

      <motion.p
        className="mt-4 text-lg text-white/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Organize your workspace, collaborate with your team and improve
        productivity.
      </motion.p>
    </div>
  );
}
