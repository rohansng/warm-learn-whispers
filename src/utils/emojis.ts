
export const getRandomEmoji = (): string => {
  const emojis = ['🌟', '✨', '💡', '🎯', '🚀', '🌸', '🦋', '🌺', '🍀', '🎨', '📚', '💎', '🌈', '🎪', '🎭', '🎪', '🎠', '🎨', '🎯', '🎲'];
  return emojis[Math.floor(Math.random() * emojis.length)];
};

export const getCategoryEmoji = (tags: string[]): string => {
  const categoryEmojis: { [key: string]: string } = {
    coding: '💻',
    design: '🎨',
    life: '🌱',
    work: '💼',
    learning: '📚',
    health: '🏃‍♀️',
    food: '🍳',
    travel: '✈️',
    music: '🎵',
    books: '📖',
    science: '🔬',
    nature: '🌿',
    fitness: '💪',
    cooking: '👨‍🍳',
    photography: '📸',
    art: '🖼️',
    tech: '⚡',
    business: '📈',
    mindfulness: '🧘‍♀️',
    creativity: '💫'
  };

  for (const tag of tags) {
    const cleanTag = tag.replace('#', '').toLowerCase();
    if (categoryEmojis[cleanTag]) {
      return categoryEmojis[cleanTag];
    }
  }

  return getRandomEmoji();
};
