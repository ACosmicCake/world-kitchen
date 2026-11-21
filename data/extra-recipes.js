// Researched recipes. Each was cross-checked against 2–3 real recipe pages from the dish's country
// (listed in `sources`, all fetched and read during research) and written in our own words.
// Same format as data/recipes.js, plus: authenticity (what was cross-checked) and sources [{name, url, lang}].

// ── batch: seasia ──
window.EXTRA_RECIPES = (window.EXTRA_RECIPES || []).concat([
  { id: "bun-cha", name: "Hanoi Grilled Pork with Noodles", native: "Bún Chả", country: "Vietnam", region: "Hanoi", difficulty: 2, servings: 4,
    tags: ["grill", "meal prep", "crowd pleaser"],
    skills: ["caramel", "balance", "knife"],
    intro: "Hanoi’s signature lunch: smoky grilled pork belly slices and seasoned pork patties dropped into a warm, sweet-sour fish-sauce broth, eaten with cold rice vermicelli and a pile of fresh herbs. The magic is in the contrast between charred, caramelised meat and the light, tangy dipping bowl with its crunchy papaya pickles.",
    ingredients: [
      "500|g|pork belly (or fatty pork shoulder)|meat",
      "400|g|ground pork shoulder (20–30% fat)|meat",
      "3|tbsp|shallots, minced|produce",
      "2|tbsp|garlic, minced|produce",
      "3|tbsp|fish sauce (marinade)|intl",
      "2|tbsp|sugar (marinade)|pantry",
      "1|tbsp|oyster sauce|intl",
      "1|tbsp|nước màu (Vietnamese caramel colour) or 3 tbsp sugar to make it|intl",
      "1|tsp|ground black pepper|spice",
      "1|tbsp|honey|pantry",
      "2|tbsp|neutral oil|pantry",
      "1|kg|fresh rice vermicelli (bún)|intl",
      "200|g|green papaya|produce",
      "1||carrot|produce",
      "400|g|lettuce and herbs (perilla, mint, Vietnamese basil, coriander)|produce",
      "100|ml|fish sauce (dipping broth)|intl",
      "90|g|sugar (dipping broth)|pantry",
      "90|ml|rice vinegar|pantry",
      "550|ml|water|pantry",
      "2||bird’s eye chillies, sliced|produce",
      "2|clove|garlic, minced (for the bowls)|produce"
    ],
    steps: [
      "A|15|Slice the pork belly 3–4 mm thick; thinner slices dry out and burn before they cook through. If you have no nước màu, melt 3 tbsp sugar to a dark amber and carefully whisk in 3 tbsp boiling water.",
      "A|10|Fry half the shallot and garlic in the oil until golden and keep the rest raw. Toss the belly slices with about half the fish sauce, sugar, oyster sauce, caramel and pepper plus half of both raw and fried aromatics.",
      "A|10|Mix the ground pork with the remaining marinade, aromatics and honey, and slap it against the bowl for 2–3 minutes so it binds. With oiled hands shape flat patties about 4 cm wide and 1 cm thick.",
      "P|60|Cover and refrigerate both meats for 1–4 hours. Do not go much past 12 hours or the meat weeps liquid and turns soft.",
      "A|15|Meanwhile salt the thinly sliced papaya and carrot for 10 minutes, rinse, squeeze dry and toss with 2 tbsp each vinegar and sugar. Warm the fish sauce, sugar and water until the sugar dissolves, then add the rest of the vinegar and taste for a sweet-sour-salty balance.",
      "A|15|Grill over glowing charcoal, about 10–15 cm above the coals, turning every minute or two until deep golden and lightly charred; the patties need a little longer than the slices. Without charcoal, roast at 200°C for 20–25 minutes, turning halfway.",
      "A|5|Divide the warm broth among 4 bowls with the pickles, garlic, chilli and a pinch of pepper, then drop the hot pork straight in so it soaks up the sauce. Serve the vermicelli (drained, not reheated) and herbs on the side for dipping."
    ],
    store: { fridge: 3, freeze: 2, reheat: "Freeze the raw marinated patties or grilled meat; reheat under a grill or in a hot pan. Keep broth, pickles and herbs separate; noodles and herbs are best fresh." },
    next: "Chop leftover grilled pork into a bánh mì with the papaya pickles, or toss it with cold noodles and herbs for a bún bowl.",
    tips: [
      "Hanoi cooks prize charcoal for the smoky flavour; fan the coals so the fat drips and sizzles rather than flaring.",
      "Some versions wrap the patties in betel leaves (lá lốt), and home cooks often swap the fish-sauce broth’s vinegar for lime juice added at the end.",
      "Taste the broth before adding the pork: it should be light enough to sip, not as strong as a dipping sauce."
    ],
    authenticity: "Both Vietnamese sources pair marinated sliced pork belly with seasoned pork patties coloured with nước màu, grill them, and serve them in a warm diluted fish sauce–sugar–vinegar broth with pickled green papaya and carrot; marinade and broth quantities averaged between the two.",
    sources: [
      { name: "Điện Máy Xanh – Vào Bếp", url: "https://www.dienmayxanh.com/vao-bep/huong-dan-cach-lam-bun-cha-ha-noi-thom-ngon-nhu-ngoai-hang-01018", lang: "vi" },
      { name: "Hoàng Hà Mobile – Bún chả chấm Hà Nội", url: "https://hoanghamobile.com/tin-tuc/bun-cha-cham/", lang: "vi" }
    ] },

  { id: "canh-chua-ca", name: "Southern Vietnamese Sour Fish Soup", native: "Canh Chua Cá", country: "Vietnam", region: "Mekong Delta (Southern Vietnam)", difficulty: 1, servings: 4,
    tags: ["soup", "weeknight", "light", "fresh"],
    skills: ["balance", "knife"],
    intro: "The everyday soup of the Mekong Delta: chunks of freshwater fish poached in a tamarind broth with pineapple, tomato, okra, taro stem and bean sprouts. It is sour, gently sweet and salty all at once, finished with fried garlic and the pungent paddy herb and sawtooth coriander that define Southern cooking.",
    ingredients: [
      "700|g|whole fish (red tilapia, snakehead or catfish), cut in steaks|seafood",
      "30|g|tamarind pulp (me)|intl",
      "1.2|L|water|pantry",
      "1/3||pineapple, peeled and cut in small wedges|produce",
      "2||tomatoes, cut in wedges|produce",
      "100|g|okra, sliced on the diagonal|produce",
      "100|g|bạc hà (taro stem / dọc mùng), peeled and sliced|intl",
      "150|g|bean sprouts|produce",
      "2|tbsp|fish sauce|intl",
      "1|tbsp|sugar|pantry",
      "1/2|tsp|salt|spice",
      "4|clove|garlic, minced|produce",
      "1|tbsp|neutral oil|pantry",
      "1|handful|rau om (rice paddy herb) and ngò gai (sawtooth coriander), chopped|produce",
      "1||red chilli, sliced|produce"
    ],
    steps: [
      "A|10|Scale and gut the fish, scrape away the dark membrane inside the belly, then rub with coarse salt and lime (or crushed ginger) and rinse several times. This removes the muddy smell freshwater fish can have.",
      "A|10|Cut the pineapple, tomatoes, okra and taro stem. Soak the tamarind in a little warm water, mash it and strain out the seeds to get the sour liquid.",
      "A|3|Fry the garlic in the oil until golden and set aside; it is the finishing aroma.",
      "A|5|Bring the water to a boil with the salt, add the tamarind liquid and pineapple, then lower in the fish gently so it keeps its shape.",
      "P|10|Simmer over medium heat for 8–10 minutes, skimming the foam so the broth stays clear, until the fish is just cooked.",
      "A|4|Add the tomato, then the okra, taro stem and bean sprouts. When it returns to a boil, season with fish sauce and sugar and taste for a bold sour-sweet-salty balance.",
      "A|2|Turn off the heat, add the herbs and chilli, ladle into a bowl and scatter the fried garlic on top. Serve hot with rice."
    ],
    store: { fridge: 1, freeze: 0, reheat: "Best eaten fresh: the vegetables go limp and the fish breaks up. Reheat leftovers gently just to a simmer and add fresh herbs." },
    next: "Strain leftover broth, bring to a boil and poach a handful of prawns or tofu in it with fresh bean sprouts for a quick second soup.",
    tips: [
      "Any firm freshwater fish works: Southern cooks use red tilapia (diêu hồng), snakehead (cá lóc), basa or cá hú; fish heads are a favourite.",
      "If tamarind is unavailable, the Điện Máy Xanh community version sours the broth with calamondin (tắc) juice and first sautés the pineapple with garlic and shallot for a sweeter base.",
      "Add the bean sprouts and herbs at the very end so they stay crunchy and fragrant."
    ],
    authenticity: "Both Vietnamese sources build the broth on tamarind with pineapple and tomato, add okra, taro stem and bean sprouts late, skim during poaching and finish with rau om and ngò gai; VnExpress adds fried garlic. Fish weight and tamarind were set between the two versions.",
    sources: [
      { name: "VnExpress – Canh cá chua kiểu Nam Bộ", url: "https://vnexpress.net/canh-ca-chua-kieu-nam-bo-4804417.html", lang: "vi" },
      { name: "Điện Máy Xanh – Canh chua cá lóc", url: "https://www.dienmayxanh.com/vao-bep/cach-nau-canh-chua-ca-loc-chuan-nhat-ngon-00828", lang: "vi" }
    ] },

  { id: "som-tam-thai", name: "Thai Green Papaya Salad", native: "ส้มตำไทย Som Tam Thai", country: "Thailand", region: "Central Thailand (from Isan roots)", difficulty: 1, servings: 2,
    tags: ["fresh", "quick", "spicy", "light"],
    skills: ["balance", "knife"],
    intro: "The Bangkok-style take on the Isan papaya salad: crisp shreds of unripe papaya bruised in a mortar with garlic, chilli, tomato and long beans, then dressed with lime, fish sauce and palm sugar and finished with dried shrimp and roasted peanuts. Unlike the funkier Lao-style versions with fermented fish, Som Tam Thai is sweet-sour and nutty.",
    ingredients: [
      "300|g|green (unripe) papaya, peeled and finely shredded|produce",
      "3|clove|garlic|produce",
      "3||bird’s eye chillies (more to taste)|produce",
      "2||long beans, cut in 4 cm lengths|produce",
      "6||cherry tomatoes, halved|produce",
      "1|tbsp|dried shrimp|intl",
      "2|tbsp|roasted peanuts, plus extra to serve|pantry",
      "2|tbsp|lime juice|produce",
      "1.5|tbsp|fish sauce|intl",
      "1|tbsp|palm sugar|intl",
      "||sticky rice and raw cabbage, to serve|produce"
    ],
    steps: [
      "A|10|Peel the papaya and shred it into thin strips. Chilling the strips for about 30 minutes in the fridge keeps them extra crisp.",
      "A|2|Pound the garlic and chillies in a mortar until broken up but not a paste.",
      "A|2|Add the long beans and pound until they just crack, then add the dried shrimp and peanuts and pound until the peanuts break into pieces.",
      "A|2|Add the tomatoes and press lightly so they release juice, then add palm sugar, lime juice and fish sauce and work until the sugar dissolves. Taste now: it should be sour first, then sweet and salty, then hot.",
      "A|2|Add the papaya and pound gently while turning everything with a spoon so the dressing coats it. Stop as soon as it is combined, or the papaya goes soggy.",
      "A|1|Pile onto a plate, scatter with more peanuts and serve right away with sticky rice and raw vegetables."
    ],
    store: { fridge: 0, freeze: 0, reheat: "Eat immediately; the papaya wilts and weeps within an hour. Shredded undressed papaya keeps 2 days in the fridge." },
    next: "Shred extra papaya and carrot and make a second batch with grilled chicken (gai yang) for a classic Isan pairing.",
    tips: [
      "Large dried shrimp can be very salty, so start with less fish sauce and adjust at the end.",
      "One Thai source uses tamarind water instead of lime juice; tart cherry or sida tomatoes are traditional.",
      "Use a clay or wooden mortar and a light hand: the aim is to bruise and mix, not to mash."
    ],
    authenticity: "All three Thai-language sources pound garlic and chilli first, then long beans and tomato, season with lime, fish sauce and palm/coconut sugar, add dried shrimp and peanuts, and add the papaya last with gentle pounding; quantities averaged between Sanook and thaifoodcookbook.net.",
    sources: [
      { name: "Sanook – วิธีทำส้มตำไทย", url: "https://www.sanook.com/women/187657/", lang: "th" },
      { name: "Thai Food Cookbook – ส้มตำไทย", url: "https://www.thaifoodcookbook.net/thaifoodrecipes_th/thaifood_isan_food/thaifood_somtumthai.html", lang: "th" },
      { name: "Thairath – สูตรส้มตำไทย ส้มตำปลาร้า", url: "https://www.thairath.co.th/lifestyle/food/2823662", lang: "th" }
    ] },

  { id: "nasi-lemak", name: "Coconut Rice with Anchovy Sambal", native: "Nasi Lemak dengan Sambal Ikan Bilis", country: "Malaysia", region: "Peninsular Malaysia", difficulty: 2, servings: 4,
    tags: ["breakfast", "spicy", "weekend project", "crowd pleaser"],
    skills: ["rice", "bloom", "balance"],
    intro: "Malaysia’s national dish: rice cooked in coconut milk with knotted pandan leaves, served with a dark, sweet-sour-spicy sambal, crisp fried anchovies, roasted peanuts, boiled egg and cucumber. It is eaten from breakfast to late night, traditionally wrapped in banana leaf.",
    ingredients: [
      "400|g|long-grain rice|pantry",
      "200|ml|coconut milk|intl",
      "300|ml|water (adjust for your rice)|pantry",
      "3||pandan leaves, tied in a knot|intl",
      "3|slice|fresh ginger (optional)|produce",
      "1/2|tsp|salt|spice",
      "15||dried red chillies, seeded and soaked|intl",
      "5||shallots|produce",
      "2|clove|garlic|produce",
      "1|tsp|belacan (shrimp paste), toasted|intl",
      "30|g|tamarind pulp|intl",
      "250|ml|warm water (for tamarind)|pantry",
      "1/2||red onion, sliced in rings|produce",
      "2|tbsp|gula Melaka or brown sugar|intl",
      "1/4|tsp|salt (sambal)|spice",
      "150|g|dried anchovies (ikan bilis), heads removed|intl",
      "100|ml|neutral oil|pantry",
      "100|g|raw peanuts|pantry",
      "4||eggs|dairy",
      "1||cucumber, sliced|produce"
    ],
    steps: [
      "P|15|Soak the tamarind pulp in the warm water, squeezing it repeatedly so the flavour dissolves, then strain and keep the juice. Soak the deseeded dried chillies in hot water at the same time to soften.",
      "A|5|Rinse the rice until the water runs clear and drain. Put it in a rice cooker or pot with the coconut milk, water, salt, pandan knot and ginger.",
      "P|25|Cook as you normally would, then rest 10 minutes and fluff; remove the pandan. Meanwhile boil the eggs for 9 minutes and cool them in cold water.",
      "A|10|Rinse and thoroughly dry the anchovies, then fry in the oil until light brown and crisp. Fry the peanuts in the same oil until golden. Drain both and let the anchovies cool so they stay crunchy.",
      "A|5|Pound or blend the soaked chillies, shallots, garlic and belacan into a fine paste, adding a splash of water if needed.",
      "A|15|Cook the paste in about 3 tbsp of the frying oil over medium-low heat, stirring often, until it darkens and the oil separates (pecah minyak). This slow frying removes the raw chilli taste and is the key to good sambal.",
      "A|10|Add the onion rings, tamarind juice, sugar and salt and simmer gently until thick and glossy. Stir in half the fried anchovies just before serving so they keep some crunch.",
      "A|5|Mound the rice on a plate or banana leaf with a spoonful of sambal, the remaining anchovies, peanuts, a halved egg and cucumber slices."
    ],
    store: { fridge: 2, freeze: 1, reheat: "Sambal keeps a week in the fridge and freezes well. Steam or microwave rice with a splash of water; keep anchovies and peanuts separate and airtight so they stay crisp." },
    next: "Use leftover sambal to stir-fry prawns or kangkung (sambal udang or kangkung belacan), or fold it into fried rice.",
    tips: [
      "Utusan’s Malay home version uses ready-made chilli paste, dried tamarind slices (asam keping), a little kicap manis and tomato sauce in the sambal, and adds ginger to the rice.",
      "Kedah’s nasi lemak kuning colours the rice yellow, and some cooks tint pandan rice green; plain white is the everyday standard.",
      "Do not add the crisp anchovies to the sambal too early or they turn soft."
    ],
    authenticity: "Both sources cook the rice with coconut milk and pandan, fry the anchovies separately until crisp, and sweeten and sour a fried chilli sambal with sugar/gula Melaka and tamarind; the Malaysian-born cook Low Bee Yinn’s paste-from-dried-chilli method was followed, with the Utusan variations noted in tips.",
    sources: [
      { name: "Free Malaysia Today (recipe by Bee Yinn Low)", url: "https://www.freemalaysiatoday.com/category/nation/2020/08/01/how-to-cook-the-perfect-plate-of-nasi-lemak", lang: "en" },
      { name: "Utusan Malaysia – Nasi Lemak Pandan Ayam Berempah", url: "https://www.utusan.com.my/premium/2022/01/nasi-lemak-pandan-ayam-berempah/", lang: "ms" }
    ] },

  { id: "sinigang-na-baboy", name: "Filipino Sour Tamarind Pork Soup", native: "Sinigang na Baboy", country: "Philippines", region: "Luzon (nationwide)", difficulty: 1, servings: 6,
    tags: ["soup", "one pot", "crowd pleaser", "leftovers"],
    skills: ["balance", "stock"],
    intro: "The Philippines’ beloved sour soup: tender pork simmered in a broth soured with young tamarind (sampalok), loaded with radish, taro, long beans, okra, eggplant and water spinach. It is clean, bracingly tart and savoury, eaten with rice and a saucer of fish sauce with crushed chilli.",
    ingredients: [
      "1|kg|pork belly or spare ribs, cut in chunks|meat",
      "450|g|young (green) tamarind|intl",
      "2.5|L|water (or rice-washing water)|pantry",
      "1||onion, cut in wedges|produce",
      "3||tomatoes, cut in wedges|produce",
      "2||taro (gabi), peeled and cubed|produce",
      "1||daikon radish, sliced|produce",
      "1||long eggplant, sliced|produce",
      "8||long beans (sitaw), cut in 5 cm lengths|produce",
      "6||okra|produce",
      "3||long green chillies (siling pansigang)|produce",
      "1|bunch|water spinach (kangkong), stems and leaves separated|produce",
      "3|tbsp|fish sauce (patis), plus more to taste|intl",
      "||ground black pepper|spice"
    ],
    steps: [
      "P|40|Boil the tamarind in 2 L of the water for about 40 minutes until the pods burst and soften. Mash, then pour through a sieve, pressing the pulp to extract every bit of sour juice.",
      "A|10|Return the tamarind broth to the pot (topping up with the remaining water) and bring to a boil with the onion, pork and half the tomatoes. Skim the scum well during the first 15 minutes for a clear soup.",
      "P|60|Add 1 tbsp fish sauce, cover and simmer for about an hour until the pork is tender. Add the taro for the last 20 minutes; let some pieces break down to give the broth body.",
      "A|5|Add the radish and eggplant and cook for 5 minutes, then the chillies, long beans, okra and remaining tomatoes for 3 minutes. Adding vegetables in batches keeps each one from overcooking.",
      "A|3|Add the kangkong stems and season with fish sauce and pepper; taste for a sharp sourness balanced by salt.",
      "P|4|Add the kangkong leaves, cover and turn off the heat so they wilt in the residual heat. Serve at once with rice and fish sauce with crushed chilli."
    ],
    store: { fridge: 3, freeze: 2, reheat: "Reheat gently to a simmer. The pork and broth freeze well; the vegetables soften, so add fresh kangkong when reheating." },
    next: "Shred leftover pork, crisp it in a pan and serve over garlic rice, or simmer it with the broth and a little coconut milk for sinigang sa gata.",
    tips: [
      "A 40 g sachet of sinigang mix or 2–3 tbsp tamarind paste can stand in for fresh tamarind when it is out of season (it peaks October to December).",
      "Yummy Kitchen TV parboils and sears the pork first and uses rice-washing water for a slightly thicker broth.",
      "Other Filipino souring agents include kamias, green mango and guava; pork neck bones give a richer broth."
    ],
    authenticity: "Both Filipino sources simmer pork belly with onion and tomato in a sour broth until tender, add vegetables in stages from slow-cooking radish and taro to quick-wilting kangkong, and season with patis; Panlasang Pinoy’s fresh-tamarind method was used, with Yummy Kitchen TV’s parboiling and rice-water broth noted.",
    sources: [
      { name: "Panlasang Pinoy (Vanjo Merano)", url: "https://panlasangpinoy.com/pork-sinigang-na-baboy/", lang: "en" },
      { name: "Yummy Kitchen TV", url: "https://yummykitchentv.com/sinigang-na-baboy/", lang: "en" }
    ] }
]);


