import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {delay, map} from 'rxjs/operators';
import {Song, SongCreateDto, SongResponse, SongUpdateDto} from '../models/song.model';

export interface SongGenres {
  pop: boolean;
  rock: boolean;
  ballad: boolean;
  rap: boolean;
  electronic: boolean;
  folk: boolean;
  rnb: boolean;
  jazz: boolean;
}

export interface SongFormData {
  songTitle: string;
  genres: SongGenres;
  keywords: string;
}

export interface LyricsData {
  english: string;
  vietnamese: string;
}

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private apiUrl = 'api/songs'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) { }

  // Simulate generating lyrics based on song data
  generateLyrics(formData: SongFormData): Observable<LyricsData> {
    console.log('Generating lyrics with data:', formData);

    // For demo - replace with actual API call
    return of({
      english: "Verse 1:\nIn the shadows of the night\nI search for a guiding light\nMemories flood through my mind\nOf the love I left behind\n\nChorus:\nChasing dreams under the stars\nWondering where you are\nTime keeps moving on\nBut my heart stays where you've gone",
      vietnamese: "Verse 1:\nTrong bóng tối của đêm\nTôi tìm kiếm ánh sáng dẫn đường\nKý ức tràn qua tâm trí tôi\nVề tình yêu tôi đã bỏ lại phía sau\n\nĐiệp khúc:\nTheo đuổi giấc mơ dưới những vì sao\nTự hỏi em đang ở đâu\nThời gian cứ trôi\nNhưng trái tim tôi vẫn ở nơi em đã đi"
    }).pipe(delay(2000)); // Simulate network delay
  }

  // Simulate generating audio from lyrics
  generateAudio(lyrics: LyricsData): Observable<string> {
    console.log('Generating audio for lyrics');

    // For demo - replace with actual API call
    // Returns a mock audio URL
    return of('https://example.com/song.mp3').pipe(delay(3000));
  }

  // Simulate alignment process
  processAlignment(audioUrl: string): Observable<WordTiming[]> {
    console.log('Processing alignment for:', audioUrl);

    // For demo - replace with actual API call
    return of([
      {word: "In", start: 0.5, end: 0.7},
      {word: "the", start: 0.7, end: 0.9},
      {word: "shadows", start: 0.9, end: 1.5},
      {word: "of", start: 1.5, end: 1.7},
      {word: "the", start: 1.7, end: 1.9},
      {word: "night", start: 1.9, end: 2.5},
      {word: "I", start: 3.0, end: 3.2},
      {word: "search", start: 3.2, end: 3.5},
      {word: "for", start: 3.5, end: 3.7},
      {word: "a", start: 3.7, end: 3.8},
      {word: "guiding", start: 3.8, end: 4.3},
      {word: "light", start: 4.3, end: 5.0}
    ]).pipe(delay(2500));
  }

  // Simulate saving to database
  saveSong(data: {
    title: string,
    genres: string[],
    lyrics: LyricsData,
    audioUrl: string,
    wordTimings: WordTiming[]
  }): Observable<{success: boolean, cloudinaryUrl: string}> {
    console.log('Saving song data:', data);

    // For demo - replace with actual API call
    return of({
      success: true,
      cloudinaryUrl: 'https://res.cloudinary.com/demo/video/upload/v1234567890/example_song.mp3'
    }).pipe(delay(2000));
  }

  // Get all songs (paginated)
  getSongs(page: number = 1, limit: number = 10): Observable<SongResponse> {
    // For demo - replace with actual API call
    return of(this.getMockSongs()).pipe(
      delay(500),
      map(songs => ({
        items: songs.slice((page - 1) * limit, page * limit),
        totalCount: songs.length
      }))
    );
  }

  // Get a single song by ID
  getSongById(id: number): Observable<Song> {
    // For demo - replace with actual API call
    const songs = this.getMockSongs();
    const song = songs.find(s => s.id === id);

    if (song) {
      return of(song).pipe(delay(300));
    }

    return of({
      id: 0,
      title: '',
      englishLyrics: '',
      vietnameseLyrics: '',
      audioUrl: '',
      genres: [],
      createdDate: new Date()
    }).pipe(delay(300));
  }

  // Create a new song
  createSong(song: SongCreateDto): Observable<Song> {
    console.log('Creating song:', song);
    // For demo - replace with actual API call
    const mockSongs = this.getMockSongs();
    const newSong: Song = {
      ...song,
      id: Math.max(...mockSongs.map(s => s.id), 0) + 1,
      createdDate: new Date()
    };

    return of(newSong).pipe(delay(800));
  }

  // Update an existing song
  updateSong(song: SongUpdateDto): Observable<Song> {
    console.log('Updating song:', song);
    // For demo - replace with actual API call
    return of({
      ...song,
      createdDate: new Date()
    } as Song).pipe(delay(800));
  }

  // Delete a song
  deleteSong(id: number): Observable<boolean> {
    console.log('Deleting song with ID:', id);
    // For demo - replace with actual API call
    return of(true).pipe(delay(800));
  }

  // Mock data for demo purposes
  private getMockSongs(): Song[] {
    return [
      {
        id: 1,
        title: 'Memories of Home',
        englishLyrics: 'In the shadows of the night\nI search for a guiding light',
        vietnameseLyrics: 'Trong bóng tối của đêm\nTôi tìm kiếm ánh sáng dẫn đường',
        audioUrl: 'https://example.com/songs/memories.mp3',
        genres: ['pop', 'ballad'],
        createdDate: new Date('2025-01-15'),
        cloudinaryUrl: 'https://res.cloudinary.com/demo/audio/upload/v1234567890/memories.mp3',
        wordTimings: [
          {word: "In", start: 0.5, end: 0.7},
          {word: "the", start: 0.7, end: 0.9},
          {word: "shadows", start: 0.9, end: 1.5}
        ]
      },
      {
        id: 2,
        title: 'Summer Breeze',
        englishLyrics: 'Summer breeze makes me feel fine\nBlowing through the jasmine in my mind',
        vietnameseLyrics: 'Làn gió mùa hè khiến tôi cảm thấy tuyệt vời\nThổi qua hoa nhài trong tâm trí tôi',
        audioUrl: 'https://example.com/songs/summer.mp3',
        genres: ['pop', 'folk'],
        createdDate: new Date('2025-02-20'),
        cloudinaryUrl: 'https://res.cloudinary.com/demo/audio/upload/v1234567890/summer.mp3'
      },
      {
        id: 3,
        title: 'Neon Lights',
        englishLyrics: 'Neon lights are flashing bright\nPulsing through the city tonight',
        vietnameseLyrics: 'Đèn neon lấp lánh sáng rực\nRộn ràng khắp thành phố đêm nay',
        audioUrl: 'https://example.com/songs/neon.mp3',
        genres: ['electronic', 'pop'],
        createdDate: new Date('2025-03-05'),
        cloudinaryUrl: 'https://res.cloudinary.com/demo/audio/upload/v1234567890/neon.mp3'
      },
      {
        id: 4,
        title: 'Mountain Echo',
        englishLyrics: 'Standing tall on mountain peaks\nAn echo of my voice speaks',
        vietnameseLyrics: 'Đứng vững trên đỉnh núi cao\nTiếng vọng của giọng tôi cất lên',
        audioUrl: 'https://example.com/songs/mountain.mp3',
        genres: ['folk', 'acoustic'],
        createdDate: new Date('2025-03-18'),
        cloudinaryUrl: 'https://res.cloudinary.com/demo/audio/upload/v1234567890/mountain.mp3'
      },
      {
        id: 5,
        title: 'Ocean Dreams',
        englishLyrics: 'Waves crashing on the shore\nDreams floating evermore',
        vietnameseLyrics: 'Sóng vỗ bờ cát\nGiấc mơ trôi mãi',
        audioUrl: 'https://example.com/songs/ocean.mp3',
        genres: ['ballad', 'ambient'],
        createdDate: new Date('2025-04-10'),
        cloudinaryUrl: 'https://res.cloudinary.com/demo/audio/upload/v1234567890/ocean.mp3'
      }
    ];
  }
}
