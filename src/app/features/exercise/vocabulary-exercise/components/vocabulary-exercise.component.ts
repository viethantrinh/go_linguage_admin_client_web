// src/app/features/exercise/vocabulary-exercise/components/vocabulary-exercise.component.ts
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ButtonDirective} from '@coreui/angular';
import {IconDirective} from '@coreui/icons-angular';
import {finalize} from 'rxjs';
import {VocabularyExerciseService} from '../services/vocabulary-exercise.service';
import {VocabularyExerciseDetail, VocabularyWord} from '../models/vocabulary-exercise.model';

@Component({
  selector: 'gl-vocabulary-exercise',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonDirective,
    IconDirective,
  ],
  templateUrl: './vocabulary-exercise.component.html',
  styleUrl: './vocabulary-exercise.component.scss'
})
export class VocabularyExerciseComponent implements OnInit {
  @Input() exercise: any;
  @Input() lessonId: number | null = null;
  @Output() exerciseSaved = new EventEmitter<void>();

  vocabularyForm!: FormGroup;
  isLoading = false;
  vocabularyWords: VocabularyWord[] = [];
  selectedWordId: number | null = null;
  errorMessage: string | null = null;
  exerciseDetail: VocabularyExerciseDetail | null = null;

  constructor(
    private fb: FormBuilder,
    private vocabularyExerciseService: VocabularyExerciseService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadExerciseDetail();
  }

  initForm(): void {
    this.vocabularyForm = this.fb.group({
      wordId: [this.selectedWordId, Validators.required]
    });
  }

  loadExerciseDetail(): void {
    if (!this.exercise?.id) {
      this.errorMessage = 'Không tìm thấy thông tin bài tập.';
      return;
    }

    this.isLoading = true;
    this.vocabularyExerciseService.getVocabularyExerciseDetail(this.exercise.id)
      .pipe(finalize(() => {
        // After loading exercise details, load vocabulary words
        this.loadVocabularyWords();
      }))
      .subscribe({
        next: (response) => {
          if (response.code === 1000) {
            this.exerciseDetail = response.result;

            // Check if there's a related word to set the selected word ID
            if (this.exerciseDetail.relatedWordId) {
              this.selectedWordId = this.exerciseDetail.relatedWordId;
              this.vocabularyForm.patchValue({
                wordId: this.selectedWordId
              });
            }
          } else {
            this.errorMessage = `Lỗi: ${response.message}`;
          }
        },
        error: (error) => {
          console.error('Error loading exercise detail:', error);
          this.errorMessage = 'Không thể tải thông tin bài tập. Vui lòng thử lại.';
        }
      });
  }

  loadVocabularyWords(): void {
    if (!this.exercise?.id) {
      this.isLoading = false;
      return;
    }

    this.vocabularyExerciseService.getVocabularyWordsByExerciseId(this.exercise.id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 1000) {
            this.vocabularyWords = response.result;
          } else {
            this.errorMessage = `Lỗi: ${response.message}`;
          }
        },
        error: (error) => {
          console.error('Error loading vocabulary words:', error);
          this.errorMessage = 'Không thể tải danh sách từ vựng. Vui lòng thử lại.';
        }
      });
  }

  saveVocabulary(): void {
    if (this.vocabularyForm.invalid) return;

    const wordId = this.vocabularyForm.get('wordId')?.value;
    this.isLoading = true;

    // Prepare payload for API call
    const payload = {
      exerciseId: this.exercise?.id,
      wordId: wordId
    };

    // Determine if this is an update (already has a selected word) or create
    const isUpdate = !!this.selectedWordId;

    this.vocabularyExerciseService.saveVocabularyExercise(payload, isUpdate)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 1000) {
            this.selectedWordId = wordId;
            this.exerciseSaved.emit();
          } else {
            this.errorMessage = `Lỗi: ${response.message}`;
          }
        },
        error: (error) => {
          console.error('Error saving vocabulary exercise:', error);
          this.errorMessage = 'Không thể lưu bài tập. Vui lòng thử lại.';
        }
      });
  }

  playAudio(audioUrl: string): void {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(error => console.error('Error playing audio:', error));
    }
  }

  isWordDisabled(word: VocabularyWord): boolean {
    // A word is disabled if it's already selected by another exercise
    // Unless it's the currently selected word for this exercise
    return word.isSelectedByAnotherExercise && word.wordId !== this.selectedWordId;
  }
}
