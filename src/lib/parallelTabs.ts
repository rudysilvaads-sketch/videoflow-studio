 export interface ParallelTab {
   id: string;
   tabId?: number;
   status: 'pending' | 'opening' | 'ready' | 'processing' | 'error';
  isPaused: boolean;
   currentPromptIndex: number;
   promptsAssigned: number[];
   completedCount: number;
 }
 
 export interface ParallelSession {
   id: string;
   tabCount: number;
   promptsPerTab: number;
   tabs: ParallelTab[];
   allPrompts: string[];
   isRunning: boolean;
   downloadFolder: string;
   createdAt: Date;
 }
 
 const PARALLEL_KEY = 'characterflow_parallel';
 
 export function getParallelSession(): ParallelSession | null {
   try {
     const stored = localStorage.getItem(PARALLEL_KEY);
     if (stored) {
       const session = JSON.parse(stored);
       return {
         ...session,
         createdAt: new Date(session.createdAt),
       };
     }
   } catch (error) {
     console.error('Error loading parallel session:', error);
   }
   return null;
 }
 
 export function saveParallelSession(session: ParallelSession): void {
   localStorage.setItem(PARALLEL_KEY, JSON.stringify(session));
 }
 
 export function clearParallelSession(): void {
   localStorage.removeItem(PARALLEL_KEY);
 }
 
 export function createParallelSession(
   prompts: string[],
   tabCount: number,
   downloadFolder: string = 'LaCasaDark_Parallel'
 ): ParallelSession {
   const promptsPerTab = Math.ceil(prompts.length / tabCount);
   
   const tabs: ParallelTab[] = [];
   
   for (let i = 0; i < tabCount; i++) {
     const startIdx = i * promptsPerTab;
     const endIdx = Math.min(startIdx + promptsPerTab, prompts.length);
     const assignedPrompts = [];
     
     for (let j = startIdx; j < endIdx; j++) {
       assignedPrompts.push(j);
     }
     
     if (assignedPrompts.length > 0) {
       tabs.push({
         id: `tab-${i + 1}`,
         status: 'pending',
          isPaused: false,
         currentPromptIndex: 0,
         promptsAssigned: assignedPrompts,
         completedCount: 0,
       });
     }
   }
   
   const session: ParallelSession = {
     id: crypto.randomUUID(),
     tabCount: tabs.length,
     promptsPerTab,
     tabs,
     allPrompts: prompts,
     isRunning: false,
     downloadFolder,
     createdAt: new Date(),
   };
   
   saveParallelSession(session);
   return session;
 }
 
 export function getParallelProgress(session: ParallelSession): {
   completed: number;
   total: number;
   percentage: number;
   tabProgress: { tabId: string; completed: number; total: number }[];
 } {
   const total = session.allPrompts.length;
   let completed = 0;
   
   const tabProgress = session.tabs.map(tab => {
     completed += tab.completedCount;
     return {
       tabId: tab.id,
       completed: tab.completedCount,
       total: tab.promptsAssigned.length,
     };
   });
   
   return {
     completed,
     total,
     percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
     tabProgress,
   };
 }