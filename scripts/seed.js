'use strict';
// Run directly: node scripts/seed.js
// Or via SEED=1 npm start

const { migrate } = require('../src/migrate');
migrate();

const artistsRepo = require('../src/repositories/artistsRepo');
const linksRepo = require('../src/repositories/linksRepo');

const HANDLE = 'jane-doe';

if (!artistsRepo.getByHandle(HANDLE)) {
  const artist = artistsRepo.create({
    handle: HANDLE,
    displayName: 'Jane Doe',
    bio: 'Singer-songwriter based in Austin, TX. New album "Neon Fields" out now.',
    avatarUrl: 'https://i.pravatar.cc/200?u=jane-doe',
  });

  const links = [
    { label: 'Spotify', url: 'https://open.spotify.com/', icon: 'spotify' },
    { label: 'Apple Music', url: 'https://music.apple.com/', icon: 'apple' },
    { label: 'YouTube', url: 'https://youtube.com/', icon: 'youtube' },
    { label: 'Instagram', url: 'https://instagram.com/', icon: 'instagram' },
    { label: 'Book a Show', url: 'https://example.com/book', icon: 'calendar' },
  ];

  for (const l of links) {
    linksRepo.create({ artistId: artist.id, ...l });
  }

  console.log(`Seeded artist '${HANDLE}' with ${links.length} links.`);
} else {
  console.log(`Artist '${HANDLE}' already exists — skipping seed.`);
}
