import { motion } from "framer-motion";

export function LoadingSpinner() {
  return (
    <motion.svg
      width="50"
      height="50"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <path
        d="M12 6V8M16.25 7.75L14.84 9.16M18 12H16M16.25 16.25L14.84 14.84M12 18V16M7.75 16.25L9.16 14.84M6 12H8M7.75 7.75L9.16 9.16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}
