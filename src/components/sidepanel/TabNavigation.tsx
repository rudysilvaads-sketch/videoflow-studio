 import { motion } from "framer-motion";
 import { Play, Settings, Clock, Wrench } from "lucide-react";
 import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
 
 interface TabNavigationProps {
   activeTab: string;
   onTabChange: (tab: string) => void;
 }
 
 const tabs = [
   { id: "control", label: "Controle", icon: Play },
   { id: "settings", label: "Config", icon: Settings },
   { id: "history", label: "Histórico", icon: Clock },
   { id: "tools", label: "Ferramentas", icon: Wrench },
 ];
 
 export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
   return (
    <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-12">
       {tabs.map((tab) => (
         <TabsTrigger
           key={tab.id}
           value={tab.id}
          className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-2 text-sm px-4 py-3 transition-all"
         >
          <tab.icon className="w-4 h-4" />
           <span>{tab.label}</span>
           {activeTab === tab.id && (
             <motion.div
               layoutId="activeTab"
               className="absolute inset-x-0 -bottom-[2px] h-0.5 bg-primary"
               transition={{ type: "spring", stiffness: 400, damping: 30 }}
             />
           )}
         </TabsTrigger>
       ))}
     </TabsList>
   );
 }