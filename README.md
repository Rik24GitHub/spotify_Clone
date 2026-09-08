# Pulse — Music Streaming App

A Spotify-inspired music streaming web app built with React + Vite, with an optional Supabase backend for authentication, cloud tracks, likes, playlists and persistent data.

## Features

- Responsive music streaming UI
- Search across tracks, artists and albums
- Browser audio playback for tracks with an `audio_url`
- Play / pause / previous / next / seek / volume controls
- Authentication with Supabase email/password
- Persistent sessions
- Cloud track catalogue
- Like/unlike tracks when signed in
- Database schema for profiles, playlists, playlist tracks and likes
- Demo mode works without a backend

## Run locally

```bash
npm install
npm run dev
```

## Enable the backend

1. Create a Supabase project.
2. Open the Supabase SQL Editor and run [`supabase/schema.sql`](./supabase/schema.sql).
3. Copy `.env.example` to `.env.local`.
4. Add your Supabase project URL and publishable key to `.env.local`.
5. Restart the Vite development server.

Never commit `.env.local` or private server keys. Only the Supabase publishable/anon client key belongs in a browser application.

## Adding real music

Insert your own or properly licensed audio into `public.tracks` with an accessible `audio_url`. You can also provide `cover_url`. The app will automatically use those records when the database contains tracks.

Do not upload copyrighted music unless you have the necessary rights or permission.

## Deploy

The project can be deployed to a static hosting service that supports Vite. Add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` environment variables in the hosting provider's project settings.

## Tech stack

React · Vite · Supabase · Lucide React

This project uses original Pulse branding and does not include Spotify proprietary code or assets.
