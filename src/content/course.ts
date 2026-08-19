import type { Trigger } from "@/lib/data/types";

/**
 * The 30-Day Mission course — the whole thing, in the app.
 *
 * One lesson per day of the challenge. The text is Antonio's, lifted from the
 * classroom and cleaned of everything that pointed somewhere else: no points,
 * no community posts, no "email it to me". What the lessons used to ask a man
 * to post, he now writes here (`prompts`, stored privately as lesson
 * responses) or does (the Today's Mission hand-off on every lesson screen).
 *
 * `body` is markdown: `##` / `###` headings, `**bold**`, `- ` bullets,
 * `1. ` numbered lists, `![alt](src)`, `[text](url)`.
 *
 * Days 12–18 and 26 carry a `visionSection`: those answers compile into the
 * Vivid Vision page. Days 12–18 also carry Antonio's ten "one small courageous
 * action" ideas, which become Declare suggestions on that day.
 */

export type PromptKind = "text" | "commit" | "check";

export type VisionSection =
  | "reputation"
  | "relationships"
  | "career"
  | "health"
  | "wealth"
  | "lifestyle"
  | "legacy"
  | "smart";

export interface LessonPrompt {
  /** Stable across edits: `${lessonId}:${n}`. Never renumber a shipped prompt. */
  id: string;
  kind: PromptKind;
  label: string;
  placeholder?: string;
  minWords?: number;
}

export interface Lesson {
  /** 1–30 — the day of the challenge, and the order in the course. */
  day: number;
  id: string;
  module: number;
  moduleTitle: string;
  title: string;
  /** Unlisted YouTube video. Four lessons have none. */
  youtubeId: string | null;
  minutes: number | null;
  trigger: Trigger | null;
  body: string;
  prompts: LessonPrompt[];
  /** Antonio's inspiration list — offered on the Declare screen that day. */
  missionSuggestions?: string[];
  visionSection?: VisionSection;
}

export interface Module {
  number: number;
  title: string;
  days: [number, number];
}

export const MODULES: Module[] = [
  { number: 1, title: "Quick Start", days: [1, 5] },
  { number: 2, title: "Legacy & Core Values", days: [6, 10] },
  { number: 3, title: "The Man You Know Yourself To Be", days: [11, 18] },
  { number: 4, title: "Laws Of Men Who Get Sh*t Done", days: [19, 26] },
  { number: 5, title: "Forge Your Vivid Vision", days: [27, 30] },
];