// ── batch: eastasia ──
window.EXTRA_RECIPES = (window.EXTRA_RECIPES || []).concat([
  { id: "nikujaga", name: "Japanese Beef and Potato Simmer", native: "肉じゃが Nikujaga", country: "Japan", region: "Nationwide", difficulty: 1, servings: 4,
    tags: ["braise", "one pot", "weeknight", "budget", "leftovers"],
    skills: ["knife", "braise", "balance"],
    intro: "Nikujaga is the archetypal Japanese home-cooking dish: thin beef, potatoes and onion gently simmered in a sweet soy broth until the potatoes drink up the flavour. It is everyday comfort food rather than restaurant fare, and many Japanese people call it the taste of a mother’s kitchen. A drop lid and a short, gentle simmer are what keep the potatoes whole while the sauce soaks in.",
    ingredients: [
      "200|g|thinly sliced beef (kiriotoshi or komagire)|meat",
      "500|g|potatoes (floury-firm, e.g. danshaku), about 4|produce",
      "1||onion|produce",
      "1/2||carrot|produce",
      "100|g|shirataki (ito konnyaku) noodles|intl",
      "8||snow peas or 4 green beans|produce",
      "1|tbsp|neutral oil|pantry",
      "300|ml|dashi or water|pantry",
      "2|tbsp|sake|intl",
      "2|tbsp|mirin|intl",
      "2|tbsp|sugar|pantry",
      "3|tbsp|soy sauce|intl"
    ],
    steps: [
      "A|10|Peel the potatoes and cut into large 3–4 cm chunks, then soak briefly in water and drain to rinse off surface starch so they hold their shape. Cut the onion into wedges and the carrot into small rolling-cut pieces.",
      "A|5|Cut the shirataki into shorter lengths, blanch for a minute in boiling water to remove the alkaline smell, and drain. String the snow peas.",
      "A|5|Heat the oil in a wide pot over medium heat. Stir-fry the beef until it just changes colour, then add the potatoes, onion and carrot and toss until everything is coated in oil and the potato edges look slightly translucent.",
      "A|5|Pour in the dashi or water and bring to a boil. Skim off the grey foam carefully, which keeps the broth clean-tasting, then add the shirataki, sake, mirin and sugar.",
      "P|8|Cover with a drop lid (otoshibuta, or a circle of foil) and simmer on medium-low so the liquid bubbles gently at the edges. Sugar goes in first because it penetrates more slowly than salt.",
      "P|8|Stir in the soy sauce, replace the drop lid and simmer until a skewer slides easily into the largest potato chunk. Do not boil hard or the potatoes will crumble.",
      "A|5|Remove the lid and simmer a few more minutes until the liquid has reduced to about half the depth of the ingredients, adding the snow peas for the last 2 minutes. Taste and adjust with a little more soy sauce if needed.",
      "P|15|Let it rest off the heat before serving if you have time: as it cools the potatoes absorb more of the broth."
    ],
    store: { fridge: 3, freeze: 1, reheat: "Keeps 3 days in the fridge and tastes better on day two; reheat gently in a pot. Remove the potatoes before freezing or expect them to turn grainy." },
    next: "Mash the leftover potatoes and beef with a little of the broth, shape into patties, crumb and fry as nikujaga korokke (croquettes).",
    tips: [
      "Shirogohan.com makes it without dashi, relying on the beef for savouriness, while Macaroni uses dashi: both work, so use whichever you have.",
      "Pork is the usual choice in eastern Japan (Kanto), while beef is standard in Kansai and western Japan.",
      "Delish Kitchen adds the soy sauce in a second stage after the sweet seasonings; this gives a rounder flavour and less chance of over-salting.",
      "Carrot is optional. If you use it, cut it smaller than the potatoes so it cooks in the same time."
    ],
    authenticity: "All three Japanese sources stir-fry beef and vegetables, add liquid, skim, season with sake, mirin, sugar and soy and simmer under a drop lid for roughly 15–20 minutes before reducing; quantities averaged and scaled to 4 servings.",
    sources: [
      { name: "白ごはん.com (Shirogohan)", url: "https://www.sirogohan.com/recipe/nikujaga/", lang: "ja" },
      { name: "DELISH KITCHEN", url: "https://delishkitchen.tv/recipes/153240773708480781", lang: "ja" },
      { name: "macaroni", url: "https://macaro-ni.jp/43463", lang: "ja" }
    ] },

  { id: "tamagoyaki", name: "Sweet Japanese Rolled Omelette", native: "卵焼き Tamagoyaki", country: "Japan", region: "Nationwide", difficulty: 2, servings: 2,
    tags: ["breakfast", "quick", "vegetarian", "technique", "meal prep"],
    skills: ["eggs"],
    intro: "Tamagoyaki is a layered rolled omelette cooked in a rectangular pan, a fixture of Japanese breakfasts and bento boxes. This is the slightly sweet home style, seasoned with sugar and a touch of soy, as opposed to the savoury dashi-maki of Kansai. The skill is in pouring thin layers and rolling each one around the last.",
    ingredients: [
      "4||eggs|dairy",
      "1 1/2|tbsp|sugar|pantry",
      "1|tsp|soy sauce|intl",
      "2|tbsp|water|pantry",
      "|pinch|salt|spice",
      "1|tbsp|neutral oil (for greasing)|pantry"
    ],
    steps: [
      "A|3|Beat the eggs by cutting through the whites with chopsticks rather than whisking hard, so you do not whip in air. Add the sugar, soy sauce, water and salt and mix until the sugar dissolves.",
      "A|2|Heat a tamagoyaki pan (or small frying pan) over medium-low heat and wipe it with oil on folded kitchen paper, reaching the corners. Keep the oily paper nearby.",
      "A|2|Pour in about a quarter of the egg and tilt to cover the pan. Pop any big bubbles with chopsticks.",
      "A|2|When the surface is about half set but still wet, roll the egg from the far end toward you, then slide the roll back to the far end. Sweet egg burns easily, so lower the heat if it browns too fast.",
      "A|6|Grease the empty part of the pan, pour in another quarter of the egg and lift the roll so the liquid runs underneath and bonds to it. Roll again toward you. Repeat until all the egg is used.",
      "P|5|Turn the hot omelette onto kitchen paper or a bamboo mat, wrap and press gently into a neat block, and let it set for a few minutes before slicing into thick pieces."
    ],
    store: { fridge: 1, freeze: 0, reheat: "Best eaten the same day; for bento cook it fully through, cool completely and pack it cold. Do not freeze." },
    next: "Slice leftover tamagoyaki into strips and use as a filling for futomaki rolls or on top of chirashi rice.",
    tips: [
      "Delish Kitchen uses sugar and soy for a mildly sweet, golden omelette; Kurashiru uses cane sugar and salt only for a brighter yellow, sweeter version. Use soy or salt depending on the look you want.",
      "Kurashiru notes that a little water makes the omelette softer and fluffier; adding too much makes it hard to roll.",
      "Take it off the heat while the last layer is still slightly moist; residual heat finishes it and keeps it tender.",
      "For the savoury Kansai style (dashi-maki), replace the water and most of the sugar with about 100 ml dashi plus a little mirin and soy."
    ],
    authenticity: "Both Japanese sources pour the seasoned egg in 3–4 portions over medium-low heat, rolling each layer from the far side toward the cook; the sugar level is set between the two and a dashi-maki recipe from Delish Kitchen was checked for the regional variation.",
    sources: [
      { name: "DELISH KITCHEN", url: "https://delishkitchen.tv/recipes/423620241696752822", lang: "ja" },
      { name: "クラシル (Kurashiru)", url: "https://www.kurashiru.com/recipe_cards/a2285a71-906d-4cde-a968-7f81230b18d9", lang: "ja" },
      { name: "DELISH KITCHEN (dashi-maki variation)", url: "https://delishkitchen.tv/recipes/140552853935620595", lang: "ja" }
    ] },

  { id: "doenjang-jjigae", name: "Korean Soybean Paste Stew", native: "된장찌개 Doenjang-jjigae", country: "Korea", region: "Nationwide", difficulty: 1, servings: 4,
    tags: ["soup", "one pot", "weeknight", "budget", "spicy"],
    skills: ["stock", "knife", "balance"],
    intro: "Doenjang-jjigae is the everyday stew of Korean home cooking, a bubbling pot of fermented soybean paste broth with tofu, zucchini and potato, served alongside rice and banchan. Rice-washing water gives the broth body and a soft, rounded taste. Every household seasons it a little differently, but the deep, savoury doenjang is always the star.",
    ingredients: [
      "800|ml|rice-washing water (ssal-tteumul) or anchovy-kelp stock|pantry",
      "5||large dried anchovies, heads and guts removed|intl",
      "3|tbsp|doenjang (Korean soybean paste)|intl",
      "1/2|tbsp|gochujang (optional)|intl",
      "1|tbsp|minced garlic|produce",
      "100|g|beef brisket or pork belly, thinly sliced (optional)|meat",
      "1||potato|produce",
      "1/2||Korean zucchini (aehobak)|produce",
      "1/2||onion|produce",
      "2||shiitake mushrooms|produce",
      "150|g|firm tofu (about half a block)|dairy",
      "1||green onion (daepa)|produce",
      "1||cheongyang green chilli|produce",
      "1||red chilli|produce",
      "1|tsp|gochugaru (Korean chilli flakes)|spice"
    ],
    steps: [
      "A|10|Save the cloudy water from your second rinse of rice. Cut the potato, zucchini, onion and tofu into bite-sized chunks, slice the mushrooms, and cut the green onion and chillies on the diagonal.",
      "A|4|If using meat, brown it in a heavy pot over medium heat until the edges cook, then add the potato and stir for 2–3 minutes so it starts to soak up the fat.",
      "A|3|Pour in the rice water and add the anchovies. When it boils, dissolve the doenjang (pressing it through a small sieve gives a smoother broth), gochujang and garlic.",
      "P|8|Simmer, skimming lightly if you like, until the potato is nearly tender. Longer boiling deepens the flavour, especially with homemade doenjang.",
      "A|2|Add the zucchini, onion and mushrooms.",
      "P|5|Simmer until the vegetables just soften.",
      "A|3|Add the tofu, green onion, chillies and gochugaru and bring back to a boil. Taste and adjust with more doenjang or a pinch of salt; add a splash of water if it is too salty. Serve bubbling in the pot with rice."
    ],
    store: { fridge: 2, freeze: 1, reheat: "Keeps 2 days in the fridge; reheat until bubbling, adding a little water as it thickens. Tofu and zucchini get softer on reheating; freeze the broth without tofu if possible." },
    next: "Stir leftover stew with rice and a handful of greens and simmer into a thick porridge, or spoon it over rice as doenjang-bap with a fried egg.",
    tips: [
      "Grandmother Son Il-sun (Wikitree) kneads homemade doenjang with grated radish by hand before adding the water and drops whole anchovies straight into the pot instead of making separate stock.",
      "Store-bought doenjang is milder and sweeter than homemade; homemade is saltier, so start with less and boil longer.",
      "The 10000recipe version adds gochujang and a little sugar for a rounder, restaurant-style taste; leave them out for a cleaner, more traditional flavour.",
      "Plain water works if you have no rice water or stock, but the result is thinner."
    ],
    authenticity: "Both Korean sources build the stew on rice-washing water with doenjang, zucchini, tofu, green onion and chilli, and only adjust salt at the end; the anchovy-in-pot method and radish come from the Wikitree home recipe, quantities from 10000recipe.",
    sources: [
      { name: "만개의레시피 (10000recipe)", url: "https://www.10000recipe.com/recipe/6912841", lang: "ko" },
      { name: "위키트리 (Wikitree) 위키레시피", url: "https://www.wikitree.co.kr/articles/1164773", lang: "ko" }
    ] },

  { id: "gongbao-jiding", name: "Kung Pao Chicken", native: "宫保鸡丁 Gōngbǎo Jīdīng", country: "China", region: "Sichuan", difficulty: 2, servings: 2,
    tags: ["wok", "quick", "spicy", "weeknight", "crowd pleaser"],
    skills: ["knife", "wok", "bloom", "balance"],
    intro: "Kung Pao chicken is a Sichuan classic named after the Qing-dynasty governor Ding Baozhen, whose official title was Gongbao. Diced chicken is stir-fried with blistered dried chillies and Sichuan peppercorns, then glazed in a quick sauce with a sweet-sour edge that Sichuan cooks call lychee flavour. Crunchy peanuts go in at the very last moment.",
    ingredients: [
      "300|g|boneless chicken thigh or breast|meat",
      "1|tsp|Shaoxing wine|intl",
      "1/4|tsp|salt|spice",
      "1|tsp|light soy sauce (for marinade)|intl",
      "1|tbsp|cornstarch (for marinade)|pantry",
      "1|tbsp|sugar|pantry",
      "1|tbsp|Chinkiang black vinegar|intl",
      "1|tbsp|light soy sauce (for sauce)|intl",
      "1|tsp|dark soy sauce|intl",
      "1|tsp|cornstarch (for sauce)|pantry",
      "2|tbsp|water|pantry",
      "10||dried red chillies, cut into segments, seeds shaken out|spice",
      "1|tsp|Sichuan peppercorns|spice",
      "3||scallion whites, cut into 1.5 cm pieces|produce",
      "3|clove|garlic, sliced|produce",
      "10|g|ginger, sliced|produce",
      "60|g|roasted or fried unsalted peanuts|pantry",
      "3|tbsp|neutral oil|pantry",
      "1|tsp|sesame oil|pantry"
    ],
    steps: [
      "A|8|Pound the chicken lightly with the back of a cleaver to tenderise it, then cut into 1.5 cm dice. Mix with the wine, salt, light soy and cornstarch and massage for a few minutes until tacky, which keeps the meat juicy over high heat.",
      "P|15|Leave the chicken to marinate while you prep everything else; a stir-fry this fast needs every ingredient ready by the wok.",
      "A|3|Stir the sugar, vinegar, light and dark soy, cornstarch and water together in a small bowl. This pre-mixed sauce (wan zhi) lets you season in one quick pour.",
      "A|2|Heat the wok, add the oil and lower the heat. Fry the chillies and Sichuan peppercorns gently until the chillies darken to deep red and smell toasty; scoop them out before they turn black, as burnt chilli is bitter.",
      "A|3|Turn the heat to high, add the chicken and spread it out, then toss until it turns white. Add the scallion, garlic and ginger and stir-fry until fragrant.",
      "A|1|Return the chillies and peppercorns, stir the sauce and pour it in. Toss over high heat for about 30 seconds until the sauce thickens and turns glossy; long cooking drives off the vinegar.",
      "A|1|Off the heat, toss in the peanuts and sesame oil and serve immediately with rice so the peanuts stay crisp."
    ],
    store: { fridge: 2, freeze: 0, reheat: "Best eaten fresh. Leftovers keep 2 days; reheat quickly in a hot wok. The peanuts will soften. Not suitable for freezing." },
    next: "Toss leftovers with cooked rice noodles and a spoonful of chilli oil for a quick cold noodle lunch.",
    tips: [
      "The Sohu home recipe uses thigh meat and a pinch of baking soda in the marinade for extra tenderness; HowToCook allows thigh or breast. Traditional Sichuan menus often use breast, but thigh is more forgiving.",
      "Cucumber and carrot are common home additions, but purists leave them out because they release water and dilute the glossy sauce.",
      "HowToCook’s advanced version adds a little doubanjiang and diced celtuce (wosun), a popular Sichuan variation.",
      "Fry raw peanuts slowly in cold oil until golden, or dry them in a 150 C oven for 10 minutes, then let them cool so they stay crunchy."
    ],
    authenticity: "Both Chinese sources marinate diced chicken in wine, soy and starch, bloom dried chillies and Sichuan peppercorns in oil first, finish with a soy-sugar-vinegar-starch sauce over high heat and add peanuts last; quantities set between the two. Sichuan-specific recipe sites (xiachufang, meishichina, douguo) blocked automated fetching, so they are not listed.",
    sources: [
      { name: "HowToCook (程序员做饭指南)", url: "https://github.com/Anduin2017/HowToCook/blob/master/dishes/meat_dish/宫保鸡丁/宫保鸡丁.md", lang: "zh" },
      { name: "搜狐 (Sohu) 美食", url: "https://m.sohu.com/a/998700545_122435169", lang: "zh" }
    ] },

  { id: "lu-rou-fan", name: "Taiwanese Braised Pork Rice", native: "滷肉飯 Lǔròu Fàn", country: "Taiwan", region: "Nationwide", difficulty: 2, servings: 6,
    tags: ["braise", "batch", "freezer", "meal prep", "crowd pleaser"],
    skills: ["knife", "braise", "sear", "rice"],
    intro: "Lu rou fan is Taiwan’s national comfort food: small strips of skin-on pork belly braised in soy sauce, rock sugar and fried shallots until meltingly soft, then spooned with its sticky sauce over white rice. The pork skin releases gelatin that makes the sauce glossy and rich. It is sold at night markets and corner shops everywhere, often with a braised egg on the side.",
    ingredients: [
      "600|g|skin-on pork belly|meat",
      "6||shallots (about 60 g), thinly sliced|produce",
      "3|clove|garlic, minced|produce",
      "40|g|fried shallot crisps (you cong su)|intl",
      "100|ml|soy sauce|intl",
      "1|tbsp|soy paste (jiangyou gao)|intl",
      "50|ml|Taiwanese rice wine (mijiu)|intl",
      "20|g|rock sugar|intl",
      "2||star anise|spice",
      "1/2|tsp|white pepper|spice",
      "600|ml|water, approximately|pantry",
      "4||eggs, hard-boiled and peeled (optional)|dairy",
      "||steamed white rice, to serve|pantry"
    ],
    steps: [
      "A|15|Cut the pork belly, skin included, into small strips about the size of a little finger, with a sharp knife since the skin is tough. Slice the shallots thinly and evenly so they colour at the same rate.",
      "A|8|Put the pork into a dry pot over medium-low heat and stir until the fat renders out and the pieces turn lightly golden. No oil is needed; the rendered lard will flavour everything.",
      "A|5|Push the pork aside and fry the shallots and garlic slowly in the fat until golden and fragrant. Do not rush this: the shallot aroma is the soul of the dish.",
      "A|3|Add the soy sauce, soy paste, rice wine and rock sugar and let them bubble against the hot pot for a moment, then stir everything together.",
      "A|2|Add the shallot crisps, white pepper, star anise and enough water to just cover. Bring to a boil and taste; keep it slightly under-seasoned because the sauce will reduce.",
      "P|90|Cover and simmer on very low heat, stirring the bottom now and then so it does not stick, until the skin is soft and sticky. Add the peeled eggs for the last 45 minutes if using. Skim off excess fat if you prefer.",
      "A|5|Uncover and reduce over higher heat if the sauce is thin, leaving plenty of sauce. Spoon the pork and sauce over hot rice and serve with a halved egg, pickled radish or blanched greens."
    ],
    store: { fridge: 5, freeze: 3, reheat: "Keeps 5 days in the fridge and improves after a day. Freeze in portions; reheat gently in a pot with a splash of water until bubbling." },
    next: "Use the pork and sauce as a topping for dry noodles, or spoon it over blanched greens such as yu choy.",
    tips: [
      "Mirror Media’s big-batch version renders 2.4 kg of pork belly strips, fries a whopping 600 g of minced shallots in the fat and simmers for 4 hours; the skimmed fat is saved for stir-frying.",
      "iCook cook 主婦CC mixes pork belly with some ground pork shoulder and suggests a spoon of unsweetened peanut butter for richness; she simmers in a clay pot for about 30 minutes.",
      "Choose belly with skin: the collagen is what thickens the sauce. A fat-to-lean ratio around 3:7 is recommended.",
      "In southern Taiwan this dish is often called rou zao fan (肉燥飯), and some cooks use ground pork instead of hand-cut belly."
    ],
    authenticity: "All three Taiwanese sources render skin-on pork belly dry, fry shallots in the fat, then braise with soy sauce, rice wine and rock sugar; simmering times ranged from 30 minutes to 4 hours, so a 90-minute middle was chosen and quantities follow the 600 g iCook recipe.",
    sources: [
      { name: "愛料理 iCook – 角落媽媽的家常餐桌", url: "https://icook.tw/recipes/488933", lang: "zh-TW" },
      { name: "愛料理 iCook – 主婦CC", url: "https://icook.tw/recipes/464964", lang: "zh-TW" },
      { name: "鏡週刊 Mirror Media", url: "https://www.mirrormedia.mg/story/20210524food003", lang: "zh-TW" }
    ] }
]);


