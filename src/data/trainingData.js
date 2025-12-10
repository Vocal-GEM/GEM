
export const TRAINING_CATEGORIES = [
    {
        id: 'breathing',
        title: 'Breathing Gym',
        description: 'Diaphragm control, airflow management, and support.',
        color: 'teal',
        exercises: [
            {
                id: 'bug-blow',
                title: 'Bug Blow',
                content: "Blow as though there is a bug on the computer screen (5-10x)."
            },
            {
                id: 'diaphragm-pulse',
                title: 'Conversational Diaphragm Pulse',
                content: `
1. Create a "beat/pulse" with the diaphragm.
2. Continue that "beat/pulse" under speech.
**Note:** This is to normalize diaphragm use, while creating relaxation in the neck. If this is done incorrectly, you will hear a strained sound.
                `
            },
            {
                id: 'order-ops',
                title: 'Order of Operations',
                content: `
1. Create a "beat/pulse" with the diaphragm.
2. Continue the pulse by gently phonating "huh" on a comfortable pitch.
3. Notice the order: Inhalation -> Diaphragm Engagement -> Air Release -> Sound.
**Goal:** The movement of air should continue as the sound starts (Open Quotient).
                `
            },
            {
                id: 'paper-blow',
                title: 'Paper Blows',
                content: "Hold toilet paper against the wall by blowing on it (3-4 inches away). Record how many seconds it stays up."
            },
            {
                id: 'pursed-lip',
                title: 'Pursed Lip Breathing',
                content: 'Inhale through nose like "smelling a rose". Exhale through pursed lips like "blowing out a candle". (10x)'
            },
            {
                id: 'rainbow-breath',
                title: 'Rainbow Passage (Breath Focus)',
                content: `Breathe after every line (//):

When the sunlight strikes raindrops in the air, // 
they act as a prism and form a rainbow. // 
The rainbow is a division of // 
white light into many beautiful colors. // 
These take the shape of a long round arch, // 
with its path high above, // 
and its two ends apparently // 
beyond the horizon. // 
There is, according to legend, // 
a boiling pot of gold at one end. // 
People look, but no one ever finds it. // 
When a person looks for something beyond their reach, // 
their friends say they are looking // 
for the pot of gold at the end of the rainbow. //`
            }
        ]
    },
    {
        id: 'sovte',
        title: 'SOVTE Lab',
        description: 'Semi-Occluded Vocal Tract Exercises for efficiency.',
        color: 'indigo',
        exercises: [
            {
                id: 'straw-phonation',
                title: 'Straw Phonation',
                content: `
1. Use a standard straw. Voice pitch glides from low to high into the straw (1 min).
2. Perform accent glides (varying pitch/volume).
3. Sing a song through the straw.
**Note:** Not for students with jaw tension.
                `
            },
            {
                id: 'cup-bubbles',
                title: 'Cup Bubbles',
                content: `
1. Straw 1cm into water.
2. Blow steady bubbles without voice (5x).
3. Blow steady bubbles on "ooo" (Sustained pitch) (5x).
4. Pitch glides (Low -> High) (5x).
5. Sing "Happy Birthday" through the bubbles.
                `
            },
            {
                id: 'lip-trills',
                title: 'Lip Trills',
                content: `
1. Hold a comfortable lip trill (1 min).
2. Glide Low -> High.
3. Perform an easy song on a lip trill.
**Assist:** Gently touch cheeks to help the trill.
                `
            },
            {
                id: 'blowfish',
                title: 'Blowfish',
                content: "Puff out cheeks and hum without letting them deflate. Glide pitch while maintaining the puff."
            },
            {
                id: 'wall-e',
                title: 'Wall-E',
                content: "Begin whistling, then start to phonate while continuing the whistle. Try pitch slides."
            }
        ]
    },
    {
        id: 'relaxation',
        title: 'Relaxation Station',
        description: 'Releasing tension, massage, and reset.',
        color: 'pink',
        exercises: [
            {
                id: 'jettison',
                title: 'Jettison the Airlocks (False Fold Release)',
                content: `
1. Put fingers in ears and breathe through mouth.
2. Focus on the sound of the breath in the throat.
3. **Open** that place so much that the sound of the breath goes away (Silent Breathing).
                `
            },
            {
                id: 'massage-neck',
                title: 'Neck Massage',
                content: "Massage down the muscles on both sides of the neck until you feel a reduction in tension."
            },
            {
                id: 'massage-hyoid',
                title: 'Hyoid Release',
                content: "Gently massage the 'U' shaped bone under the chin. Move it side to side. There should be no clicking or resistance."
            },
            {
                id: 'massage-cheeks',
                title: 'Cheek/Jaw Massage',
                content: "Use knuckles to massage under cheekbones, starting near ears and moving down to mouth."
            }
        ]
    },
    {
        id: 'tonal',
        title: 'Tone Temple',
        description: 'Resonance, Forward Placement, and Tongue position.',
        color: 'amber',
        exercises: [
            {
                id: 'aye-aye',
                title: 'Aye-Aye & Yo-Yo',
                content: "Say 'Aye Aye Aye' and 'Yo Yo Yo' with jaw relaxed (no lip movement). Do with and without sound (30s each)."
            },
            {
                id: 'tongue-pull',
                title: 'Tongue Pulling',
                content: "Use a washcloth to hold the tip of tongue. Pull straight out (not down). Perform vowel glides. **Stretches the root.**"
            },
            {
                id: 'hyoglossus',
                title: 'Hyoglossus Release',
                content: "Place a pencil under the tongue. Perform vowel glides. Don't let the tongue pull back or down."
            },
            {
                id: 'pb-scrape',
                title: 'Peanut Butter Scrape',
                content: "Use tip of tongue to scrape 'peanut butter' off roof of mouth (Middle -> Front Teeth). 10x."
            },
            {
                id: 'big-dog',
                title: 'Big Dog / Little Dog',
                content: "Pant like a big dog (Low Larynx). Pant like a tiny chihuahua (High Larynx/Twang). **Stop if squeezing.**"
            },
            {
                id: 'nee-rainbow',
                title: 'Nasal Resonance: Rainbow Passage',
                content: `Use the "NEE" sound to find forward resonance before each phrase:

NEE - when the sunlight strikes
NEE - raindrops in the air
NEE - they act as a prism
NEE - and form a rainbow`
            },
            {
                id: 'tonal-matrix',
                title: 'Tonal Consistency Matrix',
                content: `Combine "NEE" with vowels to maintain forward placement.

**Group 1 (Front):**
E: NEE-AD | NEE-AY | NEE-EYE | NEE-YEE | NEE-YOO
A: NEE-AY-AD | NEE-AY | NEE-AY-EYE | NEE-AY-EE | NEE-AY-OO
I: NEE-EYE-AD | NEE-EYE-AY | NEE-EYE-EYE | NEE-EYE-EE | NEE-EYE-OO

**Group 2 (Back/Open):**
E: NEE-AH | NEE-OH | NEE-OW | NEE-AR | NEE-AW
A: NEE-AY-AH | NEE-AY-OH | NEE-AY-OW | NEE-AY-AR | NEE-AY-AW
O: NEE-OH-AH | NEE-OH | NEE-OH-OW | NEE-OH-AR | NEE-OH-AW
`
            }
        ]
    },
    {
        id: 'performance',
        title: 'Performance Plaza',
        description: 'Monologues for Bouncy Voice, Tempo, Elongation, and Diction.',
        color: 'purple',
        exercises: [
            // Bouncy Voice
            {
                id: 'admirable-crichton',
                title: 'Lady Mary (Bouncy Voice)',
                content: `**From "The Admirable Crichton"**
"I sighted a herd near Penguin’s Creek, but had to creep round Silver Lake to get to windward of them. However, they spotted me and then the fun began. There was nothing for it but to try and run them down, so I singled out a fat buck and away we went down the shore of the lake, up the valley of rolling stones; he doubled into Brawling River and took to the water, but I swam after him; the river is only half a mile broad there, but it runs strong. He went spinning down the rapids, down I went in pursuit; he clambered ashore, I clambered ashore; away we tore helter-skelter up the hill and down again. I lost him in the marshes, got on his track again near Bread Fruit Wood, and brought him down with an arrow in Firefly Grove."`
            },
            {
                id: 'lucy-queen',
                title: 'Lucy Van Pelt (Bouncy Voice)',
                content: `**From "You’re A Good Man, Charlie Brown"**
"Do you know what I intend? I intend to be a queen. When I grow up I’m going to be the biggest queen there ever was, and I’ll live in a big palace and when I go out in my coach, all the people will wave and I will shout at them, and…and…in the summertime I will go to my summer palace and I’ll wear my crown in swimming and everything, and all the people will cheer and I will shout at them… What do you mean I can’t be queen? Nobody should be kept from being a queen if she wants to be one. It’s usually just a matter of knowing the right people.. ..well…. if I can’t be a queen, then I’ll be very rich and I will buy myself a queendom. Yes, I will buy myself a queendom and then I’ll kick out the old queen and take over the whole operation myself. I will be head queen."`
            },
            // Tempo Variance
            {
                id: 'sally-coat-hanger',
                title: 'Sally Brown (Tempo Variance)',
                content: `**From "You’re A Good Man, Charlie Brown"**
"A ‘C’? A ‘C’? I got a ‘C’ on my coathanger sculpture? How could anyone get a ‘C’ in coathanger sculpture? May I ask a question? Was I judged on the piece of sculpture itself? If so, is it not true that time alone can judge a work of art? Or was I judged on my talent? If so, is it fair that I be judged on a part of my life over which I have no control? If I was judged on my effort, then I was judged unfairly, for I tried as hard as I could! Was I judged on what I had learned about this project? If so, then were not you, my teacher, also being judged on your ability to transmit your knowledge to me? Are you willing to share my ‘C’? Perhaps I was being judged on the quality of the coathanger itself out of which my creation was made…now is this not also unfair? Am I to be judged by the quality of coat hangers that are used by the drycleaning establishment that returns our garments? Is that not the responsibility of my parents? Should they not share my ‘C’?"`
            },
            {
                id: 'beatrix-prom',
                title: 'Beatrix (Tempo Variance)',
                content: `**From "Promedy"**
"Young women need the Prom. It’s a rite of passage as sacred as getting your driver’s license or buying your first bra. There are only a few things in life that are guaranteed to be glorious and memorable and sparkling with gowns and cumberbunds. Prom is the quintessential teenage experience. Think of the unlucky grown-ups and the elderly who lament the day they decided not to go to the Prom. It is a key ingredient to a happy and meaningful life. Prom is short for Promenade, a slow, gentle walk through a shady glen, and this beloved ceremony symbolizes our journey from the shadows of adolescence to the bright sunshine of the adult world with all its freedoms. And it may be the only chance I’ll ever have to dance with someone. Maybe I’ll never have someone get down on a knee and offer me a diamond ring. Maybe I’ll never walk down the aisle with a smug look of bridal triumph. But it is my right, and the right of every book-wormy, soon-to-be librarian to have one night of Cinderella magic. Even if we have to go with our cousin, or our gay best friend from tap class, we will have a Prom. And you will help me."`
            },
            // Vowel Elongation
            {
                id: 'sister-winnie',
                title: 'Sister Winnie (Vowel Elongation)',
                content: `**From "Folk"**
"Oh, it was fine. I mean: not fine, fine – everything’s… I’ve been at the hospital, Kayleigh. I don’t know if Stephen said. Getting some tests done. I’ve got angina. Which for some reason I keep calling: vagina. It doesn’t help. It means, Kayleigh, no more fun. No more drinking, no more getting worked up, no more smoking, apparently – I’m ignoring that, obviously but. I’m getting pills, blood-thinners. They’ve showered me with leaflets. The consultant basically said I could pop my clogs at any moment. Added to which: he was a very pale man, heavy-breather – I did wonder briefly if he might actually be Death, come to get me. But then one of the other doctors popped in, called him Nigel, mentioned something about badminton so I thought: probably not. It’s hard to imagine the Grim Reaper with a shuttlecock. But that’s not the worst bit, Stephen... (See full text in script)"`
            },
            {
                id: 'sophia-girlboss',
                title: 'Sophia (Vowel Elongation)',
                content: `**From "Girlboss"**
"Adulthood is where dreams go to die. Grow up, get a job, become a drone, that’s it. Then it’s over. Society just wants to put everyone in a box. Well guess what society? There is no box. Cos I mean, if I thought the rest of my life would be spent as a mindless cog in a machine, I swear I’d just get a tattoo across my face that says: “Really man?” Just need to figure out a way of growing up without becoming a boring adult. You probably think I’m some spoiled brat who’s never had it hard cause I didn’t have to walk a mile to school. But here’s the thing, I tried college for a year. Total bust. Everything you wanna learn, you could just look up online. I know how to open champagne with a sword."`
            },
            // Diction & Articulation
            {
                id: 'elaine-graduate',
                title: 'Elaine (Diction & Articulation)',
                content: `**From "The Graduate"**
"Well nothing’s perfect Benjamin. I wish my mother didn’t drink so much. I wish I’d never fallen out of that tree and broken my thumb because it so affects my fingering I’ll probably never play the violin as well as I’d love to but that’s about it for the bullshit, Benjamin. It’s only bullshit if you let it pile up. Heaven’s in the details. Someone said that. I think Robert Frost said that. I was in this diner with my roommate Diane? And this guy came along with a goat on a rope and it turns out the reason he’s got a little goat on a rope is that he was thrown out the day before for bringing in his dog? But the point is that Diane had stood up to leave when she saw the man walk in and she sat straight down again and said, well if there’s a goat I think I’ll have dessert. And that’s why I love Diane, because if you think like that you not only notice more little goats, you get more dessert."`
            },
            {
                id: 'gwendolen-earnest',
                title: 'Gwendolen Fairfax (Diction & Articulation)',
                content: `**From "The Importance of Being Earnest"**
"Oh! It is strange he never mentioned to me that he had a ward. How secretive of him! He grows more interesting hourly. I am not sure, however, that the news inspires me with feelings of unmixed delight. I am very fond of you, Cecily; I have liked you ever since I met you! But I am bound to state that now that I know that you are Mr. Worthing’s ward, I cannot help expressing a wish you were—well, just a little older than you seem to be—and not quite so very alluring in appearance. In fact, if I may speak candidly— […] Well, to speak with perfect candour, Cecily, I wish that you were fully forty-two, and more than usually plain for your age. Ernest has a strong upright nature. He is the very soul of truth and honour. Disloyalty would be as impossible to him as deception. But even men of the noblest possible moral character are extremely susceptible to the influence of the physical charms of others. Modern, no less than Ancient History, supplies us with many most painful examples of what I refer to. If it were not so, indeed, History would be quite unreadable."`
            },
            // Syllable Separation
            {
                id: 'dont-look-at-me',
                title: 'Joseph Arnone (Syllable Separation)',
                content: `**From "Don't Look At Me"**
"Don’t look at me. You. Eh, eh, eh…when I address you, do not look at me. No eye contact. Is that understood? Look away. (beat) Okay, look at me now. (snaps her fingers) I told you not to look at me. Even if I tell you to look at me, do not look at me. Understood? Good, good darling. Oh! I have something in my eye, can you help me? (pointing) Looking, looking, looking! NO looking under all circumstances. You must raise up that attention span of yours. A fish could retain more darling. That is true. I have read it. Less attention span than a fish. Do not let that be you darling."`
            },
            {
                id: 'eliza-doolittle',
                title: 'Eliza Doolittle (Syllable Separation)',
                content: `**From "My Fair Lady"**
"My aunt died of influenza, so they said. But it’s my belief they done the old woman in. Yes Lord love you! Why should she die of influenza when she come through diphtheria right enough the year before? Fairly blue with it she was. They all thought she was dead. But my father, he kept ladling gin down her throat. Then she come to so sudden that she bit the bowl off the spoon. Now, what would you call a woman with that strength in her have to die of influenza, and what become of her new straw hat that should have come to me? Somebody pinched it, and what I say is, them that pinched it, done her in. Them she lived with would have killed her for a hatpin, let alone a hat. And as for father ladling the gin down her throat, it wouldn’t have killed her. Not her. Gin was as mother’s milk to her. Besides, he’s poured so much down his own throat that he knew the good of it."`
            },
            // Articulation Drills
            {
                id: 'consonant-buddies',
                title: 'Consonant Buddies (Unvoiced vs Voiced)',
                content: `**The Passage:**
"The stupid zebra and dumb tiger are brought before Judge Cherry, the Kangaroo. The good judge is busy, eating his favorite peanut butter sandwich. He really loves his sandwiches. He also really loves his favorite zealously zhuzhed shirt sleeves and funky vest. The stupid zebra and dumb tiger pause when they see the shirt sleeves, and cry aloud, 'That's thin'! Judge Cherry tells them to 'shush' and take themselves back outside!"

**The Pairs:**
| Sound | Unvoiced | Sound | Voiced |
| :--- | :--- | :--- | :--- |
| /p/ vs /b/ | peanut | butter |
| /t/ vs /d/ | tiger | dumb |
| /s/ vs /z/ | stupid | zebra |
| /sh/ vs /zh/ | shirt | zhuzhed |
| /ch/ vs /j/ | cherry | judge |
| /k/ vs /g/ | kangaroo | good |
| /f/ vs /v/ | funky | vest |
| /th/ vs /th/ | thin | that |
`
            }
        ]
    },
    {
        id: 'balanced-voice',
        title: 'Balanced Voice Studio',
        description: 'Integrating Open Quotient with Resonance for a sustainable voice.',
        color: 'cyan',
        exercises: [
            {
                id: 'nee-he-he-reset',
                title: 'Nee-He-He Reset',
                content: `**The Reset Technique**

Use "Nee-he-he" at the start of each phrase to find your balanced voice.

**Why it works:**
- The larynx naturally lowers when breathing between phrases
- "Nee" finds forward resonance (brightness)
- "He-he" adds airflow (open quotient)
- Combined = balanced, sustainable voice

**Practice with Rainbow Passage:**
Nee-he-he - When the sunlight strikes raindrops in the air,
Nee-he-he - they act as a prism and form a rainbow.
Nee-he-he - The rainbow is a division of
Nee-he-he - white light into many beautiful colors.

**Tip:** Use this reset anytime you feel strain or lose your placement.`
            },
            {
                id: 'balanced-voice-concept',
                title: 'What is Balanced Voice?',
                content: `**Balanced Voice = Resonance + Open Quotient**

The "sweet spot" combines:
- **Forward Resonance** (brightness, nasality)
- **Open Quotient** (airflow, softness)

Too much resonance without airflow = pressed, whiny, fatiguing
Too much airflow without resonance = breathy, weak, unsustainable

**The He-He Secret:**
Increasing the airflow on the "he-he" of the setup will:
- Increase the open quotient
- Soften any harsh nasality
- Create a warm, sustainable sound`
            },
            {
                id: 'airflow-integration',
                title: 'Airflow Integration Drill',
                content: `**Combine Breath with Resonance**

1. Start with a gentle "he" sound (pure airflow)
2. Add a "nee" before it: "Nee-he"
3. Extend to "Nee-he-he-he-he..."
4. Now speak a phrase starting with this sound

**Calibration:**
- If it sounds too pressed: add more "he" (airflow)
- If it sounds too breathy: add more "nee" (resonance)
- Find YOUR balance point

**The Mix:** Aim for roughly 60% resonance, 40% airflow to start.`
            },
            {
                id: 'real-world-practice',
                title: 'Real-World Practice Scenarios',
                content: `**Low-Stress Practice Environments**

Practicing with strangers in low-stress situations is often easier than with friends/family.

**Suggested Scenarios:**
- Drive-through ordering
- Coffee shop orders ("Can I get a large latte?")
- Store checkout conversations
- Picking up spam calls (free practice!)
- Asking for directions

**Why these work:**
- Brief interactions
- No ongoing relationship
- Low stakes if voice wavers
- Builds confidence gradually

**Challenge:** Complete 3 "stranger interactions" today using your balanced voice.`
            },
            {
                id: 'strain-reset-protocol',
                title: 'Strain Reset Protocol',
                content: `**When You Feel Strain:**

1. **Stop speaking immediately**
2. **SOVT Reset:** Do 30 seconds of straw phonation or lip trills
3. **Nee-he-he Reset:** Find your balanced placement
4. **Resume at 70%:** Speak at lower volume/effort
5. **Hydrate:** Drink water

**Prevention:**
- Take voice breaks every 20 minutes
- Use the Nee-he-he reset between paragraphs
- Never push through pain
- Monitor your Open Quotient meter in the app`
            }
        ]
    }
];

