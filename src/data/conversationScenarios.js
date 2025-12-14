/**
 * Conversation Practice Scenarios
 * 
 * Dialogue trees for interactive AI conversation practice.
 * Each scenario includes a character, opening line, and branching dialogue.
 */

// Voice settings for different character types
const VOICE_PRESETS = {
    friendly: { rate: 1.0, pitch: 1.1, volume: 1.0 },
    professional: { rate: 0.95, pitch: 1.0, volume: 1.0 },
    casual: { rate: 1.05, pitch: 1.05, volume: 0.95 },
    energetic: { rate: 1.1, pitch: 1.15, volume: 1.0 }
};

/**
 * Conversation Scenarios
 * 
 * Each scenario has:
 * - id: unique identifier
 * - title: display name
 * - description: brief description
 * - difficulty: 'beginner' | 'intermediate' | 'advanced'
 * - estimatedMinutes: rough time estimate
 * - character: the AI conversation partner
 * - openingLine: what the AI says first
 * - branches: dialogue tree with keyword matching
 * - practiceGoals: voice/speaking goals for this scenario
 */
export const CONVERSATION_SCENARIOS = [
    {
        id: 'coffee-shop',
        title: 'Coffee Shop Order',
        description: 'Practice ordering your favorite drink at a cozy cafe',
        difficulty: 'beginner',
        estimatedMinutes: 2,
        category: 'daily-life',
        character: {
            name: 'Jamie',
            role: 'Barista',
            avatar: '☕',
            voiceSettings: VOICE_PRESETS.friendly
        },
        openingLine: "Hi there! Welcome to Sunrise Cafe. What can I get started for you today?",
        branches: {
            start: {
                responses: [
                    {
                        keywords: ['coffee', 'latte', 'cappuccino', 'espresso', 'mocha'],
                        reply: "Great choice! What size would you like - small, medium, or large?",
                        next: 'size'
                    },
                    {
                        keywords: ['tea', 'chai', 'matcha', 'green tea'],
                        reply: "Lovely! We have some wonderful teas. Hot or iced?",
                        next: 'temperature'
                    },
                    {
                        keywords: ['menu', 'recommend', 'suggestion', 'popular', 'what do you have'],
                        reply: "Our most popular drink is the caramel latte! We also have great seasonal specials. Would you like to try one?",
                        next: 'recommendation'
                    },
                    {
                        keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon'],
                        reply: "Hey! Great to see you. Looking for your usual, or trying something new today?",
                        next: 'greeting_response'
                    }
                ],
                fallback: {
                    reply: "Sure thing! We have coffees, teas, and specialty drinks. What sounds good?",
                    next: 'start'
                }
            },
            size: {
                responses: [
                    {
                        keywords: ['small', 'little', 'tiny', 'short'],
                        reply: "A small it is! Would you like any flavor shots or extra espresso?",
                        next: 'customization'
                    },
                    {
                        keywords: ['medium', 'regular', 'normal'],
                        reply: "Medium, perfect! Any add-ons like vanilla or caramel?",
                        next: 'customization'
                    },
                    {
                        keywords: ['large', 'big', 'grande', 'venti'],
                        reply: "Large size coming up! Want any special flavors added?",
                        next: 'customization'
                    }
                ],
                fallback: {
                    reply: "We have small, medium, and large. Which works for you?",
                    next: 'size'
                }
            },
            temperature: {
                responses: [
                    {
                        keywords: ['hot', 'warm', 'heated'],
                        reply: "Hot tea, lovely! Would you like honey or lemon with that?",
                        next: 'tea_extras'
                    },
                    {
                        keywords: ['iced', 'cold', 'chilled'],
                        reply: "Iced tea, refreshing choice! That'll be so good. What size?",
                        next: 'size'
                    }
                ],
                fallback: {
                    reply: "I can make it hot or iced - what's your preference?",
                    next: 'temperature'
                }
            },
            recommendation: {
                responses: [
                    {
                        keywords: ['yes', 'sure', 'okay', 'sounds good', 'try', 'that', 'please'],
                        reply: "Awesome! One caramel latte coming up. What size would you like?",
                        next: 'size'
                    },
                    {
                        keywords: ['no', 'nah', 'different', 'something else'],
                        reply: "No problem! What are you in the mood for?",
                        next: 'start'
                    }
                ],
                fallback: {
                    reply: "The caramel latte is really delicious! Would you like to try it?",
                    next: 'recommendation'
                }
            },
            greeting_response: {
                responses: [
                    {
                        keywords: ['usual', 'same', 'regular'],
                        reply: "Coming right up! Your usual order. Anything else today?",
                        next: 'extras'
                    },
                    {
                        keywords: ['new', 'different', 'something else', 'try'],
                        reply: "Feeling adventurous! How about our seasonal pumpkin spice or a refreshing cold brew?",
                        next: 'recommendation'
                    }
                ],
                fallback: {
                    reply: "What can I get for you today?",
                    next: 'start'
                }
            },
            customization: {
                responses: [
                    {
                        keywords: ['vanilla', 'caramel', 'hazelnut', 'mocha', 'yes', 'sure'],
                        reply: "Perfect! I'll add that for you. Will this be for here or to go?",
                        next: 'location'
                    },
                    {
                        keywords: ['no', 'plain', 'nothing', 'just', 'regular', 'that\'s it'],
                        reply: "Keeping it classic, I like it! For here or to go?",
                        next: 'location'
                    },
                    {
                        keywords: ['oat', 'almond', 'soy', 'oat milk', 'almond milk', 'non-dairy'],
                        reply: "We have oat, almond, and soy milk. Which would you prefer?",
                        next: 'milk_choice'
                    }
                ],
                fallback: {
                    reply: "Would you like any extra flavors or keep it as is?",
                    next: 'customization'
                }
            },
            milk_choice: {
                responses: [
                    {
                        keywords: ['oat', 'oat milk'],
                        reply: "Oat milk is my favorite too! For here or to go?",
                        next: 'location'
                    },
                    {
                        keywords: ['almond', 'almond milk'],
                        reply: "Almond milk, great choice! For here or to go?",
                        next: 'location'
                    },
                    {
                        keywords: ['soy', 'soy milk'],
                        reply: "Soy milk it is! For here or to go?",
                        next: 'location'
                    }
                ],
                fallback: {
                    reply: "We have oat, almond, and soy. Which one?",
                    next: 'milk_choice'
                }
            },
            tea_extras: {
                responses: [
                    {
                        keywords: ['honey', 'yes', 'please', 'both'],
                        reply: "I'll add some honey for you! What size would you like?",
                        next: 'size'
                    },
                    {
                        keywords: ['lemon'],
                        reply: "A squeeze of lemon, perfect! What size?",
                        next: 'size'
                    },
                    {
                        keywords: ['no', 'plain', 'nothing', 'just tea'],
                        reply: "Just the tea, got it! What size?",
                        next: 'size'
                    }
                ],
                fallback: {
                    reply: "Honey, lemon, or just plain?",
                    next: 'tea_extras'
                }
            },
            location: {
                responses: [
                    {
                        keywords: ['here', 'stay', 'dine in', 'sit'],
                        reply: "For here, perfect! That'll be $4.75. I'll have it ready for you in just a moment!",
                        next: 'end'
                    },
                    {
                        keywords: ['go', 'take out', 'takeout', 'to-go', 'leave'],
                        reply: "To go, you got it! That's $4.75. I'll call your name when it's ready!",
                        next: 'end'
                    }
                ],
                fallback: {
                    reply: "Will you be enjoying this here or taking it to go?",
                    next: 'location'
                }
            },
            extras: {
                responses: [
                    {
                        keywords: ['no', 'that\'s all', 'that\'s it', 'just that', 'nothing', 'nope'],
                        reply: "Perfect! That'll be $4.75. Coming right up!",
                        next: 'end'
                    },
                    {
                        keywords: ['yes', 'pastry', 'muffin', 'croissant', 'food', 'eat'],
                        reply: "Great! Our blueberry muffins are fresh this morning. Want one?",
                        next: 'food_confirm'
                    }
                ],
                fallback: {
                    reply: "Anything else I can get for you?",
                    next: 'extras'
                }
            },
            food_confirm: {
                responses: [
                    {
                        keywords: ['yes', 'sure', 'please', 'sounds good'],
                        reply: "Yum! One muffin added. Your total is $7.50. I'll have everything ready shortly!",
                        next: 'end'
                    },
                    {
                        keywords: ['no', 'just', 'drink', 'that\'s all'],
                        reply: "No problem! Just the drink then. That's $4.75!",
                        next: 'end'
                    }
                ],
                fallback: {
                    reply: "Would you like to add a muffin?",
                    next: 'food_confirm'
                }
            },
            end: {
                isEnd: true,
                closingLine: "Thank you so much! Have a wonderful day! ☕"
            }
        },
        practiceGoals: ['ordering', 'politeness', 'small-talk']
    },

    {
        id: 'making-plans',
        title: 'Making Weekend Plans',
        description: 'Chat with a friend about what to do this weekend',
        difficulty: 'beginner',
        estimatedMinutes: 3,
        category: 'social',
        character: {
            name: 'Alex',
            role: 'Friend',
            avatar: '🎉',
            voiceSettings: VOICE_PRESETS.casual
        },
        openingLine: "Hey! So what are you thinking for this weekend? I'm totally free!",
        branches: {
            start: {
                responses: [
                    {
                        keywords: ['movie', 'film', 'cinema', 'watch', 'theater'],
                        reply: "Ooh a movie sounds fun! There's that new thriller everyone's talking about. Or we could do something lighter?",
                        next: 'movie_choice'
                    },
                    {
                        keywords: ['eat', 'food', 'dinner', 'lunch', 'restaurant', 'brunch'],
                        reply: "I'm always down to eat! There's this new place downtown I've been wanting to try. You into Italian or Asian food?",
                        next: 'food_type'
                    },
                    {
                        keywords: ['hike', 'walk', 'nature', 'park', 'outside', 'outdoor'],
                        reply: "Nature vibes, I love it! There's a really pretty trail about 20 minutes away. Not too hard but gorgeous views!",
                        next: 'hike_confirm'
                    },
                    {
                        keywords: ['nothing', 'chill', 'relax', 'lazy', 'home', 'hang'],
                        reply: "Honestly, a chill hangout sounds perfect. We could do a game night or just hang and watch stuff?",
                        next: 'chill_options'
                    },
                    {
                        keywords: ['don\'t know', 'not sure', 'ideas', 'suggest', 'what do you want'],
                        reply: "Hmm, let's see... we could do a movie, grab food somewhere, or there's that art festival downtown. What sounds most fun?",
                        next: 'suggestions'
                    }
                ],
                fallback: {
                    reply: "That could be fun! Tell me more - what did you have in mind?",
                    next: 'start'
                }
            },
            movie_choice: {
                responses: [
                    {
                        keywords: ['thriller', 'scary', 'horror', 'suspense', 'action'],
                        reply: "Yes! I love a good thriller. Saturday evening showing? We could grab dinner after!",
                        next: 'confirm_time'
                    },
                    {
                        keywords: ['comedy', 'funny', 'light', 'laugh', 'rom-com', 'romantic'],
                        reply: "A good comedy is exactly what I need right now! Saturday afternoon?",
                        next: 'confirm_time'
                    }
                ],
                fallback: {
                    reply: "What kind of movie are you in the mood for?",
                    next: 'movie_choice'
                }
            },
            food_type: {
                responses: [
                    {
                        keywords: ['italian', 'pasta', 'pizza', 'mediterranean'],
                        reply: "Italian it is! There's this cozy place with amazing pasta. Saturday night work for you?",
                        next: 'confirm_time'
                    },
                    {
                        keywords: ['asian', 'chinese', 'japanese', 'thai', 'sushi', 'ramen', 'korean'],
                        reply: "Oh nice! There's great ramen place OR an amazing sushi spot. What are you feeling?",
                        next: 'asian_specific'
                    },
                    {
                        keywords: ['mexican', 'tacos', 'burrito'],
                        reply: "Tacos are always a yes! I know the perfect spot. When should we go?",
                        next: 'confirm_time'
                    }
                ],
                fallback: {
                    reply: "What kind of food are you craving?",
                    next: 'food_type'
                }
            },
            asian_specific: {
                responses: [
                    {
                        keywords: ['ramen', 'noodles', 'soup'],
                        reply: "Ramen is so good when it's cold out! Saturday lunch? It gets super busy at dinner.",
                        next: 'confirm_time'
                    },
                    {
                        keywords: ['sushi', 'japanese', 'fish'],
                        reply: "The sushi place has this amazing omakase deal on weekends! Saturday dinner?",
                        next: 'confirm_time'
                    }
                ],
                fallback: {
                    reply: "Ramen or sushi - both are amazing honestly!",
                    next: 'asian_specific'
                }
            },
            hike_confirm: {
                responses: [
                    {
                        keywords: ['yes', 'sure', 'sounds good', 'let\'s do it', 'perfect', 'love it'],
                        reply: "Awesome! Let's do Sunday morning before it gets too hot. I'll bring snacks!",
                        next: 'confirm_plan'
                    },
                    {
                        keywords: ['no', 'too far', 'tired', 'maybe something else'],
                        reply: "No worries! We could just walk around the park downtown instead? Much more chill.",
                        next: 'park_option'
                    }
                ],
                fallback: {
                    reply: "What do you think? Up for a little adventure?",
                    next: 'hike_confirm'
                }
            },
            park_option: {
                responses: [
                    {
                        keywords: ['yes', 'sure', 'okay', 'that works'],
                        reply: "Perfect! We can grab coffee and just stroll. Sunday afternoon?",
                        next: 'confirm_time'
                    },
                    {
                        keywords: ['no', 'different', 'inside'],
                        reply: "Fair enough! What about something indoors then?",
                        next: 'start'
                    }
                ],
                fallback: {
                    reply: "A casual park walk - yay or nay?",
                    next: 'park_option'
                }
            },
            chill_options: {
                responses: [
                    {
                        keywords: ['game', 'games', 'board game', 'video game', 'play'],
                        reply: "Game night! I'll bring snacks, you pick the games? Saturday night?",
                        next: 'confirm_time'
                    },
                    {
                        keywords: ['watch', 'show', 'movie', 'netflix', 'tv', 'binge'],
                        reply: "Yes! We can finally start that show everyone's been talking about. Your place or mine?",
                        next: 'location_choice'
                    }
                ],
                fallback: {
                    reply: "Games or a show marathon - what's your vibe?",
                    next: 'chill_options'
                }
            },
            suggestions: {
                responses: [
                    {
                        keywords: ['movie', 'film'],
                        reply: "Movie it is! There's a few good ones out right now. Action or comedy?",
                        next: 'movie_choice'
                    },
                    {
                        keywords: ['food', 'eat', 'restaurant', 'dinner'],
                        reply: "Food adventure! Any cuisine you've been craving?",
                        next: 'food_type'
                    },
                    {
                        keywords: ['art', 'festival', 'event'],
                        reply: "The art festival is Saturday! We could walk around, grab some street food. Sound fun?",
                        next: 'festival_confirm'
                    }
                ],
                fallback: {
                    reply: "Movie, food, or the festival - all good options! Which one?",
                    next: 'suggestions'
                }
            },
            festival_confirm: {
                responses: [
                    {
                        keywords: ['yes', 'sure', 'fun', 'sounds good', 'let\'s go'],
                        reply: "Yay! Let's meet around noon? We can spend a few hours there!",
                        next: 'confirm_plan'
                    },
                    {
                        keywords: ['no', 'crowds', 'busy', 'rather not'],
                        reply: "Yeah, it might be crowded. What about something more low-key?",
                        next: 'start'
                    }
                ],
                fallback: {
                    reply: "The art festival - you down?",
                    next: 'festival_confirm'
                }
            },
            location_choice: {
                responses: [
                    {
                        keywords: ['my', 'mine', 'my place', 'come over', 'here'],
                        reply: "Perfect! I'll bring the snacks. Saturday evening around 7?",
                        next: 'confirm_time'
                    },
                    {
                        keywords: ['your', 'yours', 'your place'],
                        reply: "Come on over! I'll set up the cozy vibes. Saturday at 7?",
                        next: 'confirm_time'
                    }
                ],
                fallback: {
                    reply: "Your place or mine?",
                    next: 'location_choice'
                }
            },
            confirm_time: {
                responses: [
                    {
                        keywords: ['yes', 'sure', 'perfect', 'works', 'good', 'great', 'sounds good', 'okay'],
                        reply: "It's a plan! I'm so excited. I'll text you Saturday morning to confirm!",
                        next: 'end'
                    },
                    {
                        keywords: ['no', 'can\'t', 'busy', 'different time', 'sunday'],
                        reply: "No worries, we can adjust! What time works better for you?",
                        next: 'reschedule'
                    }
                ],
                fallback: {
                    reply: "Does that time work for you?",
                    next: 'confirm_time'
                }
            },
            confirm_plan: {
                responses: [
                    {
                        keywords: ['yes', 'sure', 'perfect', 'great', 'awesome', 'excited', 'can\'t wait'],
                        reply: "This is gonna be so fun! I'll text you the details. See you soon!",
                        next: 'end'
                    }
                ],
                fallback: {
                    reply: "So we're all set then?",
                    next: 'confirm_plan'
                }
            },
            reschedule: {
                responses: [
                    {
                        keywords: ['sunday', 'afternoon', 'morning', 'evening', 'later', 'earlier'],
                        reply: "That works! I'm flexible. Let's lock it in!",
                        next: 'end'
                    }
                ],
                fallback: {
                    reply: "Just let me know what works and we'll make it happen!",
                    next: 'reschedule'
                }
            },
            end: {
                isEnd: true,
                closingLine: "Perfect! Can't wait - this is gonna be awesome! Talk soon! 🎉"
            }
        },
        practiceGoals: ['casual-conversation', 'expressing-preferences', 'making-plans']
    },

    {
        id: 'job-interview',
        title: 'Job Interview Practice',
        description: 'Practice common interview questions and professional responses',
        difficulty: 'intermediate',
        estimatedMinutes: 5,
        category: 'professional',
        character: {
            name: 'Morgan',
            role: 'Hiring Manager',
            avatar: '💼',
            voiceSettings: VOICE_PRESETS.professional
        },
        openingLine: "Hello! Thanks so much for coming in today. Please, have a seat. So, tell me a little about yourself.",
        branches: {
            start: {
                responses: [
                    {
                        // Accept any reasonable introduction
                        keywords: ['i', 'my', 'background', 'experience', 'work', 'year', 'graduate', 'degree', 'passionate', 'love'],
                        reply: "That's a great background! What specifically drew you to apply for this position?",
                        next: 'why_position'
                    },
                    {
                        keywords: ['nervous', 'sorry', 'um', 'well'],
                        reply: "Take your time, no pressure! Just tell me a bit about your background and what brings you here.",
                        next: 'start'
                    }
                ],
                fallback: {
                    reply: "I'd love to hear more about your background - professional or educational, wherever you'd like to start!",
                    next: 'start'
                }
            },
            why_position: {
                responses: [
                    {
                        keywords: ['company', 'team', 'culture', 'values', 'mission', 'opportunity', 'grow', 'learn', 'challenge', 'interested', 'excited', 'passionate'],
                        reply: "I appreciate that thoughtful answer. Now, can you tell me about a challenge you've faced at work and how you handled it?",
                        next: 'challenge'
                    }
                ],
                fallback: {
                    reply: "What is it about this role that excites you?",
                    next: 'why_position'
                }
            },
            challenge: {
                responses: [
                    {
                        keywords: ['problem', 'solution', 'team', 'deadline', 'difficult', 'learned', 'resolved', 'outcome', 'result', 'worked', 'managed', 'handled'],
                        reply: "Great example! It sounds like you handle pressure well. Where do you see yourself in five years?",
                        next: 'future'
                    }
                ],
                fallback: {
                    reply: "Can you think of a specific situation where you had to overcome an obstacle?",
                    next: 'challenge'
                }
            },
            future: {
                responses: [
                    {
                        keywords: ['grow', 'learn', 'leadership', 'contribute', 'develop', 'skills', 'advance', 'goals', 'team', 'company', 'hope', 'plan'],
                        reply: "I love hearing that ambition! Now, what would you say is your greatest strength?",
                        next: 'strength'
                    }
                ],
                fallback: {
                    reply: "Where do you hope your career takes you?",
                    next: 'future'
                }
            },
            strength: {
                responses: [
                    {
                        keywords: ['communication', 'team', 'organized', 'detail', 'creative', 'problem', 'adapt', 'learn', 'reliable', 'dedicated', 'patient', 'leadership'],
                        reply: "That's definitely valuable! And what about an area you're working to improve?",
                        next: 'weakness'
                    }
                ],
                fallback: {
                    reply: "What do you consider your strongest professional quality?",
                    next: 'strength'
                }
            },
            weakness: {
                responses: [
                    {
                        keywords: ['working', 'improve', 'better', 'learn', 'sometimes', 'tend', 'trying', 'aware', 'development', 'feedback'],
                        reply: "Self-awareness is so important. Last question - do you have any questions for me about the role or the team?",
                        next: 'questions'
                    }
                ],
                fallback: {
                    reply: "Is there something you're actively trying to get better at?",
                    next: 'weakness'
                }
            },
            questions: {
                responses: [
                    {
                        keywords: ['team', 'culture', 'day', 'typical', 'projects', 'growth', 'success', 'expectations', 'next steps', 'when', 'hear'],
                        reply: "Great question! We're a collaborative team that values... you know what, I think you'd fit right in. We'll be in touch soon!",
                        next: 'end'
                    },
                    {
                        keywords: ['no', 'think', 'covered', 'all', 'good'],
                        reply: "Alright! Well, it was wonderful meeting you. We'll be making our decision soon and will be in touch. Thank you!",
                        next: 'end'
                    }
                ],
                fallback: {
                    reply: "Anything you'd like to know about working here?",
                    next: 'questions'
                }
            },
            end: {
                isEnd: true,
                closingLine: "It was a pleasure meeting you today. We'll be in touch! 💼"
            }
        },
        practiceGoals: ['professional-tone', 'confidence', 'articulation']
    },

    {
        id: 'doctor-appointment',
        title: 'Doctor\'s Office Call',
        description: 'Practice scheduling an appointment over the phone',
        difficulty: 'beginner',
        estimatedMinutes: 2,
        category: 'phone-call',
        character: {
            name: 'Taylor',
            role: 'Receptionist',
            avatar: '📞',
            voiceSettings: VOICE_PRESETS.friendly
        },
        openingLine: "Good morning, Dr. Chen's office. How may I help you?",
        branches: {
            start: {
                responses: [
                    {
                        keywords: ['appointment', 'schedule', 'book', 'see', 'doctor', 'visit', 'checkup', 'come in'],
                        reply: "Of course! Are you a new patient or returning?",
                        next: 'patient_type'
                    },
                    {
                        keywords: ['cancel', 'reschedule', 'change'],
                        reply: "No problem! Can I have your name and date of birth to pull up your appointment?",
                        next: 'verify_identity'
                    },
                    {
                        keywords: ['refill', 'prescription', 'medication'],
                        reply: "For prescription refills, I can take a message for the doctor. What medication do you need refilled?",
                        next: 'prescription'
                    }
                ],
                fallback: {
                    reply: "How can I help you today?",
                    next: 'start'
                }
            },
            patient_type: {
                responses: [
                    {
                        keywords: ['new', 'first', 'never', 'haven\'t'],
                        reply: "Welcome! We'd love to have you. What day works best for you - we have openings this week and next.",
                        next: 'day_preference'
                    },
                    {
                        keywords: ['returning', 'been', 'before', 'patient', 'existing'],
                        reply: "Great to hear from you! Can I get your name to pull up your file?",
                        next: 'verify_identity'
                    }
                ],
                fallback: {
                    reply: "Have you been to see Dr. Chen before?",
                    next: 'patient_type'
                }
            },
            verify_identity: {
                responses: [
                    {
                        // Accept any name-like response
                        keywords: ['name', 'is', 'my', 'i\'m', 'it\'s'],
                        reply: "Thank you! And what's your date of birth?",
                        next: 'dob'
                    }
                ],
                fallback: {
                    reply: "Can I get your full name please?",
                    next: 'verify_identity'
                }
            },
            dob: {
                responses: [
                    {
                        // Accept date-like patterns
                        keywords: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', '19', '20', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
                        reply: "Perfect, I found you in the system! What day works for your appointment?",
                        next: 'day_preference'
                    }
                ],
                fallback: {
                    reply: "And what's your date of birth?",
                    next: 'dob'
                }
            },
            day_preference: {
                responses: [
                    {
                        keywords: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'today', 'tomorrow', 'week', 'next'],
                        reply: "Let me check... I have 9:30 AM or 2:15 PM available. Which works better?",
                        next: 'time_choice'
                    },
                    {
                        keywords: ['soon', 'possible', 'urgent', 'asap', 'earliest'],
                        reply: "Let me see what's available... I can squeeze you in tomorrow at 11 AM. Would that work?",
                        next: 'confirm_urgent'
                    }
                ],
                fallback: {
                    reply: "What day works best for you?",
                    next: 'day_preference'
                }
            },
            time_choice: {
                responses: [
                    {
                        keywords: ['9', 'morning', 'early', 'earlier', 'first'],
                        reply: "9:30 AM it is! You're all set. We'll send a reminder the day before. Is there anything else?",
                        next: 'anything_else'
                    },
                    {
                        keywords: ['2', 'afternoon', 'later', 'second'],
                        reply: "2:15 PM, perfect! I've got you down. We'll send a reminder. Anything else I can help with?",
                        next: 'anything_else'
                    }
                ],
                fallback: {
                    reply: "Would you prefer the 9:30 AM or 2:15 PM appointment?",
                    next: 'time_choice'
                }
            },
            confirm_urgent: {
                responses: [
                    {
                        keywords: ['yes', 'perfect', 'works', 'great', 'okay', 'sure'],
                        reply: "Great, I've got you down for tomorrow at 11 AM. Please arrive 10 minutes early. Anything else?",
                        next: 'anything_else'
                    },
                    {
                        keywords: ['no', 'can\'t', 'different'],
                        reply: "No problem! What time would work better?",
                        next: 'day_preference'
                    }
                ],
                fallback: {
                    reply: "Does tomorrow at 11 AM work for you?",
                    next: 'confirm_urgent'
                }
            },
            prescription: {
                responses: [
                    {
                        keywords: ['medication', 'prescription', 'pills', 'refill', 'name'],
                        reply: "Got it! I'll leave a message for Dr. Chen and they'll send it to your pharmacy. Anything else?",
                        next: 'anything_else'
                    }
                ],
                fallback: {
                    reply: "What medication do you need refilled?",
                    next: 'prescription'
                }
            },
            anything_else: {
                responses: [
                    {
                        keywords: ['no', 'that\'s all', 'that\'s it', 'nothing', 'good', 'all set'],
                        reply: "Perfect! Have a great day, and we'll see you at your appointment!",
                        next: 'end'
                    },
                    {
                        keywords: ['yes', 'actually', 'one more', 'also'],
                        reply: "Sure, what else can I help you with?",
                        next: 'start'
                    }
                ],
                fallback: {
                    reply: "Is there anything else I can help you with?",
                    next: 'anything_else'
                }
            },
            end: {
                isEnd: true,
                closingLine: "Thank you for calling! See you soon! 📞"
            }
        },
        practiceGoals: ['phone-voice', 'clarity', 'pleasantness']
    },

    {
        id: 'small-talk',
        title: 'Casual Small Talk',
        description: 'Practice friendly small talk with a new acquaintance',
        difficulty: 'beginner',
        estimatedMinutes: 3,
        category: 'social',
        character: {
            name: 'Riley',
            role: 'New Acquaintance',
            avatar: '👋',
            voiceSettings: VOICE_PRESETS.casual
        },
        openingLine: "Oh hey! I think we've met before... at Sarah's party, right? How have you been?",
        branches: {
            start: {
                responses: [
                    {
                        keywords: ['good', 'great', 'fine', 'well', 'pretty good', 'not bad', 'okay'],
                        reply: "That's awesome! Been up to anything fun lately?",
                        next: 'whats_new'
                    },
                    {
                        keywords: ['busy', 'hectic', 'crazy', 'lot going on', 'stressed', 'tired'],
                        reply: "Ugh, I feel that! Life gets so hectic sometimes. Anything exciting at least?",
                        next: 'whats_new'
                    },
                    {
                        keywords: ['yes', 'yeah', 'right', 'remember'],
                        reply: "I thought so! It's so nice to run into you. What have you been up to?",
                        next: 'whats_new'
                    }
                ],
                fallback: {
                    reply: "It's so nice to run into you! How's everything going?",
                    next: 'start'
                }
            },
            whats_new: {
                responses: [
                    {
                        keywords: ['work', 'job', 'project', 'busy', 'office', 'working'],
                        reply: "Oh nice! What kind of work do you do? I always forget to ask people!",
                        next: 'work_talk'
                    },
                    {
                        keywords: ['trip', 'vacation', 'travel', 'went', 'visited'],
                        reply: "Ooh, where did you go? I'm so jealous, I need a vacation!",
                        next: 'travel_talk'
                    },
                    {
                        keywords: ['show', 'movie', 'watching', 'reading', 'book', 'game', 'playing'],
                        reply: "Oh what are you watching/playing? I'm always looking for recommendations!",
                        next: 'hobby_talk'
                    },
                    {
                        keywords: ['nothing', 'not much', 'same old', 'usual'],
                        reply: "Haha, I feel that! Hey, have you seen any good movies or shows lately?",
                        next: 'hobby_talk'
                    }
                ],
                fallback: {
                    reply: "What have you been up to lately?",
                    next: 'whats_new'
                }
            },
            work_talk: {
                responses: [
                    {
                        keywords: ['tech', 'software', 'developer', 'engineer', 'computer', 'code', 'design', 'creative', 'marketing', 'sales', 'teach', 'healthcare', 'nurse', 'doctor'],
                        reply: "Oh that's so cool! Do you enjoy it? I always wonder what that's like.",
                        next: 'work_feelings'
                    }
                ],
                fallback: {
                    reply: "What's your day-to-day like?",
                    next: 'work_talk'
                }
            },
            work_feelings: {
                responses: [
                    {
                        keywords: ['love', 'like', 'enjoy', 'fun', 'interesting', 'great', 'yes'],
                        reply: "That's amazing that you enjoy what you do! So rare these days. Hey, we should totally hang out sometime!",
                        next: 'future_plans'
                    },
                    {
                        keywords: ['okay', 'fine', 'pays', 'bills', 'eh', 'meh', 'not really'],
                        reply: "Yeah, work is work sometimes! At least the weekend is for fun stuff. Speaking of, we should hang out sometime!",
                        next: 'future_plans'
                    }
                ],
                fallback: {
                    reply: "How do you like it?",
                    next: 'work_feelings'
                }
            },
            travel_talk: {
                responses: [
                    {
                        keywords: ['beach', 'europe', 'asia', 'mountain', 'city', 'country', 'visited', 'went'],
                        reply: "That sounds incredible! I bet you have some great stories. We should grab coffee and you can tell me all about it!",
                        next: 'future_plans'
                    }
                ],
                fallback: {
                    reply: "Where was your favorite place?",
                    next: 'travel_talk'
                }
            },
            hobby_talk: {
                responses: [
                    {
                        keywords: ['show', 'series', 'watching', 'netflix', 'hbo', 'tv'],
                        reply: "Oh I need to check that out! Thanks for the rec. Hey, we should do a watch party sometime!",
                        next: 'future_plans'
                    },
                    {
                        keywords: ['game', 'playing', 'video game', 'switch', 'playstation', 'xbox', 'pc'],
                        reply: "Nice! I love gaming too. We should play together sometime!",
                        next: 'future_plans'
                    },
                    {
                        keywords: ['book', 'reading', 'read', 'novel'],
                        reply: "Ooh, a reader! I've been trying to read more. Any recommendations?",
                        next: 'book_rec'
                    }
                ],
                fallback: {
                    reply: "What genre are you into?",
                    next: 'hobby_talk'
                }
            },
            book_rec: {
                responses: [
                    {
                        keywords: ['fiction', 'fantasy', 'sci-fi', 'mystery', 'thriller', 'romance', 'non-fiction', 'self-help', 'biography'],
                        reply: "Oh nice! I'll have to add that to my list. Hey, we should totally hang out and chat books sometime!",
                        next: 'future_plans'
                    }
                ],
                fallback: {
                    reply: "What's the last good book you read?",
                    next: 'book_rec'
                }
            },
            future_plans: {
                responses: [
                    {
                        keywords: ['yes', 'sure', 'definitely', 'would love', 'sounds good', 'let\'s', 'totally'],
                        reply: "Awesome! Here, let me give you my number. It was so great running into you!",
                        next: 'end'
                    },
                    {
                        keywords: ['busy', 'maybe', 'see', 'let you know'],
                        reply: "No pressure at all! I'm sure we'll run into each other again. It was so nice seeing you!",
                        next: 'end'
                    }
                ],
                fallback: {
                    reply: "Would you want to hang out sometime?",
                    next: 'future_plans'
                }
            },
            end: {
                isEnd: true,
                closingLine: "So great seeing you! Take care! 👋"
            }
        },
        practiceGoals: ['friendly-tone', 'natural-flow', 'engagement']
    },

    {
        id: 'restaurant-reservation',
        title: 'Restaurant Reservation',
        description: 'Call to make a dinner reservation at a nice restaurant',
        difficulty: 'beginner',
        estimatedMinutes: 2,
        category: 'phone-call',
        character: {
            name: 'Chris',
            role: 'Host',
            avatar: '🍽️',
            voiceSettings: VOICE_PRESETS.professional
        },
        openingLine: "Good evening, Bella Vista Restaurant. How may I assist you?",
        suggestedResponses: {
            start: ["I'd like to make a reservation", "Do you have availability tonight?", "Can I book a table?"],
            party_size: ["Two people", "Four of us", "Just me"],
            time: ["7 PM would be great", "Around 8 o'clock", "What times do you have?"]
        },
        branches: {
            start: {
                responses: [
                    {
                        keywords: ['reservation', 'book', 'table', 'availability', 'tonight', 'dinner'],
                        reply: "I'd be happy to help! For how many guests?",
                        next: 'party_size'
                    },
                    {
                        keywords: ['menu', 'hours', 'open'],
                        reply: "We're open from 5 PM to 10 PM. Would you like to make a reservation?",
                        next: 'start'
                    }
                ],
                fallback: {
                    reply: "Are you looking to make a reservation with us?",
                    next: 'start'
                }
            },
            party_size: {
                responses: [
                    {
                        keywords: ['two', '2', 'couple', 'just us', 'myself', 'one', 'me'],
                        reply: "Lovely! And what date and time were you thinking?",
                        next: 'time'
                    },
                    {
                        keywords: ['three', 'four', 'five', 'six', '3', '4', '5', '6', 'group', 'family'],
                        reply: "Wonderful! For a party that size, what date and time works best?",
                        next: 'time'
                    },
                    {
                        keywords: ['large', 'party', 'eight', 'ten', '8', '10', 'big'],
                        reply: "For larger parties, let me check our availability. What date did you have in mind?",
                        next: 'time'
                    }
                ],
                fallback: {
                    reply: "How many guests will be dining with us?",
                    next: 'party_size'
                }
            },
            time: {
                responses: [
                    {
                        keywords: ['7', 'seven', '8', 'eight', 'tonight', 'tomorrow', 'friday', 'saturday', 'evening'],
                        reply: "Let me check... Yes, I can do that! May I have a name for the reservation?",
                        next: 'name'
                    },
                    {
                        keywords: ['available', 'what do you have', 'open', 'free'],
                        reply: "We have openings at 6:30, 7:00, and 8:30. Which would you prefer?",
                        next: 'time'
                    }
                ],
                fallback: {
                    reply: "What time works best for you?",
                    next: 'time'
                }
            },
            name: {
                responses: [
                    {
                        keywords: ['name', 'is', 'my', 'under', 'it\'s', 'call'],
                        reply: "Perfect! And a phone number in case we need to reach you?",
                        next: 'phone'
                    }
                ],
                fallback: {
                    reply: "What name should I put the reservation under?",
                    next: 'name'
                }
            },
            phone: {
                responses: [
                    {
                        keywords: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'number', 'is', 'my'],
                        reply: "You're all set! Any dietary restrictions or special requests we should know about?",
                        next: 'special'
                    }
                ],
                fallback: {
                    reply: "And what's the best phone number to reach you?",
                    next: 'phone'
                }
            },
            special: {
                responses: [
                    {
                        keywords: ['no', 'none', 'all good', 'we\'re good', 'nothing', 'that\'s all'],
                        reply: "Wonderful! You're confirmed. We look forward to seeing you!",
                        next: 'end'
                    },
                    {
                        keywords: ['vegetarian', 'vegan', 'allergy', 'gluten', 'birthday', 'anniversary', 'celebration'],
                        reply: "I've made a note of that! We'll make sure to accommodate you. See you soon!",
                        next: 'end'
                    }
                ],
                fallback: {
                    reply: "Any allergies or special occasions we should know about?",
                    next: 'special'
                }
            },
            end: {
                isEnd: true,
                closingLine: "Thank you for choosing Bella Vista! We look forward to serving you! 🍽️"
            }
        },
        practiceGoals: ['phone-etiquette', 'clear-speech', 'politeness']
    },

    {
        id: 'tech-support',
        title: 'Tech Support Call',
        description: 'Call tech support to troubleshoot an internet issue',
        difficulty: 'intermediate',
        estimatedMinutes: 4,
        category: 'phone-call',
        character: {
            name: 'Jordan',
            role: 'Tech Support',
            avatar: '💻',
            voiceSettings: VOICE_PRESETS.friendly
        },
        openingLine: "Hi, thanks for calling TechHelp support! My name is Jordan. What seems to be the issue today?",
        suggestedResponses: {
            start: ["My internet isn't working", "I'm having connection problems", "My WiFi keeps dropping"],
            troubleshoot: ["Yes, I tried that", "No, how do I do that?", "It's still not working"]
        },
        branches: {
            start: {
                responses: [
                    {
                        keywords: ['internet', 'wifi', 'connection', 'slow', 'not working', 'down', 'problem', 'issue'],
                        reply: "I'm sorry to hear that! Let me help you troubleshoot. First, can you tell me - is the issue with WiFi or a wired connection?",
                        next: 'connection_type'
                    },
                    {
                        keywords: ['email', 'password', 'account', 'login'],
                        reply: "I can help with that! Let me transfer you to our accounts team. One moment please... Actually, before I do - what specific issue are you having?",
                        next: 'account_issue'
                    }
                ],
                fallback: {
                    reply: "Could you describe the problem you're experiencing?",
                    next: 'start'
                }
            },
            connection_type: {
                responses: [
                    {
                        keywords: ['wifi', 'wireless', 'laptop', 'phone'],
                        reply: "Got it, wireless connection. Have you tried restarting your router? That often fixes connectivity issues.",
                        next: 'router_restart'
                    },
                    {
                        keywords: ['wired', 'ethernet', 'cable', 'desktop', 'computer'],
                        reply: "Wired connection, okay. Let's check if the ethernet cable is securely connected. Can you check both ends?",
                        next: 'cable_check'
                    }
                ],
                fallback: {
                    reply: "Are you connecting via WiFi or with an ethernet cable?",
                    next: 'connection_type'
                }
            },
            router_restart: {
                responses: [
                    {
                        keywords: ['yes', 'tried', 'did', 'already', 'done'],
                        reply: "Okay, and it's still not working? Let me check if there are any outages in your area. Can you give me your zip code?",
                        next: 'check_outage'
                    },
                    {
                        keywords: ['no', 'how', 'haven\'t'],
                        reply: "No problem! Unplug the power cable from your router, wait 30 seconds, then plug it back in. Let me know when it's back on.",
                        next: 'wait_restart'
                    }
                ],
                fallback: {
                    reply: "Have you already tried restarting the router?",
                    next: 'router_restart'
                }
            },
            wait_restart: {
                responses: [
                    {
                        keywords: ['done', 'okay', 'back', 'on', 'lights', 'working', 'connected'],
                        reply: "Great! Are you able to connect now?",
                        next: 'check_fixed'
                    },
                    {
                        keywords: ['still', 'nothing', 'not', 'no'],
                        reply: "Hmm, let me check for outages in your area. What's your zip code?",
                        next: 'check_outage'
                    }
                ],
                fallback: {
                    reply: "Let me know when the router has finished restarting - usually takes about 2 minutes.",
                    next: 'wait_restart'
                }
            },
            check_outage: {
                responses: [
                    {
                        keywords: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
                        reply: "Let me check... I don't see any outages in your area. Let's try resetting your network settings. Are you on a computer or phone?",
                        next: 'device_type'
                    }
                ],
                fallback: {
                    reply: "What's your zip code so I can check for outages?",
                    next: 'check_outage'
                }
            },
            device_type: {
                responses: [
                    {
                        keywords: ['computer', 'laptop', 'pc', 'mac', 'windows'],
                        reply: "Okay, try going to Settings, then Network, and click 'Forget' on your WiFi network. Then reconnect with your password. Does that help?",
                        next: 'check_fixed'
                    },
                    {
                        keywords: ['phone', 'iphone', 'android', 'mobile', 'tablet'],
                        reply: "Try turning WiFi off and on in your settings. If that doesn't work, go to your WiFi settings and tap 'Forget This Network', then reconnect.",
                        next: 'check_fixed'
                    }
                ],
                fallback: {
                    reply: "Are you trying to connect with a computer or a phone?",
                    next: 'device_type'
                }
            },
            cable_check: {
                responses: [
                    {
                        keywords: ['yes', 'connected', 'plugged', 'secure', 'good'],
                        reply: "Okay, try unplugging the ethernet cable and plugging it back in firmly. Sometimes the connection gets loose.",
                        next: 'check_fixed'
                    },
                    {
                        keywords: ['loose', 'disconnected', 'found', 'wasn\'t'],
                        reply: "Ah, that might be it! Make sure it clicks in securely on both ends. Is it working now?",
                        next: 'check_fixed'
                    }
                ],
                fallback: {
                    reply: "Can you check if the cable is plugged in securely at both ends?",
                    next: 'cable_check'
                }
            },
            account_issue: {
                responses: [
                    {
                        keywords: ['password', 'forgot', 'reset', 'can\'t login'],
                        reply: "I can help reset that! I'll send a reset link to your email. Is the email on file still current?",
                        next: 'check_fixed'
                    }
                ],
                fallback: {
                    reply: "What account issue are you experiencing?",
                    next: 'account_issue'
                }
            },
            check_fixed: {
                responses: [
                    {
                        keywords: ['yes', 'working', 'works', 'fixed', 'connected', 'great', 'thanks'],
                        reply: "Wonderful! I'm so glad we got that sorted out. Is there anything else I can help you with today?",
                        next: 'anything_else'
                    },
                    {
                        keywords: ['no', 'still', 'not', 'nothing'],
                        reply: "I'm sorry it's still not working. I'm going to escalate this to our advanced team. They'll call you back within 24 hours. Is that okay?",
                        next: 'escalate'
                    }
                ],
                fallback: {
                    reply: "Is the connection working now?",
                    next: 'check_fixed'
                }
            },
            escalate: {
                responses: [
                    {
                        keywords: ['yes', 'okay', 'fine', 'sure', 'thanks'],
                        reply: "Perfect. I've created a ticket for you. Someone will reach out soon. Thank you for your patience!",
                        next: 'end'
                    },
                    {
                        keywords: ['no', 'now', 'urgent', 'need'],
                        reply: "I understand the urgency. Let me see if a supervisor is available... Actually, I'm going to suggest trying one more thing. Can you try connecting to a mobile hotspot temporarily?",
                        next: 'check_fixed'
                    }
                ],
                fallback: {
                    reply: "Is it okay if our advanced team calls you back within 24 hours?",
                    next: 'escalate'
                }
            },
            anything_else: {
                responses: [
                    {
                        keywords: ['no', 'that\'s all', 'good', 'nothing', 'nope', 'thanks'],
                        reply: "Great! Thank you for calling TechHelp. Have a wonderful day!",
                        next: 'end'
                    },
                    {
                        keywords: ['yes', 'actually', 'one more', 'question'],
                        reply: "Of course! What else can I help you with?",
                        next: 'start'
                    }
                ],
                fallback: {
                    reply: "Anything else I can help with today?",
                    next: 'anything_else'
                }
            },
            end: {
                isEnd: true,
                closingLine: "Thanks for calling TechHelp! Your reference number is TH-2024. Have a great day! 💻"
            }
        },
        practiceGoals: ['problem-description', 'following-instructions', 'patience']
    },

    {
        id: 'grocery-checkout',
        title: 'Grocery Store Checkout',
        description: 'A friendly chat with the cashier while checking out',
        difficulty: 'beginner',
        estimatedMinutes: 2,
        category: 'daily-life',
        character: {
            name: 'Sam',
            role: 'Cashier',
            avatar: '🛒',
            voiceSettings: VOICE_PRESETS.energetic
        },
        openingLine: "Hi there! Did you find everything you were looking for today?",
        suggestedResponses: {
            start: ["Yes, I did, thanks!", "Most things, yeah", "It's a great store"],
            bags: ["Yes please", "No thanks, I brought my own", "Just a few"],
            payment: ["Card please", "I'll pay cash", "Do you take Apple Pay?"]
        },
        branches: {
            start: {
                responses: [
                    {
                        keywords: ['yes', 'found', 'everything', 'good', 'great', 'thanks'],
                        reply: "Awesome! Looks like you're making something delicious. Do you need any bags today?",
                        next: 'bags'
                    },
                    {
                        keywords: ['no', 'couldn\'t find', 'looking for', 'where'],
                        reply: "Oh no! What were you looking for? I can check if we have it in back.",
                        next: 'help_find'
                    },
                    {
                        keywords: ['busy', 'crowded', 'line', 'wait'],
                        reply: "Yeah, Saturdays are always busy! But you're almost done. Need any bags?",
                        next: 'bags'
                    }
                ],
                fallback: {
                    reply: "Great day for grocery shopping! Need any bags?",
                    next: 'bags'
                }
            },
            help_find: {
                responses: [
                    {
                        keywords: ['nevermind', 'it\'s okay', 'next time', 'don\'t worry'],
                        reply: "No worries! Let me know if you need anything next time. Let's get you checked out - any bags?",
                        next: 'bags'
                    },
                    {
                        keywords: ['looking', 'need', 'want', 'find'],
                        reply: "Hmm, let me check... Actually, we might be out of that. I'm sorry! Ready to check out? Need bags?",
                        next: 'bags'
                    }
                ],
                fallback: {
                    reply: "I can have someone check in back if you'd like, or we can just finish up here?",
                    next: 'bags'
                }
            },
            bags: {
                responses: [
                    {
                        keywords: ['yes', 'please', 'sure', 'need', 'some'],
                        reply: "You got it! Alright, your total is $47.82. Cash or card?",
                        next: 'payment'
                    },
                    {
                        keywords: ['no', 'brought', 'own', 'have', 'reusable'],
                        reply: "Love it, thanks for being eco-friendly! Your total is $47.82. How would you like to pay?",
                        next: 'payment'
                    }
                ],
                fallback: {
                    reply: "Would you like any bags?",
                    next: 'bags'
                }
            },
            payment: {
                responses: [
                    {
                        keywords: ['card', 'credit', 'debit', 'tap', 'apple pay', 'phone'],
                        reply: "Perfect! Just tap or insert whenever you're ready... Got it! Would you like the receipt in the bag or with you?",
                        next: 'receipt'
                    },
                    {
                        keywords: ['cash'],
                        reply: "Sure thing! Out of $60... and $12.18 is your change. Receipt in the bag or with you?",
                        next: 'receipt'
                    }
                ],
                fallback: {
                    reply: "Will that be cash or card today?",
                    next: 'payment'
                }
            },
            receipt: {
                responses: [
                    {
                        keywords: ['bag', 'in there', 'with groceries'],
                        reply: "In the bag it goes! Have a great rest of your day!",
                        next: 'end'
                    },
                    {
                        keywords: ['no', 'don\'t need', 'email', 'skip'],
                        reply: "No problem! Thanks for shopping with us. Have a wonderful day!",
                        next: 'end'
                    },
                    {
                        keywords: ['with me', 'take it', 'hand', 'keep'],
                        reply: "Here you go! Thanks so much, have a great day!",
                        next: 'end'
                    }
                ],
                fallback: {
                    reply: "Want the receipt in the bag or with you?",
                    next: 'receipt'
                }
            },
            end: {
                isEnd: true,
                closingLine: "Thanks for shopping with us! Come back soon! 🛒"
            }
        },
        practiceGoals: ['casual-chat', 'quick-responses', 'friendliness']
    }
];

