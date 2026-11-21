# 🌏 World Kitchen

**Live app: https://acosmiccake.github.io/world-kitchen/**

A cookbook, meal planner and cooking coach for people who cook alone, with 63 traditional recipes from 26 countries and a guide to 128 ingredients. It works offline and can be installed as an app.

## Run it
- **Best:** double-click **`start.cmd`**. It opens http://localhost:5173 in your browser (it needs [Node.js](https://nodejs.org)). Keep the black window open while you use the app, and close it to stop.
  - After the first visit the app works **offline**. The badge in the top-right says "✓ Works offline".
  - In Chrome or Edge, click **⬇ Install app** to get World Kitchen as its own app with a desktop/Start-menu icon.
- **Quick look:** double-clicking `index.html` also works, but without offline mode or installing.

## On your phone
Phones only allow offline/installable web apps from **https** addresses. To put it on your phone:
1. It is already hosted at https://acosmiccake.github.io/world-kitchen/ (GitHub Pages, from the `main` branch). Every `git push` updates it within a minute or two.
2. Open the https link on your phone. On iPhone, tap Share → **Add to Home Screen**. On Android, tap ⋮ → **Install app**.
3. Move your data across: on the computer go to **Journal → Download backup**, then on the phone go to **Journal → Restore from backup**.

## Pantry
In the **Pantry** tab you tap what you have at home, or use a starter kit (Basics, East & SE Asian, Indian spice box…) to fill it in faster. The pantry then shows up in three places:
- **Grocery list:** items you already have are skipped and listed under "Already at home". Tap one to put it back on the list if you're running low.
- **Recipes:** each ingredient is marked "✓ have" or "need", and one button adds the missing items to your grocery list.
- **Discover and Pantry:** "Cook from your pantry" shows the dishes you're closest to being able to make, and you can sort recipes by "most ingredients I have".

## Ingredient guide
The **Ingredients** tab covers 128 key ingredients. Each one has its history, taste, how to use it, buying and storing tips, substitutes, a photo, a short Wikipedia summary, and the recipes that use it. Tap an underlined ingredient inside any recipe to open it. Photos and summaries load from Wikipedia and Wikimedia Commons with credit (CC BY-SA), and they are saved for offline use after the first view.

## Goals, budget & workouts
- **Goals:** set your body stats and goal (maintain or gain) for a daily calorie and protein target, then your week (time to cook, wake time, training days, meals at home, packed or out) and an optional weekly food budget. **Build my week** plans batch cooks on free days, quick cooks on busy ones, and portion sizes to hit your target. It adds breakfasts, snacks and protein shakes timed around training, night-before prep, and a daily water, fruit & veg and sleep checklist. On a budget it picks cheaper dishes until the plan fits. A weekly weigh-in tells you whether to adjust calories.
- **Calories & cost:** every recipe shows estimated calories, protein, carbs and fat per serving (±15%), plus cost per serving. Set your currency, local price level and your own prices in **Shop → Prices & budget**, and the grocery list shows a total against your budget.
- **Workouts:** a strength program built from the training days in Goals (full body, upper/lower or push/pull/legs) for the gym, dumbbells or bodyweight. Each exercise has form tips and a progress log that tells you what weight to use next time. The tab also has 6 protein shakes and smoothies (with and without protein powder).
- These are estimates, not medical or dietary advice. If you have a health condition, check with a professional.

## Files
- `data/recipes.js`: the recipe database. The format is documented at the top of the file, so adding a recipe means copying an existing entry.
- `data/extra-recipes.js`: 25 researched recipes. Each was cross-checked against 2–3 real recipe pages from the dish's country, listed with links in the app.
- `data/ingredients.js`: the ingredient guide.
- `data/nutrition.js`, `data/prices.js`: nutrition values and typical prices per ingredient, used for the estimates, plus the shake recipes.
- `data/workouts.js`: exercises, training programs and training basics.
- `data/sources.js`: authentic local sources per country, the cooking skills, and the flag for each country.
- `app.js`: all app logic.
- `sw.js`: the offline cache. **When you change any app file, bump `VERSION` in this file** so installed copies update. The app then shows "↻ Update ready — tap to reload".
- `manifest.webmanifest`, `icons/`: app name and icons for installing. Run `node tools/make-icons.js` to regenerate the icons.
- `tools/serve.js`: a tiny local server with no dependencies.
- `IDEAS.md`: brainstorm and roadmap.

## Your data
Everything is stored only in your browser on this device (localStorage), and nothing is sent anywhere. Use **Journal → Download backup** to save it or move it to another device.

## About the recipes
**Researched recipes (25, marked 📚 sourced):** for each dish, 2–3 recipe pages from the dish's country were read, mostly in the local language (Vietnamese, Japanese, Thai, Turkish, Persian, Hungarian…). The recipe was then written in our own words from what those pages agree on. Each recipe shows its source links and a note on what was cross-checked.

**Original 38 recipes:** these are written up from traditional home-cooking methods for each dish. They are not copied from any website. Each recipe links to a site search for its **native dish name** (e.g. 親子丼, phở bò, ผัดกะเพรา) on recipe sites from that country, so you can check how local home cooks make it.
