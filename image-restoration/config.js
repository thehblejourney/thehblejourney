window.HBLERestorationConfig = {
  currency: 'USD',
  maxFiles: 20,
  tiers: [
    {
      id: 'quick',
      name: 'Quick Restore',
      price: 5,
      priceLabel: '$5 / photo',
      description: 'Best for photos that mainly need cleanup and polish.',
      includes: ['Brightness & contrast', 'Color correction', 'Sharpening', 'Light dust & scratch cleanup']
    },
    {
      id: 'full',
      name: 'Full Restoration',
      price: 12,
      priceLabel: '$12 / photo',
      description: 'For visibly aged or damaged photos that need deeper repair.',
      includes: ['Fading & discoloration', 'Scratches & stains', 'Tear repair', 'Detail & facial cleanup']
    },
    {
      id: 'heavy',
      name: 'Heavy Restoration',
      price: 25,
      priceLabel: 'Starting at $25 / photo',
      description: 'For severe damage, missing areas or major reconstruction.',
      startingPrice: true,
      includes: ['Severe damage repair', 'Missing-area reconstruction', 'Major face/detail repair', 'Background reconstruction']
    }
  ],
  addOns: [
    { id: 'colorize', name: 'Colorization', price: 5, perPhoto: true, label: '+$5 / photo' },
    { id: 'printready', name: 'Print-ready enhancement', price: 3, perPhoto: true, label: '+$3 / photo' },
    { id: 'rush', name: 'Rush review', price: 10, perPhoto: false, label: '+$10 / order' }
  ],
  promo: {
    enabled: false,
    label: '$2 Quick Restore bulk promotion',
    price: 2,
    minimumPhotos: 10,
    tierId: 'quick'
  }
};
