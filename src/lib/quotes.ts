import { daysBetween } from './dates'

export interface Quote {
  text: string
  author: string
  source?: string
}

// Only quotes with a traceable source; see DECISIONS.md for what was left out and why.
export const QUOTES: readonly Quote[] = [
  { text: 'Bird by bird, buddy. Just take it bird by bird.', author: 'Anne Lamott', source: 'Bird by Bird' },
  { text: 'How we spend our days is, of course, how we spend our lives.', author: 'Annie Dillard', source: 'The Writing Life' },
  { text: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear', source: 'Atomic Habits' },
  { text: 'You have done what you could; some blunders and absurdities no doubt crept in; forget them as soon as you can.', author: 'Ralph Waldo Emerson', source: 'letter to his daughter' },
  { text: 'Courage does not always roar. Sometimes courage is the quiet voice at the end of the day saying, ‘I will try again tomorrow.’', author: 'Mary Anne Radmacher', source: 'Lean Forward into Your Life' },
  { text: 'The journey of a thousand miles begins with a single step.', author: 'Lao Tzu', source: 'Tao Te Ching' },
  { text: 'Isn’t it nice to think that tomorrow is a new day with no mistakes in it yet?', author: 'L. M. Montgomery', source: 'Anne of Green Gables' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act but a habit.', author: 'Will Durant', source: 'The Story of Philosophy' },
  { text: 'Let your affairs be as two or three, and not a hundred or a thousand.', author: 'Henry David Thoreau', source: 'Walden' },
  { text: 'Not all those who wander are lost.', author: 'J. R. R. Tolkien', source: 'The Fellowship of the Ring' },
  { text: 'What you do every day matters more than what you do once in a while.', author: 'Gretchen Rubin' },
  { text: 'Sitting quietly, doing nothing, spring comes, and the grass grows by itself.', author: 'Zen saying', source: 'Zenrin Kushū' },
  { text: 'A small daily task, if it be really daily, will beat the labours of a spasmodic Hercules.', author: 'Anthony Trollope', source: 'An Autobiography' },
  { text: 'Traveler, there is no path. The path is made by walking.', author: 'Antonio Machado', source: 'Proverbios y cantares' },
  { text: 'Almost everything will work again if you unplug it for a few minutes, including you.', author: 'Anne Lamott', source: 'TED, 2017' },
  { text: 'Every action you take is a vote for the type of person you wish to become.', author: 'James Clear', source: 'Atomic Habits' },
  { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius', source: 'Meditations, trans. Gregory Hays' },
  { text: 'Well begun is half done.', author: 'Proverb' },
  { text: 'Motivation is what gets you started. Habit is what keeps you going.', author: 'Jim Ryun' },
  { text: 'The strongest of all warriors are these two — Time and Patience.', author: 'Leo Tolstoy', source: 'War and Peace' },
  { text: 'Diligence is the mother of good luck.', author: 'Benjamin Franklin', source: 'Poor Richard’s Almanack' },
  { text: 'You can do anything, but not everything.', author: 'David Allen' },
  { text: 'Do not let what you cannot do interfere with what you can do.', author: 'John Wooden' },
  { text: 'Fall seven times, stand up eight.', author: 'Japanese proverb' },
  { text: 'Little by little fills the measure.', author: 'Swahili proverb' },
  { text: 'The best is the enemy of the good.', author: 'Voltaire', source: 'La Bégueule, quoting an Italian proverb' },
  { text: 'Before enlightenment: chop wood, carry water. After enlightenment: chop wood, carry water.', author: 'Zen proverb' },
  { text: 'We suffer more often in imagination than in reality.', author: 'Seneca', source: 'Letters to Lucilius' },
  { text: 'Write it on your heart that every day is the best day in the year.', author: 'Ralph Waldo Emerson', source: 'Works and Days' },
  { text: 'Although the world is full of suffering, it is full also of the overcoming of it.', author: 'Helen Keller', source: 'Optimism' },
  { text: 'There is nothing so useless as doing efficiently that which should not be done at all.', author: 'Peter Drucker' },
  { text: 'It is good to have an end to journey toward; but it is the journey that matters, in the end.', author: 'Ursula K. Le Guin', source: 'The Left Hand of Darkness' },
  { text: 'It is not enough to be industrious; so are the ants. What are you industrious about?', author: 'Henry David Thoreau', source: 'letter to H. G. O. Blake, 1857' },
  { text: 'Do the thing, and you shall have the power.', author: 'Ralph Waldo Emerson', source: 'Compensation' },
]

const EPOCH = '2026-01-01'

export function quoteForDate(date: string): Quote {
  const count = QUOTES.length
  const index = ((daysBetween(EPOCH, date) % count) + count) % count
  return QUOTES[index]
}
