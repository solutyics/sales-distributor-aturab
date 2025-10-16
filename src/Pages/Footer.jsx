import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer
      className="py-6 text-center border-t border-gray-800 text-gray-500 flex-shrink-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      © {new Date().getFullYear()} Nexora • Sales Management App
    </motion.footer>
  );
};

export default Footer;
