import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const TRACKS_API = 'https://functions.poehali.dev/cccbaa22-d573-4dc2-b723-98c10ad54675';
const STATS_API = 'https://functions.poehali.dev/4e37ebe7-1437-45c6-b23c-6975b0c6a201';

interface Track {
  id: number;
  youtube_url: string;
  title: string;
  artist: string;
  year: string;
  album: string;
  cover_url: string;
}

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playTimeRef = useRef<number>(0);

  const loadPlaylist = async () => {
    try {
      const response = await fetch(`${TRACKS_API}?path=list&limit=100`);
      const data = await response.json();
      setPlaylist(data);
      if (data.length > 0) {
        setCurrentTrack(data[0]);
      }
    } catch (error) {
      console.error('Failed to load playlist:', error);
    }
  };

  useEffect(() => {
    loadPlaylist();
  }, []);

  useEffect(() => {
    if (playlist.length > 0) {
      setCurrentTrack(playlist[currentIndex]);
    }
  }, [currentIndex, playlist]);

  const recordListen = async (trackId: number, duration: number) => {
    try {
      await fetch(STATS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track_id: trackId,
          duration_seconds: Math.floor(duration),
        }),
      });
    } catch (error) {
      console.error('Failed to record listen:', error);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
        playTimeRef.current = Date.now();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    if (currentTrack && playTimeRef.current > 0) {
      const duration = (Date.now() - playTimeRef.current) / 1000;
      recordListen(currentTrack.id, duration);
    }
    
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    playTimeRef.current = Date.now();
  };

  const playPrevious = () => {
    if (currentTrack && playTimeRef.current > 0) {
      const duration = (Date.now() - playTimeRef.current) / 1000;
      recordListen(currentTrack.id, duration);
    }
    
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    playTimeRef.current = Date.now();
  };

  const handleTrackEnd = () => {
    playNext();
    if (isPlaying && audioRef.current) {
      setTimeout(() => audioRef.current?.play(), 500);
    }
  };

  if (!currentTrack) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a] flex items-center justify-center p-4">
        <p className="text-muted-foreground">Загрузка плейлиста...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a] flex items-center justify-center p-4">
      <audio 
        ref={audioRef} 
        src={currentTrack.youtube_url}
        onEnded={handleTrackEnd}
      />
      
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
              Dark <span className="text-primary">Sprinter</span>
            </h1>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={() => window.location.href = '/admin'}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary"
              >
                <Icon name="Settings" size={24} />
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Live Music Stream • {playlist.length} треков в плейлисте
          </p>
        </div>

        <Card className="bg-card border-border overflow-hidden backdrop-blur-lg">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent opacity-50" />
            
            <div className="relative p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative">
                    <img 
                      src={currentTrack.cover_url || 'https://cdn.poehali.dev/projects/8845f950-4107-48a8-a4e0-600bc9922cc9/files/05658163-1b15-459b-8e0d-56e68aa38099.jpg'} 
                      alt={currentTrack.album}
                      className="w-64 h-64 rounded-2xl shadow-2xl object-cover"
                    />
                    {isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute w-full h-full bg-black/20 rounded-2xl animate-pulse-ring" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-6 w-full">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                      {currentTrack.title}
                    </h2>
                    <p className="text-xl text-muted-foreground mb-1">
                      {currentTrack.artist}
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      {currentTrack.album} • {currentTrack.year}
                    </p>
                  </div>

                  {isPlaying && (
                    <div className="flex gap-1 justify-center md:justify-start items-end h-16">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 bg-primary rounded-full animate-wave"
                          style={{
                            animationDelay: `${i * 0.05}s`,
                            height: '100%',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4 justify-center md:justify-start pt-4 items-center">
                    <Button
                      onClick={playPrevious}
                      size="lg"
                      variant="ghost"
                      className="w-12 h-12 rounded-full text-foreground hover:text-primary hover:bg-primary/10"
                    >
                      <Icon name="SkipBack" size={24} />
                    </Button>
                    
                    <Button
                      onClick={togglePlay}
                      size="lg"
                      className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/50 transition-all hover:scale-105"
                    >
                      {isPlaying ? (
                        <Icon name="Pause" size={32} />
                      ) : (
                        <Icon name="Play" size={32} className="ml-1" />
                      )}
                    </Button>
                    
                    <Button
                      onClick={playNext}
                      size="lg"
                      variant="ghost"
                      className="w-12 h-12 rounded-full text-foreground hover:text-primary hover:bg-primary/10"
                    >
                      <Icon name="SkipForward" size={24} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8 space-y-4">
          <div className="text-center text-muted-foreground text-sm">
            <p>Трек {currentIndex + 1} из {playlist.length} • Автопереключение включено</p>
          </div>
          
          {playlist.length > 1 && (
            <Card className="bg-card border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="ListMusic" size={16} />
                Следующие треки
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {playlist.slice(currentIndex + 1, currentIndex + 6).map((track, idx) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setCurrentIndex(currentIndex + idx + 1);
                      if (isPlaying && audioRef.current) {
                        setTimeout(() => audioRef.current?.play(), 100);
                      }
                    }}
                  >
                    <span className="text-xs text-muted-foreground w-6">
                      {currentIndex + idx + 2}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;