export const GAB_LIBS_STORIES = [
    {
        id: 'haunted-house',
        title: "The Haunted House",
        text: "It was a dark and stormy night. The wind was *howling* (pause), and a black cat sat on a fence outside a haunted house. A *siren* (pause) wailed in the distance. The cat *meowed* (pause) in alarm as she heard the sound of footsteps. The footsteps were getting closer, but slowing down as they plodded through the deep *mud* (pause) created by the storm. The cat bounded into the haunted house to seek shelter. The door was ajar, and it *creaked* (pause) as she nudged it farther open and stepped inside. Inside the house, she could hear the drip, drip, drip of a leaky *faucet* (pause). The footsteps from outside suddenly stopped - the shoes were stuck in the mud. The cat froze and listened to the shoes' owner rip open their *velcro* (pause) and walk up the *creaky steps* (pause) into the house.",
        keywords: ["howling", "siren", "meowed", "mud", "creaked", "faucet", "velcro", "creaky steps"]
    },
    {
        id: 'farm-day',
        title: "A Day on the Farm",
        text: "It was a beautiful sunny day! Birds were *chirping* (pause) and the leaves on the trees *rustled* (pause) in the breeze. The farmer *yawned* (pause) as she got out of bed. She pried open the *creaky farmhouse door* (pause) and started to feed the animals. First were the goats! They *bleated* (pause) while they eagerly awaited their breakfast. The sheep *baaed* (pause) nearby, enviously watching the goats. The farmer went to the barn to check on the horses, who *whinnied* (pause) with pleasure when they saw her. Throughout the farmer's busy day, she also milked the *mooing cows* (pause), collected eggs from the *clucking chickens* (pause), and drove her *tractor* (pause) to check on the crops. By the time she crawled into bed at night, it was dark out. She fell asleep to the sounds of *crickets* (pause) and *hooting owls* (pause).",
        keywords: ["chirping", "rustled", "yawned", "creaky farmhouse door", "bleated", "baaed", "whinnied", "mooing cows", "clucking chickens", "tractor", "crickets", "hooting owls"]
    },
    {
        id: 'magic-schoolbus',
        title: "Magic Schoolbus Phone",
        text: "Ms. Frizzle set her phone on her desk, and ushered her class into the magic schoolbus. The class watched in amazement as the bus shrank, started *whirring like a helicopter* (pause), and flew into Ms. Frizzle's phone, just as it started to *vibrate* (pause) with an incoming call. The class was learning about apps, so they explored some of Ms. Frizzle's. Ralphie took a *photo* (pause), while Molly decided to listen to some music. She found some smooth jazz with an *upright bass solo* (pause), and then a gorgeous *soprano opera aria* (pause). Dorothy couldn't believe how dusty it was, and she *sneezed* (pause)! A second *sneeze* (pause) caused Dorothy to jump and set off an *alarm* (pause). The kids *shrieked* (pause) in surprise and hurried back onto the bus. The magic school bus left the phone and dropped the class back in the classroom. Ms. Frizzle and the kids breathed a *sigh* (pause) of relief to be back safely.",
        keywords: ["whirring like a helicopter", "vibrate", "photo", "upright bass solo", "soprano opera aria", "sneezed", "sneeze", "alarm", "shrieked", "sigh"]
    },
    {
        id: 'witches-brew',
        title: "Double, Double, Toil & Trouble",
        text: "A coven of witches gathered near a pond. They could hear frogs *croaking* (pause), and they *cackled* (pause) as they thought about how well the frogs' toes would work in their potion. The witches collected their ingredients. They set a fire, waiting until it was blazing and *crackling* (pause) to start their concoction. One witch grabbed a *hissing snake* (pause) to add to the cauldron. Another managed to catch a bat, and it *flapped its wings* (pause) furiously trying to escape her clutches. It started to rain. There was a *clap of thunder* (pause), but the witches set a spell to keep their fire burning. A nearby puppy *whimpered* (pause) and ran to seek shelter. The witches kept adding to their cauldron until they were satisfied with the *boiling potion* (pause). They said, 'Double, double toil and trouble, fire burn and cauldron bubble' and *cackled* (pause) again with glee.",
        keywords: ["croaking", "cackled", "crackling", "hissing snake", "flapped its wings", "clap of thunder", "whimpered", "boiling potion"]
    }
];
