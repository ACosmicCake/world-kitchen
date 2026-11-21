# World Kitchen: brainstorm & roadmap

## The core idea
A cookbook that actually makes you a **better cook** and a **more efficient solo cook**. It isn't a pile of recipes. It's three systems working together:

1. **Authentic recipe library.** Traditional versions, labeled with difficulty, hands-on time and total time, each linked to native-language sources from that country.
2. **Time & batch engine.** Cook once, eat 3–4 times. It plans leftovers, tracks the freezer, interleaves several dishes in one session and builds the grocery list for you.
3. **Skill progression.** Every recipe trains named techniques. A journal records what to change next time, and recommendations push you one step past your comfort zone.

## What's built (v0.1)
| Feature | What it does |
|---|---|
| Discover | 38 recipes, 16 countries plus basics. Filter by country, difficulty, time and tag. Search by ingredients you already have |
| Recipe view | Servings scaler, hands-on vs hands-off steps, step timers, storage/reheat info, leftover makeovers, links to local sources |
| Cook mode | Full-screen step-by-step view that keeps the screen awake, with timers and a "what's next" preview |
| Plan | Weekly grid. Batch cooks fill later meals with leftovers based on fridge life. Extra portions go to a freezer inventory. Auto-planner |
| Shop | Combined, scaled grocery list split into "buy fresh" and "check pantry", grouped by aisle. Advice on when to shop |
| Batch Prep | Scheduler for one cook and many dishes: shows the timeline, time saved and a step order with clock times |
| Skills | 13 techniques with why, how and common mistakes, plus progress based on what you've cooked |
| Journal | Ratings and "next time" notes that come back when you reopen the recipe, plus a passport of countries cooked |

## Ideas to add next

### Make it a better teacher
- **Technique videos/GIFs per skill**: 15-second loops (claw grip, cracking coconut cream, carbonara emulsion).
- **"Why did it fail?" troubleshooter**: per recipe, symptom → cause → fix (grainy carbonara → too hot; cloudy pho → boiled hard).
- **Taste-calibration exercises**: e.g. make one cup of broth and taste it at 3 salt levels. Teaches seasoning by feel.
- **Doneness guides**: photos of "deep amber caramel", "onions golden vs brown", "rice translucent at the edge".
- **Recipe "unlock" trees**: tortilla → French omelette → tamagoyaki; dal → chana masala → butter chicken.
- **Weekly challenge**: "This week: cook without measuring salt."
- **Mastery levels per dish**: cook a dish 3 times with notes and it's "Mastered"; the app then suggests a regional variant.

### Time management for solo cooks
- **"Finish together" mode** for the scheduler: work backward from a target dinner time.
- **Group prep across recipes**: "chop all 5 onions at once" by merging identical prep tasks across dishes.
- **Component cooking**: plan *components* (a protein, a grain, a sauce, a vegetable) and mix them into different meals all week. Example: tinga + frijoles + salsa verde → tacos, tostadas, bowls, quesadillas.
- **Energy-aware planning**: tag nights as "tired" (≤15 min or leftovers only) vs "free" (a project cook).
- **Freezer "use-by" alerts** and a "cook from the freezer" week.
- **Equipment conflicts** in the scheduler (only one oven, two burners).
- **Rice cooker / pressure cooker / air fryer variants** with adjusted times.

### Grocery & budget
- **Pantry inventory**: remember what you own so the list only shows what's missing.
- **Ingredient overlap optimizer**: suggests recipes that use up the other half of the cilantro bunch or coconut can you already bought.
- **Cost per serving** using local price data, and a weekly budget mode.
- **Store-layout ordering** for your usual supermarket; separate lists for the Asian grocer and the supermarket.
- **Substitution engine** for when you can't find an ingredient (holy basil → Thai basil + a few mint leaves).
- **Seasonality**: highlight recipes whose produce is in season where you live.

### Authentic sourcing at scale (growing the database)
- **Ingestion pipeline**: many recipe sites publish schema.org `Recipe` JSON-LD. A script could read the pages it is allowed to (check robots.txt and terms of service), normalize them into this app's format, then have a human curate the result.
- **Cross-source consensus**: compare 3–5 native sources for one dish. Ingredients that appear in all of them are "core"; ones that appear in only some are "regional variation". Flag non-traditional shortcuts.
- **Regional variants**: Hanoi phở vs Saigon phở; Neapolitan vs Roman pizza.
- **Cultural notes**: when the dish is eaten (Tết, Diwali, Sunday lunch), how it's served and table etiquette.
- **Native-language glossary** with pronunciation audio for dish and ingredient names.
- **Community verification**: cooks from that country upvote a recipe as "how my family makes it".

### Nutrition & health
- Macros per serving (via an open nutrition database), protein-per-meal targets, and dietary filters (halal, gluten-free, low-FODMAP).

### Platform
- Install as a **PWA** so it works offline in the kitchen and can be added to your phone home screen.
- **Voice control in Cook mode** ("next step", "start timer") so you don't touch the screen with messy hands.
- Sync across devices (Supabase or Firebase), share plans with a partner or roommates.
- Export grocery lists to Apple Reminders, Google Keep or Todoist.
- An **AI sous-chef** (Claude API): "I have chicken, half a cabbage and kimchi. What can I make in 20 minutes from this library?", plus live Q&A while cooking.

## Suggested build order
1. PWA/offline + pantry inventory (biggest everyday win)
2. Troubleshooter + doneness photos (biggest learning win)
3. Component cooking + "finish together" scheduler
4. Ingestion pipeline to grow to ~300 recipes with cross-source checks
5. AI sous-chef
