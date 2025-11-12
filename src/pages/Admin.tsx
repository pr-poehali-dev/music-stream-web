import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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
  play_count?: number;
}

interface Stats {
  id: number;
  title: string;
  artist: string;
  total_plays: number;
  total_duration: number;
  last_played: string;
}

const Admin = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [bulkInput, setBulkInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadTracks = async () => {
    try {
      const response = await fetch(`${TRACKS_API}?path=list`);
      const data = await response.json();
      setTracks(data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить треки',
        variant: 'destructive',
      });
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(STATS_API);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    loadTracks();
    loadStats();
  }, []);

  const addBulkTracks = async () => {
    setIsLoading(true);
    const lines = bulkInput.trim().split('\n');
    let successCount = 0;
    let errorCount = 0;

    for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.split('|').map(p => p.trim());
      if (parts.length < 3) {
        errorCount++;
        continue;
      }

      const [youtube_url, title, artist, year = '2024', album = 'Single', cover_url = ''] = parts;

      try {
        const response = await fetch(TRACKS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            youtube_url,
            title,
            artist,
            year,
            album,
            cover_url,
          }),
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    setIsLoading(false);
    setBulkInput('');
    loadTracks();
    loadStats();

    toast({
      title: 'Треки добавлены',
      description: `Успешно: ${successCount}, Ошибки: ${errorCount}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white">
            Админ-панель <span className="text-primary">Dark Sprinter</span>
          </h1>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Icon name="Radio" size={20} className="mr-2" />
            К плееру
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Icon name="Music" size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Всего треков</p>
                <p className="text-2xl font-bold text-foreground">{tracks.length}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Icon name="Play" size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Всего прослушиваний</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.reduce((sum, s) => sum + s.total_plays, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Icon name="TrendingUp" size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Топ трек</p>
                <p className="text-lg font-bold text-foreground truncate">
                  {stats[0]?.title || 'Нет данных'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-card border-border p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Массовое добавление треков
          </h2>
          <p className="text-muted-foreground mb-4">
            Формат: <code className="bg-muted px-2 py-1 rounded">YouTube URL | Название | Исполнитель | Год | Альбом | Обложка</code>
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Минимум 3 поля (URL, название, исполнитель). Каждый трек на новой строке.
          </p>
          
          <Textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="https://youtube.com/watch?v=xxx | Midnight Dreams | Electronic Pulse | 2024 | Night Waves | https://example.com/cover.jpg"
            className="min-h-[200px] mb-4 font-mono text-sm bg-background"
          />
          
          <Button
            onClick={addBulkTracks}
            disabled={isLoading || !bulkInput.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Добавляю треки...
              </>
            ) : (
              <>
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить треки ({bulkInput.split('\n').filter(l => l.trim()).length})
              </>
            )}
          </Button>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-card border-border p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Icon name="ListMusic" size={24} />
              Последние треки
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {tracks.slice(0, 10).map((track) => (
                <div
                  key={track.id}
                  className="p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <p className="font-semibold text-foreground">{track.title}</p>
                  <p className="text-sm text-muted-foreground">{track.artist} • {track.year}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                    {track.youtube_url}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Icon name="BarChart3" size={24} />
              Топ треков
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {stats.slice(0, 10).map((stat, index) => (
                <div
                  key={stat.id}
                  className="p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{stat.title}</p>
                      <p className="text-sm text-muted-foreground">{stat.artist}</p>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground/70">
                        <span>{stat.total_plays} прослушиваний</span>
                        {stat.last_played && (
                          <span>Последнее: {new Date(stat.last_played).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
