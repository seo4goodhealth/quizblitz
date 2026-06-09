// Funny name generator for QuizBlitz
// Combines adjectives + nouns to create hilarious player names

const ADJECTIVES = [
  'Sneaky', 'Fluffy', 'Wobbly', 'Grumpy', 'Derpy',
  'Fancy', 'Silly', 'Sleepy', 'Cheeky', 'Clumsy',
  'Jazzy', 'Perky', 'Zany', 'Fuzzy', 'Giddy',
  'Wonky', 'Spicy', 'Crabby', 'Dizzy', 'Nerdy',
  'Pudgy', 'Sassy', 'Peppy', 'Goofy', 'Snazzy',
  'Bouncy', 'Chubby', 'Wacky', 'Loopy', 'Dorky',
  'Spunky', 'Punky', 'Nutty', 'Twitchy', 'Quirky',
  'Jiggly', 'Bubbly', 'Topsy', 'Wiggly', 'Giggly',
  'Toasty', 'Chewy', 'Stubby', 'Lumpy', 'Bendy',
  'Splashy', 'Tinny', 'Chunky', 'Itsy', 'Bitsy',
  'Wiggly', 'Blinky', 'Stompy', 'Floaty', 'Squishy',
  'Barnacle', 'Noodle', 'Pickled', 'Cosmic', 'Disco',
  'Turbo', 'Mega', 'Ultra', 'Hyper', 'Super',
  'Electric', 'Radioactive', 'Quantum', 'Volcanic', 'Magnetic',
  'Phantom', 'Mystic', 'Chaotic', 'Ruthless', 'Feisty',
  'Savage', 'Prickly', 'Slippery', 'Breezy', 'Frosty',
  'Jelly', 'Buttery', 'Garlicky', 'Crispy', 'Melty',
]

const NOUNS = [
  'Potato', 'Ninja', 'Penguin', 'Dinosaur', 'Taco',
  'Waffle', 'Pickle', 'Noodle', 'Muffin', 'Unicorn',
  'Pancake', 'Donut', 'Burrito', 'Cactus', 'Mushroom',
  'Walrus', 'Llama', 'Sloth', 'Otter', 'Raccoon',
  'Badger', 'Platypus', 'Flamingo', 'Porcupine', 'Narwhal',
  'Squid', 'Jellyfish', 'Koala', 'Chameleon', 'Panda',
  'Baguette', 'Croissant', 'Spaghetti', 'Meatball', 'Pepper',
  'Avocado', 'Broccoli', 'Pretzel', 'Biscuit', 'Cupcake',
  'Wizard', 'Pirate', 'Viking', 'Knight', 'Samurai',
  'Goblin', 'Troll', 'Dragon', 'Phoenix', 'Kraken',
  'Robot', 'Alien', 'Zombie', 'Ghost', 'Yeti',
  'Banana', 'Coconut', 'Pineapple', 'Watermelon', 'Lemon',
  'Cannonball', 'Thunder', 'Biscuit', 'Dumpling', 'Kebab',
  'Toaster', 'Blender', 'Microwave', 'Sprinkles', 'Confetti',
  'Marshmallow', 'Popcorn', 'Nachos', 'Quesadilla', 'DimSum',
]

// Cache of recently generated names to avoid repeats
const recentNames: string[] = []

export function generateFunnyName(): string {
  // Generate several candidates and pick one not recently used
  for (let attempt = 0; attempt < 10; attempt++) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
    const name = `${adj}${noun}`

    if (!recentNames.includes(name)) {
      recentNames.push(name)
      // Keep only last 20 names in cache
      if (recentNames.length > 20) recentNames.shift()
      return name
    }
  }

  // Fallback: just combine random ones
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  return `${adj}${noun}`
}

// Get a preview of funny name examples for the UI
export function getFunnyNameExamples(count: number = 3): string[] {
  const examples: string[] = []
  for (let i = 0; i < count; i++) {
    examples.push(generateFunnyName())
  }
  return examples
}