// ── batch: southasia-me ──
window.EXTRA_RECIPES = (window.EXTRA_RECIPES || []).concat([
  { id: "rajma-masala", name: "Punjabi Kidney Bean Curry", native: "राजमा मसाला Rājmā Masālā", country: "India", region: "Punjab", difficulty: 1, servings: 4,
    tags: ["curry", "vegetarian", "batch", "freezer", "budget", "crowd pleaser"],
    skills: ["legumes", "bloom"],
    intro: "Rajma is the Sunday comfort food of Punjabi homes: red kidney beans simmered until creamy in a deeply cooked onion, tomato and ginger-garlic masala. Paired with plain rice it becomes rajma chawal, one of the most loved meals in North India.",
    ingredients: [
      "200|g|dried red kidney beans (rajma)|pantry",
      "2|tbsp|ghee or oil|dairy",
      "1|tsp|cumin seeds|spice",
      "4||cloves (whole spice)|spice",
      "1||black cardamom pod|spice",
      "1||small cinnamon stick|spice",
      "2||onions, finely chopped|produce",
      "1|tbsp|ginger-garlic paste|produce",
      "3||tomatoes, finely chopped or pureed|produce",
      "2||green chillies, slit|produce",
      "1/2|tsp|ground turmeric|spice",
      "2|tsp|Kashmiri red chilli powder|spice",
      "1|tsp|ground coriander|spice",
      "1|tsp|ground cumin|spice",
      "1/2|tsp|garam masala|spice",
      "1|tbsp|kasuri methi (dried fenugreek leaves), crushed|intl",
      "2|tsp|salt|pantry",
      "||fresh coriander, chopped|produce"
    ],
    steps: [
      "A|5|Rinse the kidney beans well and cover with plenty of cold water.",
      "P|480|Soak overnight (at least 8 hours); well-soaked beans cook evenly and turn creamy.",
      "A|5|Drain, put the beans in a pressure cooker with 750 ml fresh water and 1 tsp salt.",
      "P|30|Pressure cook for 5 to 6 whistles (or simmer in a covered pot for 1.5 to 2 hours) until a bean crushes easily between your fingers. Undercooked rajma never turns creamy, so do not rush this.",
      "A|15|Meanwhile heat the ghee, crackle the cumin, cloves, cardamom and cinnamon, then fry the onions slowly until deep golden. Add the ginger-garlic paste and cook a minute more.",
      "A|8|Lower the heat, stir in the ground spices for 30 seconds to bloom them, then add the tomatoes and cook until the masala thickens and the oil separates at the edges.",
      "P|20|Tip in the beans with their cooking water, the green chillies and remaining salt. Simmer uncovered, then mash a ladleful of beans against the pot to thicken the gravy.",
      "A|2|Finish with garam masala, kasuri methi rubbed between your palms, and fresh coriander. Serve with steamed basmati or jeera rice."
    ],
    store: { fridge: 4, freeze: 3, reheat: "Keeps and improves overnight. Reheat gently with a splash of water as the gravy thickens on standing." },
    next: "Mash leftover rajma, spread on toasted bread with chopped onion and cheese for a rajma toastie, or roll into parathas.",
    tips: [
      "Hebbar’s Kitchen tempers whole spices (cloves, black cardamom, cinnamon, even mace) in ghee; Sanjeev Kapoor keeps it simpler with only ground spices and a blended onion-ginger-garlic paste. Both are home-style.",
      "Sanjeev Kapoor cooks the masala and soaked beans together in the pressure cooker for a one-pot version; just give it extra whistles.",
      "Jammu rajma and smaller Kashmiri beans cook faster and are prized for their creaminess; adjust cooking time to your beans."
    ],
    authenticity: "Both Indian sources soak the beans 8 to 12 hours, pressure-cook them for 5 or more whistles and simmer them in a tomato-onion-ginger-garlic masala until the oil separates; Hebbar adds whole spices and kasuri methi. Quantities follow both (1 cup beans for 4).",
    sources: [
      { name: "Hebbar’s Kitchen", url: "https://hebbarskitchen.com/rajma-recipe-punjabi-rajma-masala/", lang: "en" },
      { name: "Sanjeev Kapoor", url: "https://sanjeevkapoor.com/recipe/Rajma-Masala.html", lang: "en" }
    ] },

  { id: "aloo-gobi", name: "Spiced Potato and Cauliflower", native: "आलू गोभी Ālū Gobhī", country: "India", region: "North India", difficulty: 1, servings: 4,
    tags: ["vegetarian", "vegan", "weeknight", "budget", "one pan"],
    skills: ["knife", "bloom"],
    intro: "Aloo gobi is the everyday dry sabzi of North Indian kitchens: potatoes and cauliflower cooked until golden and coated in a tight masala of cumin, tomato and warm spices. It is eaten with hot rotis or parathas and tucked into lunch boxes across the region.",
    ingredients: [
      "500|g|cauliflower, cut into large florets|produce",
      "2||medium potatoes, peeled and cut into chunks|produce",
      "4|tbsp|neutral oil|pantry",
      "1|tsp|cumin seeds|spice",
      "1|pinch|asafoetida (hing)|spice",
      "1||onion, finely chopped|produce",
      "1|tsp|ginger-garlic paste|produce",
      "1||green chilli, slit|produce",
      "1||tomato, finely chopped|produce",
      "1/4|tsp|ground turmeric|spice",
      "1/2|tsp|Kashmiri red chilli powder|spice",
      "1/2|tsp|ground coriander|spice",
      "1/2|tsp|ground cumin|spice",
      "1|tsp|salt|pantry",
      "1/2|tsp|amchur (dried mango powder)|spice",
      "1/2|tsp|garam masala|spice",
      "1|tsp|kasuri methi (optional)|intl",
      "2|tbsp|fresh coriander, chopped|produce"
    ],
    steps: [
      "A|10|Cut the cauliflower into large florets and the potatoes into similar-sized chunks; bigger pieces hold their shape instead of collapsing into mush.",
      "A|12|Heat the oil in a wide kadai or pan and fry the cauliflower, then the potatoes, over medium heat until golden at the edges. Lift out and set aside.",
      "A|5|In the remaining oil (about 1 tbsp), crackle the cumin with the asafoetida and kasuri methi, then cook the onion until soft and lightly browned. Add ginger-garlic paste and green chilli for a minute.",
      "A|5|Lower the heat, add the ground spices and salt, stir for 30 seconds, then add the tomato and cook until it breaks down and the oil shines.",
      "P|10|Return the vegetables, fold gently to coat, cover and cook on low until a knife slides easily into the potato. Sprinkle a few drops of water only if it catches.",
      "A|2|Finish with amchur, garam masala and coriander. Serve hot with roti or paratha."
    ],
    store: { fridge: 3, freeze: 0, reheat: "Reheat in a dry pan to keep the edges crisp. Freezing makes the cauliflower watery, so do not freeze." },
    next: "Mash leftovers roughly and use as a stuffing for parathas or a toasted sandwich, as Hebbar’s Kitchen suggests.",
    tips: [
      "Hebbar’s Kitchen fries the vegetables first for crisp, golden pieces; Boldsky’s version blanches them in salted water for 2 minutes, then sautés, which uses less oil.",
      "Add 1/2 cup water at the vegetable stage if you want a loose, gravy-style aloo gobi; leave it out for the classic dry sabzi.",
      "A handful of boiled green peas turns it into aloo gobi matar, a common home variation."
    ],
    authenticity: "Both Indian sources fry or blanch the potato and cauliflower separately, then toss them into a cumin, onion, ginger-garlic and tomato masala with chilli, cumin and garam masala; Hebbar adds amchur and kasuri methi. Spice amounts are a middle of both.",
    sources: [
      { name: "Hebbar’s Kitchen", url: "https://hebbarskitchen.com/aloo-gobi-dry-recipe-aloo-gobhi-ki-sabji/", lang: "en" },
      { name: "Boldsky (recipe by Meena Bhandari)", url: "https://www.boldsky.com/recipes/aloo-gobi-117560.html", lang: "en" }
    ] },

  { id: "parippu", name: "Sri Lankan Red Lentil Curry with Coconut Milk", native: "පරිප්පු Parippu", country: "Sri Lanka", region: "Island-wide", difficulty: 1, servings: 4,
    tags: ["curry", "vegetarian", "vegan", "quick", "weeknight", "budget"],
    skills: ["legumes", "balance"],
    intro: "Parippu is the gentle golden dhal that appears at nearly every Sri Lankan rice-and-curry table. Red lentils are simmered with shallots, garlic, curry leaves and pandan, then softened with coconut milk for a mild, creamy curry that balances the spicier dishes around it.",
    ingredients: [
      "200|g|red lentils (masoor dhal)|pantry",
      "1||red onion or 4 shallots, finely chopped|produce",
      "2|clove|garlic, finely chopped|produce",
      "1||green chilli, sliced|produce",
      "1|sprig|curry leaves|intl",
      "1||small piece pandan leaf (optional)|intl",
      "1/4|tsp|fenugreek seeds|spice",
      "1/2|tsp|ground turmeric|spice",
      "1/2|tsp|Sri Lankan unroasted curry powder|spice",
      "1/2|tsp|chilli powder|spice",
      "250|ml|coconut milk|intl",
      "1|tsp|salt|pantry",
      "1|tbsp|coconut oil (for tempering)|pantry",
      "1/2|tsp|black mustard seeds|spice",
      "2||dried red chillies, broken|spice",
      "1/4||lime (juice)|produce"
    ],
    steps: [
      "A|3|Rinse the lentils several times until the water runs clear; this removes starch that makes the pot foam.",
      "P|20|Leave them to soak in about 500 ml water so they plump and cook evenly.",
      "A|3|Add half the onion, the garlic, green chilli, curry leaves, pandan, fenugreek, turmeric, curry powder and chilli powder to the lentils and their water.",
      "P|15|Cover and simmer on low to medium heat until the lentils are soft and yellow. Stir only once or twice so they keep some body, and add a little warm water if the pan dries.",
      "A|3|Lower the heat, pour in the coconut milk and stir gently. Bring just to a simmer, then take off the heat, since boiling hard can split the coconut milk. Salt to taste.",
      "A|4|For the tempering, heat coconut oil, pop the mustard seeds, then fry the remaining onion and dried chillies until golden. Pour over the dhal and add a squeeze of lime."
    ],
    store: { fridge: 3, freeze: 2, reheat: "Thickens as it cools; reheat gently with a splash of water and do not let it boil hard." },
    next: "Thin leftover parippu with stock for a quick lentil soup, or eat it the Sri Lankan way with pol roti or bread for breakfast.",
    tips: [
      "Hungry Lankan cooks everything (except coconut milk) together in one pot; the Malini’s Kitchen recipe on Infolanka boils the lentils first and adds a tempering of mustard seed, chilli and garlic before the coconut milk. Both are common at home.",
      "Shallots are traditional; if using thick canned coconut milk, thin it with a little water first.",
      "Use a deep pot and keep the lid slightly ajar: red lentils expand and foam as they cook."
    ],
    authenticity: "Both Sri Lankan sources cook red lentils with turmeric, curry powder, chilli, onion and curry leaves, then add coconut milk only once the lentils are soft and bring it barely to a simmer; Infolanka adds a mustard-seed tempering and lime. Quantities sit between the two.",
    sources: [
      { name: "Hungry Lankan (Roshani Wickramasinghe)", url: "https://www.hungrylankan.com/recipes/sri-lankan-red-lentil-curry/", lang: "en" },
      { name: "Infolanka Sri Lanka Recipes (Malini’s Kitchen)", url: "https://infolanka.com/recipes/mess3/11.html", lang: "en" }
    ] },

  { id: "menemen", name: "Turkish Scrambled Eggs with Tomatoes and Peppers", native: "Menemen", country: "Turkey", region: "Nationwide", difficulty: 1, servings: 2,
    tags: ["breakfast", "quick", "vegetarian", "one pan"],
    skills: ["eggs"],
    intro: "Menemen is the star of the Turkish breakfast table: green peppers and grated ripe tomatoes cooked down in olive oil and butter, then softly scrambled with eggs. It is served bubbling in its pan with bread for dipping, and whether onion belongs in it is a friendly national debate.",
    ingredients: [
      "1|tbsp|olive oil|pantry",
      "1|tbsp|butter|dairy",
      "3||long green peppers (sivri or çarliston), sliced|produce",
      "3||ripe tomatoes|produce",
      "3||eggs|dairy",
      "1/2|tsp|salt|pantry",
      "1/4|tsp|black pepper|spice",
      "1/2|tsp|pul biber (Aleppo-style red pepper flakes)|spice",
      "||dried thyme or chopped parsley (to finish)|produce",
      "||crusty bread (to serve)|bakery"
    ],
    steps: [
      "A|5|Slice the peppers thinly and grate the tomatoes on a box grater, discarding the skins; grating gives a silky, saucy menemen.",
      "A|5|Warm the olive oil and butter in a small wide pan (ideally a sahan) and fry the peppers until soft and changing colour, without browning.",
      "A|8|Add the tomatoes, pul biber and black pepper and cook uncovered on low to medium heat until most of the liquid has evaporated; a watery menemen is the most common mistake.",
      "A|3|Add the eggs and salt and stir gently until just set and still glossy. Some cooks stir in the whites first and add the yolks for the last minute.",
      "A|1|Take off the heat while slightly soft (it keeps cooking), scatter with thyme or parsley and serve in the pan with bread."
    ],
    store: { fridge: 0, freeze: 0, reheat: "Best eaten immediately; reheated eggs turn rubbery." },
    next: "Make a double batch of the pepper and tomato base and keep it chilled for 2 days, then just add fresh eggs each morning.",
    tips: [
      "Onion is optional: Habertürk notes the pepper-only version is the breakfast classic while the onion version suits dinner. Add onion with the peppers if using.",
      "Variations: fry sucuk slices after the peppers for sucuklu menemen, or melt in kaşar or white cheese just before the eggs set.",
      "If your tomatoes are sour, Yemek.com suggests a tiny pinch of sugar; salt goes in just before or with the eggs."
    ],
    authenticity: "Both Turkish sources sauté sliced green peppers, add grated or diced tomatoes and reduce them before stirring in eggs, seasoned with salt, pepper and pul biber or thyme; both treat onion as optional. Quantities follow Yemek.com scaled with Habertürk’s 3-3-3 ratio.",
    sources: [
      { name: "Yemek.com", url: "https://yemek.com/tarif/menemen/", lang: "tr" },
      { name: "Habertürk", url: "https://www.haberturk.com/en-lezzetli-ve-guzel-menemen-tarifi-soganli-ya-da-sucuklu-menemen-nasil-yapilir-hts-1935291", lang: "tr" }
    ] },

  { id: "khoresh-gheymeh", name: "Persian Lamb and Split Pea Stew", native: "خورش قیمه Khoresh-e Gheymeh", country: "Iran", region: "Nationwide", difficulty: 2, servings: 6,
    tags: ["braise", "batch", "freezer", "party", "weekend project", "crowd pleaser"],
    skills: ["braise", "legumes", "balance"],
    intro: "Gheymeh is one of Iran’s most beloved khoresh: small cubes of lamb slow-cooked with yellow split peas, tomato paste and dried limes, perfumed with saffron and often a whisper of cinnamon and rose water. Crowned with crisp potato matchsticks, it is a fixture at family gatherings and at nazri meals cooked for religious occasions.",
    ingredients: [
      "400|g|lamb shoulder or leg, cut into 1.5 cm cubes|meat",
      "150|g|yellow split peas (lapeh)|pantry",
      "1||large onion, finely chopped|produce",
      "3|tbsp|vegetable oil|pantry",
      "1/2|tsp|ground turmeric|spice",
      "1/2|tsp|black pepper|spice",
      "2|tbsp|tomato paste|pantry",
      "4||dried limes (limoo omani)|intl",
      "1/4|tsp|saffron threads, ground and steeped in 3 tbsp hot water|spice",
      "1||cinnamon stick (or 1/2 tsp ground)|spice",
      "3||green cardamom pods|spice",
      "1|tbsp|rose water (optional)|intl",
      "1|tsp|salt|pantry",
      "2||large potatoes (for matchstick fries)|produce",
      "||oil for frying|pantry"
    ],
    steps: [
      "P|120|Rinse the split peas and soak them for about 2 hours, changing the water once; this reduces bitterness and helps them cook evenly.",
      "A|10|Pierce each dried lime a few times and simmer in water for 10 minutes, then drain; this tames their bitterness.",
      "A|12|Fry the onion in oil until golden. Add turmeric and pepper, then the lamb, and cook just until the meat changes colour all over.",
      "A|5|Add the drained split peas and fry for 2 minutes, then the tomato paste for 3 to 4 minutes until its raw smell fades. Do not let it scorch or the stew turns dark and bitter.",
      "P|60|Pour in about 1 litre boiling water, add the cinnamon and cardamom, bring to a boil, then cover and simmer on very low heat.",
      "P|60|Add the limes and half the saffron and keep simmering gently until the lamb is tender and the split peas are soft but whole.",
      "P|20|Season with salt, add the remaining saffron and the rose water, and simmer uncovered until the sauce is thick and glossy with oil rising to the top.",
      "A|20|Meanwhile cut the potatoes into very thin matchsticks, rinse, dry well and deep-fry until crisp. Pile them on the stew just before serving with saffron rice (chelow)."
    ],
    store: { fridge: 4, freeze: 3, reheat: "Tastes better the next day. Reheat gently on the hob; fry the potatoes fresh, as they go soft in storage." },
    next: "Spoon leftover gheymeh over fried eggplant slices (gheymeh bademjan style), or into a warm flatbread with yogurt.",
    tips: [
      "If the dried limes make the stew bitter, Namnak suggests simmering half a raw potato in it for 15 minutes and removing it; Bartarinha takes the limes out before the final simmer.",
      "Cinnamon darkens the stew, so some cooks add it only at the end or skip it for a lighter colour.",
      "Fried eggplant instead of (or as well as) potatoes is a popular variation; Bartarinha also suggests a little ginger or a few cardamom pods in the last 10 minutes."
    ],
    authenticity: "Both Persian sources fry onion, turmeric and lamb, then split peas and tomato paste, and simmer around 2.5 to 3 hours with pierced dried limes added for the last hour or so, finishing with saffron and optional rose water and cinnamon, topped with fried potatoes. Meat and pea amounts are averaged.",
    sources: [
      { name: "Namnak (نمناک)", url: "https://namnak.com/%D8%AE%D9%88%D8%B1%D8%B4-%D9%82%DB%8C%D9%85%D9%87.p18516", lang: "fa" },
      { name: "Bartarinha (برترین‌ها)", url: "https://www.bartarinha.ir/fa/news/869788/طرز-تهیه-خورش-قیمه-مجلسی-مرحله‌به‌مرحله", lang: "fa" }
    ] }
]);


