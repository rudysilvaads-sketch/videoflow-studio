 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { 
   Search, 
   MapPin, 
   Volume2, 
   Cloud, 
   Zap,
   ChevronDown,
   Check
 } from "lucide-react";
 import { Input } from "@/components/ui/input";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { 
   Collapsible,
   CollapsibleContent,
   CollapsibleTrigger,
 } from "@/components/ui/collapsible";
 import { Scenario, ScenarioCategory } from "@/types/series";
 import { survivalScenarios, scenarioCategories } from "@/data/survivalScenarios";
 import { cn } from "@/lib/utils";
 
 interface ScenarioLibraryProps {
   onSelectScenario: (scenario: Scenario) => void;
   selectedScenarioId?: string;
 }
 
 export function ScenarioLibrary({ onSelectScenario, selectedScenarioId }: ScenarioLibraryProps) {
   const [searchQuery, setSearchQuery] = useState("");
   const [expandedCategories, setExpandedCategories] = useState<ScenarioCategory[]>(["shelter"]);
   const [selectedFilters, setSelectedFilters] = useState<ScenarioCategory[]>([]);
 
   const toggleCategory = (category: ScenarioCategory) => {
     setExpandedCategories(prev => 
       prev.includes(category) 
         ? prev.filter(c => c !== category)
         : [...prev, category]
     );
   };
 
   const toggleFilter = (category: ScenarioCategory) => {
     setSelectedFilters(prev =>
       prev.includes(category)
         ? prev.filter(c => c !== category)
         : [...prev, category]
     );
   };
 
   const filteredScenarios = survivalScenarios.filter(scenario => {
     const matchesSearch = searchQuery === "" || 
       scenario.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       scenario.description.toLowerCase().includes(searchQuery.toLowerCase());
     
     const matchesFilter = selectedFilters.length === 0 || 
       selectedFilters.includes(scenario.category);
 
     return matchesSearch && matchesFilter;
   });
 
   const groupedScenarios = filteredScenarios.reduce((acc, scenario) => {
     if (!acc[scenario.category]) {
       acc[scenario.category] = [];
     }
     acc[scenario.category].push(scenario);
     return acc;
   }, {} as Record<ScenarioCategory, Scenario[]>);
 
   return (
     <div className="space-y-4">
       {/* Search */}
       <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
         <Input
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           placeholder="Buscar cenário..."
           className="pl-9 h-9"
         />
       </div>
 
       {/* Category Filters */}
       <div className="flex flex-wrap gap-1.5">
         {Object.entries(scenarioCategories).map(([key, cat]) => (
           <button
             key={key}
             onClick={() => toggleFilter(key as ScenarioCategory)}
             className={cn(
               "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors",
               selectedFilters.includes(key as ScenarioCategory)
                 ? "bg-primary text-primary-foreground"
                 : "bg-muted hover:bg-muted/80 text-muted-foreground"
             )}
           >
             <span>{cat.icon}</span>
             <span>{cat.name.split(" ")[0]}</span>
           </button>
         ))}
       </div>
 
       {/* Scenarios by Category */}
       <ScrollArea className="h-[400px] pr-2">
         <div className="space-y-2">
           {Object.entries(groupedScenarios).map(([category, scenarios]) => {
             const catInfo = scenarioCategories[category as ScenarioCategory];
             const isExpanded = expandedCategories.includes(category as ScenarioCategory);
 
             return (
               <Collapsible
                 key={category}
                 open={isExpanded}
                 onOpenChange={() => toggleCategory(category as ScenarioCategory)}
               >
                 <CollapsibleTrigger asChild>
                   <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                     <div className={cn(
                       "w-6 h-6 rounded-md flex items-center justify-center text-sm",
                       `bg-gradient-to-br ${catInfo.color}`
                     )}>
                       {catInfo.icon}
                     </div>
                     <span className="flex-1 text-left text-xs font-medium">
                       {catInfo.name}
                     </span>
                     <Badge variant="secondary" className="text-[10px] h-4">
                       {scenarios.length}
                     </Badge>
                     <ChevronDown className={cn(
                       "w-4 h-4 text-muted-foreground transition-transform",
                       isExpanded && "rotate-180"
                     )} />
                   </button>
                 </CollapsibleTrigger>
 
                 <CollapsibleContent>
                   <AnimatePresence>
                     <motion.div
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       className="pl-2 pt-1 space-y-1"
                     >
                       {scenarios.map((scenario, index) => (
                         <motion.button
                           key={scenario.id}
                           initial={{ x: -10, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           transition={{ delay: index * 0.03 }}
                           onClick={() => onSelectScenario(scenario)}
                           className={cn(
                             "w-full p-3 rounded-xl border transition-all text-left group",
                             selectedScenarioId === scenario.id
                               ? "bg-primary/10 border-primary/30"
                               : "bg-card border-border hover:border-primary/30 hover:bg-muted/30"
                           )}
                         >
                           <div className="flex items-start gap-2">
                             <span className="text-lg flex-shrink-0">{scenario.icon}</span>
                             <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2">
                                 <span className="text-xs font-medium">{scenario.name}</span>
                                 {selectedScenarioId === scenario.id && (
                                   <Check className="w-3 h-3 text-primary" />
                                 )}
                               </div>
                               <p className="text-[10px] text-muted-foreground mt-0.5">
                                 {scenario.description}
                               </p>
 
                               {/* Quick info */}
                               <div className="flex flex-wrap gap-1 mt-2">
                                 {scenario.suggestedSounds.slice(0, 2).map((sound, i) => (
                                   <span
                                     key={i}
                                     className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted text-[9px] text-muted-foreground"
                                   >
                                     <Volume2 className="w-2.5 h-2.5" />
                                     {sound.split(" ").slice(0, 2).join(" ")}
                                   </span>
                                 ))}
                                 {scenario.suggestedWeather && scenario.suggestedWeather[0] && (
                                   <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted text-[9px] text-muted-foreground">
                                     <Cloud className="w-2.5 h-2.5" />
                                     {scenario.suggestedWeather[0]}
                                   </span>
                                 )}
                               </div>
                             </div>
                           </div>
                         </motion.button>
                       ))}
                     </motion.div>
                   </AnimatePresence>
                 </CollapsibleContent>
               </Collapsible>
             );
           })}
 
           {Object.keys(groupedScenarios).length === 0 && (
             <div className="text-center py-8 text-muted-foreground">
               <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
               <p className="text-xs">Nenhum cenário encontrado</p>
               <p className="text-[10px]">Tente ajustar a busca ou filtros</p>
             </div>
           )}
         </div>
       </ScrollArea>
     </div>
   );
 }