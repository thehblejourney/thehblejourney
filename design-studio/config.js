window.HBLE_STUDIO_CONFIG = {
  brand: 'HBLE Studios',
  legal: 'HBLE Enterprises Inc.',
  title: 'HBLE Design Studio',
  tagline: 'Choose it. Customize it. Let HBLE create it.',
  quoteNote: 'Submitting this form requests a quote. It does not create a payment obligation or guarantee a final price.',
  categories: [
    'All',
    'Invitations & Celebrations',
    'Memorial & Legacy',
    'Business & Promotion',
    'Music & Media',
    'Sports & Recognition',
    'Custom'
  ],
  addOns: [
    { id: 'rush', label: 'Rush delivery review' },
    { id: 'extra-revision', label: 'Additional revision round' },
    { id: 'animated', label: 'Animated / motion version' },
    { id: 'social-version', label: 'Matching social-media version' },
    { id: 'print-ready', label: 'Print-ready version' },
    { id: 'matching-flyer', label: 'Matching flyer or companion design' },
    { id: 'thank-you', label: 'Matching thank-you card' },
    { id: 'event-package', label: 'Full event design package' }
  ],
  fieldTemplates: {
    event: [
      { id: 'event_date', label: 'Event date', type: 'date' },
      { id: 'event_time', label: 'Event time', type: 'text', placeholder: 'Example: 6:00 PM' },
      { id: 'venue', label: 'Venue / location', type: 'text' },
      { id: 'rsvp', label: 'RSVP details', type: 'text', placeholder: 'Name, phone, email, deadline, or link' },
      { id: 'theme', label: 'Theme / vibe', type: 'text', placeholder: 'Elegant, luxury, fun, vintage, modern…' },
      { id: 'wording', label: 'Exact wording to include', type: 'textarea' }
    ],
    memorial: [
      { id: 'honoree_name', label: 'Full name of loved one', type: 'text' },
      { id: 'life_dates', label: 'Birth and passing dates', type: 'text', placeholder: 'Example: March 2, 1954 – October 10, 2026' },
      { id: 'service_details', label: 'Service / memorial details', type: 'textarea' },
      { id: 'tone', label: 'Preferred tone', type: 'text', placeholder: 'Classic, peaceful, elegant, celebratory…' },
      { id: 'wording', label: 'Obituary, tribute, scripture, poem, or wording', type: 'textarea' }
    ],
    business: [
      { id: 'business_name', label: 'Business / organization name', type: 'text' },
      { id: 'headline', label: 'Main headline / offer', type: 'text' },
      { id: 'call_to_action', label: 'Call to action', type: 'text', placeholder: 'Call now, RSVP, Shop today, Visit us…' },
      { id: 'contact_details', label: 'Contact details to display', type: 'textarea' },
      { id: 'platform_size', label: 'Where will this design be used?', type: 'text', placeholder: 'Instagram, Facebook, print, 5x7, poster, menu…' }
    ],
    media: [
      { id: 'project_title', label: 'Title / project name', type: 'text' },
      { id: 'creator_name', label: 'Artist / creator / host name', type: 'text' },
      { id: 'platform_size', label: 'Platform / required size', type: 'text', placeholder: 'Spotify, YouTube, podcast cover, print poster…' },
      { id: 'concept', label: 'Concept / visual direction', type: 'textarea' },
      { id: 'text', label: 'Exact text to include', type: 'textarea' }
    ],
    sports: [
      { id: 'athlete_name', label: 'Athlete / honoree name', type: 'text' },
      { id: 'team_school', label: 'Team / school / organization', type: 'text' },
      { id: 'colors', label: 'Team / school colors', type: 'text' },
      { id: 'number_position', label: 'Jersey number / position / role', type: 'text' },
      { id: 'achievement', label: 'Achievement / announcement / wording', type: 'textarea' }
    ],
    custom: [
      { id: 'need', label: 'What do you want HBLE to create?', type: 'textarea' },
      { id: 'purpose', label: 'What is the design for?', type: 'text' },
      { id: 'size', label: 'Size / platform if known', type: 'text' },
      { id: 'must_have', label: 'Must-have elements', type: 'textarea' }
    ]
  }
};