/**
 * Get suggested responses for a branch
 */
export const getSuggestedResponses = (scenarioId, branchId) => {
    const scenario = CONVERSATION_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario?.suggestedResponses) return null;
    return scenario.suggestedResponses[branchId] || null;
};

/**
 * Get scenarios by category
 */
export const getScenariosByCategory = (category) => {
    return CONVERSATION_SCENARIOS.filter(s => s.category === category);
};

/**
 * Get scenarios by difficulty
 */
export const getScenariosByDifficulty = (difficulty) => {
    return CONVERSATION_SCENARIOS.filter(s => s.difficulty === difficulty);
};

/**
 * Get a specific scenario by ID
 */
export const getScenarioById = (id) => {
    return CONVERSATION_SCENARIOS.find(s => s.id === id);
};

/**
 * Get all unique categories
 */
export const getCategories = () => {
    return [...new Set(CONVERSATION_SCENARIOS.map(s => s.category))];
};

/**
 * Get random scenario
 */
export const getRandomScenario = (difficulty = null) => {
    const filtered = difficulty
        ? CONVERSATION_SCENARIOS.filter(s => s.difficulty === difficulty)
        : CONVERSATION_SCENARIOS;
    return filtered[Math.floor(Math.random() * filtered.length)];
};

export default CONVERSATION_SCENARIOS;

