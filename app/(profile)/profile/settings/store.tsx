// import { Globe, Moon, Sun } from 'lucide-react'

// const [preferences, setPreferences] = useState({
//     theme: 'system',
//     language: 'en',
//   })

// <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
//         <div className="p-5 border-b border-border/50">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
//               <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
//             </div>
//             <div>
//               <h2 className="font-semibold">Preferences</h2>
//               <p className="text-xs text-muted-foreground">Customize your experience</p>
//             </div>
//           </div>
//         </div>

//         <div className="divide-y divide-border/50">
//           {/* Theme */}
//           <div className="p-5">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 {preferences.theme === 'dark' ? (
//                   <Moon className="w-5 h-5 text-muted-foreground" />
//                 ) : (
//                   <Sun className="w-5 h-5 text-muted-foreground" />
//                 )}
//                 <div>
//                   <p className="font-medium text-sm">Theme</p>
//                   <p className="text-xs text-muted-foreground">Choose light or dark mode</p>
//                 </div>
//               </div>
//               <div className="flex gap-1 bg-muted rounded-lg p-1">
//                 {['light', 'dark', 'system'].map((theme) => (
//                   <button
//                     key={theme}
//                     onClick={() => setPreferences(prev => ({ ...prev, theme }))}
//                     className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
//                       preferences.theme === theme
//                         ? 'bg-background shadow-sm text-foreground'
//                         : 'text-muted-foreground hover:text-foreground'
//                     }`}
//                   >
//                     {theme.charAt(0).toUpperCase() + theme.slice(1)}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Language */}
//           <div className="p-5">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <Globe className="w-5 h-5 text-muted-foreground" />
//                 <div>
//                   <p className="font-medium text-sm">Language</p>
//                   <p className="text-xs text-muted-foreground">Select your preferred language</p>
//                 </div>
//               </div>
//               <select 
//                 value={preferences.language}
//                 onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
//                 className="bg-muted border-none rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
//               >
//                 <option value="en">English</option>
//                 <option value="ar">العربية</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>