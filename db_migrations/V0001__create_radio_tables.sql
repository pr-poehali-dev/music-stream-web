CREATE TABLE IF NOT EXISTS tracks (
    id SERIAL PRIMARY KEY,
    youtube_url TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    year TEXT,
    album TEXT,
    cover_url TEXT,
    audio_url TEXT,
    duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS playlist_schedule (
    id SERIAL PRIMARY KEY,
    track_id INTEGER REFERENCES tracks(id),
    scheduled_time TIMESTAMP NOT NULL,
    played_at TIMESTAMP,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listen_stats (
    id SERIAL PRIMARY KEY,
    track_id INTEGER REFERENCES tracks(id),
    listener_ip TEXT,
    listened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INTEGER
);

CREATE INDEX idx_tracks_active ON tracks(is_active);
CREATE INDEX idx_playlist_schedule_time ON playlist_schedule(scheduled_time);
CREATE INDEX idx_listen_stats_track ON listen_stats(track_id);
CREATE INDEX idx_listen_stats_date ON listen_stats(listened_at);