export const LESSONS: Lesson[] = [
  {
    day: 1,
    id: "welcome-and-get-started",
    module: 1,
    moduleTitle: "Quick Start",
    title: "Welcome & Get Started",
    youtubeId: "p1VGPvExpx0",
    minutes: 2,
    trigger: null,
    prompts: [],
    body: `Welcome to your Mission. Over the next 30 days you'll learn the system behind Honor, Courage, and Commitment — one short lesson and one real-world Mission a day. Watch the video, then mark the lesson complete.`,
  },
  {
    day: 2,
    id: "mission-fragrances-set-overview",
    module: 1,
    moduleTitle: "Quick Start",
    title: "Mission Fragrances Set Overview",
    youtubeId: "FCZ7-xwRPWI",
    minutes: 3,
    trigger: null,
    prompts: [
      {
        id: "mission-fragrances-set-overview:1",
        kind: "text",
        label: "Which of the three Scent Triggers — Honor, Courage, or Commitment — are you most drawn to, and why?",
        placeholder: "Name the one, and say why.",
      },
    ],
    body: `Your Mission Fragrances set contains three 50ml EDP (1.7 oz) Scent Triggers – Honor, Courage, and Commitment.

In this lesson, we'll dive into the details of each Scent Trigger, including when and where to wear them and a breakdown of their unique notes.

## Honor

![Honor scent notes](/images/course/honor-notes.jpg)

I carefully crafted this scent to be fresh and clean, blending aromatic and oriental notes that fall into the 'Fougere' fragrance category.

Honor is versatile enough to wear every day, no matter the occasion. You won't have to worry about standing out or feeling out of place.

Personally, I think Honor is perfect for a morning pick-me-up as you head into work. It's light and airy, with a balanced mix of citrus, floral, and woody notes that'll remind you of a refreshing spring morning.

### Honor is specifically formulated with:

**Bergamot** – stimulates your body's release of serotonin and dopamine – both essential for improving your mood.

**Lemon and Petitgrain Citrus** – stimulates serotonin and raises levels of norepinephrine – a brain chemical linked to easier decision-making and upped motivation.

**Pepper Spice** – boosts circulation, improves blood flow, and normalizes blood pressure.

**Herbal Cypress and Shinus Moile** – relaxes the mind and promotes creativity by reducing oxy-Hb concentration in the right prefrontal cortex and increasing parasympathetic nervous activity.

**Neroli Floral** – natural mood enhancer, shown to aid in releasing serotonin while reducing the stress hormone cortisol.

**Nutmeg Spice** – contains adaptogen properties; a natural brain stimulator that improves alertness and elevates your mood.

**Musk** – activates the motor nerve endings both in the conscious and subconscious mind, increasing the concentration power.

## Courage

![Courage scent notes](/images/course/courage-notes.jpg)

Courage boasts a bold blend of light top notes and deeper base notes that make it noticeable without being overpowering. It's the perfect companion for sitting in the office.

Technically speaking, Courage falls into the 'citrus aromatic' fragrance category, with a mix of citrus, floral, and green notes. While still a light fragrance, the floral heart notes add depth and give it a bit more of a kick when compared to Honor.

The bold mix of light top notes and deeper base notes give this fragrance the power to be noticed without seeming too intense – the perfect companion for sitting in the office.

Courage isn't as light as Honor but isn't as deep as Commitment – it sits somewhere between the two. This makes it an excellent fragrance for the 9-5 worker, as its lifespan should get you through most of your working day.

### Courage is specifically formulated with:

**Galbanum** – eases nervous tension and helps keep you focused.

**Lemongrass** – keeps you alert, energized and enables you to think clearly.

**Grapefruit** – the citrus found within grapefruit is a powerful mood balancer and stress reliever.

**Petitgrain Mandarin Citrus** – combats stress and anxiety, helping you keep focused.

**Lavender** – gives you the energy you need to beat the afternoon slump.

**Neroli** – stimulates the release of serotonin, the important mood-enhancing neurotransmitter.

**Orange Blossom** – contains monoterpenes like limonene and pinene (which act as stimulants to help you combat mid-day fatigue).

## Commitment

![Commitment scent notes](/images/course/commitment-notes.jpg)

Commitment is my seductive and mysterious 'Amber Woody' fragrance that exudes sophistication.

While this fragrance might not be suitable for the everyday office environment, it's perfect if you're looking to make a lasting impression on a special night.

Notes of Vanilla, Tonka, and Oud give Commitment a luxurious and unforgettable scent that will impress in the right setting.

### Commitment is specifically formulated with:

**Veviter** – shown to improve alertness and brain function. It decreases mental fatigue and helps you feel more awake if you struggle to focus.

**Myrtle** – soothes your mind; relieves anxiety, moodiness, and irritability.

**Cedarwood** – promotes vitality while reducing anxiety.

**Sweet Amber** – improves cognitive performance, helping you keep productive and on-task right through to the end of your day.

**Pine Resin** – invigorates the mind.

## How To Use Your Portable Scent Trigger Dispensers

![How to fill a portable atomizer](/images/course/atomizer.jpg)

1. Remove the cap of your Scent Trigger and pop off the nozzle.
2. Align the open end of the Portable Scent Trigger Dispenser with the nozzle of the Scent Trigger.
3. Gently press the dispenser down onto the Scent Trigger's nozzle, creating a secure connection.
4. Once the dispenser is properly attached, give it a few quick pumps or squeezes to fill it with fragrance. After filling the dispenser, remove it from the Scent Trigger and replace the nozzle.`,
  },
  {
    day: 3,
    id: "star-system",
    module: 1,
    moduleTitle: "Quick Start",
    title: "S.T.A.R. System",
    youtubeId: "_xs_ANlHjJ8",
    minutes: 4,
    trigger: null,
    prompts: [],
    body: `Get ready to dive into the S.T.A.R. System — Select, Take Action, Anchor, and Repeat. It's a neuroscience-based framework built for one job: getting the most out of your Scent Triggers.

This four-step strategy helps you harness the power of your Performance Enhancing Colognes, unlocking peak performance at the right moments.

Want to know how to leverage your Scent Triggers correctly? Let's dive in!

![S.T.A.R. step one: Select](/images/course/star-1-select.svg)

## 1. Select

First, **Select** what value you want to embody.

Honor, Courage, or Commitment?

There is no right or wrong choice here; your selection depends entirely on the value you want to personify for the next few hours.

![S.T.A.R. step two: Take Action](/images/course/star-2-take-action.svg)

## 2. Take Action

Now let’s **Take Action**.

Pick up your chosen Scent Trigger, hold it in your hand, and feel the weight. Next, pop off the top, and enjoy the satisfying click as it unlocks the fragrance’s full potential.

Holding the Scent Trigger upright, spray into the cap. Bring the cap up to your nose and smell the fragrance.

Next, spray the scent onto your body or clothing (if you're going to spray one to two times, I recommend the chest area. If you're going to be applying the fragrance for the entire day, I recommend you spray three times in the chest area and once on each forearm/wrist area).

If you really want the fragrance to project, then consider going through this process a second time in 10-15 minutes, spraying twice on the back of the neck and two more times in the chest area, on top of any clothing you're wearing.

![S.T.A.R. step three: Anchor](/images/course/star-3-anchor.svg)

## 3. Anchor

It’s time to **Anchor** your chosen value with the Scent Trigger.

Close your eyes and recall a moment when you felt Honorable, Courageous, or Committed (your choice here depends on the Scent Trigger you selected).

Revisit that memory for 5-15 seconds. Open your eyes, take a deep breath, and know that you are an Honorable, Courageous, and Committed man because you have shown you are this person in the past.

If visualization is difficult at first, don’t worry; it's common for many of us guys. Like any other skill, it becomes easier with practice.

![S.T.A.R. step four: Repeat](/images/course/star-4-repeat.svg)

## 4. Repeat

At this point, you're finished - although if you only sprayed two or three times, you can go through this process again in 15 minutes (using the same Scent Trigger - don't try to mix them).

Remember that Honor lasts approximately 4-6 hours, Courage lasts 5-7 hours, and Commitment lasts 7-9 hours. That's how long other people will be able to smell these fragrances on your body.

However, most people will stop smelling a fragrance on their own bodies within 10 minutes. This is normal, it's called Olfactory Fatigue.

That being said, you can reapply the same Scent Trigger multiple times a day, and it will speed up the process of you conditioning yourself to this scent and the value associated with it.

Be careful of applying too much (of course, this depends on your situation, but I would say 2-3 sprays every 5 hours is going to be the max for most guys).

You do want to repeat this process daily for at least two months.`,
  },
  // TODO(antonio): the source copy promised "a special gift from the founder"
  // for finishing inside 30 days. Cut until the gift is real — put the
  // sentence back into `body` if it is.
  {
    day: 4,
    id: "30-day-mission-fragrance-challenge",
    module: 1,
    moduleTitle: "Quick Start",
    title: "30 Day Mission Fragrance Challenge",
    youtubeId: null,
    minutes: null,
    trigger: null,
    prompts: [
      {
        id: "30-day-mission-fragrance-challenge:1",
        kind: "commit",
        label: "I commit to using my Scent Triggers daily for the next 30 days.",
      },
    ],
    body: `![The 30-Day Challenge](/images/course/30-day-challenge.jpg)

## The Importance of Consistency

Consistency is the key to maximizing the benefits of your Scent Triggers. These aren’t just regular fragrances — they’re your partners in personal growth.

As with any transformation journey, **regularly using your Scent Triggers** helps condition your brain to associate each scent with the quality it represents — **Honor, Courage, and Commitment.**

When you repeat this ritual daily, you’ll start to notice how each fragrance influences your **mood, focus, and confidence.** These scents are more than colognes — they’re tools to **reinforce your best self** through repetition and awareness.

## The 30-Day Challenge

Here's how it runs in this app: one short lesson and one real Mission a day, for thirty days. The lesson gives you the idea. The Mission puts it into your life that same day. Your Reps are the evidence.

Even if it takes you longer than 30 days, **you’ll still experience real transformation** by actively using your Mission Fragrances set — so it’s a win-win either way.`,
  },
  {
    day: 5,
    id: "mindset-to-succeed",
    module: 1,
    moduleTitle: "Quick Start",
    title: "Mindset To Succeed",
    youtubeId: "MSSMEO8ZGGc",
    minutes: 4,
    trigger: null,
    prompts: [
      {
        id: "mindset-to-succeed:1",
        kind: "commit",
        label: "I commit to being Coachable, Taking Action, and being Patient.",
      },
    ],
    body: `In this pivotal session, we'll focus on three critical commitments you need to make to maximize your gains from this course.

## 1. Be Coachable

Being able to take advice and improve according to other people’s feedback is a skill every man should develop throughout his lifetime. This is what it means to be ‘coachable.’

Ultimately, it’s your coachability that will determine your success here. You need to adopt a ‘growth mindset’ – a willingness to learn and to improve.

You must be open to change, comfortable with self-improvement, and willing to get out of your comfort zone to make the changes you need to succeed.

I’m not saying you need to change your whole personality and life values – quite the opposite. However, it is important to be open to the new ideas we explore in this program without losing your positive mindset and without losing motivation.

## 2. Take Action

Remember those long, boring lessons at school? The ones where you just sat back and listened to a teacher talk for hours on end, wishing you were somewhere else entirely? Yeah – me too.

So let’s be honest here – you probably forgot everything you were taught when you left the classroom. Am I right?

The reason for that is simple – the decision to sit back passively, listen, and hope the information will just sink in simply doesn’t work.

For real change, you need to become an active learner by ensuring you listen, absorb, and take action on the information that has been presented to you.

Acting upon the lessons you have been taught helps you to reinforce what you’ve learned. There’s a very good reason I’m telling you this, gents.

Remember — as you go through this course I'll give you small, quick actions that require your commitment and completion. It is crucial that you actually do them.

## 3. Be Patient

I like to think of this course the same way I think about the gym.

Even though you work out every day - you probably don’t see noticeable results after the first week of lifting weights and running cardio. In fact, you probably won’t see much change after the first month!

I’ve been there, guys, and I know it’s frustrating - even disheartening.

However, it’s only when you break through those first few weeks of potential disappointment and work through your self-doubt that one day you see yourself in the mirror and realize, ‘Wow! I’ve lost a ton of weight!’

The same principle applies here:

You might not see results straight away.

The reality is that it can take up to 60 days to form a habit. You might not see results after the first week or even the first couple of months, but I guarantee you this:

If you commit to this course, act consistently, and overcome the doubts you might have in those first few weeks - chances are you will see an explosion of growth and be rewarded.

## Cultivate a Growth Mindset

Now, gentlemen, while these three commitments are crucial, there's an underlying mindset that fuels all of them - the Growth Mindset.

I want you to cultivate this mindset.

Believe in your ability to improve and grow. Embrace challenges, persist in the face of setbacks, see effort as the path to mastery, and understand that criticism can lead to learning.

With a growth mindset, you understand that you can develop your abilities and intelligence, which are not fixed but can be developed with dedication and hard work.

This mindset fosters a love for learning, resilience, and, ultimately, great accomplishment.`,
  },
  {
    day: 6,
    id: "your-legacy",
    module: 2,
    moduleTitle: "Legacy & Core Values",
    title: "Your Legacy",
    youtubeId: "hbqprG4UFIM",
    minutes: 4,
    trigger: null,
    prompts: [
      {
        id: "your-legacy:1",
        kind: "text",
        label: "Write your own eulogy. What do you want to be remembered for — the impact you made, the relationships you kept, the values you lived by?",
        placeholder: "Take your time. Nobody sees this but you.",
      },
    ],
    body: `Picture this - you walk into a dark room filled with people. You know some of them - a colleague, an old friend, your cousin you once played football with. There are many familiar faces in this room – relationships both past and present.

All of a sudden, you turn, and you see a casket...

**It's your funeral.**

I know this might be hard, but I want you to take a couple of minutes and think: "If today were my funeral, what would people say about me?"

Will they talk about your favorite movie? Your favorite song? How much you could bench press? Unless you based your personality on those things – it's highly unlikely!

Chances are they'll talk about how you made them feel, the nice things you've done, the things you've done to keep your relationships healthy - "soft skills" as we know them. They'll talk about how much you loved your friends and family… why?

Your actions as a husband, father, and friend showed them that you loved them.

Today, I want you to take a step back, look at your life, and write down what you would like people to say about you.

What will your parents, wife (or girlfriend), kids, and loved ones have to say once you're gone?

If you know the virtues and the values that you'd like to be remembered by, it will be that much easier for you to live that life so that people remember you how you want to be remembered.

This may be an emotional subject, and you may not want to do it — but I encourage you to take a few minutes and write it down below. It will help you with every step we take from here.`,
  },
  {
    day: 7,
    id: "the-importance-of-honor",
    module: 2,
    moduleTitle: "Legacy & Core Values",
    title: "The Importance Of Honor",
    youtubeId: "a9yG3pylUKY",
    minutes: 3,
    trigger: "honor",
    prompts: [
      {
        id: "the-importance-of-honor:1",
        kind: "text",
        label: "Give three specific examples of times you have been honorable. They can be big or small, recent or years ago.",
        placeholder: "Three moments you did the right thing when it was hard.",
      },
    ],
    body: `When I was creating the concept behind Mission Fragrance, I decided to name each of the Mission Fragrance Scent Triggers after my three Core Values: Honor, Courage, and Commitment.

As you guys know, I base a lot of my advice on my military heritage, so it only seemed right that my core values be inspired by the values of the United States Marine Corps.

In this lesson, I'll be breaking out each of these values.

## Honor

Honor is an ancient and profound concept that has been held in high regard by countless cultures, societies, and individuals throughout history.

Its meaning, while often difficult to define, embodies virtues such as integrity, courage, respect, and duty.

Honor is a deeply personal commitment to these virtues, a commitment that transcends external recognition and becomes a defining aspect of one's character.

The movie 'Rob Roy' encapsulates this definition beautifully, suggesting that honor is not something that can be bestowed upon a person by another.

It must be cultivated from within, as it is a gift to oneself.

This suggests that honor is not an attribute to be passively received but actively developed.

Honor is intrinsic, and its measure lies not in external accolades or recognition but in the quiet satisfaction of acting in alignment with one's principles.

## Why is Honor Important?

Honor serves as our moral compass, guiding us to act ethically and responsibly.

Having honor means being true to our word, standing up for what we believe in, and treating others with respect.

In short, it's about being the best person we can be for our sake and for the sake of those around us. The cultivation of honor builds trust, fosters strong relationships, and improves our overall quality of life.

## Cultivating Honor in Everyday Life

So how can you cultivate this sense of honor in your everyday life?

Here are some actionable steps you can take:

**Define your values:** Take some time to identify what you value most. Your values serve as the guiding principles that shape your behavior and decisions.

**Align your actions with your values:** Once you've identified your values, strive to align your actions with them. This means living out your values in all aspects of your life, even when it's challenging.

**Stand up for what you believe in:** Having honor means standing up for what you believe in, even when it's unpopular or difficult. It means being courageous enough to voice your opinion and stand your ground.

**Take responsibility for your actions:** Honor requires us to take responsibility for our actions, even when we've made a mistake. It's about owning up to our actions and striving to rectify our mistakes.`,
  },
  {
    day: 8,
    id: "the-need-for-courage",
    module: 2,
    moduleTitle: "Legacy & Core Values",
    title: "The Need For Courage",
    youtubeId: "NCeKnEezPWs",
    minutes: 2,
    trigger: "courage",
    prompts: [
      {
        id: "the-need-for-courage:1",
        kind: "text",
        label: "Give three specific examples of times you have been courageous. Courage isn't being fearless — it's acting in spite of fear.",
        placeholder: "Three moments you acted while the fear was still there.",
      },
    ],
    body: `What is courage? Is it about becoming a hero in a moment of crisis? Perhaps. But in reality, courage is much more than that...

It's about the decisions we make daily and the attitude we carry throughout life.

## Where Does Courage Come From?

Courage isn't something that just happens. It's not a switch you flip when you're in danger.

A man's courage comes from the mental, moral, and physical strength ingrained within him through hard work and the practice of mastering his fear.

It should aim to do what is right, adhere to a higher standard of personal conduct, and lead by example - sometimes making tough decisions under stress and pressure.

## Understanding Courage

It's easy to imagine running out into the battlefield to save their buddies or single-handedly taking out an enemy position when guys think of courage.

These things happen – but quite frankly, it's unlikely to happen to you as you go about your day-to-day life.

Not all acts of courage need to be huge and audacious to be defined as brave. Sticking to a plan when you know things could go wrong – that's brave.

Facing your fear of heights and climbing a ladder to fix a gutter pipe – that's also brave.

These may seem like small steps, but they require an inner strength that is truly admirable.

## Daily Acts of Courage

Getting down to the basics – courage could be something as simple as saying "no" to an event you don't want to attend.

Let's be clear – you won't win any medals for this, but the principle is the same. You've overcome a fear that was holding you back, and that, gentlemen, is what I call a courageous success.

Every act of courage contributes to building a courageous personality, no matter how small it seems. It's about facing your fears and overcoming them one day at a time.`,
  },
  {
    day: 9,
    id: "the-power-of-commitment",
    module: 2,
    moduleTitle: "Legacy & Core Values",
    title: "The Power Of Commitment",
    youtubeId: "ihWgFp5H0DU",
    minutes: 2,
    trigger: "commitment",
    prompts: [
      {
        id: "the-power-of-commitment:1",
        kind: "text",
        label: "Give three specific examples of times you have been committed. What matters is that you stayed the course.",
        placeholder: "Three moments you kept showing up.",
      },
    ],
    body: `I can guarantee that every man has shown at least some commitment during his adult life. In short, commitment is the spirit of determination and dedication that leads to the mastery of self.

Its purpose is to promote the highest order of discipline and is the ingredient that instills dedication to our life's purpose.

## What is Commitment?

Commitment is more than just a promise or a vow. It's a conscious decision to stick to a goal or a task, even in the face of adversity.

It's about pushing through, despite obstacles and setbacks, to fulfill an obligation we've made to ourselves or others.

## Where Does Commitment Come From?

Commitment doesn't spring up from anywhere. It doesn't come and go with our moods. It's born from a mental and emotional determination, fortified through discipline, self-control, and the mastery of our doubts and fears.

It's about standing by our principles and values and sometimes making challenging decisions under stress and pressure.

## Understanding Commitment

I hear you, gents. Not every man wants the commitment of getting married, settling down, and having a few kids. I did it, and I think it's great – but I know it's not for everyone, and each man has to forge his own path.

So, don't worry, I'm not suggesting you get down on one knee and ask your girl to marry you tomorrow.

Commitment might seem daunting when considering significant life commitments, such as relationships, careers, or personal development goals.

However, commitment starts small. It's about making daily decisions that align with our objectives, like choosing to hit the gym instead of sleeping in or opting for a healthier meal over fast food.

These might seem like insignificant choices, but they reinforce our commitment and build our capacity to stay dedicated to larger, more challenging goals.

## Daily Acts of Commitment

Commitment is interwoven into the fabric of our daily lives. It could be as simple as sticking to your plan to meditate every morning or making plans with your buddies and seeing them through to the end.

No matter how small, each act of commitment contributes to building a resilient and determined character.`,
  },
  {
    day: 10,
    id: "shrine-to-self-improvement",
    module: 2,
    moduleTitle: "Legacy & Core Values",
    title: "Shrine To Self-Improvement",
    youtubeId: "GCpsEfFp_E8",
    minutes: 3,
    trigger: null,
    prompts: [
      {
        id: "shrine-to-self-improvement:1",
        kind: "check",
        label: "My shrine is set up.",
      },
    ],
    body: `We've all collected various mementos throughout our lives as we accomplished significant milestones. Be it that trophy from high school sports days or the degree that marks our academic success - these tokens are a testament to our past achievements.

But I want you to think broader and more profound.

What if you could build a shrine to your self-improvement journey? An everyday reminder of your commitment to growth and betterment.

And a surprising tool to kickstart this process could be something as simple yet profound as your Mission Fragrance Set.

A shrine doesn't need to hold religious or spiritual connotations. In this context, it's a personalized, sacred corner dedicated to your development.

The Mission Fragrance Set on your dresser can become a visual cue that stimulates thoughts about the routines and systems you're implementing in your life.

Creating this shrine involves a few purposeful steps:

## 1. Choose A Space

Find a quiet corner that can be your touchstone for reflection.

Gather meaningful items: in addition to the Mission Fragrance set, assemble items that resonate with your journey - books that inspire you, quotes that energize you, photographs that remind you of your cherished memories or inspirations.

## 2. Arrange Your Items

This step is all about personalizing your space. Arrange your items in a way that speaks to your heart.

There's no right or wrong here - it's your space.

## 3. Use Your New Shrine

Spend time in front of your shrine each day, reflecting on your goals and the significance of each item you've placed there.

This shrine, this personal monument to your journey, is a powerful motivator. It not only constantly reminds you of your goals but also fuels your desire to attain them.

Remember, the most important part about this shrine is that it needs to reflect you and your journey.`,
  },
  {
    day: 11,
    id: "why-you-need-a-vision",
    module: 3,
    moduleTitle: "The Man You Know Yourself To Be",
    title: "Why You Need A Vision",
    youtubeId: "NhI4wxne2Hk",
    minutes: 5,
    trigger: null,
    prompts: [
      {
        id: "why-you-need-a-vision:1",
        kind: "check",
        label: "Ordered my frame and dry-erase markers.",
      },
    ],
    body: `Let's focus on defining the man you know yourself to be by creating your Vivid Vision. A clear Vivid Vision acts as your compass, guiding your actions and keeping you motivated.

Start by imagining where you want to be in three years. Be specific about your personal, professional, and financial goals.

To get started, set yourself up for success: order a frame and dry-erase markers. At the end of this course you'll compile your Vivid Vision here in the app — then print it, frame it, and sign it daily.

[Dry-erase markers](https://amzn.to/44WsUqT) · [A4 frame](https://amzn.to/4bF3UXa)`,
  },
  {
    day: 12,
    id: "your-reputation",
    module: 3,
    moduleTitle: "The Man You Know Yourself To Be",
    title: "Your Reputation",
    youtubeId: "AWdD1k2ccJ0",
    minutes: 6,
    trigger: null,
    visionSection: "reputation",
    prompts: [
      {
        id: "your-reputation:1",
        kind: "text",
        label: "How do you want people to perceive you three years from now? Be specific — your loved ones, your friends, your colleagues.",
        placeholder: "In three years…",
      },
      {
        id: "your-reputation:2",
        kind: "text",
        label: "List 3–5 concrete actions you'll take to build that reputation.",
        placeholder: "One step per line.",
      },
      {
        id: "your-reputation:3",
        kind: "text",
        label: "What are the biggest challenges or habits that could hold you back — distractions, pride, inconsistency?",
        placeholder: "Be honest. Nobody sees this but you.",
      },
      {
        id: "your-reputation:4",
        kind: "text",
        label: "Identify one small courageous action you can take today to honor your commitment to being your best self.",
        placeholder: "One action. Short. Specific.",
      },
    ],
    missionSuggestions: [
      "Send a text message to your partner expressing gratitude, such as “I’m so thankful to have you in my life.”",
      "Compliment your child on a recent achievement, like saying, “I’m so proud of your hard work on your dance recital.”",
      "Drink a glass of water first thing in the morning to start your day hydrated.",
      "Go for a 10-minute walk around your neighborhood to clear your mind.",
      "Download and start listening to an inspiring audiobook, such as a motivational biography.",
      "Call a friend or family member you haven’t spoken to in a while just to check in and see how they are doing.",
      "Write a thank-you note to a coworker who helped you with a project recently.",
      "Spend five minutes doing a guided meditation to relax and refocus.",
      "Organize your desk or workspace to create a more productive environment.",
      "Set a short-term goal, like reading a chapter of a book each day, and start today by reading the first chapter.",
    ],
    body: `Let's discuss the importance of reputation. While it may not matter to strangers, it’s crucial for those you care about and who depend on you.

Your reputation is a reflection of character.

Think about what you want your reputation to be in three years. Not as it is now, but the reputation you aspire to have with your loved ones, friends, and colleagues.

Society often rewards achievements like wealth and power, but virtues like love, dedication, and wisdom truly matter to those who count on us.

These virtues may not always be rewarded, but they are essential for meaningful relationships and personal fulfillment.

To build the reputation you desire, start with one small courageous action you can take today to honor your commitment to being your best self.

Looking for inspiration? Here's a list to get you started:

1. Send a text message to your partner expressing gratitude, such as “I’m so thankful to have you in my life.”
2. Compliment your child on a recent achievement, like saying, “I’m so proud of your hard work on your dance recital.”
3. Drink a glass of water first thing in the morning to start your day hydrated.
4. Go for a 10-minute walk around your neighborhood to clear your mind.
5. Download and start listening to an inspiring audiobook, such as a motivational biography.
6. Call a friend or family member you haven’t spoken to in a while just to check in and see how they are doing.
7. Write a thank-you note to a coworker who helped you with a project recently.
8. Spend five minutes doing a guided meditation to relax and refocus.
9. Organize your desk or workspace to create a more productive environment.
10. Set a short-term goal, like reading a chapter of a book each day, and start today by reading the first chapter.`,
  },
  {
    day: 13,
    id: "relationships",
    module: 3,
    moduleTitle: "The Man You Know Yourself To Be",
    title: "Relationships",
    youtubeId: "NGi4l1rNc50",
    minutes: 4,
    trigger: null,
    visionSection: "relationships",
    prompts: [
      {
        id: "relationships:1",
        kind: "text",
        label: "Describe how you want your relationships to look in three years. Be detailed about your interactions and the quality of your connections.",
        placeholder: "In three years…",
      },
      {
        id: "relationships:2",
        kind: "text",
        label: "List the specific steps you need to take to improve your relationships.",
        placeholder: "One step per line.",
      },
      {
        id: "relationships:3",
        kind: "text",
        label: "What are the biggest obstacles currently holding you back from improving your relationships?",
        placeholder: "Be honest. Nobody sees this but you.",
      },
      {
        id: "relationships:4",
        kind: "text",
        label: "Identify one small courageous action you can take today to honor your commitment to being your best self.",
        placeholder: "One action. Short. Specific.",
      },
    ],
    missionSuggestions: [
      "Text your partner something you appreciate about them.",
      "Leave a note for your child telling them how proud you are of them.",
      "Call the brother you haven’t spoken to in a while just to check in.",
      "Set a date night with your partner or a fun activity with your kids.",
      "Reach out to a friend or relative you’ve had a disagreement with and apologize.",
      "Send an old photo to a friend or family member with a message about why it’s special.",
      "Offer to help a friend or family member with a task or project.",
      "Spend 30 minutes with your family without any distractions (no phones or TV).",
      "Give an unexpected compliment to a coworker or friend.",
      "Reach out to an old friend and suggest catching up over coffee or a phone call.",
    ],
    body: `Alright, let's dive into one of the most important aspects of life—relationships. As men, we sometimes get so caught up in providing and protecting that we forget to nurture our connections with loved ones.

Think about how you want your relationships to look in three years. Visualize the bond you want with your kids, partner, family, and friends. Be detailed and vivid.

Now, consider the steps you need to take to achieve these relationship goals. Identify obstacles, whether it’s being too guarded or not making enough time. Acknowledge these and find ways to overcome them.

Finally, think of one small, courageous action you can take today to improve your relationships. Even a simple text or call can make a huge difference.

Here's some inspiration:

1. Text your partner something you appreciate about them.
2. Leave a note for your child telling them how proud you are of them.
3. Call the brother you haven’t spoken to in a while just to check in.
4. Set a date night with your partner or a fun activity with your kids.
5. Reach out to a friend or relative you’ve had a disagreement with and apologize.
6. Send an old photo to a friend or family member with a message about why it’s special.
7. Offer to help a friend or family member with a task or project.
8. Spend 30 minutes with your family without any distractions (no phones or TV).
9. Give an unexpected compliment to a coworker or friend.
10. Reach out to an old friend and suggest catching up over coffee or a phone call.`,
  },
  {
    day: 14,
    id: "career-and-business",
    module: 3,
    moduleTitle: "The Man You Know Yourself To Be",
    title: "Career & Business",
    youtubeId: "8UbE1PcGqC0",
    minutes: 3,
    trigger: null,
    visionSection: "career",
    prompts: [
      {
        id: "career-and-business:1",
        kind: "text",
        label: "Describe where you want to be in your career or business in three years. Include your role, your achievements, and the culture you work in.",
        placeholder: "In three years…",
      },
      {
        id: "career-and-business:2",
        kind: "text",
        label: "List the specific steps you need to take to reach that three-year career vision.",
        placeholder: "One step per line.",
      },
      {
        id: "career-and-business:3",
        kind: "text",
        label: "What's holding you back from advancing in your career or business?",
        placeholder: "Be honest. Nobody sees this but you.",
      },
      {
        id: "career-and-business:4",
        kind: "text",
        label: "Identify one small courageous action you can take today to honor your commitment to being your best self.",
        placeholder: "One action. Short. Specific.",
      },
    ],
    missionSuggestions: [
      "Update your resume.",
      "Send a follow-up email to a potential client.",
      "Research industry trends for 15 minutes.",
      "Reach out to a former colleague for a catch-up call.",
      "Set a new short-term career goal and write it down.",
      "Add a new skill to your LinkedIn profile.",
      "Draft a cover letter for a job you're interested in.",
      "Share a relevant article on LinkedIn.",
      "Organize your work desk to boost productivity.",
      "Schedule a quick informational interview with someone in your field.",
    ],
    body: `Many of us guys are business-focused and already have detailed plans in place, but it's important to distill these plans into a clear, concise vision.

Think about where you want to be in your job or your career in three years. This could mean realizing you're in a dead-end job and need a change or finding ways to break free from stagnation in your current role.

A Vivid Vision will help you see the steps needed to achieve your career goals.

Break down your vision into smaller, actionable steps. For example, you could update your resume, reach out to old customers, or find new opportunities for growth. Smaller steps are easier to tackle and lead to significant progress.

Identify the biggest obstacles holding you back. For many, it could be fear of failure or rejection. Recognize these barriers and commit to overcoming them with honesty and determination.

Identify one small courageous action you can take today to honor your commitment to being your best self. Here are 10 specific examples:

1. Update your resume.
2. Send a follow-up email to a potential client.
3. Research industry trends for 15 minutes.
4. Reach out to a former colleague for a catch-up call.
5. Set a new short-term career goal and write it down.
6. Add a new skill to your LinkedIn profile.
7. Draft a cover letter for a job you're interested in.
8. Share a relevant article on LinkedIn.
9. Organize your work desk to boost productivity.
10. Schedule a quick informational interview with someone in your field.`,
  },
  {
    day: 15,
    id: "health",
    module: 3,
    moduleTitle: "The Man You Know Yourself To Be",
    title: "Health",
    youtubeId: "co2ZBwcMsjM",
    minutes: 4,
    trigger: null,
    visionSection: "health",
    prompts: [
      {
        id: "health:1",
        kind: "text",
        label: "Describe where you want your health, fitness, and diet to be in three years. Be specific about your weight, your body fat, and what you want to be able to do.",
        placeholder: "In three years…",
      },
      {
        id: "health:2",
        kind: "text",
        label: "List the concrete steps needed to get there.",
        placeholder: "One step per line.",
      },
      {
        id: "health:3",
        kind: "text",
        label: "What are the biggest obstacles currently holding you back from improving your health?",
        placeholder: "Be honest. Nobody sees this but you.",
      },
      {
        id: "health:4",
        kind: "text",
        label: "Identify one small courageous action you can take today to honor your commitment to being your best self.",
        placeholder: "One action. Short. Specific.",
      },
    ],
    missionSuggestions: [
      "Do 10 push-ups.",
      "Drink an extra glass of water.",
      "Take a 10-minute walk.",
      "Prep a healthy meal for tomorrow.",
      "Stretch for 5 minutes.",
      "Replace a sugary snack with a piece of fruit.",
      "Try a new workout video online.",
      "Meditate for 5 minutes.",
      "Write down your health goals in a journal.",
      "Stand up and move around for a few minutes if you've been sitting for a while.",
    ],
    body: `Where do you want to be in three years in terms of fitness, diet, and overall well-being? The more specific and vivid your vision, the better.

Consider your weight, body fat percentage, and physical activities you'd like to achieve. For instance, could you get back into shape to pass a fitness test? Set realistic yet ambitious goals to help you stay motivated and focused.

Identify 3-7 concrete steps to achieve your health vision. This could include hiring a fitness coach, learning about nutrition, or setting up a consistent exercise routine. The more detailed you are, the easier it will be to follow through.

Next, think about the biggest obstacles holding you back. For many, it's a lack of time or feeling selfish about taking time for themselves. Recognize these barriers and find ways to overcome them. Accountability partners or fitness coaches can be incredibly helpful.

By defining your health goals, breaking them into actionable steps, and addressing obstacles, you'll be on your way to achieving the health and fitness levels you desire.

Identify one small courageous action you can take today to honor your commitment to being your best self.

Here are 10 examples to help you:

1. Do 10 push-ups.
2. Drink an extra glass of water.
3. Take a 10-minute walk.
4. Prep a healthy meal for tomorrow.
5. Stretch for 5 minutes.
6. Replace a sugary snack with a piece of fruit.
7. Try a new workout video online.
8. Meditate for 5 minutes.
9. Write down your health goals in a journal.
10. Stand up and move around for a few minutes if you've been sitting for a while.`,
  },
  {
    day: 16,
    id: "wealth",
    module: 3,
    moduleTitle: "The Man You Know Yourself To Be",
    title: "Wealth",
    youtubeId: "GqQmxeLr6GI",
    minutes: 4,
    trigger: null,
    visionSection: "wealth",
    prompts: [
      {
        id: "wealth:1",
        kind: "text",
        label: "Describe where you want to be financially in three years. Include savings goals, income streams, and debt.",
        placeholder: "In three years…",
      },
      {
        id: "wealth:2",
        kind: "text",
        label: "List the specific steps you need to take to reach that three-year wealth vision.",
        placeholder: "One step per line.",
      },
      {
        id: "wealth:3",
        kind: "text",
        label: "What are the biggest obstacles currently holding you back from achieving it?",
        placeholder: "Be honest. Nobody sees this but you.",
      },
      {
        id: "wealth:4",
        kind: "text",
        label: "Identify one small courageous action you can take today to honor your commitment to being your best self.",
        placeholder: "One action. Short. Specific.",
      },
    ],
    missionSuggestions: [
      "Open a savings account.",
      "Transfer $10 to your emergency fund.",
      "Review your monthly budget.",
      "Cancel a subscription you don't use.",
      "Set up a meeting with a financial advisor.",
      "Track your expenses for the day.",
      "Read an article about passive income.",
      "Pay an extra $20 towards your debt.",
      "Sell an item you no longer need.",
      "Automate a small monthly transfer to your savings.",
    ],
    body: `Wealth encompasses more than just money—it's about your earnings, savings, assets, and overall financial health.

Visualize where you want to be in three years regarding wealth. Do you want to have an emergency fund, a passive income stream, or be debt-free? Paint a vivid vision of your financial goals, being both realistic and ambitious.

Next, outline the steps needed to achieve this vision. This might involve seeking a new job, getting a raise, or starting a new income stream. Don’t let fear hold you back. Identifying your financial goals and the necessary steps is crucial.

Think about the biggest obstacles that might hinder your progress. For many, it’s fear of failure or change. By acknowledging these barriers, you can start to overcome them.

By defining your wealth goals, breaking them into actionable steps, and addressing obstacles, you'll be on your way to achieving financial stability and growth.

Identify one small courageous action you can take today to honor your commitment to being your best self. Here are 10 specific examples:

1. Open a savings account.
2. Transfer $10 to your emergency fund.
3. Review your monthly budget.
4. Cancel a subscription you don't use.
5. Set up a meeting with a financial advisor.
6. Track your expenses for the day.
7. Read an article about passive income.
8. Pay an extra $20 towards your debt.
9. Sell an item you no longer need.
10. Automate a small monthly transfer to your savings.`,
  },
  {
    day: 17,
    id: "lifestyle",
    module: 3,
    moduleTitle: "The Man You Know Yourself To Be",
    title: "Lifestyle",
    youtubeId: "qF8IJk2xadQ",
    minutes: 3,
    trigger: null,
    visionSection: "lifestyle",
    prompts: [
      {
        id: "lifestyle:1",
        kind: "text",
        label: "Describe your ideal lifestyle three years from now. Be specific about where you want to live and how you want to live.",
        placeholder: "In three years…",
      },
      {
        id: "lifestyle:2",
        kind: "text",
        label: "List the specific steps you need to take to get there.",
        placeholder: "One step per line.",
      },
      {
        id: "lifestyle:3",
        kind: "text",
        label: "What are the biggest obstacles currently holding you back from achieving it?",
        placeholder: "Be honest. Nobody sees this but you.",
      },
      {
        id: "lifestyle:4",
        kind: "text",
        label: "Identify one small courageous action you can take today to honor your commitment to being your best self.",
        placeholder: "One action. Short. Specific.",
      },
    ],
    missionSuggestions: [
      "Research a new city you want to live in.",
      "Save $20 towards your travel fund.",
      "Look up job opportunities in your dream location.",
      "Spend 10 minutes decluttering a room in your house.",
      "Plan a small trip or weekend getaway.",
      "Explore online communities in your desired location.",
      "Create a Pinterest board for your dream home.",
      "Set a daily reminder to visualize your ideal lifestyle.",
      "Talk to a friend or family member about your goals.",
      "Write down one thing you love about your current lifestyle to build a positive mindset.",
    ],
    body: `Now let's get to the fun part!

Visualizing your ideal lifestyle in three years can be incredibly motivating.

Think about where you want to live, how you want to live, and what changes you’d like to see. Perhaps you envision building your dream home, traveling the world, or living in a new city. Be as specific as possible in describing your lifestyle vision.

Consider what steps are necessary to achieve this lifestyle. Outline the actions you need to take, whether it’s moving to a new location, changing jobs, or saving money for travel.

Next, identify the obstacles that might hinder your progress. For many, these could be financial constraints, family commitments, or the fear of change. By recognizing these challenges, you can start to find ways to overcome them.

Identify one small courageous action you can take today to honor your commitment to being your best self. Here are 10 specific examples:

1. Research a new city you want to live in.
2. Save $20 towards your travel fund.
3. Look up job opportunities in your dream location.
4. Spend 10 minutes decluttering a room in your house.
5. Plan a small trip or weekend getaway.
6. Explore online communities in your desired location.
7. Create a Pinterest board for your dream home.
8. Set a daily reminder to visualize your ideal lifestyle.
9. Talk to a friend or family member about your goals.
10. Write down one thing you love about your current lifestyle to build a positive mindset.`,
  },
  {
    day: 18,
    id: "social-impact-and-your-legacy",
    module: 3,
    moduleTitle: "The Man You Know Yourself To Be",
    title: "Social Impact & Your Legacy",
    youtubeId: "oU7fHhMoXoY",
    minutes: 4,
    trigger: null,
    visionSection: "legacy",
    prompts: [
      {
        id: "social-impact-and-your-legacy:1",
        kind: "text",
        label: "Describe the legacy you want to have in three years. Include your community involvement and the impact you want to make.",
        placeholder: "In three years…",
      },
      {
        id: "social-impact-and-your-legacy:2",
        kind: "text",
        label: "List the specific steps you need to take — volunteering, donating, starting a community project.",
        placeholder: "One step per line.",
      },
      {
        id: "social-impact-and-your-legacy:3",
        kind: "text",
        label: "What are the biggest obstacles currently holding you back from achieving it?",
        placeholder: "Be honest. Nobody sees this but you.",
      },
      {
        id: "social-impact-and-your-legacy:4",
        kind: "text",
        label: "Identify one small courageous action you can take today to honor your commitment to being your best self.",
        placeholder: "One action. Short. Specific.",
      },
    ],
    missionSuggestions: [
      "Research a local charity to volunteer with.",
      "Donate $10 to a cause you care about.",
      "Write a letter of appreciation to a community leader.",
      "Plant a tree in your neighborhood.",
      "Spend an hour cleaning up a local park.",
      "Organize a small fundraiser for a charity.",
      "Share an inspiring story on social media.",
      "Mentor a young person in your community.",
      "Attend a community meeting or event.",
      "Reach out to a local organization to offer your skills.",
    ],
    body: `Finally, let's focus on your legacy and impact. Think about the legacy you want to leave and the impact you want to have in three years. Your legacy extends beyond your immediate circle, influencing the broader community.

Consider how you’d like to be remembered and the contributions you want to make. This could be through charitable work, community involvement, or being a positive role model. Be as vivid and specific as possible in describing your legacy vision.

Next, outline the steps needed to achieve this vision. Whether it's volunteering more, donating to charities, or starting a community project, identify the actions you need to take.

Think about the obstacles that might hinder your progress. Common barriers include time constraints, financial limitations, or fear of judgment. Recognizing these challenges allows you to address them effectively.

Identify one small courageous action you can take today to honor your commitment to being your best self. Here are 10 specific examples:

1. Research a local charity to volunteer with.
2. Donate $10 to a cause you care about.
3. Write a letter of appreciation to a community leader.
4. Plant a tree in your neighborhood.
5. Spend an hour cleaning up a local park.
6. Organize a small fundraiser for a charity.
7. Share an inspiring story on social media.
8. Mentor a young person in your community.
9. Attend a community meeting or event.
10. Reach out to a local organization to offer your skills.`,
  },
  {
    day: 19,
    id: "mindset-for-achieving-your-vivid-vision",
    module: 4,
    moduleTitle: "Laws Of Men Who Get Sh*t Done",
    title: "Mindset for Achieving Your Vivid Vision",
    youtubeId: "odhvU6I3Kz0",
    minutes: 5,
    trigger: null,
    prompts: [
      {
        id: "mindset-for-achieving-your-vivid-vision:1",
        kind: "commit",
        label: "I commit to having a growth, abundance, and resilient mindset.",
      },
    ],
    body: `You've just named the obstacles standing between you and your three-year vision. In this module we're equipping you with the tools and frameworks to overcome them.

Most challenges fall into categories like money, time, resources, effort, and lack of progress. Recognizing these common barriers is the first step in overcoming them.

Let’s talk about your mindset. Everything starts in the mind. If you feel defeated before you begin, you won’t get far. But if you see obstacles as challenges that make life interesting, you’re already on the right track. Think about your favorite movie heroes—they always face challenges and grow from them. Resilience is key. When you fall, get back up and keep going.

Next is growth. No matter your age, you can grow and learn. Don’t be afraid to change your mind when presented with new facts. Stubbornly sticking to outdated beliefs can hold you back. Embrace growth and be willing to adapt.

Finally, adopt an abundance mindset. Don’t view the world as a pie with limited slices. Wealth and opportunities are constantly being created. Focus on building value and creating more wealth, not just for yourself but also for others.

With these mindsets—resilience, growth, and abundance—you’ll be well-equipped to build your Vivid Vision.`,
  },
  {
    day: 20,
    id: "pareto-principle",
    module: 4,
    moduleTitle: "Laws Of Men Who Get Sh*t Done",
    title: "Pareto Principle",
    youtubeId: "CiNTVRxOgyY",
    minutes: 5,
    trigger: null,
    prompts: [
      {
        id: "pareto-principle:1",
        kind: "text",
        label: "Where in your life would the 80/20 principle create the biggest impact right now? Be specific.",
      },
    ],
    body: `Welcome to a life-changing concept: the 80/20 principle. Introduced by Italian economist Vilfredo Pareto, this idea states that **80% of results** come from **20% of efforts**.

For example - in business, 20% of customers often account for 80% of sales.

Recognizing this key principle can help you focus on what truly matters and achieve more with less effort.

Apply this principle to your life by identifying key areas where a small effort can yield significant results. Be specific and think about where you can make the most impact.

As always, wear your Scent Trigger and take one small courageous action today to honor your commitment to being your best self.

This could be sending a text, drinking a glass of water, or setting up an investment. These small actions, over time, will make a huge difference.`,
  },
  {
    day: 21,
    id: "essentialism",
    module: 4,
    moduleTitle: "Laws Of Men Who Get Sh*t Done",
    title: "Essentialism",
    youtubeId: "VkA4H2mZNII",
    minutes: 4,
    trigger: null,
    prompts: [
      {
        id: "essentialism:1",
        kind: "text",
        label: "What small step will you take in the next 24 hours to embrace Essentialism?",
        placeholder: "Clear one drawer. Cut one meeting. Say no once.",
      },
    ],
    body: `Essentialism is about zeroing in on the **vital few things that truly matter**, giving you more freedom and joy.

Steve Jobs, upon his return to Apple, noticed the company was spread thin with too many products. His solution? Streamline!

By eliminating the non-essential, Apple was able to focus on what truly mattered, leading to its remarkable success.

This is the heart of Essentialism—cutting through the noise to focus on what's most important.

Incorporate essentialism into your life by using tools like the Eisenhower Matrix to prioritize tasks. This matrix helps you focus on important but non-urgent tasks that often get buried under urgent but less important activities.

Imagine the peace and productivity that come from concentrating on what truly drives your goals!

How to get started? Declutter!

Marie Kondo, a decluttering guru, suggests only keeping items that spark joy. Apply this principle to your schedule and commitments as well.

By saying "no" to good things, you create space to say "yes" to great things, enriching your life.

Embrace the power of Essentialism to protect your time and focus on what truly matters. It’s not just about less; it’s about better. Free up time for meaningful activities, like enjoying a serene walk with your partner or having a reflective moment with yourself.

What small step can you take in the next 24 hours to embrace this powerful mindset?

As you take action, don’t forget to use your Scent Trigger and recite the mantra: "Today, I'll take one small courageous action to honor my commitment to being my best self."`,
  },
  {
    day: 22,
    id: "1-percent-better-daily",
    module: 4,
    moduleTitle: "Laws Of Men Who Get Sh*t Done",
    title: "1% Better Daily",
    youtubeId: "MePOS7sTKH0",
    minutes: 3,
    trigger: null,
    prompts: [
      {
        id: "1-percent-better-daily:1",
        kind: "text",
        label: "Where can you get 1% better today? Keep it small — one tiny improvement.",
      },
    ],
    body: `Let's dive into the concept of getting 1% better every day. This powerful approach was popularized by Toyota in the 1980s.

The idea is simple yet incredibly effective: focus on small, incremental improvements each day. James Clear further expanded on this by highlighting how these tiny gains compound over time.

Imagine this: improving by just 1% daily can make you 37 times better by the end of the year!

So, how can you apply this in your life?

Start by identifying areas where you can make small improvements. It could be learning a new skill, enhancing your efficiency, or improving a relationship. These minor adjustments may seem insignificant, but over time, they create exponential growth.

To make this process even more effective, use your Scent Triggers to reinforce the habit of taking one small courageous action each day. This will keep you focused and motivated on your journey to becoming your best self.`,
  },
  {
    day: 23,
    id: "doing-nothing-vs-doing-one-thing",
    module: 4,
    moduleTitle: "Laws Of Men Who Get Sh*t Done",
    title: "Doing Nothing vs. Doing One Thing",
    youtubeId: "FaJhvhVPb9c",
    minutes: 3,
    trigger: null,
    prompts: [
      {
        id: "doing-nothing-vs-doing-one-thing:1",
        kind: "text",
        label: "What's the one thing you're going to get done today that will make a difference?",
      },
    ],
    body: `Let’s talk about the power of doing one thing versus doing nothing at all.

I get it—life can be overwhelming. Take fitness as an example; you might think that if you can’t fit in a 30-minute run, it’s not worth doing anything.

But even a small action, like doing a few air squats or one pull-up, can make a difference.

The key here is to break the barrier of inaction. Often, we’re paralyzed by the thought of needing to do a lot, so we end up doing nothing. It's better to do something small than nothing at all.

The hardest part is often just starting.

There’s a great book by Mel Robbins called "The 5-Second Rule." In it, she talks about counting down from five and then taking action. This can help you overcome the hesitation that holds you back. I use this trick to get out of bed in the morning and to step into the gym.

My rule is simple: I just have to step into the gym, and once I’m there, I usually end up working out.

Setting the bar low and just getting started can lead to doing more than you initially planned. Even if you only accomplish that one small task, you’re still ahead of the person who did nothing.

So, think about it: What’s one thing you can do today that will have a significant impact? Don’t overthink it, just start.

And don’t forget to recite your mantra: "Today, I'll take one small courageous action to honor my commitment to being my best self."`,
  },
  {
    day: 24,
    id: "latent-potential",
    module: 4,
    moduleTitle: "Laws Of Men Who Get Sh*t Done",
    title: "Latent Potential",
    youtubeId: "qWaP70yaVe0",
    minutes: 4,
    trigger: null,
    prompts: [
      {
        id: "latent-potential:1",
        kind: "text",
        label: "Where in your life is there latent potential — something heating up, waiting to ignite?",
      },
    ],
    body: `Imagine putting a piece of paper in an oven. At 100°, 200°, 300°, 400°, and even 450°, nothing happens.

But at 451°, it ignites.

The energy was building up all along, and it finally hit the ignition point.

This is similar to our efforts in life. You might feel like you're hitting brick walls when you're trying to improve your fitness, grow your business, or make investments.

Progress often seems slow, but all that effort is building up. Eventually, you'll reach a tipping point where everything clicks, and you achieve your goals.

Consider real estate in 2020 and 2021. Many saw sudden, significant gains after years of slow progress.

This principle applies to personal goals too, like fitness. You might not see immediate results, but one day, you'll notice the change.

Take John Grisham, for example. He was a lawyer who knew he was a writer at heart. He wrote "A Time to Kill," which initially flopped, but he kept going. His next book, "The Firm," exploded in popularity.

His latent potential as a writer was always there; it just needed time to ignite.

So, where in your life is there latent potential? What’s heating up and just waiting to ignite?`,
  },
  {
    day: 25,
    id: "identity-based-decision-making",
    module: 4,
    moduleTitle: "Laws Of Men Who Get Sh*t Done",
    title: "Identity-Based Decision Making",
    youtubeId: "ZMBy99RiuvM",
    minutes: 5,
    trigger: null,
    prompts: [
      {
        id: "identity-based-decision-making:1",
        kind: "text",
        label: "How do you see yourself? What identity do you hold?",
        placeholder: "Be generous. Describe yourself as your future self would.",
      },
    ],
    body: `Identity-based decision-making is an incredibly powerful concept because it goes beyond specific goals and taps into who you fundamentally are.

Consider the swimmer Michael Phelps. Sure, he aimed for gold medals, but his core identity is being a swimmer. He’s in the pool every day because that’s who he is.

Similarly, if you see yourself as a healthy person, you’ll naturally adopt healthy habits.

Let's talk about your three-year vision. Guess what? You’re already that person you aspire to be inside.

**You just need to align your actions with your identity.**

If you see yourself as a healthy person, you'll avoid unhealthy foods not just to lose weight but because it's part of who you are.

Write down how you identify yourself.

Are you a healthy person? A successful person? A dedicated family man?

Be generous and think about how your future self would describe you.

Lastly, don't forget your Scent Trigger and recite the mantra: "Today, I'll take one small courageous action to honor my commitment to being my best self."`,
  },
  {
    day: 26,
    id: "smart-goals",
    module: 4,
    moduleTitle: "Laws Of Men Who Get Sh*t Done",
    title: "SMART Goals",
    youtubeId: "QZQjcgh26jA",
    minutes: 4,
    trigger: null,
    visionSection: "smart",
    prompts: [
      {
        id: "smart-goals:1",
        kind: "text",
        label: "Write one S.M.A.R.T. goal aligned to your three-year Vivid Vision.",
        placeholder: "Specific. Measurable. Attainable. Relevant. Time-bound.",
      },
    ],
    body: `Finally, let’s talk about S.M.A.R.T. goals.

The acronym stands for Specific, Measurable, Attainable, Relevant, and Time-bound. It originated from a 1981 paper by George T. Doran and has become a popular framework for setting effective goals.

**Specific**: Define your goal clearly. Instead of saying, “I want to jump higher,” say, “I want to add five inches to my vertical jump.”

**Measurable**: Ensure you can track your progress. For example, “I want to add five inches.”

**Attainable**: Make sure your goal is realistic. If others have achieved similar results, you likely can too.

**Relevant**: Align your goal with your broader objectives. Improving your vertical jump is relevant if you want to get better at basketball or volleyball.

**Time-bound**: Set a deadline. Decide if you’ll achieve your goal in six months, a year, or another timeframe.

Using S.M.A.R.T. goals helps you stay accountable and ensures your efforts are focused and effective. Whether your vision involves wealth, health, or personal growth, S.M.A.R.T. goals can guide you toward success.

Write a S.M.A.R.T. goal aligned with your three-year Vivid Vision.

And don't forget to use your Scent Trigger today and recite, "Today, I'm taking one small courageous action to honor my commitment to being my best self."`,
  },
  {
    day: 27,
    id: "your-vivid-vision-is-coming-to-life",
    module: 5,
    moduleTitle: "Forge Your Vivid Vision",
    title: "Your Vivid Vision Is Coming to Life",
    youtubeId: "SwZrllkuszY",
    minutes: 4,
    trigger: null,
    prompts: [],
    body: `**Congratulations, gentlemen — you've made it through the hardest part of the course.**

You've reflected on your values. You've sharpened your mindset. You've taken courageous daily actions.

And now you're ready for one of the most powerful moments in this journey.

## A Powerful Next Step

Everything you've written over the last three weeks — your goals, your values, your reflections, your identity — comes together now into one document: your 3-Year Vivid Vision.

It covers seven areas of your life:

- **Your Reputation**
- **Your Relationships**
- **Your Career or Business**
- **Your Health and Fitness**
- **Your Wealth and Finances**
- **Your Lifestyle** — home, routines, travel, hobbies
- **Your Social Impact & Legacy**

This document is your compass — a clear, inspiring snapshot of the man you are becoming.

## Build It Now

Tap the button below. The app compiles what you wrote on Days 12 through 18, along with your S.M.A.R.T. goal from Day 26, into a single page. Anything you left blank is marked so you can fill it in, and you can edit every word.`,
  },
  {
    day: 28,
    id: "review-your-vivid-vision",
    module: 5,
    moduleTitle: "Forge Your Vivid Vision",
    title: "Review Your Vivid Vision",
    youtubeId: null,
    minutes: null,
    trigger: null,
    prompts: [],
    body: `Your Vivid Vision is compiled and waiting for you. Open it and read it slowly. Sit with it. Feel it.

This is not a homework sheet.

This is a **snapshot of your future life** — the man you're becoming.

## Refine With 80/20 And Essentialism

As you go through your Vivid Vision, ask yourself:

- Does this feel true and exciting?
- Is this really the man I want to be in three years?
- Is anything important missing?
- Has anything changed in my priorities or circumstances?

Now apply your two core filters.

**Pareto Principle (80/20).** Which 20% of the goals, habits, and projects in this vision will create 80% of your results? Those are the ones you prioritize. Those are the ones you build systems around.

**Essentialism.** Is anything here unnecessary, distracting, or overcomplicated? If it is, cut it. Your future deserves a vision that is clear, focused, and powerful — not bloated and overwhelming.

Edit it directly on the Vivid Vision page. Nothing is locked. You can come back and change it any time — today, or months from now.`,
  },
  {
    day: 29,
    id: "broadcast-your-vivid-vision",
    module: 5,
    moduleTitle: "Forge Your Vivid Vision",
    title: "Broadcast Your Vivid Vision",
    youtubeId: null,
    minutes: null,
    trigger: null,
    prompts: [
      {
        id: "broadcast-your-vivid-vision:1",
        kind: "check",
        label: "Scheduled my 3-year review date.",
      },
      {
        id: "broadcast-your-vivid-vision:2",
        kind: "check",
        label: "Printed and framed my Vivid Vision.",
      },
    ],
    body: `![Broadcast your Vivid Vision](/images/course/broadcast-banner.jpg)

Your Vivid Vision is no longer just an idea in your head. It's written down, in your own words, and it's yours.

## Bring Your Vision Into Your Environment

Print it and display it somewhere meaningful: your office, your desk, your shrine — anywhere you'll see it daily.

A framed Vivid Vision becomes:

- a **daily reminder** of who you're becoming
- a **visual trigger** for consistency
- a **commitment** to yourself
- a symbol of the future you're creating

Once it's framed, it's time for the next step: share it.

## Why Sharing Your Vivid Vision Matters

Sharing your Vivid Vision with a trusted circle is a powerful way to gain feedback, support, and accountability.

1. **Accountability.** When people know your goals, you're far more likely to stay committed and follow through.
2. **Feedback.** Trusted friends, family, or colleagues will see things you've missed, and help you sharpen it.
3. **Support.** Sharing lets others back you — encouragement, resources, and connections that help you get there.

Then set a date three years out to come back and measure yourself against it. The Vivid Vision page will put that date in your calendar in one tap, and share the vision itself with whoever you choose.`,
  },
  {
    day: 30,
    id: "frame",
    module: 5,
    moduleTitle: "Forge Your Vivid Vision",
    title: "Frame",
    youtubeId: null,
    minutes: null,
    trigger: null,
    prompts: [
      {
        id: "frame:1",
        kind: "check",
        label: "Scheduled my 3-year review date.",
      },
      {
        id: "frame:2",
        kind: "check",
        label: "Printed and framed my Vivid Vision.",
      },
    ],
    body: `![Frame your Vivid Vision](/images/course/frame-banner.jpg)

Thirty days. One lesson and one Mission at a time.

You know your values. You know the man you're becoming. And you have the evidence — every Rep in your log is a day you did what you said you would do.

## The Last Job

Print your Vivid Vision, frame it, and put it where you'll see it every morning. Sign it daily.

## And Then Keep Going

The 30-Day Mission ends here. The Mission doesn't.

Keep the ritual. **Select** the value you need. **Take Action** — apply the Scent Trigger. **Anchor** a moment you lived that value. **Repeat**, daily.

One small courageous action a day, to honor your commitment to being your best self.`,
  },];

export const LESSON_COUNT = LESSONS.length;

export function lessonForDay(day: number): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.day === day);
}

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

export function moduleOf(lesson: Lesson): Module | undefined {
  return MODULES.find((module) => module.number === lesson.module);
}

/** The next lesson in course order, crossing module boundaries. */
export function nextLesson(id: string): Lesson | undefined {
  const index = LESSONS.findIndex((lesson) => lesson.id === id);
  if (index === -1) return undefined;
  return LESSONS[index + 1];
}
