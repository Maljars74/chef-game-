// ============================================================
//  ZE SWEDISH CHEF'S KÜCHEN — Recipe Database
//  Bork bork bork!
// ============================================================

const RECIPES = [
  {
    id: 1,
    name: "Spaghetti Carbonara",
    emoji: "🍝",
    time: "25 min",
    difficulty: "Medium",
    servings: "4 servings",
    tags: ["pasta", "italian", "dinner"],
    ingredients: [
      "🍝 400g spaghetti",
      "🥓 150g pancetta or bacon",
      "🥚 4 large eggs",
      "🧀 100g Pecorino Romano, grated",
      "🧀 50g Parmesan, grated",
      "🧄 2 garlic cloves",
      "🫒 2 tbsp olive oil",
      "🧂 Salt & black pepper"
    ],
    steps: [
      { instruction: "Bring a large pot of salted water to a rolling boil. It should taste like the sea! Add the spaghetti and cook until al dente — about 8-10 minutes.", tip: "Save a cup of pasta water before draining — it's liquid gold for the sauce!" },
      { instruction: "While pasta cooks, slice the pancetta into small cubes. Heat olive oil in a large pan over medium heat. Add pancetta and cook until crispy and golden, about 5 minutes. Toss in the garlic for the last minute.", tip: "Don't drain the pancetta fat — it adds amazing flavour to the sauce!" },
      { instruction: "In a bowl, whisk together the eggs, grated Pecorino, and Parmesan. Season generously with freshly cracked black pepper. This is your creamy sauce!", tip: "Room-temperature eggs blend more smoothly. Take them out 20 min before cooking." },
      { instruction: "Drain the pasta (saving that pasta water!). Remove the pan from heat — this is crucial! Add the hot drained pasta to the pancetta pan, then quickly pour in the egg-cheese mixture.", tip: "Removing from heat is essential — too much heat will scramble the eggs into lumps!" },
      { instruction: "Toss everything together vigorously, adding splashes of pasta water as needed to create a silky, glossy sauce that coats every strand of pasta.", tip: "The residual heat from the pasta cooks the egg gently. Keep tossing!" },
      { instruction: "Plate immediately! Heap into warm bowls, finish with extra Pecorino and a generous crack of black pepper. Serve at once and enjoy!", tip: "Carbonara waits for no one — it gets clumpy if left out! Eat right away." }
    ]
  },
  {
    id: 2,
    name: "Chicken Tikka Masala",
    emoji: "🍛",
    time: "45 min",
    difficulty: "Medium",
    servings: "4 servings",
    tags: ["chicken", "indian", "curry", "dinner"],
    ingredients: [
      "🍗 700g chicken breast, cubed",
      "🫙 400g canned crushed tomatoes",
      "🥛 200ml heavy cream",
      "🧅 2 large onions, diced",
      "🧄 4 garlic cloves, minced",
      "🫚 1 tbsp fresh ginger",
      "🥛 150ml plain yogurt",
      "🌶️ 2 tsp garam masala",
      "🌿 2 tsp cumin",
      "🫚 2 tsp turmeric",
      "🌶️ 1 tsp chili powder",
      "🫒 3 tbsp oil",
      "🧂 Salt to taste",
      "🌿 Fresh cilantro"
    ],
    steps: [
      { instruction: "Marinate the chicken: combine yogurt, 1 tsp garam masala, 1 tsp cumin, turmeric, chili powder, and salt in a bowl. Add chicken cubes and mix well. Let sit for at least 15 minutes (or overnight in the fridge for best results).", tip: "The longer the chicken marinates, the more tender and flavourful it becomes!" },
      { instruction: "Grill or pan-fry the marinated chicken over high heat until nicely charred on all sides, about 6-8 minutes total. Set aside — don't worry about cooking it through yet, it'll finish in the sauce.", tip: "Those charred bits are everything! They give tikka masala its signature smoky depth." },
      { instruction: "In a large pan, heat the oil over medium heat. Add the diced onions and cook until deep golden brown, about 10 minutes. Add garlic and ginger, stir for 2 minutes until fragrant.", tip: "Properly caramelized onions are the secret base of a great curry. Don't rush them!" },
      { instruction: "Add remaining garam masala and cumin to the onion mixture. Toast the spices for 1 minute, stirring constantly, until they smell incredible and darken slightly.", tip: "Blooming spices in oil releases their essential oils and massively boosts flavour." },
      { instruction: "Pour in the crushed tomatoes. Stir well and simmer for 12-15 minutes until the sauce thickens and the oil starts to separate from it — this means it's ready!", tip: "This 'bhuna' stage is key — cook until you see oil pooling on the surface." },
      { instruction: "Stir in the cream and cooked chicken. Simmer gently for 8-10 minutes until the chicken is fully cooked and the sauce is velvety. Adjust salt. Garnish with fresh cilantro and serve with warm naan or basmati rice.", tip: "Add a squeeze of lemon juice at the end to brighten up all the flavours!" }
    ]
  },
  {
    id: 3,
    name: "Classic French Omelette",
    emoji: "🍳",
    time: "8 min",
    difficulty: "Easy",
    servings: "1 serving",
    tags: ["eggs", "french", "breakfast", "quick"],
    ingredients: [
      "🥚 3 large eggs",
      "🧈 30g unsalted butter",
      "🧂 Salt & white pepper",
      "🌿 Fresh chives, chopped",
      "🧀 30g Gruyère (optional)"
    ],
    steps: [
      { instruction: "Crack the eggs into a bowl. Season with a pinch of salt and white pepper. Beat vigorously with a fork until completely homogeneous — no streaks of white or yolk. The eggs should look pale yellow.", tip: "Over-beaten eggs make a tougher omelette. Stop when fully combined and slightly frothy." },
      { instruction: "Heat an 8-inch non-stick pan over medium-high heat. Add the butter and swirl it around. When the butter foams and the foam just starts to subside, you're at the perfect temperature.", tip: "The butter temperature is everything. Too cool = rubbery. Too hot = browned eggs." },
      { instruction: "Pour in the eggs all at once. Immediately start shaking the pan back and forth while stirring the eggs with a fork in a circular motion, keeping the tines flat against the pan.", tip: "Keep the motion constant! This creates those fine, creamy curds that define a real French omelette." },
      { instruction: "As soon as the eggs are set but still slightly glossy on top (about 30-40 seconds), stop stirring. If adding cheese, sprinkle it now across the center.", tip: "The residual heat will finish cooking the inside. You want it barely set in the middle — baveuse!" },
      { instruction: "Tilt the pan at 45° and use the fork to fold the top third of the omelette over the center. Then roll it out onto a warm plate so it folds over itself into a neat oval log.", tip: "Don't panic if the shape is imperfect at first — even French chefs practice for years!" },
      { instruction: "The outside should be pale yellow with no browning. Scatter fresh chives on top, add a tiny knob of butter for gloss, and serve immediately on a warm plate.", tip: "Eat within seconds of cooking — a proper omelette waits for nobody!" }
    ]
  },
  {
    id: 4,
    name: "Beef Tacos",
    emoji: "🌮",
    time: "30 min",
    difficulty: "Easy",
    servings: "4 servings",
    tags: ["beef", "mexican", "tacos", "dinner"],
    ingredients: [
      "🥩 500g ground beef",
      "🌮 8-12 corn tortillas",
      "🧅 1 onion, diced",
      "🧄 3 garlic cloves",
      "🍅 2 tomatoes, diced",
      "🥬 Shredded lettuce",
      "🧀 Cheddar cheese, shredded",
      "🥑 1 avocado",
      "🌶️ 2 tsp chili powder",
      "2 tsp cumin",
      "1 tsp paprika",
      "🧂 Salt & pepper",
      "🍋 Lime wedges",
      "🌿 Fresh cilantro"
    ],
    steps: [
      { instruction: "Heat a drizzle of oil in a large skillet over medium-high heat. Add the diced onion and cook for 3-4 minutes until softened. Add garlic and cook for another minute until fragrant.", tip: "Use a wide pan so the beef can brown rather than steam — crowding = grey meat!" },
      { instruction: "Add the ground beef. Break it apart with a spoon and cook, stirring occasionally, until deeply browned with some crispy bits, about 7-8 minutes. Drain excess fat if needed.", tip: "Don't over-stir the beef — let it sit and brown. Colour = flavour!" },
      { instruction: "Sprinkle chili powder, cumin, and paprika over the beef. Season with salt and pepper. Stir and cook for 2 more minutes so the spices toast into the meat. Add a splash of water if it looks dry.", tip: "Letting the spices cook in the fat for a minute makes a world of difference." },
      { instruction: "While the beef rests, prepare all your toppings: dice the tomatoes, shred the lettuce, slice the avocado, grate the cheese, and cut the lime into wedges. Set up a taco bar!", tip: "Cold toppings contrast perfectly with hot meat. Keep everything ready before the beef is done." },
      { instruction: "Warm the tortillas directly over a gas flame for 15-20 seconds per side (or in a dry skillet) until soft and slightly charred at the edges.", tip: "Never skip warming tortillas — it makes them pliable and brings out their corn flavour." },
      { instruction: "Build your tacos: spoon beef onto a tortilla, top with lettuce, tomato, avocado, cheese, and a heap of fresh cilantro. Squeeze lime over everything. Double up the tortillas for extra strength!", tip: "The secret to great tacos is the ratio — don't overstuff or they'll fall apart!" }
    ]
  },
  {
    id: 5,
    name: "Tomato Basil Soup",
    emoji: "🥣",
    time: "35 min",
    difficulty: "Easy",
    servings: "4 servings",
    tags: ["soup", "tomato", "vegetarian", "lunch"],
    ingredients: [
      "🍅 800g canned whole tomatoes",
      "🍅 4 ripe fresh tomatoes",
      "🧅 1 large onion",
      "🧄 4 garlic cloves",
      "🌿 Large bunch fresh basil",
      "🫒 3 tbsp olive oil",
      "🫙 500ml vegetable stock",
      "🥛 4 tbsp heavy cream",
      "🍬 1 tsp sugar",
      "🧂 Salt & black pepper",
      "🍞 Crusty bread, to serve"
    ],
    steps: [
      { instruction: "Preheat oven to 200°C (400°F). Halve the fresh tomatoes and place them cut-side up on a baking tray with whole garlic cloves. Drizzle with 2 tbsp olive oil, sprinkle salt. Roast for 25 minutes until caramelized and slightly charred.", tip: "Roasting tomatoes concentrates their sweetness and removes excess water — deeper flavour!" },
      { instruction: "Meanwhile, heat remaining olive oil in a large pot over medium heat. Finely dice the onion and cook until soft and translucent, about 8 minutes.", tip: "Low and slow for the onions — you want them sweet, not browned." },
      { instruction: "Add the roasted tomatoes and garlic to the pot along with the canned tomatoes. Pour in the vegetable stock and add most of the basil (save some leaves for garnish). Bring to a boil, then simmer for 10 minutes.", tip: "Adding basil during cooking infuses the soup with deep herbal flavour." },
      { instruction: "Use an immersion blender to blend the soup until completely smooth. Alternatively, carefully blend in batches in a stand blender. Strain through a sieve if you want an ultra-silky texture.", tip: "Always vent the blender lid when blending hot liquids — steam builds up and can explode the lid!" },
      { instruction: "Return soup to low heat. Stir in the cream and sugar. Taste and adjust seasoning generously — don't be shy with salt and pepper.", tip: "The sugar balances acidity. Taste before adding — some tomatoes are sweeter than others." },
      { instruction: "Ladle into warm bowls. Swirl a little cream on top, scatter fresh basil leaves, and crack some black pepper. Serve immediately with crusty bread for dipping!", tip: "Warm the bowls in the oven for 5 minutes first — soup stays hot much longer!" }
    ]
  },
  {
    id: 6,
    name: "Chocolate Lava Cake",
    emoji: "🍫",
    time: "25 min",
    difficulty: "Medium",
    servings: "4 servings",
    tags: ["dessert", "chocolate", "cake", "baking"],
    ingredients: [
      "🍫 200g dark chocolate (70%)",
      "🧈 100g unsalted butter",
      "🥚 4 large eggs",
      "🥚 4 egg yolks",
      "🍬 120g caster sugar",
      "🌾 30g plain flour",
      "🫙 Butter & cocoa for ramekins",
      "🍦 Vanilla ice cream to serve",
      "🫐 Fresh berries"
    ],
    steps: [
      { instruction: "Preheat oven to 220°C (425°F). Butter four 150ml ramekins thoroughly, then dust with cocoa powder, tapping out any excess. Place on a baking tray. This ensures the cakes slide out cleanly.", tip: "Don't use flour to dust — cocoa keeps the outside dark and chocolatey." },
      { instruction: "Break the chocolate into pieces and melt with the butter in a heatproof bowl set over simmering water (bain-marie), stirring gently. Alternatively, microwave in 30-second bursts, stirring between each. Let cool slightly.", tip: "Never let the water touch the bowl — steam is enough to melt chocolate perfectly." },
      { instruction: "In a large bowl, whisk together the whole eggs, egg yolks, and caster sugar until the mixture becomes thick, pale, and doubles in volume — about 3 minutes with an electric mixer.", tip: "Properly aerated eggs give the cakes their light, mousse-like texture outside the lava center." },
      { instruction: "Gently fold the slightly cooled chocolate mixture into the egg mixture using a rubber spatula. Sift in the flour and fold again until just combined — don't over-mix or you'll lose the air.", tip: "Under-mixing is better than over-mixing here. A few streaks of flour are fine." },
      { instruction: "Divide the batter equally between the prepared ramekins. At this point, you can refrigerate them for up to 24 hours — a great make-ahead dessert!", tip: "If baking from cold, add 2-3 extra minutes to the cooking time." },
      { instruction: "Bake for exactly 10-12 minutes until the edges are set and firm but the center still has a slight wobble. Run a knife around the edge, wait 30 seconds, then invert onto a plate. Serve immediately with ice cream!", tip: "Every oven is different — do a test cake first to nail your timing. The lava should flow!" }
    ]
  },
  {
    id: 7,
    name: "Caesar Salad",
    emoji: "🥗",
    time: "20 min",
    difficulty: "Easy",
    servings: "2 servings",
    tags: ["salad", "chicken", "caesar", "lunch"],
    ingredients: [
      "🥬 1 large romaine lettuce",
      "🍗 2 chicken breasts",
      "🍞 2 thick slices sourdough",
      "🧄 4 garlic cloves",
      "🥚 2 egg yolks",
      "🐟 4 anchovy fillets",
      "🍋 2 lemons",
      "🫒 120ml olive oil",
      "🧀 60g Parmesan, shaved",
      "🧂 Salt & black pepper",
      "🫒 2 tbsp Dijon mustard"
    ],
    steps: [
      { instruction: "Make the dressing: mash the anchovy fillets and 1 garlic clove into a paste with a pinch of salt. Whisk in egg yolks, Dijon mustard, and a squeeze of lemon juice. Slowly drizzle in olive oil while whisking to create a thick, emulsified dressing. Season to taste.", tip: "Add the oil drop by drop at first — rushing this step causes the dressing to split!" },
      { instruction: "Make croutons: tear the sourdough into rough chunks. Toss with olive oil, 1 crushed garlic clove, salt, and pepper. Spread on a tray and bake at 190°C for 12-15 minutes until golden and crunchy.", tip: "Torn croutons have more craggy surface area to get crunchy than cut ones." },
      { instruction: "Season the chicken breasts with salt, pepper, and a drizzle of olive oil. Cook in a hot griddle pan or skillet for 5-6 minutes per side until cooked through with golden grill marks. Rest for 5 minutes, then slice diagonally.", tip: "Resting the chicken lets the juices redistribute — never skip this step!" },
      { instruction: "Wash and dry the romaine leaves thoroughly. Tear the larger leaves into manageable pieces. Damp leaves will dilute your dressing.", tip: "Spin or pat lettuce completely dry — water is the enemy of a great dressed salad." },
      { instruction: "In a large bowl, toss the romaine with enough dressing to coat each leaf — don't drown it. Add most of the croutons and half the Parmesan and toss again gently.", tip: "Season the salad after dressing — the anchovy in the dressing is already quite salty." },
      { instruction: "Plate the salad, arrange the sliced chicken on top, scatter remaining croutons and Parmesan shavings. Grind black pepper generously over everything. Serve immediately!", tip: "Eat right away — dressed salad wilts quickly. Dress it at the very last minute." }
    ]
  },
  {
    id: 8,
    name: "Banana Pancakes",
    emoji: "🥞",
    time: "20 min",
    difficulty: "Easy",
    servings: "2 servings",
    tags: ["breakfast", "banana", "pancakes", "sweet"],
    ingredients: [
      "🍌 2 ripe bananas",
      "🥚 2 eggs",
      "🌾 100g plain flour",
      "🥛 150ml milk",
      "🫙 1 tsp baking powder",
      "🧈 1 tbsp melted butter",
      "🍬 1 tbsp sugar",
      "🧂 Pinch of salt",
      "🫐 Fresh berries to serve",
      "🍯 Maple syrup"
    ],
    steps: [
      { instruction: "Mash the bananas in a large bowl until smooth with only a few lumps remaining. The riper the bananas, the sweeter and more flavourful your pancakes will be.", tip: "Very overripe, even black-skinned bananas work best — they're sweeter and mash more smoothly." },
      { instruction: "Whisk the eggs into the mashed banana until fully combined. Add the milk and melted butter and whisk again.", tip: "Make sure the butter has cooled slightly or it may scramble the eggs when mixed." },
      { instruction: "Sift in the flour, baking powder, sugar, and salt. Stir gently until just combined — a few lumps are perfectly fine! Over-mixing develops gluten and makes pancakes tough.", tip: "The batter should look slightly lumpy. Over-mixed batter = rubbery pancakes." },
      { instruction: "Let the batter rest for 5 minutes. Meanwhile, heat a non-stick pan or griddle over medium heat. Add a tiny knob of butter and let it melt and foam.", tip: "Getting the pan temperature right is key — too hot and the outside burns before the inside cooks." },
      { instruction: "Pour about 3 tablespoons of batter per pancake. Cook until bubbles form on the surface and the edges look set, about 2 minutes. Flip gently and cook for another 1-2 minutes.", tip: "Resist the urge to press down on the pancakes after flipping — this squishes out the fluffiness!" },
      { instruction: "Serve stacked high with fresh berries, a drizzle of maple syrup, and an extra sliver of butter melting on top. Eat immediately while fluffy and warm!", tip: "Keep finished pancakes in a low oven (90°C) on a plate to stay warm while you cook the rest." }
    ]
  },
  {
    id: 9,
    name: "Garlic Butter Shrimp",
    emoji: "🦐",
    time: "15 min",
    difficulty: "Easy",
    servings: "2 servings",
    tags: ["seafood", "shrimp", "quick", "dinner"],
    ingredients: [
      "🦐 400g large shrimp, peeled",
      "🧈 60g unsalted butter",
      "🧄 6 garlic cloves, minced",
      "🌿 Fresh parsley",
      "🍋 1 lemon",
      "🌶️ Red chili flakes",
      "🫒 1 tbsp olive oil",
      "🍷 60ml dry white wine",
      "🧂 Salt & black pepper",
      "🍞 Crusty bread to serve"
    ],
    steps: [
      { instruction: "Pat the shrimp completely dry with paper towels. This is crucial! Wet shrimp steam instead of sear. Season generously with salt, pepper, and a pinch of chili flakes.", tip: "Dry shrimp = golden crust. Wet shrimp = grey, steamed shrimp. Dry them thoroughly!" },
      { instruction: "Heat olive oil in a large skillet over high heat until smoking. Add shrimp in a single layer — don't crowd them! Cook for exactly 60-90 seconds per side until pink and slightly curled. Remove to a plate.", tip: "Work in batches if needed. Overcooked shrimp are rubbery — they cook incredibly fast!" },
      { instruction: "Reduce heat to medium. Add half the butter to the same pan. When foaming, add the garlic and cook for 60 seconds, stirring, until golden and fragrant.", tip: "Watch the garlic carefully — it goes from golden to burnt in seconds!" },
      { instruction: "Pour in the white wine and let it bubble and reduce by half, about 2 minutes, scraping up any browned bits from the pan. These bits are pure flavour!", tip: "If you don't have wine, chicken stock or even a splash of water works well." },
      { instruction: "Add the remaining butter and swirl the pan to create a glossy emulsified sauce. Return the shrimp to the pan and toss to coat. Squeeze lemon juice over everything.", tip: "Swirling rather than stirring keeps the butter sauce emulsified and silky smooth." },
      { instruction: "Scatter chopped fresh parsley over the shrimp. Taste and adjust seasoning. Serve immediately over pasta or rice, or simply with crusty bread to mop up that incredible sauce!", tip: "This dish is best eaten immediately — shrimp toughen quickly as they cool." }
    ]
  },
  {
    id: 10,
    name: "Mushroom Risotto",
    emoji: "🍄",
    time: "40 min",
    difficulty: "Hard",
    servings: "4 servings",
    tags: ["rice", "mushroom", "italian", "vegetarian"],
    ingredients: [
      "🍄 400g mixed mushrooms",
      "🍚 300g Arborio rice",
      "🧅 1 large onion, finely diced",
      "🧄 3 garlic cloves",
      "🧈 60g unsalted butter",
      "🫒 3 tbsp olive oil",
      "🍷 150ml dry white wine",
      "🫙 1.2L hot vegetable stock",
      "🧀 80g Parmesan, grated",
      "🌿 Fresh thyme & parsley",
      "🧂 Salt & black pepper"
    ],
    steps: [
      { instruction: "Keep your stock hot in a saucepan on a low burner throughout. Cold stock added to risotto lowers the temperature and disrupts the cooking. Slice mushrooms into chunky pieces. Cook them in half the butter over high heat until deeply golden — don't stir too much. Season and set aside.", tip: "Cook mushrooms in batches in a very hot, spacious pan — crowding them makes them steam and go grey." },
      { instruction: "In a wide, heavy pot, heat olive oil over medium heat. Add onion and cook gently for 6-8 minutes until completely soft but not browned. Add garlic and cook for 1 more minute.", tip: "A wide, shallow pan is better than a tall pot — more surface area for evaporation and stirring." },
      { instruction: "Add the Arborio rice. Toast it, stirring constantly, for 2-3 minutes until the grains look slightly translucent at the edges and smell nutty. This step builds the starchy base for the creamy texture.", tip: "Properly toasted rice will never turn mushy. This step is non-negotiable!" },
      { instruction: "Pour in the white wine and stir until fully absorbed. Then add a ladle of hot stock, stirring until absorbed before adding the next. Continue this process, ladle by ladle, over 18-20 minutes total.", tip: "You don't have to stir constantly — every 30 seconds is fine. The starch needs some friction to release." },
      { instruction: "When the rice is cooked al dente (tender but with a slight bite), remove from heat. Stir in most of the cooked mushrooms, the remaining cold butter cut into cubes, and the Parmesan. Stir vigorously for 1 minute.", tip: "This 'mantecatura' step — beating in cold butter off heat — creates risotto's legendary creaminess!" },
      { instruction: "The risotto should be loose and flowing like lava — it will thicken as it sits. Adjust with a splash more stock if needed. Taste and season well. Serve immediately in warm bowls, topped with remaining mushrooms, fresh herbs, and more Parmesan!", tip: "Real risotto doesn't hold — serve it the moment it's done. All'onda (wave-like) is the consistency you want." }
    ]
  }
];
