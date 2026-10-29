window.HBLE_DESIGN_SERVICES = [
  { id:'wedding-invitation', title:'Wedding Invitations', category:'Invitations & Celebrations', description:'Elegant digital or print-ready wedding invitations built around the couple, venue and visual theme.', template:'event', extraFields:[
    { id:'couple_names', label:'Names exactly as they should appear', type:'text' },
    { id:'wedding_style', label:'Wedding style / colors', type:'text', placeholder:'Black & gold, garden, modern luxury…' }
  ]},
  { id:'save-the-date', title:'Save-the-Date Designs', category:'Invitations & Celebrations', description:'Early announcement designs for weddings, anniversaries and milestone celebrations.', template:'event' },
  { id:'wedding-program', title:'Wedding Programs', category:'Invitations & Celebrations', description:'Ceremony programs with the order of service, wedding party and special acknowledgments.', template:'event', extraFields:[
    { id:'wedding_party', label:'Wedding party names / roles', type:'textarea' },
    { id:'ceremony_order', label:'Ceremony order / program content', type:'textarea' }
  ]},
  { id:'anniversary-invitation', title:'Anniversary Party Invitations', category:'Invitations & Celebrations', description:'Celebration invitations for milestone anniversaries with a polished, personal look.', template:'event', extraFields:[
    { id:'honoree_names', label:'Names of the couple / honorees', type:'text' },
    { id:'years', label:'Years being celebrated', type:'text', placeholder:'25 years, 50 years…' }
  ]},
  { id:'graduation-invitation', title:'Graduation Party Invitations', category:'Invitations & Celebrations', description:'Graduation announcements and party invitations designed around the graduate and school identity.', template:'event', extraFields:[
    { id:'graduate_name', label:'Graduate name', type:'text' },
    { id:'school', label:'School / college / university', type:'text' },
    { id:'degree', label:'Degree, program, honor, or achievement', type:'text' },
    { id:'class_year', label:'Class year', type:'text' }
  ]},
  { id:'retirement-invitation', title:'Retirement Party Invitations', category:'Invitations & Celebrations', description:'Professional retirement celebration graphics honoring the person, career and next chapter.', template:'event', extraFields:[
    { id:'honoree_name', label:'Retiree / honoree name', type:'text' },
    { id:'company', label:'Company / organization', type:'text' },
    { id:'years_service', label:'Years of service', type:'text' },
    { id:'career_note', label:'Career title, department, or special message', type:'textarea' }
  ]},
  { id:'baby-shower', title:'Baby Shower Invitations', category:'Invitations & Celebrations', description:'Personalized shower invitations that can match a theme, color palette or nursery style.', template:'event', extraFields:[
    { id:'parent_names', label:'Parent(s) / honoree names', type:'text' },
    { id:'baby_name', label:'Baby name if you want it included', type:'text' }
  ]},
  { id:'gender-reveal', title:'Gender Reveal Invitations', category:'Invitations & Celebrations', description:'Reveal-party invitations with custom wording, theme and social-ready versions available.', template:'event' },
  { id:'bridal-shower', title:'Bridal Shower Invitations', category:'Invitations & Celebrations', description:'Bridal shower invitations tailored to the bride, host, theme and event details.', template:'event', extraFields:[{ id:'bride_name', label:'Bride / honoree name', type:'text' }]},
  { id:'engagement-party', title:'Engagement Party Invitations', category:'Invitations & Celebrations', description:'Engagement celebration invitations for couples, families and hosts.', template:'event', extraFields:[{ id:'couple_names', label:'Couple names', type:'text' }]},
  { id:'family-reunion', title:'Family Reunion Flyers & Invitations', category:'Invitations & Celebrations', description:'Family reunion announcements, schedules and event flyers designed to bring the whole weekend together.', template:'event', extraFields:[
    { id:'family_name', label:'Family / reunion name', type:'text' },
    { id:'activities', label:'Activities or weekend schedule', type:'textarea' }
  ]},
  { id:'thank-you-card', title:'Thank-You Cards', category:'Invitations & Celebrations', description:'Matching or standalone thank-you cards for events, customers, families and celebrations.', template:'custom' },

  { id:'obituary-image', title:'Obituary Image Production', category:'Memorial & Legacy', description:'Respectful memorial artwork built around a loved one’s photo, life details and family-selected wording.', template:'memorial', extraFields:[
    { id:'photo_focus', label:'Photo preference / retouching notes', type:'textarea' },
    { id:'display_use', label:'Where will the image be used?', type:'text', placeholder:'Social media, service display, print, keepsake…' }
  ]},
  { id:'funeral-program', title:'Funeral & Memorial Programs', category:'Memorial & Legacy', description:'Multi-section memorial programs for services, tributes, acknowledgments and keepsakes.', template:'memorial', extraFields:[
    { id:'program_sections', label:'Program sections / order of service', type:'textarea' },
    { id:'page_count', label:'Preferred page count / format if known', type:'text' }
  ]},
  { id:'celebration-of-life', title:'Celebration of Life Graphics', category:'Memorial & Legacy', description:'Tribute graphics, event announcements and social images for celebration-of-life gatherings.', template:'memorial' },

  { id:'grand-opening', title:'Business Grand Opening Flyers', category:'Business & Promotion', description:'Grand opening graphics designed to make a new location, launch or relaunch feel established.', template:'business', extraFields:[
    { id:'event_date', label:'Grand opening date / time', type:'text' },
    { id:'address', label:'Business address', type:'text' }
  ]},
  { id:'promo-flyer', title:'Business Promotional Flyers', category:'Business & Promotion', description:'Promotional graphics for offers, services, events, launches and customer campaigns.', template:'business' },
  { id:'business-card', title:'Business Cards', category:'Business & Promotion', description:'Professional card layouts with your contact information, brand style and services.', template:'business', extraFields:[
    { id:'person_name_title', label:'Name / title to display', type:'text' },
    { id:'card_sides', label:'Single-sided or two-sided?', type:'select', options:['Not sure','Single-sided','Two-sided'] }
  ]},
  { id:'menu-food-flyer', title:'Restaurant Menus & Food Flyers', category:'Business & Promotion', description:'Menus, specials, food promos and restaurant marketing graphics made to sell the experience.', template:'business', extraFields:[
    { id:'menu_items', label:'Menu items / prices / specials', type:'textarea' },
    { id:'service_type', label:'Dine-in, takeout, catering, delivery, or event?', type:'text' }
  ]},
  { id:'social-promo', title:'Social Media Promotional Graphics', category:'Business & Promotion', description:'Platform-ready promotional designs for TikTok, Instagram, Facebook and other social channels.', template:'business' },
  { id:'logo-concept', title:'Custom Logo Concepts', category:'Business & Promotion', description:'Original logo concept development based on your business identity, audience and positioning.', template:'business', extraFields:[
    { id:'brand_personality', label:'Brand personality', type:'text', placeholder:'Luxury, bold, playful, premium, rugged…' },
    { id:'logo_words', label:'Exact business name / tagline', type:'textarea' }
  ]},

  { id:'album-cover', title:'Album & Single Cover Art', category:'Music & Media', description:'Cover artwork built around the record, artist identity and release mood.', template:'media', extraFields:[
    { id:'release_type', label:'Release type', type:'select', options:['Single','EP','Album','Mixtape','Other'] }
  ]},
  { id:'podcast-cover', title:'Podcast Cover Art', category:'Music & Media', description:'Podcast artwork that stays recognizable at thumbnail size and supports the show’s identity.', template:'media' },
  { id:'youtube-thumbnail', title:'YouTube Thumbnails & Channel Graphics', category:'Music & Media', description:'Attention-focused thumbnails and channel graphics built for clarity and click appeal.', template:'media' },
  { id:'event-flyer', title:'Event Flyers & Posters', category:'Music & Media', description:'Concert, community, party, showcase and promotional event designs for digital or print use.', template:'event' },
  { id:'event-ticket', title:'Event Tickets & VIP Pass Designs', category:'Music & Media', description:'Ticket, credential and VIP pass artwork that matches the event identity.', template:'event', extraFields:[
    { id:'ticket_type', label:'Ticket / pass type', type:'text', placeholder:'General admission, VIP, staff, media…' },
    { id:'numbering', label:'Need numbering, QR space, or barcode space?', type:'text' }
  ]},

  { id:'sports-player', title:'Sports Flyers & Player Graphics', category:'Sports & Recognition', description:'Player spotlights, game-day graphics, achievements and promotional sports visuals.', template:'sports' },
  { id:'athlete-signing', title:'Athlete Commitment & Signing Graphics', category:'Sports & Recognition', description:'Commitment, signing-day and recruitment graphics that make the announcement feel official.', template:'sports', extraFields:[
    { id:'committed_to', label:'Committed / signing with', type:'text' },
    { id:'announcement_date', label:'Announcement date if needed', type:'date' }
  ]},
  { id:'award-recognition', title:'Award & Recognition Graphics', category:'Sports & Recognition', description:'Recognition graphics for employees, students, athletes, community leaders and honorees.', template:'sports' },
  { id:'certificate', title:'Certificate Designs', category:'Sports & Recognition', description:'Custom certificates for achievement, participation, appreciation and recognition.', template:'custom', extraFields:[
    { id:'recipient_line', label:'Recipient name format', type:'text' },
    { id:'award_line', label:'Award / certificate wording', type:'textarea' },
    { id:'signatures', label:'Signature names / titles / logo notes', type:'textarea' }
  ]},

  { id:'custom-design', title:'Custom Design — Tell Us What You Need', category:'Custom', description:'Don’t see your idea listed? Choose this and describe the visual you want HBLE to build.', template:'custom' }
];
