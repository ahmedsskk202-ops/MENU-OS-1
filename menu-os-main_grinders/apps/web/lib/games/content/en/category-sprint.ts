import type { CategorySprintItem } from "../types";

// Speed Categories: players list as many valid items as they can before the timer
// ends, submitted as one comma/newline-separated answer. Scoring checks each listed
// item against `acceptedItems` (case-insensitive), counting distinct valid matches —
// so lists are generous (common synonyms included) rather than a single "correct"
// answer.
export const CATEGORY_SPRINT_PACKS: CategorySprintItem[] = [
  {
    id: "en-cs-001",
    category: "Fruits",
    acceptedItems: ["apple", "banana", "orange", "grape", "grapes", "mango", "pineapple", "watermelon", "strawberry", "strawberries", "kiwi", "peach", "pear", "cherry", "cherries", "lemon", "lime", "plum", "fig", "figs", "date", "dates", "pomegranate", "melon", "apricot", "blueberry", "blueberries", "raspberry", "coconut", "papaya"],
  },
  {
    id: "en-cs-002",
    category: "Vegetables",
    acceptedItems: ["carrot", "potato", "tomato", "onion", "cucumber", "lettuce", "spinach", "broccoli", "cauliflower", "pepper", "bell pepper", "eggplant", "zucchini", "cabbage", "garlic", "corn", "peas", "beans", "okra", "mushroom", "radish", "celery", "pumpkin", "squash", "beet", "beetroot"],
  },
  {
    id: "en-cs-003",
    category: "Countries",
    acceptedItems: ["egypt", "jordan", "syria", "lebanon", "saudi arabia", "kuwait", "uae", "united arab emirates", "qatar", "bahrain", "oman", "turkey", "iran", "france", "germany", "italy", "spain", "england", "united kingdom", "usa", "united states", "canada", "brazil", "argentina", "japan", "china", "india", "russia", "australia", "morocco", "algeria", "tunisia", "yemen", "sudan", "libya"],
  },
  {
    id: "en-cs-004",
    category: "Animals",
    acceptedItems: ["lion", "tiger", "elephant", "giraffe", "zebra", "monkey", "bear", "wolf", "fox", "rabbit", "deer", "horse", "camel", "cow", "sheep", "goat", "dog", "cat", "eagle", "owl", "penguin", "dolphin", "whale", "shark", "snake", "crocodile", "turtle", "frog", "kangaroo", "panda"],
  },
  {
    id: "en-cs-005",
    category: "Football Clubs",
    acceptedItems: ["real madrid", "barcelona", "manchester united", "manchester city", "liverpool", "chelsea", "arsenal", "tottenham", "bayern munich", "juventus", "ac milan", "inter milan", "paris saint-germain", "psg", "atletico madrid", "borussia dortmund", "al hilal", "al nassr", "al ittihad"],
  },
  {
    id: "en-cs-006",
    category: "Colors",
    acceptedItems: ["red", "blue", "green", "yellow", "orange", "purple", "pink", "black", "white", "brown", "gray", "grey", "gold", "silver", "beige", "turquoise", "maroon", "navy", "teal", "violet"],
  },
  {
    id: "en-cs-007",
    category: "Movies",
    acceptedItems: ["titanic", "avatar", "avengers", "inception", "the lion king", "frozen", "joker", "spider-man", "batman", "star wars", "harry potter", "jurassic park", "the matrix", "gladiator", "forrest gump"],
  },
  {
    id: "en-cs-008",
    category: "Kitchen Items",
    acceptedItems: ["spoon", "fork", "knife", "plate", "bowl", "cup", "pan", "pot", "oven", "stove", "fridge", "refrigerator", "kettle", "blender", "microwave", "cutting board", "whisk", "spatula", "tray", "glass"],
  },
  {
    id: "en-cs-009",
    category: "Sports",
    acceptedItems: ["football", "basketball", "tennis", "swimming", "volleyball", "boxing", "cycling", "golf", "rugby", "cricket", "badminton", "wrestling", "athletics", "gymnastics", "skiing", "surfing", "table tennis", "handball"],
  },
  {
    id: "en-cs-010",
    category: "Middle Eastern Dishes",
    acceptedItems: ["hummus", "falafel", "shawarma", "kebab", "tabbouleh", "biryani", "kabsa", "baklava", "kunafa", "mansaf", "dolma", "fattoush", "manakish"],
  },
  {
    id: "en-cs-011",
    category: "Musical Instruments",
    acceptedItems: ["guitar", "piano", "violin", "drums", "flute", "trumpet", "saxophone", "cello", "oud", "clarinet", "harp", "trombone", "oboe", "viola", "accordion"],
  },
  {
    id: "en-cs-012",
    category: "Cities",
    acceptedItems: ["cairo", "dubai", "riyadh", "amman", "beirut", "istanbul", "paris", "london", "new york", "tokyo", "rome", "madrid", "berlin", "moscow", "los angeles", "chicago", "toronto"],
  },
  {
    id: "en-cs-013",
    category: "Professions",
    acceptedItems: ["doctor", "engineer", "teacher", "chef", "pilot", "nurse", "lawyer", "police officer", "firefighter", "dentist", "accountant", "architect", "waiter", "driver", "electrician", "plumber", "farmer", "journalist"],
  },
  {
    id: "en-cs-014",
    category: "Drinks",
    acceptedItems: ["water", "tea", "coffee", "juice", "soda", "milk", "lemonade", "smoothie", "cola", "orange juice", "iced tea", "hot chocolate", "espresso", "cappuccino", "latte"],
  },
  {
    id: "en-cs-015",
    category: "Things Found at the Beach",
    acceptedItems: ["sand", "sea", "sun", "umbrella", "towel", "shell", "shells", "waves", "surfboard", "sunscreen", "swimsuit", "ball", "bucket", "lifeguard", "boat"],
  },
];
