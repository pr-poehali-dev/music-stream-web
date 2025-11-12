import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = {
    title: "Midnight Dreams",
    artist: "Electronic Pulse",
    year: "2024",
    album: "Night Waves",
    cover: "https://cdn.poehali.dev/projects/8845f950-4107-48a8-a4e0-600bc9922cc9/files/05658163-1b15-459b-8e0d-56e68aa38099.jpg",
    streamUrl: "https://stream.zenolive.com/d84xzsaw1a0uv"
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a] flex items-center justify-center p-4">
      <audio ref={audioRef} src={currentTrack.streamUrl} />
      
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            Dark <span className="text-primary">Sprinter</span>
          </h1>
          <p className="text-muted-foreground text-lg">Live Electronic Music Stream</p>
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
                      src={currentTrack.cover} 
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

                  <div className="flex gap-4 justify-center md:justify-start pt-4">
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center text-muted-foreground text-sm">
          <p>Streaming live 24/7 • High Quality Audio</p>
        </div>
      </div>
    </div>
  );
};

export default Index;