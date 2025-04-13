import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { WordArrangementExerciseDetail, WordArrangementExerciseRequest, Sentence, LanguageType } from '../models/word-arrangement-exercise.model';

@Injectable({
  providedIn: 'root'
})
export class WordArrangementExerciseService {
  constructor(private http: HttpClient) {}

  // Get word arrangement exercise details by ID
  getWordArrangementExerciseDetail(exerciseId: number): Observable<any> {
    // Uncomment to use real API
    // return this.http.get<any>(`${environment.apiUrl}/exercises/${exerciseId}/word-arrangement`);

    // Mock response for development
    return of({
      code: 1000,
      message: 'Success',
      result: this.getMockExerciseDetail(exerciseId)
    });
  }

  // Get sentences for a lesson or topic
  getSentences(lessonId?: number): Observable<any> {
    // Uncomment to use real API
    // return this.http.get<any>(`${environment.apiUrl}/sentences`, {
    //   params: { lessonId: lessonId?.toString() || '' }
    // });

    // Mock response for development
    return of({
      code: 1000,
      message: 'Success',
      result: this.getMockSentences()
    });
  }

  // Save word arrangement exercise (create or update)
  saveWordArrangementExercise(payload: WordArrangementExerciseRequest, isUpdate: boolean): Observable<any> {
    // Uncomment to use real API
    // if (isUpdate) {
    //   return this.http.put<any>(`${environment.apiUrl}/exercises/word-arrangement`, payload);
    // } else {
    //   return this.http.post<any>(`${environment.apiUrl}/exercises/word-arrangement`, payload);
    // }

    // Mock response for development
    console.log('Saving word arrangement exercise:', payload, 'isUpdate:', isUpdate);
    return of({
      code: 1000,
      message: 'Success',
      result: {
        exerciseId: payload.exerciseId || 999,
        sentenceId: payload.sentenceId,
        sourceLanguage: payload.sourceLanguage,
        targetLanguage: payload.targetLanguage,
        options: payload.options
      }
    });
  }

  // Mock data for development
  private getMockExerciseDetail(exerciseId: number): WordArrangementExerciseDetail {
    return {
      exerciseId: exerciseId,
      exerciseName: 'Sắp xếp từ',
      instruction: 'Sắp xếp các từ để tạo thành câu hoàn chỉnh',
      sentenceId: 101,
      sentence: {
        sentenceId: 101,
        englishText: 'She is a girl',
        vietnameseText: 'Em ấy là một bé gái'
      },
      sourceLanguage: LanguageType.ENGLISH,
      targetLanguage: LanguageType.VIETNAMESE,
      options: [
        { id: 1, wordArrangementExerciseId: 1, wordText: 'Em', isDistractor: false, correctPosition: 0 },
        { id: 2, wordArrangementExerciseId: 1, wordText: 'ấy', isDistractor: false, correctPosition: 1 },
        { id: 3, wordArrangementExerciseId: 1, wordText: 'là', isDistractor: false, correctPosition: 2 },
        { id: 4, wordArrangementExerciseId: 1, wordText: 'một', isDistractor: false, correctPosition: 3 },
        { id: 5, wordArrangementExerciseId: 1, wordText: 'bé', isDistractor: false, correctPosition: 4 },
        { id: 6, wordArrangementExerciseId: 1, wordText: 'gái', isDistractor: false, correctPosition: 5 },
        { id: 7, wordArrangementExerciseId: 1, wordText: 'trai', isDistractor: true, correctPosition: null }
      ]
    };
  }

  private getMockSentences(): Sentence[] {
    return [
      {
        sentenceId: 101,
        englishText: 'She is a girl',
        vietnameseText: 'Em ấy là một bé gái',
        isSelectedByAnotherExercise: false
      },
      {
        sentenceId: 102,
        englishText: 'He is a boy',
        vietnameseText: 'Em ấy là một bé trai',
        isSelectedByAnotherExercise: false
      },
      {
        sentenceId: 103,
        englishText: 'This is my book',
        vietnameseText: 'Đây là quyển sách của tôi',
        isSelectedByAnotherExercise: true
      },
      {
        sentenceId: 104,
        englishText: 'I like to learn languages',
        vietnameseText: 'Tôi thích học ngôn ngữ',
        isSelectedByAnotherExercise: false
      },
      {
        sentenceId: 105,
        englishText: 'They are my friends',
        vietnameseText: 'Họ là bạn của tôi',
        isSelectedByAnotherExercise: false
      }
    ];
  }
}