// ── batch: europe ──
window.EXTRA_RECIPES = (window.EXTRA_RECIPES || []).concat([
  { id: "cacio-e-pepe", name: "Roman Pecorino and Black Pepper Pasta", native: "Cacio e Pepe", country: "Italy", region: "Rome, Lazio", difficulty: 2, servings: 4,
    tags: ["quick", "weeknight", "budget", "technique"],
    skills: ["emulsion"],
    intro: "A Roman classic built from nothing but pasta, aged Pecorino Romano and toasted black pepper, said to come from the shepherds of Lazio who carried long-keeping foods. There is no butter or cream: the silky sauce is an emulsion of grated cheese and starchy pasta water, which makes it a true test of technique.",
    ingredients: ["400|g|spaghetti or tonnarelli|pantry", "120|g|Pecorino Romano DOP, finely grated, plus extra to serve|dairy", "5|g|whole black peppercorns|spice", "1|tsp|coarse salt (for the pasta water)|pantry"],
    steps: [
      "A|5|Grate the pecorino as finely as you can into a large bowl; fine, dry cheese melts evenly instead of forming lumps.",
      "A|4|Toast the peppercorns in a dry heavy pan over medium heat until fragrant, then crush them coarsely in a mortar. Toasting releases the aromatic oils and rounds off the raw bite. Stir most of the pepper into the cheese.",
      "A|10|Boil the pasta in well-salted water (go easy on the salt, the pecorino is salty) and drain it about one minute before the packet time, saving plenty of cooking water.",
      "A|2|While the pasta finishes, whisk half a ladle of hot but not boiling pasta water into the cheese and pepper with a fork until you have a thick, smooth cream. Water that is too hot makes the cheese seize into strings.",
      "A|2|Off the heat, put the pasta in a wide pan or the bowl with the cream and toss hard, adding spoonfuls of pasta water until every strand is coated in a glossy sauce.",
      "A|1|Serve at once on warm plates with more pecorino and the remaining crushed pepper."
    ],
    store: { fridge: 0, freeze: 0, reheat: "Eat immediately: the emulsion breaks and turns rubbery as it cools, so it does not keep or reheat well." },
    next: "Mix any leftover pasta with beaten eggs and extra pecorino and fry it into a crisp frittata di pasta.",
    tips: ["Always toss off the heat; direct heat is the main reason the cheese clumps.", "Tonnarelli (thick square egg pasta) are the old Roman choice, spaghetti is the everyday one; Turismo Roma also mentions rigatoni and chitarra-cut pasta at home.", "For a milder version, Dissapore suggests cutting the pecorino with some Parmigiano, though purists use pecorino only."],
    authenticity: "All three Italian sources use only pasta, Pecorino Romano and black pepper, with the cream made from cheese and pasta water and finished off the heat; Dissapore and the Le Spighe chef both toast the pepper first. Quantities follow Dissapore and Turismo Roma (100 to 120 g cheese per 400 g pasta).",
    sources: [{ name: "Dissapore", url: "https://www.dissapore.com/ricette/spaghetti-cacio-e-pepe-ricetta-originale/", lang: "it" }, { name: "Turismo Roma (City of Rome tourism)", url: "https://turismoroma.it/it/node/34889", lang: "it" }, { name: "Scatti di Gusto (chef Giuseppe Mulargia, Rome)", url: "https://www.scattidigusto.it/tonnarelli-cacio-e-pepe-la-ricetta-originale-dal-cuore-di-roma", lang: "it" }] },

  { id: "pasta-e-fagioli", name: "Italian Pasta and Bean Soup", native: "Pasta e Fagioli", country: "Italy", region: "Nationwide (Veneto, Campania, Tuscany and beyond)", difficulty: 1, servings: 4,
    tags: ["soup", "budget", "one pot", "batch", "crowd pleaser"],
    skills: ["legumes", "knife"],
    intro: "One of the great cucina povera dishes of Italy: borlotti beans and short pasta cooked together in a thick, savoury soup. Part of the beans is pureed so the soup turns creamy without any cream, and every region has its own spin, from Venetian pasta e fasoi to Neapolitan versions with mussels.",
    ingredients: ["200|g|dried borlotti beans (or 400 g cooked)|pantry", "250|g|ditalini or other short pasta|pantry", "1||onion|produce", "1||carrot|produce", "1||celery stalk|produce", "1|clove|garlic|produce", "60|g|lardo or pancetta, diced (optional)|meat", "1|tbsp|tomato paste (or 4 tbsp passata)|pantry", "2||bay leaves|spice", "1|sprig|rosemary|produce", "3|tbsp|extra virgin olive oil, plus extra to serve|pantry", "1.2|L|vegetable or meat broth|pantry", "||salt and black pepper|spice", "||grated Parmigiano (optional, to serve)|dairy"],
    steps: [
      "P|480|Soak the dried beans in plenty of cold water for 8 to 12 hours, changing the water once or twice if you can.",
      "P|50|Drain, cover with fresh water, add one bay leaf and simmer gently until creamy inside, about 40 to 60 minutes depending on the beans. Salt only near the end so the skins stay tender.",
      "A|15|Finely chop onion, carrot and celery. Warm the oil in a heavy pot and cook the vegetables slowly with the lardo or pancetta (if using), garlic, rosemary and the second bay leaf for about 15 minutes, until soft and golden. A slow soffritto is where most of the flavour comes from.",
      "P|20|Add the drained beans and tomato paste, stir for a minute, then pour in enough broth to cover by two fingers. Simmer for about 20 minutes.",
      "A|5|Fish out the bay leaves, rosemary and garlic. Blend or pass through a food mill about half the beans and stir the puree back in; this is what gives the soup its body.",
      "A|10|Bring back to a boil, add the pasta and cook until al dente, stirring often and adding hot broth or water as it thickens.",
      "P|5|Turn off the heat a minute or two early and let it rest, then check salt and serve with a thread of raw olive oil, black pepper and Parmigiano if you like."
    ],
    store: { fridge: 2, freeze: 0, reheat: "The pasta keeps drinking liquid, so loosen with a ladle of water and a spoonful of oil when reheating. Do not freeze with the pasta in; freeze the bean base alone and cook fresh pasta into it instead." },
    next: "Let leftovers thicken overnight, then press into a pan and fry the slices crisp on both sides, or thin with broth and add greens for a quick minestra.",
    tips: ["The right texture is very thick: Dissapore says a spoon should almost stand up in it, while a brothier version is fine if you prefer.", "Canned borlotti work for a weeknight; rinse them well and skip the soak and first simmer.", "Regional variations: Naples adds mussels, Emilia drops in Parmigiano rinds, and some cooks add pork rind, sausage or potatoes; cannellini can replace borlotti."],
    authenticity: "Both Italian sources build the soup on a carrot, celery and onion soffritto with borlotti, a little tomato and short pasta, and both puree part of the beans for creaminess; I averaged the pasta quantity (220 to 320 g) and kept the lardo optional as Dissapore does.",
    sources: [{ name: "Dissapore", url: "https://www.dissapore.com/ricette/pasta-e-fagioli/", lang: "it" }, { name: "Dulcis in Forno (GialloZafferano blog)", url: "https://blog.giallozafferano.it/dulcisinforno/pasta-e-fagioli-semplice-ricetta-classica/", lang: "it" }] },

  { id: "gazpacho-andaluz", name: "Andalusian Chilled Tomato Soup", native: "Gazpacho Andaluz", country: "Spain", region: "Andalusia", difficulty: 1, servings: 6,
    tags: ["fresh", "light", "vegan", "party", "meal prep"],
    skills: ["emulsion", "balance"],
    intro: "The cold summer soup of Andalusia: ripe tomatoes, cucumber, green pepper, garlic, stale bread, olive oil and sherry vinegar blended into a smooth, refreshing cream. It began as a pounded mortar dish of bread, garlic, oil and vinegar, and the bread and oil still give it its velvety body.",
    ingredients: ["1|kg|very ripe pera (plum) tomatoes|produce", "1||Italian green pepper|produce", "1||cucumber|produce", "1|clove|garlic|produce", "50|g|stale country bread|bakery", "60|ml|extra virgin olive oil, plus extra to finish|pantry", "30|ml|sherry vinegar (vinagre de Jerez)|pantry", "250|ml|very cold water|pantry", "5|g|salt|spice", "||diced cucumber, pepper and tomato, or fried bread croutons (to serve)|produce"],
    steps: [
      "A|5|Soak the stale bread in a little water for a few minutes, then squeeze it out. Peel the cucumber if the skin is thick or bitter.",
      "A|10|Roughly chop the tomatoes, pepper, cucumber and garlic. No need to peel the tomatoes or pepper, the sieve will catch the skins.",
      "A|5|Blend the vegetables, bread, vinegar, salt and cold water until completely smooth, then with the motor running pour in the olive oil in a thin stream so it emulsifies into a creamy, pale orange soup.",
      "A|5|Press the gazpacho through a fine sieve with the back of a ladle to remove skins and seeds. Taste and adjust salt, vinegar or water; it should be bright but not sharp.",
      "P|120|Cover and chill for at least two hours (or overnight). Do not add ice to cool it faster, it only waters it down.",
      "A|5|Serve very cold in bowls or glasses with a drizzle of oil and small bowls of finely diced vegetables and fried bread for everyone to add."
    ],
    store: { fridge: 2, freeze: 0, reheat: "Serve cold, never heat. Keep tightly covered in the fridge so it does not oxidise or pick up other smells; stir before serving. Does not freeze well." },
    next: "Use leftover gazpacho as a cold sauce over grilled fish or prawns, or as the base for a quick tomato rice.",
    tips: ["Purists leave out onion and red pepper; Directo al Paladar suggests serving chopped onion on the side for those who like it.", "Plum (pera) tomatoes are preferred because they have firm flesh, few seeds and less water.", "Consumer describes the old method: garlic and salt pounded in a mortar, then bread, oil, water and vinegar worked in (that stage alone is gazpacho blanco) before the vegetables go in. A lighter, chunkier relative called aguadillo floats chopped vegetables in seasoned water."],
    authenticity: "Both Spanish sources use tomato, cucumber, green pepper, garlic, stale bread, olive oil, vinegar and salt, and both warn against adding ice or watering it down; quantities follow Directo al Paladar, with the oil added gradually as in the mortar method described by Consumer.",
    sources: [{ name: "Directo al Paladar", url: "https://www.directoalpaladar.com/recetas-de-sopas-y-cremas/receta-de-gazpacho-andaluz-tradicional", lang: "es" }, { name: "Consumer (Fundación Eroski)", url: "https://www.consumer.es/?p=26210", lang: "es" }] },

  { id: "caldo-verde", name: "Portuguese Kale, Potato and Chouriço Soup", native: "Caldo Verde", country: "Portugal", region: "Minho", difficulty: 1, servings: 6,
    tags: ["soup", "budget", "weeknight", "one pot", "crowd pleaser"],
    skills: ["knife"],
    intro: "The national soup of Portugal, born in the Minho region in the north: a smooth potato and onion broth full of ribbon-thin couve-galega, finished with slices of chouriço and a thread of raw olive oil. It is served everywhere from family tables to the late-night stalls of the Santos Populares festivals, usually with a slice of broa cornbread.",
    ingredients: ["600|g|floury potatoes|produce", "1||onion|produce", "3|clove|garlic|produce", "4|tbsp|olive oil, plus extra to finish|pantry", "1/2||chouriço de carne (about 120 g)|meat", "1.5|L|water|pantry", "200|g|couve-galega (Portuguese collard greens), very finely shredded|produce", "||salt and black pepper|spice", "||broa de milho (cornbread), to serve|bakery"],
    steps: [
      "A|5|Chop the onion and slice the garlic. Warm the oil in a large pot and gently soften them with the whole chouriço for a few minutes, so the sausage perfumes the base.",
      "P|20|Add the peeled potatoes in large chunks, season, pour in the water and simmer until the potatoes fall apart when pressed, about 20 minutes.",
      "A|10|Meanwhile stack and roll the couve leaves (stalks removed) into tight cigars and slice them into the thinnest possible ribbons. Fine shreds cook in minutes and stay green.",
      "A|5|Lift out the chouriço. Blend the soup with a stick blender, adding a splash of raw olive oil, until velvety; it should be smooth but still pourable.",
      "P|5|Bring back to a simmer, stir in the couve and cook uncovered for about 3 to 5 minutes, just until tender. Leaving the lid off keeps the greens a bright, vivid green.",
      "A|3|Slice the chouriço into thin rounds. Ladle the soup into bowls, top each with a few slices and a drizzle of olive oil, and serve with broa."
    ],
    store: { fridge: 3, freeze: 1, reheat: "Reheat gently, adding a little water if it has thickened; the greens lose some colour on standing. For freezing, freeze the blended potato base without the couve and add freshly shredded greens when reheating." },
    next: "Simmer leftover soup with a handful of rice or white beans to turn it into a thicker, more filling one-bowl meal.",
    tips: ["If you cannot find couve-galega, Portuguese cabbage or collard greens are the usual stand-ins; slice them just as thinly.", "Add the olive oil raw at the end: it is a defining flavour, not just cooking fat.", "Variations from the sources: Pingo Doce suggests coriander for freshness, and Receitas e Culinária mentions simmering a piece of ham with the potatoes or skipping the chouriço for a meatless bowl."],
    authenticity: "All three Portuguese sources simmer potato, onion and garlic, blend it smooth, then cook finely shredded couve-galega for only a few minutes and serve with sliced chouriço, olive oil and broa; Teleculinária cooks the chouriço in the base, the others add it at the end. Quantities averaged (450 to 600 g potato, 150 to 200 g couve).",
    sources: [{ name: "Teleculinária", url: "https://teleculinaria.pt/receitas/caldo-verde-tradicional-a-portuguesa", lang: "pt" }, { name: "Pingo Doce", url: "https://www.pingodoce.pt/receitas/caldo-verde-com-chourico/", lang: "pt" }, { name: "Receitas e Culinária", url: "https://www.receitaseculinaria.pt/2023/02/caldo-verde-do-minho.html", lang: "pt" }] },

  { id: "gulyasleves", name: "Hungarian Goulash Soup", native: "Gulyásleves", country: "Hungary", region: "Great Hungarian Plain (Alföld)", difficulty: 2, servings: 6,
    tags: ["soup", "one pot", "batch", "freezer", "crowd pleaser"],
    skills: ["bloom", "braise", "dough", "knife"],
    intro: "The herdsmen’s soup of the Hungarian plains: beef shank simmered with onions, plenty of sweet paprika and caraway, then filled out with root vegetables, potatoes and tiny pinched noodles called csipetke. In Hungary gulyás is a soup, not the thick stew sold as goulash abroad, and it is hearty enough to be a full meal with fresh bread.",
    ingredients: ["800|g|beef shank (marhalábszár), in 2 cm cubes|meat", "60|g|lard (or oil)|pantry", "2||large onions, finely chopped|produce", "3|clove|garlic, crushed|produce", "2|tbsp|Hungarian sweet paprika|spice", "1|tsp|caraway seeds, crushed or ground|spice", "2||Hungarian wax or green peppers, sliced|produce", "2||tomatoes, diced|produce", "2||carrots|produce", "2||parsnips|produce", "1/4||celeriac, diced|produce", "600|g|potatoes, diced|produce", "2||bay leaves|spice", "2|L|water|pantry", "||salt and black pepper|spice", "1||egg (for csipetke)|dairy", "100|g|plain flour (for csipetke), approx.|pantry", "||hot paprika or fresh chilli, bread (to serve)|produce"],
    steps: [
      "A|8|Melt the lard in a heavy pot and cook the onion gently until soft and glassy, without letting it brown much.",
      "A|2|Pull the pot off the heat and stir in the paprika with a splash of water. Paprika scorches in seconds and turns bitter, so it should only bloom in the fat, never fry hard.",
      "A|8|Return to the heat, add the beef and garlic and stir until the meat is sealed and coated. Add the peppers and tomatoes, salt, pepper and caraway, and let it stew down with small splashes of water until thick and glossy.",
      "P|90|Add enough water to cover the meat and simmer gently, half-covered, until the beef is nearly tender, about 1.5 hours. Top up with water as it reduces so the meat stays covered.",
      "A|10|Meanwhile make the csipetke: knead the egg, a pinch of salt and enough flour into a firm, dry dough, then pinch off pea-sized bits onto a floured towel. Cut the carrots and parsnips into rounds or sticks.",
      "P|10|Add the remaining water (about 1.5 L), the carrots, parsnips, celeriac and bay leaves and simmer for 10 minutes.",
      "P|15|Add the potatoes and simmer until everything is tender, about 15 minutes.",
      "P|5|Drop in the csipetke and cook until they float and are tender, a few minutes. Check the salt and serve with fresh bread and hot paprika on the side."
    ],
    store: { fridge: 3, freeze: 3, reheat: "Tastes even better the next day; reheat gently with a splash of water. It freezes well, though potatoes and csipetke soften, so for freezing it is best to cook fresh csipetke when reheating." },
    next: "Simmer leftovers down until thick and serve over nokedli or boiled potatoes as a quick stew-style goulash.",
    tips: ["Shank is the classic cut because its connective tissue melts and gives the broth body without any flour.", "Street Kitchen enriches theirs with hot and mild paprika pastes, celery leaves and a spoon of mustard; Nők Lapja reduces the paprika base with small splashes of water four or five times for a deeper flavour.", "Bográcsgulyás, cooked outdoors in a kettle over a fire, is the same dish made thicker with less water."],
    authenticity: "All three Hungarian sources sweat onion in lard, add sweet paprika off the high heat, then simmer beef with caraway, peppers and tomato until nearly tender before adding root vegetables and potatoes; Mindmegette and Nők Lapja finish with egg csipetke. Meat quantities averaged (400 g for 4 to 1 kg for 8).",
    sources: [{ name: "Mindmegette", url: "https://www.mindmegette.hu/recept/alfoldi-gulyasleves", lang: "hu" }, { name: "Street Kitchen", url: "https://streetkitchen.hu/receptek/klasszikus-gulyasleves", lang: "hu" }, { name: "Nők Lapja", url: "https://www.noklapja.hu/gasztro/2025/07/21/gulyasleves-recept/", lang: "hu" }] }
]);


