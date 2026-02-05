 import { Moon, Sun } from "lucide-react";
 import { motion } from "framer-motion";
 import { useTheme } from "@/hooks/useTheme";
 import { cn } from "@/lib/utils";
 
 interface ThemeToggleProps {
   className?: string;
   size?: "sm" | "md";
 }
 
 export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
   const { theme, toggleTheme } = useTheme();
   const isDark = theme === "dark";
 
   const sizes = {
     sm: {
       container: "w-12 h-6",
       thumb: "w-5 h-5",
       icon: "w-3 h-3",
       translate: "translateX(24px)",
     },
     md: {
       container: "w-14 h-7",
       thumb: "w-6 h-6",
       icon: "w-3.5 h-3.5",
       translate: "translateX(28px)",
     },
   };
 
   const s = sizes[size];
 
   return (
     <button
       onClick={toggleTheme}
       className={cn(
         "relative rounded-full p-0.5 transition-colors duration-300",
         isDark 
           ? "bg-secondary border border-border" 
           : "bg-secondary border border-border",
         className
       )}
       aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
     >
       <div className={cn("relative flex items-center", s.container)}>
         {/* Background icons */}
         <div className="absolute inset-0 flex items-center justify-between px-1.5">
           <Sun className={cn(
             s.icon,
             "transition-opacity duration-300",
             isDark ? "opacity-30 text-muted-foreground" : "opacity-0"
           )} />
           <Moon className={cn(
             s.icon,
             "transition-opacity duration-300",
             isDark ? "opacity-0" : "opacity-30 text-muted-foreground"
           )} />
         </div>
 
         {/* Sliding thumb */}
         <motion.div
           className={cn(
             s.thumb,
             "rounded-full flex items-center justify-center shadow-md",
             isDark 
               ? "bg-primary" 
               : "bg-primary"
           )}
           initial={false}
           animate={{
             x: isDark ? parseInt(s.translate.match(/\d+/)?.[0] || "0") : 0,
           }}
           transition={{
             type: "spring",
             stiffness: 500,
             damping: 30,
           }}
         >
           <motion.div
             initial={false}
             animate={{ rotate: isDark ? 0 : 180 }}
             transition={{ duration: 0.3 }}
           >
             {isDark ? (
               <Moon className={cn(s.icon, "text-primary-foreground")} />
             ) : (
               <Sun className={cn(s.icon, "text-primary-foreground")} />
             )}
           </motion.div>
         </motion.div>
       </div>
     </button>
   );
 }