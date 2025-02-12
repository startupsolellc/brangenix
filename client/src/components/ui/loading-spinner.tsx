import { motion } from "framer-motion";

export function LoadingSpinner() {
  return (
    <motion.svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="text-primary"
    >
      {/* Main gear */}
      <path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Gear teeth */}
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