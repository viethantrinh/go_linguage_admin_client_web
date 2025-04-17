import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError, delay, map} from 'rxjs/operators';
import {Song, SongCreateDto, SongStatusResponse, SongUpdateDto, WordTimestamp} from '../models/song.model';
import {TOKEN_KEY} from '../../../shared/utils/app.constants';
import {ApiResponse} from '../../../core/models/api-response.model';

export interface LyricsData {
  english: string;
  vietnamese: string;
}

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private apiUrl = 'http://192.168.1.22:8080/api/songs';

  constructor(private http: HttpClient) { }

  // Create a new song with lyrics using Groq AI
  createSongWithLyrics(songData: SongCreateDto): Observable<Song> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);

    return this.http.post<ApiResponse<Song>>(`${this.apiUrl}`, songData, { headers })
      .pipe(
        map(response => {
          if (response.code === 1000) {
            return response.result;
          }
          throw new Error(response.message);
        }),
        catchError(error => {
          console.error('Error creating song:', error);
          return throwError(() => error);
        })
      );
  }

  // Generate audio for an existing song using Suno AI
  generateSongAudio(songId: number): Observable<Song> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.post<ApiResponse<Song>>(`${this.apiUrl}/${songId}/audio`, {}, { headers })
      .pipe(
        map(response => {
          if (response.code === 1000) {
            return response.result;
          }
          throw new Error(response.message);
        }),
        catchError(error => {
          console.error('Error generating audio:', error);
          return throwError(() => error);
        })
      );
  }

  // Check the status of audio generation
  checkSongStatus(songId: number): Observable<SongStatusResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.post<ApiResponse<SongStatusResponse>>(`${this.apiUrl}/${songId}/status`, {}, { headers })
      .pipe(
        map(response => {
          if (response.code === 1000) {
            return response.result;
          }
          throw new Error(response.message);
        }),
        catchError(error => {
          console.error('Error checking song status:', error);
          return throwError(() => error);
        })
      );
  }

  // Force alignment for song lyrics
  forceAlignmentLyrics(songId: number): Observable<Song> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.post<ApiResponse<Song>>(`${this.apiUrl}/${songId}/force-alignment`, {}, { headers })
      .pipe(
        map(response => {
          if (response.code === 1000) {
            return response.result;
          }
          throw new Error(response.message);
        }),
        catchError(error => {
          console.error('Error during force alignment:', error);
          return throwError(() => error);
        })
      );
  }

  // Get all songs (paginated) - keeping this for compatibility
  getSongs(page: number = 1, limit: number = 10): Observable<{ items: Song[], totalCount: number }> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<{ items: Song[], totalCount: number }>>(`${this.apiUrl}?page=${page}&limit=${limit}`, { headers })
      .pipe(
        map(response => {
          if (response.code === 1000) {
            return response.result;
          }
          return { items: [], totalCount: 0 };
        }),
        catchError(error => {
          console.error('Error fetching songs:', error);
          return of({ items: [], totalCount: 0 });
        })
      );
  }

  // Get a single song by ID
  getSongById(id: number): Observable<Song> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<Song>>(`${this.apiUrl}/${id}`, { headers })
      .pipe(
        map(response => {
          if (response.code === 1000) {
            return response.result;
          }
          throw new Error('Song not found');
        }),
        catchError(error => {
          console.error(`Error fetching song with ID ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  // Update an existing song
  updateSong(song: SongUpdateDto): Observable<Song> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.put<ApiResponse<Song>>(`${this.apiUrl}/${song.id}`, song, { headers })
      .pipe(
        map(response => {
          if (response.code === 1000) {
            return response.result;
          }
          throw new Error(response.message);
        }),
        catchError(error => {
          console.error('Error updating song:', error);
          return throwError(() => error);
        })
      );
  }

  // Delete a song
  deleteSong(id: number): Observable<boolean> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, { headers })
      .pipe(
        map(response => {
          if (response.code === 1000) {
            return true;
          }
          return false;
        }),
        catchError(error => {
          console.error(`Error deleting song with ID ${id}:`, error);
          return of(false);
        })
      );
  }

  // Simulate generating lyrics based on song data
  generateLyrics(formData: {
    songTitle: string;
    genres: {
      pop: boolean;
      rock: boolean;
      ballad: boolean;
      rap: boolean;
      electronic: boolean;
      folk: boolean;
      rnb: boolean;
      jazz: boolean;
    };
    keywords: string;
  }): Observable<LyricsData> {
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
  processAlignment(audioUrl: string): Observable<WordTimestamp[]> {
    console.log('Processing alignment for:', audioUrl);

    // For demo - replace with actual API call
    return of([
      { word: "In", startTime: 0.5, endTime: 0.7 },
      { word: "the", startTime: 0.7, endTime: 0.9 },
      { word: "shadows", startTime: 0.9, endTime: 1.5 },
      { word: "of", startTime: 1.5, endTime: 1.7 },
      { word: "the", startTime: 1.7, endTime: 1.9 },
      { word: "night", startTime: 1.9, endTime: 2.5 },
      { word: "I", startTime: 3.0, endTime: 3.2 },
      { word: "search", startTime: 3.2, endTime: 3.5 },
      { word: "for", startTime: 3.5, endTime: 3.7 },
      { word: "a", startTime: 3.7, endTime: 3.8 },
      { word: "guiding", startTime: 3.8, endTime: 4.3 },
      { word: "light", startTime: 4.3, endTime: 5.0 }
    ]).pipe(delay(2500));
  }

  // Simulate saving to database
  saveSong(data: {
    title: string;
    genres: string[];
    lyrics: LyricsData;
    audioUrl: string;
    wordTimings: WordTimestamp[];
  }): Observable<{ success: boolean, cloudinaryUrl: string }> {
    console.log('Saving song data:', data);

    // For demo - replace with actual API call
    return of({
      success: true,
      cloudinaryUrl: 'https://res.cloudinary.com/demo/video/upload/v1234567890/example_song.mp3'
    }).pipe(delay(2000));
  }

  // Mock data for demo purposes
  private getMockSongs(): Song[] {
    return [
      {
        id: 1,
        name: 'Memories of Home',
        englishLyric: 'In the shadows of the night\nI search for a guiding light',
        vietnameseLyric: 'Trong bóng tối của đêm\nTôi tìm kiếm ánh sáng dẫn đường',
        audioUrl: 'https://example.com/songs/memories.mp3',
        creationStatus: 'lyric_created',
        timestamps: [
          { word: "In", startTime: 0.5, endTime: 0.7 },
          { word: "the", startTime: 0.7, endTime: 0.9 },
          { word: "shadows", startTime: 0.9, endTime: 1.5 }
        ]
      },
      {
        id: 2,
        name: 'Summer Breeze',
        englishLyric: 'Summer breeze makes me feel fine\nBlowing through the jasmine in my mind',
        vietnameseLyric: 'Làn gió mùa hè khiến tôi cảm thấy tuyệt vời\nThổi qua hoa nhài trong tâm trí tôi',
        audioUrl: 'https://example.com/songs/summer.mp3',
        creationStatus: 'lyric_created'
      },
      {
        id: 3,
        name: 'Neon Lights',
        englishLyric: 'Neon lights are flashing bright\nPulsing through the city tonight',
        vietnameseLyric: 'Đèn neon lấp lánh sáng rực\nRộn ràng khắp thành phố đêm nay',
        audioUrl: 'https://example.com/songs/neon.mp3',
        creationStatus: 'lyric_created'
      }
    ];
  }
}
