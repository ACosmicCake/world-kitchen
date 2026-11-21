// Typical supermarket prices in US dollars per kg (2025-ish averages, rounded). Used to ESTIMATE costs.
// Prices differ a lot by country and store: set your currency + price level in Shop → "Prices & budget",
// and override any ingredient with what you actually pay.
// Row: [match names (longest substring wins), USD per kg]
window.PRICES = [
[["oil", "neutral oil", "vegetable oil", "groundnut oil", "lard or oil", "oil or ghee", "ghee or oil", "pork lard or vegetable oil"], 4],
[["olive oil", "olive oil or butter"], 13], [["sesame oil"], 15], [["coconut oil"], 12], [["dendê"], 14],
[["ghee"], 20], [["butter"], 11], [["lard"], 6], [["peanut butter"], 7], [["tahini"], 14],
[["pork belly", "skin-on pork belly", "pork belly or shoulder", "pork belly or spare ribs"], 10], [["pork shoulder", "ground pork shoulder"], 6],
[["ground pork", "ground pork or chicken"], 8], [["pork neck bones"], 4], [["guanciale"], 30], [["pancetta", "lardo or pancetta", "lardons or bacon"], 25], [["chouriço", "chorizo"], 15],
[["beef bones"], 5], [["beef brisket", "beef brisket or pork belly"], 12], [["beef chuck", "chicken thigh or beef chuck"], 13], [["beef sirloin", "beef eye of round", "thinly sliced beef"], 20],
[["beef shank"], 10], [["beef", "ground beef or pork", "ground or thin-sliced beef"], 11], [["lamb"], 18],
[["chicken thigh", "boneless chicken thigh"], 7], [["chicken breast or thigh", "boneless chicken thigh or breast"], 8.5], [["chicken pieces", "chicken thighs & drumsticks", "chicken & rabbit"], 5],
[["shrimp", "raw shrimp", "shell-on shrimp"], 20], [["white fish", "fish steaks"], 18], [["whole fish"], 10], [["dried anchovies", "large dried anchovies"], 25], [["dried shrimp"], 30],
[["egg", "eggs", "whole egg", "egg yolk"], 6], [["tofu", "firm tofu", "firm or soft tofu", "silken or soft tofu", "soft tofu"], 5],
[["yogurt", "plain yogurt"], 5], [["greek yogurt"], 7], [["whole milk", "milk"], 1.1], [["cream"], 7], [["condensed milk"], 6], [["pecorino"], 25], [["parmigiano"], 30],
[["rice", "bomba", "carnaroli", "jasmine or short-grain rice", "long-grain rice", "parboiled rice", "long-grain rice or coarse bulgur"], 2.5],
[["cooked rice", "cold cooked rice", "cooked japanese rice", "cooked short-grain rice", "jasmine rice", "steamed rice"], 1.1],
[["spaghetti", "pasta", "ditalini", "rigatoni", "tonnarelli"], 3], [["fresh tagliatelle"], 10], [["rice noodle", "flat rice noodles", "fresh rice vermicelli"], 5],
[["rice vermicelli"], 6], [["glass noodles"], 8], [["shirataki"], 10], [["rice paper"], 12], [["gyoza wrappers"], 10],
[["flour", "plain flour"], 1.5], [["cassava flour"], 6], [["cornstarch"], 4], [["bread", "stale country bread", "crusty bread"], 5], [["tostadas or tortillas", "tortilla"], 5], [["japanese curry roux"], 20],
[["chickpeas", "dried chickpeas", "lentils", "brown lentils", "red lentils", "toor dal", "masoor", "split peas", "dried pinto", "dried red kidney", "dried borlotti", "black beans"], 3.5],
[["cooked chickpeas"], 3], [["garrofó", "lima beans"], 5], [["flat green beans", "green beans", "long beans", "snow peas"], 6], [["pozole corn", "hominy", "large-kernel corn"], 4],
[["peanuts", "raw peanuts", "roasted peanuts"], 8], [["cashews"], 20], [["sesame seeds"], 12], [["oats", "rolled oats"], 3], [["whey protein"], 30],
[["coconut milk"], 5], [["coconut water"], 4],
[["sugar", "rock sugar", "palm sugar", "brown sugar", "gula melaka", "nước màu"], 2.5], [["honey", "honey or sugar"], 12],
[["kecap manis", "hoisin", "oyster sauce"], 8], [["ketchup"], 4], [["mirin", "sake", "shaoxing", "rice wine"], 10], [["gochujang", "doenjang", "miso", "soy paste", "doubanjiang"], 12],
[["curry paste", "thai chili paste", "nam phrik", "chipotles in adobo"], 14], [["soy sauce", "light soy sauce", "dark soy sauce"], 6], [["fish sauce"], 7],
[["vinegar"], 3], [["wine", "burgundy"], 10], [["stock", "broth", "dashi"], 1.5], [["water", "ice"], 0], [["tomato passata", "tomato purée"], 3], [["tomato paste"], 6],
[["potato", "potatoes", "floury potatoes", "medium potatoes", "large potatoes"], 2], [["sweet potatoes"], 3], [["taro"], 5], [["french fries"], 4], [["olives"], 12],
[["pineapple"], 3], [["green papaya", "papaya"], 4], [["apple"], 4], [["banana"], 1.5], [["berries", "frozen berries"], 8], [["avocado"], 6],
[["lemon", "lime", "limes", "small limes", "lime juice"], 5], [["tamarind"], 8],
[["onion", "white onion", "red onion", "large onion", "small onion", "pearl onions", "red onion or 4 shallots"], 2.5], [["shallots"], 8],
[["garlic", "minced garlic", "head garlic"], 10], [["ginger", "galangal"], 8], [["carrot", "carrots"], 2.5], [["parsnip"], 4], [["celeriac"], 4], [["celery"], 3],
[["tomato", "tomatoes", "ripe tomatoes", "plum tomatoes", "roma tomatoes", "pera", "cherry tomatoes"], 4.5], [["tomatillos"], 5],
[["bell pepper", "peppers", "italian green pepper"], 5], [["chili", "chile", "chilli", "chilies", "chillies", "serrano", "scotch bonnet", "ají", "cheongyang"], 10],
[["dried ancho", "dried guajillo", "dried red chillies", "dried red chilies", "dried red chili"], 25],
[["eggplant", "eggplants", "long eggplant"], 4.5], [["zucchini", "korean zucchini"], 4], [["cucumber"], 3], [["cauliflower"], 4], [["spinach", "water spinach"], 9],
[["napa cabbage", "cabbage", "couve", "kale"], 2.5], [["lettuce", "lettuce leaves"], 5], [["kimchi"], 12], [["bean sprouts", "soybean or mung bean sprouts"], 5], [["bamboo shoots"], 6],
[["mushrooms", "shiitake", "button mushrooms", "oyster or straw mushrooms"], 9], [["okra"], 7], [["radishes"], 6], [["daikon"], 3],
[["scallion", "scallions", "green onion", "garlic chives", "chives"], 8], [["lemongrass"], 10], [["preserved lemon"], 15], [["fried shallot"], 20],
[["herbs", "cilantro", "basil", "mint", "parsley", "perilla", "bạc hà", "coriander", "makrut", "pandan", "curry leaves", "rosemary", "thyme", "epazote", "bouquet garni"], 30],
[["kombu", "katsuobushi", "wakame"], 60], [["salt", "baking soda"], 1], [["rose water", "kasuri", "dried limes", "gochugaru", "belacan", "shrimp paste"], 20],
];
// Fallback USD/kg by aisle when nothing matches; spice-aisle lines cost a flat amount each (you use a pinch of a jar).
window.AISLE_PRICE = { produce: 3, meat: 9, seafood: 14, dairy: 5, bakery: 5, frozen: 5, intl: 8, pantry: 4 };
window.SPICE_LINE_COST = 0.15;

