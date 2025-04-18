import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {ApiResponse} from '../../../../core/models/api-response.model';
import {BASE_REMOTE_URL, TOKEN_KEY} from '../../../../shared/utils/app.constants';
import {MatchingExerciseDetail, MatchingExerciseRequest, Word} from '../models/matching-exercise.model';

@Injectable({
  providedIn: 'root'
})
export class MatchingExerciseService {
  private readonly baseUrl = `${BASE_REMOTE_URL}`;

  // Sample data for development/testing
  private sampleWords: Word[] = [
    {
      wordId: 1,
      englishText: 'Hello',
      vietnameseText: 'Xin chào',
      audioUrl: 'assets/audio/hello.mp3'
    },
    {
      wordId: 2,
      englishText: 'Goodbye',
      vietnameseText: 'Tạm biệt',
      audioUrl: 'assets/audio/goodbye.mp3'
    },
    {
      wordId: 3,
      englishText: 'Thank you',
      vietnameseText: 'Cảm ơn',
      audioUrl: 'assets/audio/thankyou.mp3'
    },
    {
      wordId: 4,
      englishText: 'Sorry',
      vietnameseText: 'Xin lỗi',
      audioUrl: 'assets/audio/sorry.mp3'
    },
    {
      wordId: 5,
      englishText: 'Yes',
      vietnameseText: 'Vâng',
      audioUrl: 'assets/audio/yes.mp3'
    },
    {
      wordId: 6,
      englishText: 'No',
      vietnameseText: 'Không',
      audioUrl: 'assets/audio/no.mp3'
    }
  ];

  // Sample data for development/testing
  private sampleMatchingExerciseDetail: MatchingExerciseDetail = {
    exerciseId: 1,
    exerciseName: 'Basic Greeting Words',
    instruction: 'Match the English words with their Vietnamese translations',
    matchingPairs: [
      { id: 1, matchingExerciseId: 1, wordId: 1, word: this.sampleWords[0] },
      { id: 2, matchingExerciseId: 1, wordId: 2, word: this.sampleWords[1] },
      { id: 3, matchingExerciseId: 1, wordId: 3, word: this.sampleWords[2] }
    ]
  };

  constructor(private http: HttpClient) { }

  /**
   * Get list of available words for matching exercise
   * @param exerciseId ID of the exercise to load words for
   * @returns Observable of words array
   */
  getWords(exerciseId?: number): Observable<ApiResponse<Word[]>> {
    // Real API call to fetch words for matching exercise
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);

    // Use the topic's word list endpoint if we don't have an exerciseId (for creating a new exercise)
    // or use the matching exercise specific endpoint when editing
    if (exerciseId) {
      return this.http.get<ApiResponse<Word[]>>(
        `${this.baseUrl}/words/by-matching-exercise/${exerciseId}`,
        { headers }
      );
    }

    // For development/testing when no exerciseId is provided, return sample data
    // In production, you would need to get words from the topic's word list instead
    // This could be something like: return this.http.get<ApiResponse<Word[]>>(`${this.baseUrl}/words/by-topic/${topicId}`, { headers });
    return of({
      code: 1000,
      message: 'Success',
      timestamp: new Date().toISOString(),
      result: this.sampleWords
    });
  }

  /**
   * Get details of a matching exercise
   * @param exerciseId ID of the exercise to load
   * @returns Observable containing exercise details
   */
  getMatchingExerciseDetail(exerciseId: number): Observable<ApiResponse<MatchingExerciseDetail>> {
    // Real API call to fetch matching exercise details
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<MatchingExerciseDetail>>(
      `${this.baseUrl}/exercises/matching/${exerciseId}`,
      { headers }
    );

    // Keep the sample data return commented out for reference
    // return of({
    //   code: 1000,
    //   message: 'Success',
    //   timestamp: new Date().toISOString(),
    //   result: this.sampleMatchingExerciseDetail
    // });
  }

  /**
   * Save a matching exercise (create or update)
   * @param matchingExercise The exercise data to save
   * @param isUpdate Whether this is an update to an existing exercise
   * @returns Observable with the API response
   */
  saveMatchingExercise(matchingExercise: MatchingExerciseRequest, isUpdate: boolean): Observable<ApiResponse<any>> {
    // Real API calls to save matching exercise
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);

    if (isUpdate) {
      return this.http.put<ApiResponse<any>>(
        `${this.baseUrl}/exercises/matching`,
        matchingExercise,
        { headers }
      );
    } else {
      return this.http.post<ApiResponse<any>>(
        `${this.baseUrl}/exercises/matching`,
        matchingExercise,
        { headers }
      );
    }

    // Keep the sample data return commented out for reference
    // return of({
    //   code: 1000,
    //   message: 'Success',
    //   timestamp: new Date().toISOString(),
    //   result: { exerciseId: matchingExercise.exerciseId }
    // });
  }
}
