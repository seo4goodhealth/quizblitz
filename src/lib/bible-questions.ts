// Comprehensive Bible-Only Question Bank for QuizBlitz
// All questions directly reference specific Bible content (books, verses, stories, characters, events, places, numbers)
// Kids-safe: no violence details, no inappropriate content

import { BankQuestion } from './question-bank'

// ============================================================
// Old Testament Stories (Creation, Flood, Exodus, etc.)
// ============================================================
const oldTestamentStories: BankQuestion[] = [
  { text: 'According to Genesis 1, what did God create on the first day?', optionA: 'Light', optionB: 'Water', optionC: 'Animals', optionD: 'Trees', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'In Genesis 1, what did God create on the second day?', optionA: 'The sky (firmament)', optionB: 'Land', optionC: 'Sun and moon', optionD: 'Sea creatures', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'According to Genesis 1, on which day did God create the sun, moon, and stars?', optionA: 'First day', optionB: 'Second day', optionC: 'Third day', optionD: 'Fourth day', correctAnswer: 'optionD', timeLimit: 15 },
  { text: 'In Genesis 1, what did God create on the third day?', optionA: 'Birds', optionB: 'Land and plants', optionC: 'Fish', optionD: 'Animals', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Genesis 1, on which day did God create sea creatures and birds?', optionA: 'Third day', optionB: 'Fourth day', optionC: 'Fifth day', optionD: 'Sixth day', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to Genesis 2, in which garden did God place the first man?', optionA: 'Garden of Gethsemane', optionB: 'Garden of Eden', optionC: 'Garden of Gilead', optionD: 'Garden of Carmel', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'In Genesis 3, what did the serpent tell Eve would happen if she ate the forbidden fruit?', optionA: 'She would become invisible', optionB: 'She would be like God, knowing good and evil', optionC: 'She would live forever in the garden', optionD: 'She would gain great strength', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Genesis 6-9, who built the ark to survive the great flood?', optionA: 'Abraham', optionB: 'Moses', optionC: 'Noah', optionD: 'Elijah', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'According to Genesis 7, how many of each kind of clean animal did Noah take on the ark?', optionA: 'Two', optionB: 'Three', optionC: 'Five', optionD: 'Seven', correctAnswer: 'optionD', timeLimit: 20 },
  { text: 'In Genesis 8, what bird did Noah send out first from the ark?', optionA: 'Dove', optionB: 'Raven', optionC: 'Eagle', optionD: 'Sparrow', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'According to Genesis 8, what did the dove bring back to Noah the second time?', optionA: 'A worm', optionB: 'An olive leaf', optionC: 'A fig leaf', optionD: 'A small stone', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Genesis 11, what was the name of the tower that people tried to build to reach heaven?', optionA: 'Tower of Babel', optionB: 'Tower of Babylon', optionC: 'Tower of Jericho', optionD: 'Tower of Zion', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'According to Exodus 7-12, how many plagues did God send on Egypt?', optionA: 'Seven', optionB: 'Eight', optionC: 'Ten', optionD: 'Twelve', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'According to Exodus 7, what was the first plague God sent on Egypt?', optionA: 'Frogs', optionB: 'Water turned to blood', optionC: 'Locusts', optionD: 'Darkness', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Exodus 12, what was the last plague God sent on Egypt?', optionA: 'Darkness', optionB: 'Locusts', optionC: 'The firstborn died', optionD: 'Boils', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'In Exodus 12, what were the Israelites told to put on their doorposts so the angel would pass over?', optionA: 'Olive oil', optionB: 'Water', optionC: 'Blood of a lamb', optionD: 'White wool', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to Exodus 14, what body of water did Moses part so the Israelites could cross?', optionA: 'Jordan River', optionB: 'Red Sea', optionC: 'Sea of Galilee', optionD: 'Dead Sea', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'In Exodus 16, what food did God provide from heaven for the Israelites in the desert?', optionA: 'Bread', optionB: 'Manna', optionC: 'Quail', optionD: 'Dates', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Exodus 17, how did Moses provide water for the Israelites at Horeb?', optionA: 'Dug a well', optionB: 'Struck a rock', optionC: 'Prayed for rain', optionD: 'Found a spring', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Joshua 6, what did the Israelites do to make the walls of Jericho fall?', optionA: 'Attacked with swords', optionB: 'Marched around the city and shouted', optionC: 'Built a ramp over the wall', optionD: 'Dug a tunnel under the wall', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Joshua 6, how many times did the Israelites march around Jericho on the seventh day?', optionA: 'Three', optionB: 'Five', optionC: 'Seven', optionD: 'Ten', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to Judges 16, who brought down the temple of Dagon by pushing the pillars?', optionA: 'Gideon', optionB: 'Samson', optionC: 'Deborah', optionD: 'Ehud', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In 1 Kings 18, what prophet challenged the prophets of Baal on Mount Carmel?', optionA: 'Elisha', optionB: 'Isaiah', optionC: 'Elijah', optionD: 'Amos', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to 2 Kings 5, what river did Naaman wash in seven times to be healed of leprosy?', optionA: 'Nile', optionB: 'Euphrates', optionC: 'Jordan', optionD: 'Tigris', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'In Genesis 22, what was Abraham asked to offer as a sacrifice on Mount Moriah?', optionA: 'A lamb', optionB: 'His son Isaac', optionC: 'A dove', optionD: 'His servant', correctAnswer: 'optionB', timeLimit: 15 },
]

// ============================================================
// Old Testament People (Adam, Moses, David, etc.)
// ============================================================
const oldTestamentPeople: BankQuestion[] = [
  { text: 'According to Genesis 2:7, God formed man from what material?', optionA: 'Water', optionB: 'Dust of the ground', optionC: 'Clay and stone', optionD: 'Sand', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Genesis 2, who was the first woman created in the Bible?', optionA: 'Sarah', optionB: 'Rebekah', optionC: 'Eve', optionD: 'Rachel', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'According to Genesis 4, who was the first child born in the Bible?', optionA: 'Abel', optionB: 'Cain', optionC: 'Seth', optionD: 'Enoch', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Genesis 5:27, who lived to be 969 years old, the oldest person in the Bible?', optionA: 'Noah', optionB: 'Adam', optionC: 'Methuselah', optionD: 'Enoch', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'In Genesis 12, who did God call to leave his homeland and go to a new land?', optionA: 'Isaac', optionB: 'Jacob', optionC: 'Abraham', optionD: 'Moses', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'According to Genesis 17, what was Abraham\'s name before God changed it?', optionA: 'Abram', optionB: 'Aron', optionC: 'Abel', optionD: 'Adam', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'In Genesis 25, who was the younger twin who bought his brother\'s birthright for stew?', optionA: 'Esau', optionB: 'Jacob', optionC: 'Ishmael', optionD: 'Judah', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Genesis 32, what was Jacob\'s name changed to after he wrestled with God?', optionA: 'Judah', optionB: 'Joseph', optionC: 'Israel', optionD: 'Benjamin', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'In Genesis 37, which son of Jacob was sold into slavery by his brothers?', optionA: 'Reuben', optionB: 'Judah', optionC: 'Joseph', optionD: 'Benjamin', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'According to Genesis 41, what did Pharaoh dream about that Joseph interpreted?', optionA: 'Seven fat and seven thin cows', optionB: 'A burning bush', optionC: 'A ladder to heaven', optionD: 'A great flood', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'In Exodus 2, who was saved from death as a baby when his mother placed him in a basket in the Nile?', optionA: 'Aaron', optionB: 'Joshua', optionC: 'Moses', optionD: 'Samuel', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'According to Exodus 3, what did Moses see that was burning but not consumed?', optionA: 'A tree', optionB: 'A bush', optionC: 'A mountain', optionD: 'A house', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Exodus 4, what did Moses say at the burning bush that made God angry?', optionA: 'I am not a good speaker', optionB: 'Send someone else', optionC: 'I don\'t know your name', optionD: 'The people won\'t listen', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'According to 1 Samuel 16, which son of Jesse was chosen to be king while still a shepherd boy?', optionA: 'Eliab', optionB: 'David', optionC: 'Absalom', optionD: 'Solomon', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'In 1 Samuel 17, how many stones did David pick up before facing Goliath?', optionA: 'One', optionB: 'Three', optionC: 'Five', optionD: 'Seven', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to 1 Samuel 17, what was Goliath\'s height described as in the Bible?', optionA: 'Five cubits', optionB: 'Six cubits and a span', optionC: 'Seven cubits', optionD: 'Eight cubits', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'In 1 Samuel 18, who became David\'s close friend, the son of Saul?', optionA: 'Absalom', optionB: 'Jonathan', optionC: 'Ishbosheth', optionD: 'Mephibosheth', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to 2 Samuel 11, who was the woman David saw bathing from his rooftop?', optionA: 'Abigail', optionB: 'Bathsheba', optionC: 'Michal', optionD: 'Tamar', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In 1 Kings 3, what did Solomon ask God to give him when he became king?', optionA: 'Wealth', optionB: 'Wisdom', optionC: 'Long life', optionD: 'Victory in battle', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to 2 Kings 2, who was taken up to heaven in a chariot of fire?', optionA: 'Moses', optionB: 'Enoch', optionC: 'Elijah', optionD: 'Elisha', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'In the book of Ruth, who was the Moabite woman who chose to stay with her mother-in-law Naomi?', optionA: 'Orpah', optionB: 'Ruth', optionC: 'Naomi', optionD: 'Boaz', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to 1 Samuel 1, which woman prayed for a child and later dedicated her son Samuel to God?', optionA: 'Sarah', optionB: 'Hannah', optionC: 'Rebekah', optionD: 'Rachel', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Genesis 21, who was the son Abraham had with Hagar?', optionA: 'Isaac', optionB: 'Ishmael', optionC: 'Esau', optionD: 'Jacob', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Numbers 13-14, which two spies gave a positive report about entering Canaan?', optionA: 'Moses and Aaron', optionB: 'Joshua and Caleb', optionC: 'Ephraim and Manasseh', optionD: 'Shadrach and Meshach', correctAnswer: 'optionB', timeLimit: 20 },
]

// ============================================================
// Old Testament Places & Events
// ============================================================
const oldTestamentPlacesEvents: BankQuestion[] = [
  { text: 'According to Genesis 2:10-14, what river flowed out of Eden and divided into four headwaters?', optionA: 'Nile', optionB: 'Euphrates', optionC: 'A river that split into four', optionD: 'Jordan', correctAnswer: 'optionC', timeLimit: 20 },
  { text: 'In Genesis 28, what place did Jacob name after dreaming of a ladder to heaven?', optionA: 'Bethel', optionB: 'Beersheba', optionC: 'Jerusalem', optionD: 'Shiloh', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'According to Exodus 19-20, on which mountain did Moses receive the Ten Commandments?', optionA: 'Mount Nebo', optionB: 'Mount Carmel', optionC: 'Mount Sinai', optionD: 'Mount Zion', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'In Numbers 13, what did the spies bring back from the land of Canaan to show its fruitfulness?', optionA: 'Figs and olives', optionB: 'A cluster of grapes so large it took two men to carry', optionC: 'Pomegranates and dates', optionD: 'Wheat and barley', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'According to Numbers 20, where did Moses strike the rock to bring forth water?', optionA: 'Mount Sinai', optionB: 'Meribah (Kadesh)', optionC: 'Elim', optionD: 'Marah', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'In Joshua 3, what river did the Israelites cross on dry ground to enter the Promised Land?', optionA: 'Euphrates', optionB: 'Nile', optionC: 'Jordan', optionD: 'Jabbok', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to 1 Samuel 4-5, where did the Philistines capture the Ark of the Covenant?', optionA: 'Jerusalem', optionB: 'Ebenezer', optionC: 'Shiloh', optionD: 'Bethel', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'In 2 Samuel 5, what city did David capture and make the capital of Israel?', optionA: 'Hebron', optionB: 'Jerusalem', optionC: 'Bethlehem', optionD: 'Samaria', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to 1 Kings 5-8, who built the first temple in Jerusalem?', optionA: 'David', optionB: 'Solomon', optionC: 'Hezekiah', optionD: 'Nehemiah', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'In 2 Kings 17, which empire conquered the northern kingdom of Israel?', optionA: 'Babylon', optionB: 'Assyria', optionC: 'Egypt', optionD: 'Persia', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to 2 Kings 25, which empire conquered Jerusalem and destroyed the temple?', optionA: 'Assyria', optionB: 'Babylon', optionC: 'Persia', optionD: 'Rome', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In the book of Ezra, which Persian king allowed the Jews to return to Jerusalem?', optionA: 'Darius', optionB: 'Cyrus', optionC: 'Artaxerxes', optionD: 'Ahasuerus', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'According to the book of Nehemiah, what structure did Nehemiah help rebuild?', optionA: 'The temple', optionB: 'The walls of Jerusalem', optionC: 'The palace', optionD: 'The city gates only', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In the book of Esther, in which city does the story take place?', optionA: 'Jerusalem', optionB: 'Babylon', optionC: 'Susa (Shushan)', optionD: 'Nineveh', correctAnswer: 'optionC', timeLimit: 20 },
  { text: 'According to Genesis 19, what city was destroyed by fire from heaven along with Gomorrah?', optionA: 'Nineveh', optionB: 'Sodom', optionC: 'Babylon', optionD: 'Jericho', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Exodus 15, after crossing the Red Sea, what place did the Israelites come to where the water was bitter?', optionA: 'Elim', optionB: 'Marah', optionC: 'Meribah', optionD: 'Rephidim', correctAnswer: 'optionB', timeLimit: 20 },
]

// ============================================================
// Psalms & Proverbs
// ============================================================
const psalmsProverbs: BankQuestion[] = [
  { text: 'According to Psalm 23:1, "The Lord is my shepherd, I shall not" what?', optionA: 'Be afraid', optionB: 'Want', optionC: 'Perish', optionD: 'Falter', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'Psalm 23:4 says, "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your" what "comfort me"?', optionA: 'Staff', optionB: 'Shield', optionC: 'Word', optionD: 'Sword', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'According to Psalm 46:10, what does God say we should do to know that He is God?', optionA: 'Pray', optionB: 'Be still', optionC: 'Sing praises', optionD: 'Read the law', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'Psalm 119 is the longest chapter in the Bible. What is its main subject?', optionA: 'God\'s Word (law, statutes, commandments)', optionB: 'The story of Moses', optionC: 'The history of Israel', optionD: 'The life of David', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'According to Psalm 100:1, what are we commanded to make to the Lord?', optionA: 'A sacrifice', optionB: 'A joyful noise (shout)', optionC: 'A solemn vow', optionD: 'An offering', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'Psalm 19:1 says, "The heavens declare the glory of God; the skies proclaim the work of his" what?', optionA: 'Hands', optionB: 'Mind', optionC: 'Heart', optionD: 'Power', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'According to Psalm 139:14, what did David say was "fearfully and wonderfully made"?', optionA: 'The heavens', optionB: 'The earth', optionC: 'I am (the human body)', optionD: 'The temple', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to Proverbs 1:7, "The fear of the Lord is the beginning of" what?', optionA: 'Wisdom', optionB: 'Faith', optionC: 'Love', optionD: 'Strength', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'Proverbs 3:5 says, "Trust in the Lord with all your heart and lean not on your own" what?', optionA: 'Strength', optionB: 'Understanding', optionC: 'Desires', optionD: 'Plans', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Proverbs 22:6, "Train up a child in the way he should go, and when he is old he will not" what?', optionA: 'Forget it', optionB: 'Depart from it', optionC: 'Doubt it', optionD: 'Turn from it', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'Proverbs 18:21 says, "The tongue has the power of life and" what?', optionA: 'Death', optionB: 'Wisdom', optionC: 'Fire', optionD: 'Truth', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'According to Proverbs 27:17, "As iron sharpens iron, so one person sharpens" what?', optionA: 'Another', optionB: 'The mind', optionC: 'The soul', optionD: 'A sword', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'Psalm 51 is a prayer of repentance. According to its heading, who prayed this psalm after being confronted by Nathan?', optionA: 'Solomon', optionB: 'David', optionC: 'Saul', optionD: 'Hezekiah', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Psalm 8:4, what does David ask: "What is mankind that you are mindful of them, human beings that you" what?', optionA: 'Care for them', optionB: 'Remember them', optionC: 'Love them', optionD: 'Forgive them', correctAnswer: 'optionA', timeLimit: 20 },
  { text: 'Proverbs 31 describes a "virtuous woman" or "wife of noble character." According to verse 10, her worth is far above what?', optionA: 'Gold', optionB: 'Rubies', optionC: 'Diamonds', optionD: 'Pearls', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'According to Psalm 127:1, "Unless the Lord builds the house, the builders labor in" what?', optionA: 'Sin', optionB: 'Vain', optionC: 'Fear', optionD: 'Darkness', correctAnswer: 'optionB', timeLimit: 15 },
]

// ============================================================
// Prophets & Prophecy
// ============================================================
const prophetsProphecy: BankQuestion[] = [
  { text: 'According to Isaiah 7:14, a virgin will conceive and give birth to a son and call him what?', optionA: 'Jesus', optionB: 'Immanuel', optionC: 'Messiah', optionD: 'Prince of Peace', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'Isaiah 9:6 prophesied a child would be called "Wonderful Counselor, Mighty God, Everlasting Father," and what?', optionA: 'King of Kings', optionB: 'Prince of Peace', optionC: 'Lord of Lords', optionD: 'Holy One', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Isaiah 53, the suffering servant was "pierced for our" what?', optionA: 'Sins', optionB: 'Faith', optionC: 'Fears', optionD: 'Troubles', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'In Jeremiah 1:5, God told Jeremiah, "Before I formed you in the womb I" what?', optionA: 'Loved you', optionB: 'Knew you', optionC: 'Chose you', optionD: 'Blessed you', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Jeremiah 29:11, God says, "For I know the plans I have for you, plans to prosper you and not to harm you, plans to give you a hope and a" what?', optionA: 'Future', optionB: 'Victory', optionC: 'Kingdom', optionD: 'Blessing', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'In the book of Jonah, God told Jonah to go preach to which city?', optionA: 'Babylon', optionB: 'Nineveh', optionC: 'Jerusalem', optionD: 'Tyre', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Jonah 1, how many days and nights was Jonah inside the great fish?', optionA: 'One', optionB: 'Two', optionC: 'Three', optionD: 'Seven', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'In the book of Daniel, what did Daniel interpret for King Nebuchadnezzar?', optionA: 'A prophecy', optionB: 'Dreams', optionC: 'Writings on the wall', optionD: 'A vision', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Daniel 5, what appeared on the wall during Belshazzar\'s feast?', optionA: 'A burning message', optionB: 'Fingers of a human hand writing', optionC: 'A golden scroll', optionD: 'An angel with a sword', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Daniel 6, how many times a day did Daniel pray, even when it was forbidden?', optionA: 'One', optionB: 'Two', optionC: 'Three', optionD: 'Seven', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to Daniel 3, who were the three men thrown into the fiery furnace for refusing to worship an idol?', optionA: 'Daniel, David, and Solomon', optionB: 'Shadrach, Meshach, and Abednego', optionC: 'Elijah, Elisha, and Ezekiel', optionD: 'Peter, James, and John', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Daniel 3, who did Nebuchadnezzar see walking in the fiery furnace with the three men?', optionA: 'An angel', optionB: 'A fourth figure like a son of the gods', optionC: 'Daniel', optionD: 'The prophet Isaiah', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'According to Micah 5:2, which small town was prophesied to be the birthplace of a ruler in Israel?', optionA: 'Jerusalem', optionB: 'Nazareth', optionC: 'Bethlehem', optionD: 'Hebron', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'In the book of Ezekiel 37, what did God tell Ezekiel to prophesy to that became living people?', optionA: 'Dry bones', optionB: 'Stones', optionC: 'Dust', optionD: 'Ashes', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'According to Zechariah 9:9, how was the coming King prophesied to enter Jerusalem?', optionA: 'On a war horse', optionB: 'Riding on a donkey', optionC: 'In a chariot', optionD: 'Walking', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In the book of Amos, what was Amos\'s occupation before becoming a prophet?', optionA: 'Fisherman', optionB: 'Shepherd and caretaker of sycamore-fig trees', optionC: 'Potter', optionD: 'Tax collector', correctAnswer: 'optionB', timeLimit: 20 },
]

// ============================================================
// New Testament - Life of Jesus
// ============================================================
const lifeOfJesus: BankQuestion[] = [
  { text: 'According to Matthew 1, how many generations were there from Abraham to David?', optionA: 'Ten', optionB: 'Fourteen', optionC: 'Twelve', optionD: 'Seven', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'According to Luke 2, in which town was Jesus born?', optionA: 'Nazareth', optionB: 'Jerusalem', optionC: 'Bethlehem', optionD: 'Capernaum', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'In Luke 2, who appeared to the shepherds to announce the birth of Jesus?', optionA: 'A prophet', optionB: 'An angel of the Lord', optionC: 'A star', optionD: 'A wise man', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Matthew 2, who followed a star to find the young Jesus?', optionA: 'Shepherds', optionB: 'Magi (wise men)', optionC: 'Priests', optionD: 'Fishermen', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'In Matthew 3, who baptized Jesus in the Jordan River?', optionA: 'Peter', optionB: 'John the Baptist', optionC: 'Andrew', optionD: 'Philip', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'According to Matthew 3:17, what did the voice from heaven say at Jesus\'s baptism?', optionA: 'This is my beloved Son, in whom I am well pleased', optionB: 'Behold the Lamb of God', optionC: 'The kingdom of heaven is near', optionD: 'Go and sin no more', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'In Matthew 4, how many days was Jesus tempted in the wilderness?', optionA: 'Seven', optionB: 'Thirty', optionC: 'Forty', optionD: 'Fifty', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to Matthew 4:4, Jesus answered the devil, "Man shall not live on bread alone, but on every" what?', optionA: 'Word that comes from the mouth of God', optionB: 'Prayer offered in faith', optionC: 'Good deed done in love', optionD: 'Promise in the Scriptures', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'In John 2, what was Jesus\'s first miracle, performed at a wedding?', optionA: 'Healing a blind man', optionB: 'Turning water into wine', optionC: 'Feeding 5000', optionD: 'Calming a storm', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'According to John 2, in which town did Jesus perform his first miracle at a wedding?', optionA: 'Jerusalem', optionB: 'Capernaum', optionC: 'Cana', optionD: 'Bethany', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'In Matthew 14, how many people did Jesus feed with five loaves and two fish?', optionA: 'About 1,000', optionB: 'About 3,000', optionC: 'About 5,000 men (plus women and children)', optionD: 'About 10,000', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to Matthew 14, how many baskets of food were left over after Jesus fed the 5,000?', optionA: 'Five', optionB: 'Seven', optionC: 'Twelve', optionD: 'None', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'In Mark 4, what did Jesus say to calm the storm on the sea?', optionA: 'Be still', optionB: 'Go in peace', optionC: 'Do not be afraid', optionD: 'Peace, be still', correctAnswer: 'optionD', timeLimit: 15 },
  { text: 'According to Mark 5, what was the name of the man Jesus healed who lived among the tombs?', optionA: 'The text does not give a name', optionB: 'Legion', optionC: 'Lazarus', optionD: 'Bartimaeus', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'In John 11, who did Jesus raise from the dead after four days in the tomb?', optionA: 'Jairus\'s daughter', optionB: 'The widow\'s son', optionC: 'Lazarus', optionD: 'Dorcas', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'According to John 11, in which town did Jesus raise Lazarus from the dead?', optionA: 'Bethany', optionB: 'Bethlehem', optionC: 'Jerusalem', optionD: 'Capernaum', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'In Matthew 17, on which mountain was Jesus transfigured before Peter, James, and John?', optionA: 'Mount Sinai', optionB: 'Mount of Olives', optionC: 'A high mountain (traditionally Mount Tabor)', optionD: 'Mount Carmel', correctAnswer: 'optionC', timeLimit: 20 },
  { text: 'According to Matthew 21, what did Jesus ride into Jerusalem on (Palm Sunday)?', optionA: 'A horse', optionB: 'A donkey and a colt', optionC: 'A chariot', optionD: 'A camel', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Matthew 26, who betrayed Jesus with a kiss?', optionA: 'Peter', optionB: 'Judas Iscariot', optionC: 'Thomas', optionD: 'James', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'According to Matthew 26, how many pieces of silver did Judas receive for betraying Jesus?', optionA: 'Twenty', optionB: 'Thirty', optionC: 'Forty', optionD: 'Fifty', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In John 19, what was written on the cross above Jesus?', optionA: 'King of Kings', optionB: 'Jesus of Nazareth, King of the Jews', optionC: 'Son of God', optionD: 'The Messiah', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to John 19, in what garden was Jesus buried?', optionA: 'Garden of Eden', optionB: 'A garden near Golgotha', optionC: 'Garden of Gethsemane', optionD: 'Garden of Bethany', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'In Matthew 28, who were the first people to find the empty tomb?', optionA: 'Peter and John', optionB: 'Mary Magdalene and the other Mary', optionC: 'The Roman guards', optionD: 'The chief priests', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Acts 1, how many days did Jesus appear to his disciples after his resurrection?', optionA: 'Seven', optionB: 'Twenty-one', optionC: 'Forty', optionD: 'Fifty', correctAnswer: 'optionC', timeLimit: 20 },
  { text: 'In Acts 1:9, how did Jesus leave the earth after his resurrection?', optionA: 'Walked away', optionB: 'He was taken up (ascended) into heaven', optionC: 'Disappeared in the temple', optionD: 'Was taken by angels', correctAnswer: 'optionB', timeLimit: 15 },
]

// ============================================================
// New Testament - Parables & Teachings
// ============================================================
const parablesTeachings: BankQuestion[] = [
  { text: 'In Matthew 13, what did the sower go out to sow in Jesus\'s parable?', optionA: 'Wheat', optionB: 'Seed', optionC: 'Grain', optionD: 'Vines', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to the parable in Matthew 13, the seed that fell on good soil produced a crop of what multiples?', optionA: 'Thirty, sixty, or a hundred times', optionB: 'Ten, twenty, or fifty times', optionC: 'Twelve, twenty-four, or forty-eight times', optionD: 'Seven times seventy', correctAnswer: 'optionA', timeLimit: 20 },
  { text: 'In Luke 15, what did the prodigal son ask his father for?', optionA: 'A new home', optionB: 'His share of the estate', optionC: 'A position of authority', optionD: 'Permission to travel', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Luke 15, what did the father do when the prodigal son returned home?', optionA: 'Punished him', optionB: 'Ran to him and embraced him', optionC: 'Made him a servant', optionD: 'Turned him away', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Luke 10, who helped the injured man in the parable of the Good Samaritan?', optionA: 'A priest', optionB: 'A Levite', optionC: 'A Samaritan', optionD: 'A Pharisee', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'According to Matthew 20, in the parable of the workers in the vineyard, how much did each worker receive?', optionA: 'Different amounts based on hours worked', optionB: 'A denarius each', optionC: 'Two denarii for those who worked longest', optionD: 'Whatever the landowner decided that day', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'In Matthew 25, what did the wise virgins bring that the foolish ones did not?', optionA: 'Extra lamps', optionB: 'Extra oil', optionC: 'Extra wicks', optionD: 'Extra torches', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Matthew 25:14-30, in the parable of the talents, how many talents did the master give to each servant?', optionA: 'One, two, and five', optionB: 'Two, three, and five', optionC: 'One, three, and ten', optionD: 'Five, ten, and twenty', correctAnswer: 'optionA', timeLimit: 20 },
  { text: 'In Luke 18, what did the persistent widow keep doing in Jesus\'s parable?', optionA: 'Praying in the temple', optionB: 'Asking the judge for justice', optionC: 'Knocking on a door', optionD: 'Sowing seed', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Matthew 13:45-46, what did the merchant sell to buy one pearl of great value?', optionA: 'His house', optionB: 'Everything he had', optionC: 'His other pearls', optionD: 'His field', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Luke 12, what did the rich fool do with his abundant crops?', optionA: 'Shared them with the poor', optionB: 'Built bigger barns to store them', optionC: 'Sold them at the market', optionD: 'Fed them to his animals', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Matthew 18, how many times did Jesus say we should forgive?', optionA: 'Seven times', optionB: 'Seventy-seven times (or seventy times seven)', optionC: 'One hundred times', optionD: 'As many times as needed', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Matthew 7:24-27, what is the wise man\'s house built on?', optionA: 'Sand', optionB: 'Rock', optionC: 'Wood', optionD: 'Brick', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'According to Matthew 5:14, Jesus said, "You are the light of the world. A city on a hill cannot be" what?', optionA: 'Destroyed', optionB: 'Moved', optionC: 'Hidden', optionD: 'Forgotten', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'In Matthew 5:9, Jesus said, "Blessed are the peacemakers, for they will be called" what?', optionA: 'Children of God', optionB: 'Sons of light', optionC: 'Friends of God', optionD: 'Citizens of heaven', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'According to Matthew 5:3, "Blessed are the poor in spirit, for theirs is the kingdom of" what?', optionA: 'Earth', optionB: 'Heaven', optionC: 'God', optionD: 'Light', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Matthew 6:9, how does the Lord\'s Prayer begin?', optionA: 'Our Father in heaven, hallowed be your name', optionB: 'Lord, hear my prayer', optionC: 'Almighty God, we come before you', optionD: 'Holy, holy, holy is the Lord', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'According to Matthew 6:33, Jesus said, "Seek first his kingdom and his" what?', optionA: 'Glory', optionB: 'Righteousness', optionC: 'Wisdom', optionD: 'Power', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Matthew 7:12, what is often called the Golden Rule?', optionA: 'Love your neighbor as yourself', optionB: 'Do to others what you would have them do to you', optionC: 'Forgive and you will be forgiven', optionD: 'Honor your father and mother', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Matthew 22:37-39, what did Jesus say is the greatest commandment?', optionA: 'Honor your father and mother', optionB: 'Do not steal', optionC: 'Love the Lord your God with all your heart, soul, and mind', optionD: 'Love your neighbor as yourself', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'In Matthew 22:39, what did Jesus say is the second greatest commandment?', optionA: 'Do not lie', optionB: 'Love your neighbor as yourself', optionC: 'Forgive your enemies', optionD: 'Keep the Sabbath holy', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to John 3:16, "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have" what?', optionA: 'Eternal life', optionB: 'Great wealth', optionC: 'Perfect peace', optionD: 'Heavenly rewards', correctAnswer: 'optionA', timeLimit: 10 },
  { text: 'In John 14:6, Jesus said, "I am the way, the truth, and the" what?', optionA: 'Light', optionB: 'Life', optionC: 'Hope', optionD: 'Peace', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'According to John 10:10, Jesus said he came so that people may have life and have it how?', optionA: 'Everlasting', optionB: 'To the full (abundantly)', optionC: 'Without pain', optionD: 'Forever', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Matthew 28:19-20, what did Jesus command his disciples to do (the Great Commission)?', optionA: 'Build a temple', optionB: 'Go and make disciples of all nations', optionC: 'Wait in Jerusalem', optionD: 'Write down his teachings', correctAnswer: 'optionB', timeLimit: 15 },
]

// ============================================================
// New Testament - Apostles & Early Church
// ============================================================
const apostlesEarlyChurch: BankQuestion[] = [
  { text: 'According to Matthew 10:2-4, how many apostles did Jesus choose?', optionA: 'Seven', optionB: 'Ten', optionC: 'Twelve', optionD: 'Fifteen', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'In Matthew 4, what were Peter and Andrew doing when Jesus called them?', optionA: 'Working in a field', optionB: 'Casting a net into the sea (fishing)', optionC: 'Sitting at a tax booth', optionD: 'Praying in the synagogue', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Matthew 9:9, what was Matthew\'s occupation before following Jesus?', optionA: 'Fisherman', optionB: 'Tax collector', optionC: 'Carpenter', optionD: 'Shepherd', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Acts 2, what event occurred when the Holy Spirit came upon the believers at Pentecost?', optionA: 'An earthquake', optionB: 'They spoke in other tongues (languages)', optionC: 'A bright light from heaven', optionD: 'The temple was filled with water', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Acts 2, how many people were added to the church on the day of Pentecost?', optionA: 'About 1,000', optionB: 'About 2,000', optionC: 'About 3,000', optionD: 'About 5,000', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'In Acts 3, who healed the lame beggar at the temple gate called Beautiful?', optionA: 'Peter and John', optionB: 'Paul and Barnabas', optionC: 'James and Andrew', optionD: 'Philip and Stephen', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'According to Acts 6-7, who was the first Christian martyr (stoned to death)?', optionA: 'James', optionB: 'Stephen', optionC: 'Peter', optionD: 'Andrew', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Acts 8, who baptized the Ethiopian official on the road to Gaza?', optionA: 'Peter', optionB: 'Paul', optionC: 'Philip', optionD: 'Stephen', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to Acts 9, what happened to Saul on the road to Damascus?', optionA: 'He was arrested', optionB: 'A bright light from heaven blinded him', optionC: 'He found a treasure', optionD: 'He met the apostles', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Acts 9, who was sent to lay hands on Saul so he could see again?', optionA: 'Peter', optionB: 'Ananias', optionC: 'Barnabas', optionD: 'Stephen', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Acts 10, which apostle had a vision of unclean animals and was sent to the centurion Cornelius?', optionA: 'Paul', optionB: 'John', optionC: 'Peter', optionD: 'James', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'In Acts 12, which apostle was miraculously freed from prison by an angel?', optionA: 'John', optionB: 'Peter', optionC: 'Paul', optionD: 'James', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Acts 13, who were the first missionaries sent out from the church at Antioch?', optionA: 'Peter and John', optionB: 'Barnabas and Saul (Paul)', optionC: 'Philip and Stephen', optionD: 'James and Andrew', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Acts 16, who was the first convert to Christianity in Europe (in Philippi)?', optionA: 'A Roman soldier', optionB: 'Lydia, a seller of purple cloth', optionC: 'The Philippian jailer', optionD: 'A Greek philosopher', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'According to Acts 16, what did Paul and Silas do at midnight while in prison in Philippi?', optionA: 'They slept', optionB: 'They prayed and sang hymns to God', optionC: 'They argued with the guards', optionD: 'They planned an escape', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Acts 27, how many people were on the ship with Paul during the shipwreck?', optionA: 'About 76', optionB: 'About 150', optionC: 'About 276', optionD: 'About 400', correctAnswer: 'optionC', timeLimit: 20 },
  { text: 'According to Matthew 26, which apostle denied Jesus three times?', optionA: 'Thomas', optionB: 'John', optionC: 'Peter', optionD: 'Andrew', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'In John 20, which apostle is known as "Doubting Thomas"?', optionA: 'Peter', optionB: 'Thomas', optionC: 'Judas', optionD: 'Matthew', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'According to Acts 1, who replaced Judas as the twelfth apostle?', optionA: 'Paul', optionB: 'Matthias', optionC: 'Barnabas', optionD: 'Stephen', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'In Acts 9, by what other name was Saul known after his conversion?', optionA: 'Peter', optionB: 'Paul', optionC: 'Silas', optionD: 'Timothy', correctAnswer: 'optionB', timeLimit: 10 },
]

// ============================================================
// New Testament - Epistles & Revelation
// ============================================================
const epistlesRevelation: BankQuestion[] = [
  { text: 'According to Romans 3:23, "All have sinned and fall short of the" what?', optionA: 'Glory of God', optionB: 'Kingdom of heaven', optionC: 'Law of Moses', optionD: 'Way of righteousness', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'Romans 6:23 says, "The wages of sin is death, but the gift of God is eternal life in Christ Jesus our" what?', optionA: 'King', optionB: 'Lord', optionC: 'Savior', optionD: 'Friend', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Romans 8:28, "In all things God works for the good of those who love him, who have been called according to his" what?', optionA: 'Will', optionB: 'Purpose', optionC: 'Plan', optionD: 'Promise', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In 1 Corinthians 13, what does Paul say is the greatest of faith, hope, and love?', optionA: 'Faith', optionB: 'Hope', optionC: 'Love', optionD: 'They are equal', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to 1 Corinthians 13:4, "Love is patient, love is" what?', optionA: 'Strong', optionB: 'Kind', optionC: 'Wise', optionD: 'Bold', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'In Galatians 5:22-23, how many fruits of the Spirit are listed?', optionA: 'Seven', optionB: 'Nine', optionC: 'Ten', optionD: 'Twelve', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Ephesians 2:8, "By grace you have been saved, through" what?', optionA: 'Works', optionB: 'Faith', optionC: 'Prayer', optionD: 'Knowledge', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Ephesians 6:11, what does Paul tell believers to put on?', optionA: 'The crown of glory', optionB: 'The full armor of God', optionC: 'The robe of righteousness', optionD: 'The shield of faith alone', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Philippians 4:13, "I can do all things through" who?', optionA: 'The Spirit', optionB: 'Christ who strengthens me', optionC: 'The power of prayer', optionD: 'My own efforts', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'In Philippians 4:6-7, what does Paul say we should do instead of being anxious?', optionA: 'Work harder', optionB: 'Pray and give thanks', optionC: 'Read the Scriptures', optionD: 'Be patient', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to 2 Timothy 3:16, "All Scripture is God-breathed and is useful for" what?', optionA: 'Teaching, rebuking, correcting, and training in righteousness', optionB: 'Healing and comfort', optionC: 'Wisdom and prosperity', optionD: 'Building the church', correctAnswer: 'optionA', timeLimit: 20 },
  { text: 'In Hebrews 11:1, "Faith is the assurance of things hoped for, the conviction of things" what?', optionA: 'Seen', optionB: 'Unseen', optionC: 'Promised', optionD: 'Known', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to James 1:5, if anyone lacks wisdom, what should they do?', optionA: 'Study the law', optionB: 'Ask God, who gives generously', optionC: 'Consult the elders', optionD: 'Meditate and fast', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In 1 John 4:8, "Whoever does not love does not know God, because God is" what?', optionA: 'Holy', optionB: 'Love', optionC: 'Just', optionD: 'Merciful', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Revelation 1, on what island was John when he received the revelation?', optionA: 'Crete', optionB: 'Patmos', optionC: 'Cyprus', optionD: 'Malta', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Revelation 2-3, how many churches are addressed in the letters?', optionA: 'Five', optionB: 'Six', optionC: 'Seven', optionD: 'Twelve', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to Revelation 21, what will God wipe away from every eye?', optionA: 'Sin', optionB: 'Tears', optionC: 'Fear', optionD: 'Doubt', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Revelation 22:13, Jesus says, "I am the Alpha and the Omega, the First and the Last, the Beginning and the" what?', optionA: 'End', optionB: 'Eternal', optionC: 'Everything', optionD: 'Forever', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'According to Revelation 5:5, what animal is Jesus called?', optionA: 'The Lamb of God', optionB: 'The Lion of the tribe of Judah', optionC: 'The Good Shepherd', optionD: 'The sacrificial goat', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'In Revelation 21:2, what comes down from heaven prepared as a bride?', optionA: 'An angel', optionB: 'The New Jerusalem', optionC: 'The kingdom of God', optionD: 'The Holy Spirit', correctAnswer: 'optionB', timeLimit: 15 },
]

// ============================================================
// Bible Books & Structure
// ============================================================
const bibleBooksStructure: BankQuestion[] = [
  { text: 'What is the first book of the Bible?', optionA: 'Exodus', optionB: 'Genesis', optionC: 'Leviticus', optionD: 'Matthew', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'What is the last book of the Old Testament?', optionA: 'Malachi', optionB: 'Zechariah', optionC: 'Haggai', optionD: 'Nehemiah', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'What is the first book of the New Testament?', optionA: 'Mark', optionB: 'Luke', optionC: 'Matthew', optionD: 'John', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'What is the last book of the Bible?', optionA: 'Jude', optionB: '3 John', optionC: 'Revelation', optionD: 'Acts', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'How many books are in the standard Protestant Bible?', optionA: '39', optionB: '27', optionC: '66', optionD: '73', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'How many books are in the Old Testament (Protestant canon)?', optionA: '27', optionB: '39', optionC: '46', optionD: '33', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'How many books are in the New Testament?', optionA: '25', optionB: '27', optionC: '29', optionD: '39', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'What book of the Bible is named after a Greek word meaning "creation" or "beginning"?', optionA: 'Genesis', optionB: 'Exodus', optionC: 'Origins', optionD: 'Beginnings', correctAnswer: 'optionA', timeLimit: 15 },
  { text: 'What book of the Bible means "departure" or "going out"?', optionA: 'Genesis', optionB: 'Exodus', optionC: 'Numbers', optionD: 'Deuteronomy', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'Which four books of the New Testament tell the story of Jesus\'s life?', optionA: 'Acts, Romans, Corinthians, Galatians', optionB: 'Matthew, Mark, Luke, John', optionC: 'Peter, James, John, Jude', optionD: 'Hebrews, James, Peter, John', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'What book of the New Testament tells the story of the early church after Jesus\'s ascension?', optionA: 'Romans', optionB: 'Acts', optionC: 'Hebrews', optionD: 'Revelation', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'How many Psalms are in the book of Psalms?', optionA: '100', optionB: '120', optionC: '150', optionD: '175', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to tradition, who wrote most of the Psalms?', optionA: 'Solomon', optionB: 'Moses', optionC: 'David', optionD: 'Samuel', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'Who wrote the majority of the New Testament epistles (letters)?', optionA: 'Peter', optionB: 'John', optionC: 'Paul', optionD: 'James', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'How many books of the Bible are named after women?', optionA: 'None', optionB: 'One', optionC: 'Two', optionD: 'Three', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'Which two books of the Bible are named after women?', optionA: 'Sarah and Ruth', optionB: 'Ruth and Esther', optionC: 'Esther and Mary', optionD: 'Deborah and Ruth', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'What is the shortest book in the Old Testament?', optionA: 'Obadiah', optionB: 'Haggai', optionC: 'Nahum', optionD: 'Zephaniah', correctAnswer: 'optionA', timeLimit: 20 },
  { text: 'What is the shortest verse in the Bible (John 11:35)?', optionA: 'God is love', optionB: 'Jesus wept', optionC: 'Pray always', optionD: 'Be still', correctAnswer: 'optionB', timeLimit: 10 },
  { text: 'What is the longest book in the Bible by number of chapters?', optionA: 'Genesis', optionB: 'Isaiah', optionC: 'Jeremiah', optionD: 'Psalms', correctAnswer: 'optionD', timeLimit: 15 },
  { text: 'Which New Testament book is a letter to Philemon about his runaway slave Onesimus?', optionA: 'Colossians', optionB: 'Philemon', optionC: 'Ephesians', optionD: 'Titus', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'The books of 1 and 2 Samuel, 1 and 2 Kings, and 1 and 2 Chronicles are classified as what type of literature?', optionA: 'Law', optionB: 'Poetry', optionC: 'History', optionD: 'Prophecy', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'What are the first five books of the Bible collectively called?', optionA: 'The Law (Torah/Pentateuch)', optionB: 'The Prophets', optionC: 'The Writings', optionD: 'The Histories', correctAnswer: 'optionA', timeLimit: 15 },
]

// ============================================================
// Bible Numbers & Facts
// ============================================================
const bibleNumbersFacts: BankQuestion[] = [
  { text: 'According to Genesis 1, on which day did God rest from all his work?', optionA: 'The fifth day', optionB: 'The sixth day', optionC: 'The seventh day', optionD: 'The first day', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'How many sons did Jacob (Israel) have, who became the heads of the tribes of Israel?', optionA: 'Ten', optionB: 'Eleven', optionC: 'Twelve', optionD: 'Thirteen', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'According to Exodus, how many commandments did God give Moses on Mount Sinai?', optionA: 'Five', optionB: 'Seven', optionC: 'Ten', optionD: 'Twelve', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'According to Genesis 6-7, how old was Noah when the flood began?', optionA: '300 years old', optionB: '400 years old', optionC: '500 years old', optionD: '600 years old', correctAnswer: 'optionD', timeLimit: 20 },
  { text: 'How many days and nights did it rain during the great flood, according to Genesis 7?', optionA: 'Seven', optionB: 'Twenty', optionC: 'Forty', optionD: 'Fifty', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to Numbers 14, how many years did the Israelites wander in the wilderness?', optionA: 'Twenty', optionB: 'Thirty', optionC: 'Forty', optionD: 'Fifty', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'How many books are in the Pentateuch (the first five books of the Bible)?', optionA: 'Three', optionB: 'Four', optionC: 'Five', optionD: 'Seven', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'According to 1 Kings 6, how many years did Solomon take to build the temple?', optionA: 'Five', optionB: 'Seven', optionC: 'Ten', optionD: 'Twelve', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'According to Genesis 7:2, how many pairs of unclean animals went on the ark?', optionA: 'One pair', optionB: 'Two pairs', optionC: 'Three pairs', optionD: 'Seven pairs', correctAnswer: 'optionA', timeLimit: 20 },
  { text: 'How many plagues were sent on Egypt, according to the book of Exodus?', optionA: 'Seven', optionB: 'Eight', optionC: 'Ten', optionD: 'Twelve', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'According to 1 Samuel 17, how tall was Goliath described as being?', optionA: 'Five cubits', optionB: 'Six cubits and a span', optionC: 'Seven cubits and a span', optionD: 'Nine cubits', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Matthew 14, how many loaves of bread did Jesus use to feed the 5,000?', optionA: 'Three', optionB: 'Five', optionC: 'Seven', optionD: 'Twelve', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'According to Matthew 15, how many baskets were left after Jesus fed the 4,000?', optionA: 'Five', optionB: 'Seven', optionC: 'Twelve', optionD: 'None', correctAnswer: 'optionB', timeLimit: 15 },
  { text: 'In Acts 1:15, about how many believers were gathered in the upper room?', optionA: 'About 50', optionB: 'About 120', optionC: 'About 200', optionD: 'About 500', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'According to Judges 16, how many locks of Samson\'s hair were cut when he lost his strength?', optionA: 'One', optionB: 'Three', optionC: 'Seven', optionD: 'All of them', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to 2 Samuel 5:4, how old was David when he became king over all Israel?', optionA: 'Twenty', optionB: 'Twenty-five', optionC: 'Thirty', optionD: 'Thirty-five', correctAnswer: 'optionC', timeLimit: 20 },
  { text: 'How many days was Jesus in the tomb before the resurrection, according to the Gospels?', optionA: 'One', optionB: 'Two', optionC: 'Three', optionD: 'Seven', correctAnswer: 'optionC', timeLimit: 10 },
  { text: 'According to Exodus 12:37, about how many Israelite men left Egypt (not counting women and children)?', optionA: 'About 100,000', optionB: 'About 300,000', optionC: 'About 600,000', optionD: 'About 1,000,000', correctAnswer: 'optionC', timeLimit: 20 },
  { text: 'In Joshua 6, how many times did the Israelites march around Jericho in total (all days combined)?', optionA: 'Seven', optionB: 'Ten', optionC: 'Thirteen', optionD: 'Fourteen', correctAnswer: 'optionC', timeLimit: 20 },
  { text: 'According to Genesis 5:5, how old was Adam when he died?', optionA: '777 years', optionB: '930 years', optionC: '969 years', optionD: '365 years', correctAnswer: 'optionB', timeLimit: 20 },
  { text: 'How many books of the Bible did Moses traditionally write?', optionA: 'Three', optionB: 'Four', optionC: 'Five', optionD: 'Seven', correctAnswer: 'optionC', timeLimit: 15 },
  { text: 'According to 2 Kings 19:35, how many Assyrian soldiers were struck down by the angel of the Lord in one night?', optionA: '10,000', optionB: '85,000', optionC: '100,000', optionD: '185,000', correctAnswer: 'optionD', timeLimit: 20 },
  { text: 'How many times did Peter deny Jesus, according to all four Gospels?', optionA: 'Once', optionB: 'Twice', optionC: 'Three times', optionD: 'Seven times', correctAnswer: 'optionC', timeLimit: 10 },
]

// Combine all sub-categories into the main export
export const bibleQuestions: BankQuestion[] = [
  ...oldTestamentStories,
  ...oldTestamentPeople,
  ...oldTestamentPlacesEvents,
  ...psalmsProverbs,
  ...prophetsProphecy,
  ...lifeOfJesus,
  ...parablesTeachings,
  ...apostlesEarlyChurch,
  ...epistlesRevelation,
  ...bibleBooksStructure,
  ...bibleNumbersFacts,
]