// Extra nutrition rows for shake ingredients (same format as data/nutrition.js).
window.NUTRITION.push(
  [["whey protein"], 400, 80, 8, 6, 30, 0.5],
  [["oats", "rolled oats"], 389, 17, 66, 7, 0, 0.4],
  [["banana"], 89, 1.1, 23, 0.3, 120],
  [["greek yogurt"], 97, 9, 4, 5],
  [["berries", "frozen berries"], 50, 0.7, 12, 0.3],
  [["avocado"], 160, 2, 9, 15, 200],
  [["condensed milk"], 321, 8, 54, 9, 0, 1.3],
);

// Cost (USD) of the planner's simple add-ons.
window.ADDON_COST = { rice: 0.3, "pb-toast": 0.6, oats: 1.0, gainer: 1.0, "eggs-toast": 1.2, "yogurt-bowl": 1.8, "trail-mix": 1.2, milk: 0.35, "olive-oil": 0.2, banana: 0.5 };

// Protein shakes & smoothies. Nutrition and cost are computed from the ingredients, like recipes.
window.SHAKES = [
  { id: "shake-gainer", name: "Budget mass-gainer shake", purpose: "gain", when: "After training or as a big snack",
    ingredients: ["400|ml|whole milk|dairy", "60|g|rolled oats|pantry", "1||banana|produce", "2|tbsp|peanut butter|pantry"],
    how: "Blend the oats dry first into a powder so the shake isn’t gritty, then add everything else and blend 30 seconds. No protein powder needed.", tip: "The cheapest way to drink 700+ kcal. Freeze peeled bananas in halves so it’s thick and cold." },
  { id: "shake-whey", name: "Whey recovery shake", purpose: "recovery", when: "Within an hour after training",
    ingredients: ["30|g|whey protein|pantry", "300|ml|whole milk|dairy", "1||banana|produce"],
    how: "Shake or blend. Fast protein plus carbs to refill your muscles after a session.", tip: "Use water instead of milk on days you’re over your calories." },
  { id: "shake-greek", name: "Greek yogurt power smoothie (no powder)", purpose: "gain", when: "Breakfast on the go or afternoon snack",
    ingredients: ["250|g|greek yogurt|dairy", "250|ml|whole milk|dairy", "30|g|rolled oats|pantry", "1|tbsp|honey|pantry", "100|g|frozen berries|frozen"],
    how: "Blend everything until smooth. High protein from real food only.", tip: "Strained (Greek) yogurt has about twice the protein of regular yogurt." },
  { id: "shake-bedtime", name: "Bedtime milk & peanut butter", purpose: "bedtime", when: "30–60 minutes before bed",
    ingredients: ["300|ml|whole milk|dairy", "1|tbsp|peanut butter|pantry"],
    how: "Blend or whisk with a pinch of cinnamon. Milk protein (mostly casein) digests slowly overnight.", tip: "Warm it up in winter." },
  { id: "shake-lean", name: "Lean whey & berry shake", purpose: "lean", when: "Snack when you need protein but not many calories",
    ingredients: ["30|g|whey protein|pantry", "300|ml|water|pantry", "100|g|frozen berries|frozen", "20|g|rolled oats|pantry"],
    how: "Blend until smooth. Lots of protein for few calories — for maintaining or cutting.", tip: "Add ice for a thicker shake." },
  { id: "shake-sinh-to-bo", name: "Vietnamese avocado smoothie", native: "Sinh tố bơ", purpose: "gain", when: "Afternoon snack",
    ingredients: ["1/2||avocado|produce", "200|ml|whole milk|dairy", "1|tbsp|condensed milk|pantry", "1|handful|ice|pantry"],
    how: "Blend avocado, milk, condensed milk and ice until thick and creamy — the classic Vietnamese street-stall smoothie.", tip: "Healthy fats make this an easy 400 kcal. Add a scoop of whey to boost protein." },
];
