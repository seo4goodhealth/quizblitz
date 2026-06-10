// Funny name generator for QuizBlitz
// Combines adjectives + nouns to create hilarious player names
// Supports Spanglish mode for Spanish locale!

// English adjectives (original)
const EN_ADJECTIVES = [
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
  'Barnacle', 'Noodle', 'Pickled', 'Cosmic', 'Disco',
  'Turbo', 'Mega', 'Ultra', 'Hyper', 'Super',
  'Electric', 'Radioactive', 'Quantum', 'Volcanic', 'Magnetic',
  'Phantom', 'Mystic', 'Chaotic', 'Ruthless', 'Feisty',
  'Savage', 'Prickly', 'Slippery', 'Breezy', 'Frosty',
  'Jelly', 'Buttery', 'Garlicky', 'Crispy', 'Melty',
]

// English nouns (original)
const EN_NOUNS = [
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

// Spanglish adjectives - the more ridiculous the better!
// Mix of Spanish, English, and pure Spanglish nonsense
const SP_ADJECTIVES = [
  // Pure Spanish comedy
  'Chido', 'Loco', 'Fresa', 'Naco', 'Chido',
  'Baboso', 'Menso', 'Crazy', 'Tonto', 'Chiquito',
  'Gordito', 'Flaquito', 'Chamaco', 'Pocito', 'Rarito',
  'Chismoso', 'Travieso', 'Agujetas', 'Miedoso', 'Cansado',
  // Spanglish hybrids (the best kind!)
  'SuperLoco', 'MuyChido', 'BienFresa', 'ElCrazy', 'SoPill',
  'TooMuch', 'MuyCool', 'ElSavage', 'BienChido', 'FullNaco',
  'WayLoco', 'PeroLike', 'MuyBaboso', 'ElMero', 'BienMacho',
  // Funny intensifiers
  'Requete', 'Súper', 'Híper', 'Biónico', 'Nuclear',
  'Galáctico', 'Interdimensional', 'Explosivo', 'Volcánico', 'Magnético',
  // Food-based adjectives
  'Picantito', 'Dulcecito', 'Saladito', 'Agridulce', 'MuyFresco',
  'BienPicante', 'ExtraQueso', 'ConSalsa', 'AlPastor', 'AlCarbon',
  // More Spanglish gold
  'ElPro', 'LaMera', 'MuyFuerte', 'BienRudo', 'ElBoss',
  'SacateEl', 'AyCaramba', 'ÓraPues', 'Ándale', 'Órale',
  'Chévere', 'Bacán', 'Chilango', 'Regio', 'Guanaco',
  // Absurd combinations
  'ChidoPeroNo', 'AlgoRaro', 'MedioLoco', 'PocoSerio', 'CasiPro',
  'MedioCrazy', 'UnPoco', 'MuyMucho', 'SúperRaro', 'ChidoSí',
]

// Spanglish nouns - iconic Latino culture + internet nonsense
const SP_NOUNS = [
  // Food (the backbone of Latino culture)
  'Taco', 'Chilaquiles', 'Elote', 'Tamal', 'Enchilada',
  'Mole', 'Pozole', 'Tostada', 'Gordita', 'Quesadilla',
  'Ceviche', 'Aguachile', 'Churro', 'Paleta', 'Michelada',
  'Horchata', 'Jamaica', 'Tamarindo', 'Mangonada', 'Chamoyada',
  'Machete', 'Cemita', 'Tlacoyo', 'Huarache', 'Memela',
  // Animals with Spanish flair
  'Gallo', 'Chango', 'Cuy', 'Llama', 'Iguana',
  'Cucaracha', 'Zorrillo', 'Venado', 'Guajolote', 'Ajolote',
  'Teporingo', 'Ocelote', 'Quetzal', 'Puma', 'Jaguar',
  // People/Characters
  'Chaparro', 'Güey', 'Vato', 'Ese', 'Mija',
  'Jefe', 'Jefa', 'Primo', 'Compa', 'Amiguito',
  'Abuelita', 'TíoLoco', 'Madrina', 'Padrino', 'Comadre',
  // Objects & Culture
  'Piñata', 'Fútbol', 'Sombrero', 'Sarape', 'Maracas',
  'Lowrider', 'Banda', 'Corrido', 'Trompeta', 'Acordeón',
  'Cumbia', 'Salsa', 'Bachata', 'Reggaetón', 'Dembow',
  // Pure Spanglish noun hybrids
  'ElNinja', 'LaNinja', 'ElProfe', 'LaProfe', 'ElBoss',
  'LaJefa', 'ElChido', 'LaFresa', 'ElNaco', 'LaMera',
  'ElTaco', 'LaPapa', 'ElChile', 'LaSalsa', 'ElMaíz',
  // More ridiculous combos
  'Chorizo', 'Papaya', 'MaricónDe', 'Malacopa', 'Alma',
  'Caguama', 'BoingMango', 'Ricolino', 'Bimbo', 'Marinela',
  'PelonPe', 'Jarritos', 'TopoChico', 'Valentina', 'Chamoy',
  // Epic nouns
  'Chupacabras', 'Llorona', 'Alebrije', 'Nahual', 'Quetzalcoatl',
]

// Cache of recently generated names to avoid repeats
const recentNames: string[] = []

export function generateFunnyName(locale?: string): string {
  const isSpanishLocale = locale === 'es' || locale === 'ca'

  // Pick the right word pools
  const adjectives = isSpanishLocale
    ? [...SP_ADJECTIVES, ...EN_ADJECTIVES.slice(0, 30)] // Mix Spanglish + some English
    : EN_ADJECTIVES
  const nouns = isSpanishLocale
    ? [...SP_NOUNS, ...EN_NOUNS.slice(0, 30)] // Mix Spanglish + some English
    : EN_NOUNS

  // Generate several candidates and pick one not recently used
  for (let attempt = 0; attempt < 10; attempt++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const name = `${adj}${noun}`

    if (!recentNames.includes(name)) {
      recentNames.push(name)
      // Keep only last 20 names in cache
      if (recentNames.length > 20) recentNames.shift()
      return name
    }
  }

  // Fallback: just combine random ones
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${adj}${noun}`
}

// Get a preview of funny name examples for the UI
export function getFunnyNameExamples(locale?: string, count: number = 3): string[] {
  const examples: string[] = []
  for (let i = 0; i < count; i++) {
    examples.push(generateFunnyName(locale))
  }
  return examples
}
