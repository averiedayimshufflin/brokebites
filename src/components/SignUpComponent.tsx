import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export default function SignUpComponent() {
return(
    <motion.div
    key = "sign-up-button"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.03, y: -1 }}
    whileTap={{ scale: 0.97, y: 0 }}
  transition={{ duration: 0.50, ease: "easeOut" }}
    >

    <Button asChild className= "">
      <Link href="/sign-in">Sign in</Link>
    </Button>
    </motion.div>
);
}