// ── batch: americas-africa ──
window.EXTRA_RECIPES = (window.EXTRA_RECIPES || []).concat([
  { id: "pozole-rojo", name: "Red Pork and Hominy Soup", native: "Pozole Rojo", country: "Mexico", region: "Central & Western Mexico (Jalisco, Guerrero, CDMX)", difficulty: 2, servings: 8,
    tags: ["soup", "batch", "freezer", "party", "crowd pleaser", "weekend project", "leftovers"],
    skills: ["stock", "bloom", "balance"],
    intro: "Pozole is a festive Mexican soup of big, burst kernels of cacahuazintle corn and tender pork in a brick-red broth coloured by dried guajillo and ancho chiles. It is the classic dish for Independence night (15 September) and family gatherings, and each bowl is finished at the table with a pile of crunchy, fresh garnishes.",
    ingredients: [
      "1|kg|precooked pozole corn (maíz pozolero / cacahuazintle), rinsed|intl",
      "600|g|pork shoulder (maciza), in large chunks|meat",
      "500|g|pork neck bones, trotter or pork head pieces|meat",
      "3|L|water|pantry",
      "1||white onion, halved|produce",
      "1||head garlic, halved crosswise|produce",
      "3||bay leaves|spice",
      "6||dried guajillo chiles|intl",
      "3||dried ancho chiles|intl",
      "2|clove|garlic (for the chile sauce)|produce",
      "1/4||white onion (for the chile sauce)|produce",
      "1|tsp|dried Mexican oregano, plus more to serve|spice",
      "1|pinch|ground cumin|spice",
      "1|tbsp|pork lard or vegetable oil|pantry",
      "||salt|pantry",
      "1/2||head iceberg lettuce or cabbage, finely shredded|produce",
      "6||radishes, thinly sliced|produce",
      "1||white onion, finely chopped (to serve)|produce",
      "4||limes, in wedges|produce",
      "||chile piquín or ground chile de árbol (to serve)|spice",
      "||tostadas and Mexican crema (to serve)|bakery"
    ],
    steps: [
      "A|10|Rinse the corn well under running water until it runs clear; this washes off leftover lime (cal) and helps the kernels open into flowers. Put it in a large pot with the water, halved onion, garlic head and bay leaves.",
      "P|40|Simmer uncovered without salt until the kernels start to burst open at the tips. Salt added now can keep the corn from blooming.",
      "A|10|Add all the pork to the corn pot, bring back to a simmer and skim off the grey foam as it rises so the broth stays clean. Cooking the meat with the corn thickens and flavours the broth.",
      "P|75|Simmer gently, partly covered, until the shoulder pulls apart easily. Top up with hot water if the level drops a lot.",
      "A|15|Meanwhile, stem and seed the chiles, toast them for a few seconds per side on a dry pan, then soak in just-boiled water for no more than 3–5 minutes. Over-soaking or burning makes the sauce bitter and dulls the red.",
      "A|10|Blend the drained chiles with the 2 garlic cloves, quarter onion, oregano, cumin and about 250 ml of the pot broth until very smooth, then strain through a sieve to remove skins.",
      "A|10|Heat the lard in a pan and fry the chile purée, stirring, for about 8–10 minutes until it darkens and thickens. Frying the sauce cooks out the raw chile taste.",
      "P|30|Pull out the onion, garlic, bay and bones; shred the meat and return it. Stir the chile sauce into the pot, salt generously and simmer together so the flavours marry, then taste and adjust salt.",
      "A|5|Serve in deep bowls and let everyone add lettuce, radish, onion, oregano, chile and a squeeze of lime, with tostadas spread with crema on the side."
    ],
    store: { fridge: 4, freeze: 3, reheat: "Cool, refrigerate and lift off the set fat; reheat gently until simmering. Keep the garnishes separate and cut them fresh. It tastes even better the next day." },
    next: "Simmer leftover pozole down until thick, then spoon the pork and corn onto tostadas with shredded lettuce, crema and salsa.",
    tips: [
      "Pork head gives the richest, most gelatinous broth; shoulder alone gives cleaner shredded meat. Mixing a bony cut with shoulder gets you both.",
      "If using raw dried cacahuazintle, soak it overnight and simmer 2–3 hours until it blooms before adding the pork.",
      "If the broth tastes bitter, the chiles were soaked too long or scorched; dilute with more broth. If it tastes flat, it almost always needs more salt.",
      "Some families blend in a couple of cooked tomatoes with the chiles, others use only guajillo; for more heat add 2–3 chiles de árbol to the sauce."
    ],
    authenticity: "All three Mexican sources agree on cooking the meat in the corn pot, skimming, and using a strained guajillo-based sauce added at the end with lettuce, radish, oregano and lime to finish; Animal Gourmet and El Universal pair guajillo with ancho and fry the sauce in fat, while Cookpad uses guajillo only. Quantities are a middle ground across the three.",
    sources: [
      { name: "Animal Gourmet (Grupo Animal) – Cómo hacer pozole rojo", url: "https://grupoanimal.mx/gastronomia/recetas/como-hacer-pozole-rojo", lang: "es" },
      { name: "Cookpad México – Pozole rojo (Bonnie Maldonado)", url: "https://cookpad.com/mx/recetas/13633126", lang: "es" },
      { name: "El Universal (Menú) – Salsa para pozole rojo", url: "https://www.eluniversal.com.mx/menu/receta-de-salsa-para-pozole-rojo/", lang: "es" }
    ] },

  { id: "cebiche-peruano", name: "Peruvian Lime-Cured Fish", native: "Cebiche Peruano", country: "Peru", region: "Lima & the Peruvian coast", difficulty: 2, servings: 4,
    tags: ["fresh", "light", "quick", "spicy", "party", "technique"],
    skills: ["knife", "balance"],
    intro: "Cebiche is Peru’s national dish: cubes of very fresh white fish tossed with salt, hot ají limo and freshly squeezed Peruvian lime, then served within minutes. The tangy, spicy juices left in the bowl are the famous leche de tigre, and the plate is always rounded out with sweet potato, corn and crunchy toasted cancha.",
    ingredients: [
      "800|g|very fresh skinless white fish (corvina, lenguado/sole or mero), sashimi grade|seafood",
      "14||small limes (Key or Peruvian limes), about 250 ml juice|produce",
      "1||large red onion|produce",
      "2||ají limo chiles (or 1 habanero / fresh rocoto)|intl",
      "2|tbsp|fresh cilantro (culantro), finely chopped|produce",
      "1|stalk|celery (for the leche de tigre)|produce",
      "2|clove|garlic (for the leche de tigre)|produce",
      "1|tsp|fresh ginger (kion), grated|produce",
      "4||ice cubes|frozen",
      "||salt|pantry",
      "2||sweet potatoes (camote), boiled and sliced|produce",
      "2||ears large-kernel corn (choclo), boiled|produce",
      "4||lettuce leaves|produce",
      "||cancha serrana (toasted corn) to serve|intl"
    ],
    steps: [
      "A|40|Boil the sweet potatoes and corn ahead of time and let them cool; they are served at room temperature next to the cold fish.",
      "A|10|Slice the onion into thin feathers (pluma) and soak in iced water while you work, which keeps it crisp and tames its bite. Seed and finely chop the ají limo; leave a few seeds for more heat.",
      "A|10|Cut the fish into roughly 2 cm cubes, removing any dark bloodline, and keep it in a bowl set over ice. Cold fish stays firm and the lime acts more slowly.",
      "A|5|Optional leche de tigre boost: blend a handful of fish trimmings with the celery, garlic, ginger, a little ají, a few cilantro stems, ice and about 100 ml lime juice for a few seconds, then strain.",
      "A|5|Squeeze the limes by hand or gently, only halfway, right before using; pressing hard releases bitter oils from the peel.",
      "A|3|Salt the fish well first and toss, then add the chopped ají and half the cilantro. Pour over the lime juice (and the strained leche de tigre, if using), toss for a few seconds and add the drained onion.",
      "A|2|Taste the juice and adjust salt, lime and chile. Plate at once on lettuce with camote, choclo and cancha; the fish should still be translucent in the centre."
    ],
    store: { fridge: 0, freeze: 0, reheat: "Must be eaten immediately; the lime keeps changing the fish and it turns chalky and rubbery within an hour. Lime does not make raw fish safe, so use only very fresh fish meant for raw eating." },
    next: "Make a fresh batch of leche de tigre from fish trimmings and serve it as a chilled shot, or cook any unused raw fish into a quick chupe-style soup.",
    tips: [
      "Peruvian cebiche is a quick toss, not a long marinade: lime goes on at the last moment and it is served within minutes.",
      "Street-cart (carretillero) cebiche in Lima is served with chicharrón de pota (fried squid) on top; a dash of rocoto in the leche de tigre adds fruity heat.",
      "Fried plantain chips (chifles) or boiled cassava can stand in for corn, and some families add a scoop of white rice.",
      "Rubbing a cut ají limo around the empty mixing bowl before adding the fish perfumes the whole cebiche without too much heat."
    ],
    authenticity: "Both Peruvian sources use white fish, salt before lime, ají limo, red onion and cilantro, with lime added just before serving, and plate with camote, choclo, lettuce and cancha; La República adds the blended and strained leche de tigre with celery, garlic, ginger and fish. Quantities follow the Infobae Perú version for 4.",
    sources: [
      { name: "La República (Perú) – Ceviche peruano carretillero", url: "https://larepublica.pe/recetas/185544-receta-del-ceviche-peruano-carretillero-buenazo-food-peruvian-comida-peruana", lang: "es" },
      { name: "Infobae Perú – Receta de ceviche", url: "https://www.infobae.com/peru/2026/10/16/receta-de-ceviche/", lang: "es" }
    ] },

  { id: "moqueca-baiana", name: "Bahian Fish Stew with Coconut and Palm Oil", native: "Moqueca Baiana", country: "Brazil", region: "Bahia", difficulty: 2, servings: 6,
    tags: ["braise", "one pot", "party", "crowd pleaser", "weeknight"],
    skills: ["knife", "braise", "balance"],
    intro: "Moqueca baiana is the signature fish stew of Bahia in north-eastern Brazil: thick steaks of firm white fish gently cooked on a bed of onion, tomato and peppers in coconut milk and golden-orange dendê (palm) oil. The dendê, an Afro-Brazilian ingredient, is what sets it apart from the oil-based moqueca of Espírito Santo.",
    ingredients: [
      "1.5|kg|firm white fish steaks about 2 cm thick (robalo/sea bass, badejo, surubim or grouper)|seafood",
      "2||limes, juiced|produce",
      "3|clove|garlic, crushed|produce",
      "2||large onions, sliced into rings|produce",
      "4||ripe tomatoes, sliced into rounds|produce",
      "3||bell peppers (mix of red, yellow and green), sliced into rings|produce",
      "1|bunch|cilantro (coentro), chopped|produce",
      "1||fresh red chile (pimenta dedo-de-moça), chopped|produce",
      "100|ml|dendê (red palm) oil|intl",
      "2|tbsp|olive oil|pantry",
      "400|ml|coconut milk|intl",
      "300|g|raw shrimp, peeled (optional)|seafood",
      "||salt and black pepper|pantry",
      "100|g|cassava flour (farinha de mandioca), for pirão|intl",
      "||white rice, to serve|pantry"
    ],
    steps: [
      "A|5|Season the fish with the lime juice, garlic, salt and pepper and set aside while you slice the vegetables.",
      "P|15|Let the fish marinate briefly; much longer and the lime starts to firm the flesh.",
      "A|10|Slice the onions, tomatoes and peppers into rounds. In a wide pot (ideally a clay pot), off the heat, lay down a third of the vegetables with a little salt and cilantro.",
      "A|5|Arrange half the fish in one layer, add another third of the vegetables and cilantro, then the rest of the fish and the remaining vegetables on top. A wide pot keeps the steaks from stacking and breaking.",
      "A|2|Pour the dendê, olive oil and coconut milk over everything and scatter the chile on top.",
      "P|25|Cover and cook over medium heat without stirring; the vegetables release enough liquid to stew the fish. Shake the pot gently instead of stirring, and keep it at a lively simmer rather than a hard boil, which toughens the fish.",
      "A|3|If using shrimp, tuck them into the broth in the last 3–4 minutes so they stay tender. Finish with the rest of the cilantro and adjust salt.",
      "A|8|For pirão, ladle about 500 ml of the hot broth into a small pan and whisk in the cassava flour a little at a time over low heat until it forms a smooth, soft porridge. Serve the moqueca with rice and pirão."
    ],
    store: { fridge: 2, freeze: 0, reheat: "Best eaten fresh. Leftovers keep 2 days in the fridge; rewarm gently over low heat without boiling so the fish does not fall apart. Not good frozen." },
    next: "Flake leftover fish into the broth with extra coconut milk and serve over rice as a quick bobó-style stew, or thicken the leftover broth into a fresh batch of pirão.",
    tips: [
      "Moqueca baiana must have both dendê and coconut milk; the Capixaba (Espírito Santo) moqueca uses neither and is cooked with annatto and olive oil instead.",
      "Some Bahian cooks first fry the garlic, onion and peppers in the dendê for a deeper flavour, then lay the fish on top, add the coconut milk once the fish is nearly cooked and simmer a few more minutes.",
      "Use a firm fish; delicate fillets fall apart. Cação (dogfish), tilapia and mixed seafood versions are all common.",
      "Dendê is strong: start with less if you are new to it, and add a drizzle at the end for colour and aroma."
    ],
    authenticity: "Both Brazilian sources use firm white fish steaks seasoned with lime, a bed of tomato, onion and bell pepper, dendê, coconut milk and lots of coentro, served with rice and pirão from the broth; TudoGostoso fries the base first and adds coconut milk at the end, while Receiteria layers everything raw in a clay pot. I followed the layered method and noted the other in tips, scaling quantities to 6.",
    sources: [
      { name: "TudoGostoso – Moqueca baiana", url: "https://www.tudogostoso.com.br/receita/29083-moqueca-baiana.html", lang: "pt" },
      { name: "Receiteria – Moqueca baiana", url: "https://www.receiteria.com.br/receita/moqueca-baiana/", lang: "pt" }
    ] },

  { id: "nigerian-jollof-rice", name: "Nigerian Party Jollof Rice", native: "Jollof Rice", country: "Nigeria", region: "Nationwide (party style)", difficulty: 2, servings: 8,
    tags: ["party", "crowd pleaser", "one pot", "batch", "spicy", "leftovers", "freezer"],
    skills: ["rice", "balance"],
    intro: "Party jollof is the deep orange-red rice cooked at every Nigerian celebration: parboiled long-grain rice steamed in a fried tomato, tatashe and scotch bonnet base with stock, curry powder, thyme and bay. The slightly scorched, smoky layer at the bottom of the pot is prized as the best part.",
    ingredients: [
      "750|g|long-grain parboiled rice|pantry",
      "6||plum tomatoes|produce",
      "3||red bell peppers (tatashe)|produce",
      "1||scotch bonnet pepper (ata rodo), or to taste|produce",
      "2||onions (1 for blending, 1 sliced)|produce",
      "120|ml|vegetable or groundnut oil|pantry",
      "70|g|tomato paste|pantry",
      "2|tsp|Nigerian-style curry powder|spice",
      "2|tsp|dried thyme|spice",
      "3||bay leaves|spice",
      "1|tsp|grated fresh ginger (optional)|produce",
      "3||stock cubes (Knorr or Maggi)|intl",
      "1|L|chicken or beef stock|pantry",
      "||salt|pantry",
      "||fried plantain, fried chicken or coleslaw (to serve)|produce"
    ],
    steps: [
      "A|10|Blend the tomatoes, tatashe, scotch bonnet and one onion until smooth.",
      "P|20|Simmer the purée uncovered until it thickens and most of the water has cooked off. A watery base boils instead of frying, so this step builds the deep flavour.",
      "A|10|Meanwhile, parboil the rice in boiling water for about 8 minutes, then rinse and drain well in a sieve. This removes surface starch so the grains stay separate.",
      "A|10|Heat the oil and fry the sliced onion until translucent, then add the tomato paste and fry, stirring, until it darkens and the oil separates. Frying the paste removes its sour, raw taste.",
      "A|10|Add the reduced pepper base, curry powder, thyme, bay leaves, ginger and crumbled stock cubes and fry together until the oil rises to the top again. Pour in the stock, bring to a boil and season with salt; it should taste a little over-salted because the rice will absorb it.",
      "A|3|Stir in the drained rice; the liquid should be level with the rice, not above it. Cover tightly with foil under the lid to trap the steam.",
      "P|30|Cook on low heat until the liquid is absorbed and the rice is tender, adding a small splash of stock only if it is still hard. Stir gently from the top once or twice so you do not scrape the bottom into the rice.",
      "P|3|For the smoky party flavour, turn the heat up for the last 2–3 minutes to lightly scorch the bottom, then turn off and rest covered before fluffing."
    ],
    store: { fridge: 4, freeze: 3, reheat: "Refrigerate within 2 hours. Reheat covered with a splash of water in a pot or microwave until piping hot. Freezes well in portions." },
    next: "Fry leftover jollof in a hot pan with diced cooked chicken, peas and a beaten egg for a jollof fried-rice style lunch.",
    tips: [
      "Use parboiled long-grain rice; it holds up to the long steam without turning mushy, which is the hallmark of good party jollof.",
      "A thin aluminium pot and a little bottom-burn give the smoky ‘party’ taste; some cooks finish the pot in a hot oven for 10 minutes instead.",
      "Many cooks make a big batch of fried tomato stew ahead, freeze it, and use 2–3 cups per pot of jollof for speed.",
      "Variations include adding fresh sliced tomatoes and onions at the end, a little nutmeg, or peas and sweet corn for mixed-vegetable jollof."
    ],
    authenticity: "All three Nigerian sources build the rice on a fried tomato–pepper base with tomato paste, curry powder, thyme and stock cubes, cook parboiled rice with liquid just level with the grains on low heat, and treat a slightly burnt bottom as a feature. Quantities blend All Nigerian Recipes (750 g rice) and BusinessDay; the reducing step comes from Fabwoman.ng.",
    sources: [
      { name: "All Nigerian Recipes – Nigerian Jollof Rice", url: "https://www.allnigerianrecipes.com/rice/nigerian-jollof-rice/", lang: "en" },
      { name: "BusinessDay (Nigeria) – Party jollof rice", url: "https://businessday.ng/bd-weekender/culinary-delights-bd-weekender/article/party-jollof-rice/", lang: "en" },
      { name: "Fabwoman.ng – How to prepare jollof rice", url: "https://fabwoman.ng/how-to-prepare-jollof-rice/", lang: "en" }
    ] },

  { id: "misir-wot", name: "Ethiopian Spiced Red Lentil Stew", native: "ምስር ወጥ Misir Wot", country: "Ethiopia", region: "Nationwide", difficulty: 1, servings: 6,
    tags: ["vegan", "vegetarian", "budget", "spicy", "batch", "freezer", "one pot", "meal prep"],
    skills: ["legumes", "bloom", "balance"],
    intro: "Misir wot is the everyday red lentil stew of Ethiopia, a staple of fasting days when no animal products are eaten. Finely chopped onions are cooked down slowly before the chile-rich berbere blend is fried in, giving a thick, deeply spiced stew that is scooped up with injera.",
    ingredients: [
      "250|g|red lentils (whole red lentils hold their shape best), rinsed|pantry",
      "2||medium red onions, very finely chopped|produce",
      "3|clove|garlic, crushed|produce",
      "1|tbsp|fresh ginger, grated|produce",
      "100|ml|vegetable oil (or niter kibbeh if not keeping it vegan)|pantry",
      "3|tbsp|berbere spice blend (use 1 for mild)|spice",
      "1|tbsp|tomato paste|pantry",
      "750|ml|hot water or vegetable stock, added gradually|pantry",
      "||salt|pantry",
      "1/2|tsp|mitmita or mekelesha spice (optional, to finish)|spice",
      "||injera or rice, to serve|bakery"
    ],
    steps: [
      "A|10|Cook the chopped onion in a heavy pot over medium heat with just a splash of water and no oil, stirring, until soft and starting to colour. Dry-cooking the onion first is the Ethiopian base for wot and gives the stew body.",
      "A|5|Add the oil and fry the onion for 2 minutes, then add the garlic and ginger and fry 2 minutes more.",
      "A|5|Stir in the tomato paste and cook until it darkens slightly, then add the berbere and fry for a minute, adding a splash of hot water so the spice does not scorch. Stir well so the berbere does not clump.",
      "P|15|Add about 250 ml hot water, cover and simmer gently so the raw edge of the spices cooks off and the berbere mellows and sweetens.",
      "A|5|Add the rinsed lentils and another 250 ml hot water. Using hot water keeps the pot at a steady temperature so the lentils cook evenly.",
      "P|20|Simmer on medium-low, stirring now and then and adding more hot water a little at a time, until the lentils are tender but still hold their shape and the stew is thick, not soupy.",
      "P|5|Season with salt, stir in the optional mekelesha, turn off the heat and rest covered so the lentils finish cooking in the residual heat. Serve hot with injera."
    ],
    store: { fridge: 4, freeze: 3, reheat: "Tastes even better the next day. Reheat in a pot with a splash of water, stirring. Freezes well; thaw overnight in the fridge before reheating." },
    next: "Thin leftover misir wot with stock for a spicy lentil soup, or use it as a filling for baked sambusa-style pastries.",
    tips: [
      "Misir alicha wot is the mild version: swap the berbere for about 1 teaspoon of ground turmeric and follow the same method.",
      "Split red lentils cook much faster and collapse into a purée, so check them early; whole red lentils give a firmer, more traditional texture.",
      "Some cooks boil the lentils separately for about 5 minutes until just tender, then finish them in the onion–berbere sauce, which makes timing easier.",
      "On non-fasting days a spoon of niter kibbeh (spiced clarified butter) stirred in at the end adds richness; on fasting days keep it oil-only and vegan."
    ],
    authenticity: "Both Ethiopian cooks build the stew on onion, garlic and a generous amount of berbere fried in oil before adding red lentils and water, serve it with injera, and keep it vegan; Helen Mebrate adds ginger, tomato paste and gradual hot water, while Luladey Moges parboils the lentils first and gives the turmeric alicha variation. Oil and berbere amounts are a middle ground. Neither source is hosted on an Ethiopian domain.",
    sources: [
      { name: "Helen Mebrate (Ethiopian Foodie) via The Vegan Society – Ethiopian Misir Wot", url: "https://www.vegansociety.com/node/132069", lang: "en" },
      { name: "Luladey Moges, Enebla: Recipes from an Ethiopian Kitchen (TouchWood Editions) – Misir Wot", url: "https://touchwoodeditions.com/blogs/recipes/misir-wot-recipe", lang: "en" }
    ] }
]);

