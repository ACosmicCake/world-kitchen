# 🌏 World Kitchen

**Live app: https://acosmiccake.github.io/world-kitchen/**

A cookbook, meal planner and cooking coach for people who cook alone, with traditional recipes from 16 countries. It works offline and can be installed as an app.

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

## Files
- `data/recipes.js`: the recipe database. The format is documented at the top of the file, so adding a recipe means copying an existing entry.
- `data/sources.js`: authentic local sources per country, the cooking skills, and the flag for each country.
- `app.js`: all app logic.
- `sw.js`: the offline cache. **When you change any app file, bump `VERSION` in this file** so installed copies update. The app then shows "↻ Update ready — tap to reload".
- `manifest.webmanifest`, `icons/`: app name and icons for installing. Run `node tools/make-icons.js` to regenerate the icons.
- `tools/serve.js`: a tiny local server with no dependencies.
- `IDEAS.md`: brainstorm and roadmap.

## Your data
Everything is stored only in your browser on this device (localStorage), and nothing is sent anywhere. Use **Journal → Download backup** to save it or move it to another device.

## About the recipes
The recipes are written up from traditional home-cooking methods for each dish. They are not copied from any website. Each recipe links to a site search for its **native dish name** (e.g. 親子丼, phở bò, ผัดกะเพรา) on recipe sites from that country, so you can check how local home cooks make it.
