
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

export const getTagEmoji = (tag: string): string => {
  const tagEmojis: { [key: string]: string } = {
    'programming': '💻',
    'design': '🎨',
    'learning': '📚',
    'work': '💼',
    'life': '🌱',
    'health': '🏃‍♀️',
    'cooking': '👨‍🍳',
    'books': '📖',
    'science': '🔬',
    'technology': '⚡',
    'creativity': '💫',
    'productivity': '⚡',
    'mindfulness': '🧘‍♀️',
    'fitness': '💪',
    'travel': '✈️',
    'music': '🎵',
    'art': '🎨',
    'business': '📈',
    'finance': '💰',
    'communication': '💬'
  };
  
  const cleanTag = tag.toLowerCase();
  return tagEmojis[cleanTag] || '🏷️';
};
