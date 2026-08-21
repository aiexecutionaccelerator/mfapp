import type { Trigger } from "@/lib/data/types";

/**
 * Stoic quotes shown on the Mission Active screen, one per Mission, chosen by
 * the Mission's trigger. Rendered in plain English from the public-domain
 * Greek/Latin (Meditations, Seneca's Letters and essays, Epictetus' Enchiridion
 * and Discourses); citations are book.section where the source is standard.
 *
 * HONOR = character, integrity, justice, standards.
 * COURAGE = fear, adversity, acting anyway.
 * COMMITMENT = discipline, follow-through, focus, finishing.
 */
export interface StoicQuote {
  id: string;
  trigger: Trigger;
  text: string;
  author: "Marcus Aurelius" | "Seneca" | "Epictetus" | "Cato the Younger" | "Zeno of Citium" | "Musonius Rufus";
  source: string;
}

export const STOIC_QUOTES: StoicQuote[] = [
  // ───────────────────────── HONOR ─────────────────────────
  { id: "h01", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 10.16", text: "Waste no more time arguing about what a good man should be. Be one." },
  { id: "h02", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 2.1", text: "Say to yourself at daybreak: today I will meet the meddling, the ungrateful, the arrogant. None of them can harm me, for none can make me act against my own good." },
  { id: "h03", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 3.5", text: "Stand upright — not held upright." },
  { id: "h04", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 7.69", text: "Perfection of character is this: to live each day as if it were your last, without frenzy, without apathy, without pretense." },
  { id: "h05", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 4.3", text: "Nowhere can a man find a quieter or more untroubled retreat than in his own soul." },
  { id: "h06", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 6.30", text: "Take care not to be made into a Caesar, not to be dyed with that color. Keep yourself simple, good, pure, serious, a friend of justice." },
  { id: "h07", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 5.16", text: "The soul takes on the color of its thoughts." },
  { id: "h08", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 7.59", text: "Dig within. Within is the wellspring of good, and it is always ready to bubble up if you keep digging." },
  { id: "h09", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 3.7", text: "Never value anything as profitable that compels you to break your word or lose your self-respect." },
  { id: "h10", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 3.16", text: "It is the mark of a good man to love the part he has been given and to keep the spirit within him pure and undisturbed." },
  { id: "h11", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 7.22", text: "It is peculiar to man to love even those who do wrong. You will do this if you remember that they are kin to you, that they do wrong through ignorance, and that soon both of you will be gone." },
  { id: "h12", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 9.4", text: "He who does wrong, wrongs himself. He who acts unjustly, acts unjustly to himself, making himself worse." },
  { id: "h13", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 12.4", text: "It is strange that a man should value the opinion others hold of him above his own." },
  { id: "h14", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 9.42", text: "When you have done a good act and another has received it, why do you look for a third thing besides — a reputation for it, or a return?" },
  { id: "h15", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 6.47", text: "One thing is worth much: to live out your life in truth and justice, with goodwill even toward liars and the unjust." },
  { id: "h16", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 8.5", text: "Do what human nature demands. Say what seems most just to you — only with kindness, modesty, and sincerity." },
  { id: "h17", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 2.5", text: "Do every act of your life as if it were the last — free from carelessness, from self-love, from discontent with what you have been given." },
  { id: "h18", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 5.11", text: "Ask yourself: to what use am I now putting my soul? Whose soul do I have right now — a child's, a tyrant's, a beast's?" },
  { id: "h19", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 1.15", text: "Be a man who is rather than seems; who does good quietly and does not ask to be noticed." },
  { id: "h20", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 7.15", text: "Whatever anyone does or says, I must be good — as gold, or emerald, or purple keeps saying: whatever anyone does, I must keep my color." },
  { id: "h21", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 6.54", text: "What is not good for the hive is not good for the bee." },
  { id: "h22", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 9.29", text: "Do not wait for Plato's Republic. Be satisfied if the smallest thing goes well, and count that outcome as no small thing." },
  { id: "h23", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 5.6", text: "Some men, when they have done a good deed, are quick to claim the credit. Be the kind who has done it and simply passes on to the next, like a vine that bears its grapes and asks nothing." },
  { id: "h24", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 6.21", text: "If anyone can show me that I think or act wrongly, I will gladly change. I seek the truth, by which no one was ever harmed." },
  { id: "h25", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 4.18", text: "How much time he gains who does not look to see what his neighbor says or does or thinks, but only at what he himself is doing, to make it just and holy." },
  { id: "h26", trigger: "honor", author: "Seneca", source: "Letters 66", text: "Nothing is honorable that is done unwillingly, or under compulsion." },
  { id: "h27", trigger: "honor", author: "Seneca", source: "Letters 123", text: "No man is good by chance. Virtue has to be learned." },
  { id: "h28", trigger: "honor", author: "Seneca", source: "Letters 66", text: "Virtue is nothing else than right reason." },
  { id: "h29", trigger: "honor", author: "Seneca", source: "Letters 11", text: "Choose someone whose life, whose words, whose very face reveals the character behind it. Picture him always, as your guardian or your model." },
  { id: "h30", trigger: "honor", author: "Seneca", source: "Letters 76", text: "Only the honorable is good. Everything else borrows its worth." },
  { id: "h31", trigger: "honor", author: "Seneca", source: "Letters 41", text: "A man's proper good is what is his own — his reason, his character. Praise that, not his possessions." },
  { id: "h32", trigger: "honor", author: "Seneca", source: "Letters 10", text: "Live among men as if God saw you. Speak with God as if men were listening." },
  { id: "h33", trigger: "honor", author: "Seneca", source: "Letters 28", text: "The first step toward being made whole is to recognize your fault." },
  { id: "h34", trigger: "honor", author: "Seneca", source: "On Anger 2.29", text: "The greatest remedy for anger is delay." },
  { id: "h35", trigger: "honor", author: "Seneca", source: "Letters 52", text: "Choose as a guide one you admire more when you see him act than when you hear him speak." },
  { id: "h36", trigger: "honor", author: "Seneca", source: "Letters 97", text: "The first and greatest punishment of the wrongdoer is that he has done wrong." },
  { id: "h37", trigger: "honor", author: "Seneca", source: "Letters 7", text: "Associate with those who will make you better. Welcome those whom you can make better." },
  { id: "h38", trigger: "honor", author: "Seneca", source: "Letters 43", text: "A good conscience welcomes the crowd; a bad one is anxious even in solitude." },
  { id: "h39", trigger: "honor", author: "Epictetus", source: "Enchiridion 33", text: "Decide what kind of man you want to be, and then do what you must do to be that man." },
  { id: "h40", trigger: "honor", author: "Epictetus", source: "Discourses 1.2", text: "Consider at what price you sell your integrity. But please, do not sell it cheap." },
  { id: "h41", trigger: "honor", author: "Epictetus", source: "Enchiridion 35", text: "When you have decided a thing should be done, never avoid being seen doing it — even if the crowd would judge it wrongly." },
  { id: "h42", trigger: "honor", author: "Epictetus", source: "Discourses 2.8", text: "You carry a god within you, and you do not know it. You dishonor him by unworthy thoughts and shameful acts." },
  { id: "h43", trigger: "honor", author: "Epictetus", source: "Enchiridion 46", text: "Do not explain your philosophy. Embody it." },
  { id: "h44", trigger: "honor", author: "Epictetus", source: "Discourses 3.23", text: "First say to yourself what you would be, and then do what you have to do." },
  { id: "h45", trigger: "honor", author: "Epictetus", source: "Enchiridion 42", text: "When someone treats you badly, remember he does what seems right to him. If he is wrong, he is the one harmed — for he is the one deceived." },
  { id: "h46", trigger: "honor", author: "Epictetus", source: "Discourses 1.29", text: "You may fetter my leg, but not even Zeus can conquer my will." },
  { id: "h47", trigger: "honor", author: "Epictetus", source: "Enchiridion 48", text: "The mark of a man making progress: he blames no one, praises no one, complains of no one, and says nothing of himself as though he were somebody." },
  { id: "h48", trigger: "honor", author: "Cato the Younger", source: "as recorded by Plutarch", text: "I would rather men ask why I have no statue than why I have one." },
  { id: "h49", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 7.54", text: "Everywhere and at all times it is in your power to accept what happens with reverence, to act justly toward those around you, and to examine your present thoughts so that nothing slips in unexamined." },
  { id: "h50", trigger: "honor", author: "Marcus Aurelius", source: "Meditations 4.49", text: "Be like the rock that the waves keep crashing over. It stands unmoved, and the raging of the sea falls still around it." },

  // ───────────────────────── COURAGE ─────────────────────────
  { id: "c01", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 5.20", text: "What stands in the way becomes the way. The obstacle to action advances the action." },
  { id: "c02", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 5.1", text: "At dawn, when you struggle to get up, tell yourself: I am rising to do the work of a human being. Why should I complain, if I am going to do what I was born for?" },
  { id: "c03", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 10.15", text: "Live as if on a mountain. It makes no difference whether a man lives here or there, if he lives everywhere as a citizen of the world." },
  { id: "c04", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 8.47", text: "If you are distressed by anything external, the pain is not due to the thing itself but to your judgment of it — and this you have the power to revoke at any moment." },
  { id: "c05", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 8.44", text: "Give yourself a gift: the present moment." },
  { id: "c06", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 5.18", text: "Nothing happens to any man that he is not formed by nature to bear." },
  { id: "c07", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 7.61", text: "The art of living is more like wrestling than dancing — it asks you to stand ready and unshaken against every blow, even the unforeseen." },
  { id: "c08", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 4.7", text: "Take away the complaint 'I have been harmed,' and the harm is taken away." },
  { id: "c09", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 9.5", text: "A man can do wrong by doing nothing, not only by doing something." },
  { id: "c10", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 4.49", text: "Does what has happened keep you from acting with justice, generosity, self-control, sanity, prudence, honesty, humility, straightforwardness? No. Then it is no misfortune." },
  { id: "c11", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 12.17", text: "If it is not right, do not do it. If it is not true, do not say it." },
  { id: "c12", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 6.6", text: "The best revenge is not to be like your enemy." },
  { id: "c13", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 7.47", text: "Look up at the stars and run with them. Such thoughts wash away the dirt of life on the ground." },
  { id: "c14", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 8.32", text: "Build your life action by action, and be content if each one achieves its goal as far as it can. No one can stop you from that." },
  { id: "c15", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 7.29", text: "Confine yourself to the present." },
  { id: "c16", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 10.8", text: "If you keep to these names — sincere, dignified, free — you will be like a man who has passed into a new life." },
  { id: "c17", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 7.56", text: "Think of yourself as already dead. You have lived your life. Now take what is left and live it properly." },
  { id: "c18", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 6.19", text: "If a thing is hard for you, do not conclude it is impossible for man. If it is possible and proper for a man, think it within your reach." },
  { id: "c19", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 2.11", text: "Since it is possible that you may depart from life this very moment, regulate every act and thought accordingly." },
  { id: "c20", trigger: "courage", author: "Seneca", source: "Letters 13", text: "We suffer more often in imagination than in reality." },
  { id: "c21", trigger: "courage", author: "Seneca", source: "Letters 104", text: "It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult." },
  { id: "c22", trigger: "courage", author: "Seneca", source: "On Providence 5", text: "Fire tests gold; adversity tests brave men." },
  { id: "c23", trigger: "courage", author: "Seneca", source: "On Providence 3", text: "No man is more unhappy than he who never faces adversity — for he is never allowed to prove himself." },
  { id: "c24", trigger: "courage", author: "Seneca", source: "Letters 78", text: "What you fear, you will find, if you look at it plainly, is bounded — either it is bearable, or it is brief." },
  { id: "c25", trigger: "courage", author: "Seneca", source: "Letters 13", text: "There are more things likely to frighten us than to crush us. We suffer more in imagination than in reality." },
  { id: "c26", trigger: "courage", author: "Seneca", source: "Letters 107", text: "Fate leads the willing and drags the unwilling." },
  { id: "c27", trigger: "courage", author: "Seneca", source: "On Providence 4", text: "Why does God afflict the best men with hardship? For the same reason that in the army the bravest men are assigned the most dangerous tasks." },
  { id: "c28", trigger: "courage", author: "Seneca", source: "On Providence 4", text: "Disaster is virtue's opportunity." },
  { id: "c29", trigger: "courage", author: "Seneca", source: "Letters 5", text: "Cease to hope and you will cease to fear. Both belong to a mind in suspense, anxious about the future." },
  { id: "c30", trigger: "courage", author: "Seneca", source: "On the Shortness of Life 1", text: "It is not that we have a short time to live, but that we waste a great deal of it." },
  { id: "c31", trigger: "courage", author: "Seneca", source: "Medea", text: "Fortune fears the brave and crushes the timid." },
  { id: "c32", trigger: "courage", author: "Seneca", source: "Letters 85", text: "Bravery is the scorn of things that look fearful." },
  { id: "c33", trigger: "courage", author: "Seneca", source: "Letters 63", text: "Whatever can happen at any time can happen today." },
  { id: "c34", trigger: "courage", author: "Seneca", source: "On Providence 5", text: "Toil calls out the best men." },
  { id: "c35", trigger: "courage", author: "Epictetus", source: "Enchiridion 5", text: "Men are disturbed not by things, but by the views they take of things." },
  { id: "c36", trigger: "courage", author: "Epictetus", source: "Discourses 2.1", text: "It is not death or pain that is to be feared, but the fear of pain or death." },
  { id: "c37", trigger: "courage", author: "Epictetus", source: "Enchiridion 1", text: "Some things are within our power, and some are not. Within our power: our judgments, our impulses, our desires, our actions." },
  { id: "c38", trigger: "courage", author: "Epictetus", source: "Discourses 1.6", text: "What would have become of Hercules if there had been no lion, hydra, stag, or boar? What would he have done without his labors?" },
  { id: "c39", trigger: "courage", author: "Epictetus", source: "Discourses 1.24", text: "Difficulties are what show men what they are. When one arrives, remember: God, like a trainer, has matched you with a rough young man." },
  { id: "c40", trigger: "courage", author: "Epictetus", source: "Enchiridion 29", text: "Do not be like children who play at being wrestlers, then gladiators, then philosophers. Consider the whole matter, and then go after it like a man." },
  { id: "c41", trigger: "courage", author: "Epictetus", source: "Discourses 2.18", text: "If you would not be of an angry temper, do not feed the habit. Count the days on which you have not been angry." },
  { id: "c42", trigger: "courage", author: "Epictetus", source: "Enchiridion 8", text: "Do not demand that events happen as you wish; wish them to happen as they do, and your life will go well." },
  { id: "c43", trigger: "courage", author: "Epictetus", source: "Discourses 2.1", text: "No man is free who is not master of himself." },
  { id: "c44", trigger: "courage", author: "Epictetus", source: "Enchiridion 51", text: "How long will you wait before you demand the best of yourself? You are no longer a boy, but a grown man. Decide now that you will live as one who is mature and making progress." },
  { id: "c45", trigger: "courage", author: "Epictetus", source: "Discourses 1.1", text: "What, then, must we do? Make the best of what is in our power, and take the rest as it comes." },
  { id: "c46", trigger: "courage", author: "Epictetus", source: "Discourses 2.19", text: "Show me a man who is sick and happy, in danger and happy, dying and happy. Show him to me — by the gods, I want to see a Stoic." },
  { id: "c47", trigger: "courage", author: "Epictetus", source: "Enchiridion 20", text: "Remember that it is not he who reviles or strikes you who insults you, but your opinion that these things are insulting." },
  { id: "c48", trigger: "courage", author: "Seneca", source: "Hercules Furens", text: "There is no easy way from the earth to the stars." },
  { id: "c49", trigger: "courage", author: "Musonius Rufus", source: "Lectures 6", text: "Practice is more important than theory, for practice is what makes a man able to act." },
  { id: "c50", trigger: "courage", author: "Marcus Aurelius", source: "Meditations 3.12", text: "If you work at what is before you, following right reason seriously, vigorously, calmly, allowing nothing to distract you — you will live happily. And there is no man able to prevent this." },

  // ───────────────────────── COMMITMENT ─────────────────────────
  { id: "m01", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 6.51", text: "A man of ambition thinks his good lies in others' actions; a man of pleasure, in his own feelings; a man of sense, in his own actions." },
  { id: "m02", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 4.24", text: "If you want tranquility, do less. Do what is essential, and do it well." },
  { id: "m03", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 9.7", text: "Wipe out imagination. Check desire. Extinguish appetite. Keep the ruling faculty in its own power." },
  { id: "m04", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 8.22", text: "Attend to the matter in front of you, whether it is a thing, a principle, or an action." },
  { id: "m05", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 12.6", text: "Practice even what you have despaired of mastering. The left hand, unpracticed, still holds the bridle better than the right — because it has been trained to it." },
  { id: "m06", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 5.9", text: "Do not be disgusted, discouraged, or dissatisfied if you do not succeed in every act. When you have failed, return to the task again." },
  { id: "m07", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 12.1", text: "Everything you hope to reach by a roundabout way you can have now — if you do not refuse it to yourself." },
  { id: "m08", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 3.4", text: "Do not waste the remainder of your life in thoughts about others, unless it serves some common good. You lose the chance to do something else." },
  { id: "m09", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 6.7", text: "Take pleasure in one thing and rest in it: passing from one act of service to another, with God in mind." },
  { id: "m10", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 7.7", text: "Do not be ashamed of being helped. You have a task to finish, like a soldier at the wall. What if you are lame and cannot mount alone, but can with another's help?" },
  { id: "m11", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 2.4", text: "It is now time to understand what sort of universe you are part of, and that a limit of time is fixed for you — which, if you do not use it to clear away the clouds, will pass, and you with it, and never return." },
  { id: "m12", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 2.7", text: "Stop letting yourself be pulled in every direction. Give yourself time to learn something good, and stop wandering." },
  { id: "m13", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 4.2", text: "Let no act be done without a purpose, nor otherwise than according to the perfect principles of art." },
  { id: "m14", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 9.6", text: "Your present opinion founded on understanding, your present conduct directed to the common good, your present disposition content with whatever happens — that is enough." },
  { id: "m15", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 11.7", text: "How clearly it strikes you that there is no other condition of life so well suited to practicing philosophy as the one you happen to be in now." },
  { id: "m16", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 5.4", text: "I go on my way through the things that happen according to nature, until I fall and rest — breathing out my breath into the air from which I draw it daily." },
  { id: "m17", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 10.2", text: "Observe what your nature requires, so far as you are governed by nature only. Then do it, and accept it, if your nature as a living being is not made worse by it." },
  { id: "m18", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 6.22", text: "I do my duty. Other things do not trouble me." },
  { id: "m19", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 8.36", text: "Do not let your imagination be crushed by life as a whole. Do not try to picture everything bad that could possibly happen. Stick with the situation at hand, and ask: why is this so unbearable? Why can't I endure it?" },
  { id: "m20", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 3.5", text: "Let the god within you be the guardian of a man: mature, engaged, a Roman, a ruler — one who has taken his post like a soldier waiting for the signal." },
  { id: "m21", trigger: "commitment", author: "Seneca", source: "Letters 1", text: "While we are postponing, life speeds by. Nothing is ours except time." },
  { id: "m22", trigger: "commitment", author: "Seneca", source: "Letters 2", text: "Everywhere means nowhere. A man who spends his time traveling has many acquaintances and no friends. So it is with the mind that settles on nothing." },
  { id: "m23", trigger: "commitment", author: "Seneca", source: "Letters 71", text: "If a man does not know to what port he is steering, no wind is favorable." },
  { id: "m24", trigger: "commitment", author: "Seneca", source: "Letters 101", text: "Let us so order our minds as if we had come to the very end. Let us postpone nothing." },
  { id: "m25", trigger: "commitment", author: "Seneca", source: "Letters 101", text: "Not how long, but how well you have lived is the main thing." },
  { id: "m26", trigger: "commitment", author: "Seneca", source: "Letters 101", text: "Begin at once to live, and count each separate day as a separate life." },
  { id: "m27", trigger: "commitment", author: "Seneca", source: "On the Shortness of Life 3", text: "You act like mortals in all you fear, and like immortals in all you desire." },
  { id: "m28", trigger: "commitment", author: "Seneca", source: "Letters 101", text: "Let us balance life's account every day." },
  { id: "m29", trigger: "commitment", author: "Seneca", source: "Letters 34", text: "A large part of goodness is the will to become good." },
  { id: "m30", trigger: "commitment", author: "Seneca", source: "Letters 6", text: "I feel that I am being not only reformed, but transformed." },
  { id: "m31", trigger: "commitment", author: "Seneca", source: "Letters 84", text: "We should follow the example of the bees: gather, sort, and then blend what we have gathered into one — so that even if the source shows, the result is clearly our own." },
  { id: "m32", trigger: "commitment", author: "Seneca", source: "Letters 33", text: "It is one thing to remember, another to know. Remembering is guarding what is entrusted to memory; knowing is making each thing your own." },
  { id: "m33", trigger: "commitment", author: "Seneca", source: "Letters 20", text: "Let philosophy scrape off your faults rather than teach you to deny them. Let your words and your life agree." },
  { id: "m34", trigger: "commitment", author: "Seneca", source: "Letters 8", text: "Hold fast to this sound and wholesome rule of life: indulge the body only so far as is needful for good health." },
  { id: "m35", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 6.2", text: "Let it make no difference to you whether you are cold or warm, if you are doing your duty; whether drowsy or well rested; whether ill-spoken of or praised; whether dying or doing something else." },
  { id: "m36", trigger: "commitment", author: "Epictetus", source: "Discourses 2.18", text: "Every habit and faculty is maintained and increased by the corresponding actions: the habit of walking by walking, of running by running." },
  { id: "m37", trigger: "commitment", author: "Epictetus", source: "Enchiridion 29", text: "In every affair consider what precedes and what follows, and then undertake it." },
  { id: "m38", trigger: "commitment", author: "Epictetus", source: "Enchiridion 50", text: "Whatever rules you have set for yourself, abide by them as laws — as if you would commit sacrilege by breaking any of them." },
  { id: "m39", trigger: "commitment", author: "Epictetus", source: "Discourses 4.12", text: "If you relax your attention for a little, do not imagine you will recover it whenever you please. The loss of it is the habit of carelessness." },
  { id: "m40", trigger: "commitment", author: "Epictetus", source: "Discourses 2.18", text: "Whatever you would make habitual, practice it; and if you would not make a thing habitual, do not practice it, but accustom yourself to something else." },
  { id: "m41", trigger: "commitment", author: "Epictetus", source: "Discourses 1.15", text: "No great thing is created suddenly, any more than a bunch of grapes or a fig. First it must blossom, then bear fruit, then ripen." },
  { id: "m42", trigger: "commitment", author: "Epictetus", source: "Enchiridion 29", text: "Consider first what it is you are undertaking, then your own nature and what it can bear. You must train, eat by rule, abstain, work at set hours — in heat, in cold." },
  { id: "m43", trigger: "commitment", author: "Epictetus", source: "Enchiridion 49", text: "Be ashamed of nothing but of not being able to live by the words you read." },
  { id: "m44", trigger: "commitment", author: "Epictetus", source: "Discourses 2.18", text: "If you wish to be a good reader, read; if a writer, write. Every habit is strengthened by the corresponding act." },
  { id: "m45", trigger: "commitment", author: "Epictetus", source: "Enchiridion 13", text: "If you wish to improve, be content to be thought foolish and stupid about outward things." },
  { id: "m46", trigger: "commitment", author: "Epictetus", source: "Enchiridion 10", text: "On the occasion of every accident, turn to yourself and ask what power you have for making use of it." },
  { id: "m47", trigger: "commitment", author: "Epictetus", source: "Discourses 1.4", text: "Where is progress? In the will — that it may be trained to keep to what is within your power, and to let go of what is not." },
  { id: "m48", trigger: "commitment", author: "Musonius Rufus", source: "Lectures 5", text: "Theory tells you what to do. Practice is the doing. The man who has practiced does the thing; the man who has only learned can merely describe it." },
  { id: "m49", trigger: "commitment", author: "Cato the Younger", source: "as recorded by Plutarch", text: "I begin to speak only when I am certain what I will say is not better left unsaid." },
  { id: "m50", trigger: "commitment", author: "Marcus Aurelius", source: "Meditations 4.17", text: "Do not act as if you were going to live ten thousand years. Death hangs over you. While you live, while you can — become good." },
];

/** Deterministic quote for a Mission: same Mission → same quote; Missions rotate. */
export function quoteForMission(trigger: Trigger, missionId: string): StoicQuote {
  const pool = STOIC_QUOTES.filter((q) => q.trigger === trigger);
  let hash = 0;
  for (let i = 0; i < missionId.length; i++) {
    hash = (hash * 31 + missionId.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length];
}
