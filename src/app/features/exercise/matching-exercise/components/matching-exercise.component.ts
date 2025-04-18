import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  AlertComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  FormLabelDirective,
  FormSelectDirective,
  RowComponent,
  SpinnerComponent,
  TextColorDirective
} from '@coreui/angular';
import {IconDirective} from '@coreui/icons-angular';
import {finalize} from 'rxjs';
import {MatchingExerciseDetail, Word} from '../models/matching-exercise.model';
import {MatchingExerciseService} from '../services/matching-exercise.service';

/**
 * @description
 * The MatchingExerciseComponent manages the creation and editing of matching exercises.
 * It provides a form interface for configuring matching pairs of vocabulary words.
 *
 * The component supports:
 * - Creating a list of words to match
 * - Adding/removing word pairs
 * - Loading existing exercises for editing
 */
@Component({
  selector: 'gl-matching-exercise',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextColorDirective,
    FormLabelDirective,
    ContainerComponent,
    AlertComponent,
    SpinnerComponent,
    FormSelectDirective,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    ButtonDirective,
    IconDirective,
  ],
  templateUrl: './matching-exercise.component.html',
  styleUrl: './matching-exercise.component.scss'
})
export class MatchingExerciseComponent implements OnInit {
  /** The exercise object being edited or created */
  @Input() exercise: any;

  /** Optional lesson ID to associate the exercise with */
  @Input() lessonId: number | null = null;

  /** Event emitted when the exercise is successfully saved */
  @Output() exerciseSaved = new EventEmitter<void>();

  /** Form group for managing matching exercise data */
  matchingExerciseForm!: FormGroup;

  /** Flag indicating whether an API operation is in progress */
  isLoading = false;

  /** Error message to display to the user */
  errorMessage: string | null = null;

  /** Stores detailed information about the exercise being edited */
  exerciseDetail: MatchingExerciseDetail | null = null;

  /** Collection of words available for this exercise */
  words: Word[] = [];

  /**
   * Constructor initializes required services
   * @param fb FormBuilder for creating reactive forms
   * @param matchingExerciseService Service for matching exercise API calls
   */
  constructor(
    private fb: FormBuilder,
    private matchingExerciseService: MatchingExerciseService
  ) { }

  /**
   * Initializes the component, sets up the form, and loads necessary data
   */
  ngOnInit(): void {
    console.log('Exercise input:', this.exercise); // Debug log to check structure
    this.initForm();

    // Load existing exercise details if editing
    if (this.exercise?.id) {
      this.loadExerciseDetail();
    }

    this.loadWords();
  }

  /**
   * Initializes the reactive form structure with default values
   * Sets up form control listeners for dynamic validation
   */
  initForm(): void {
    this.matchingExerciseForm = this.fb.group({
      matchingPairs: this.fb.array([])
    });

    // Add at least one matching pair to start with
    if (this.matchingPairsArray.length === 0) {
      this.addMatchingPair();
    }
  }

  /**
   * Getter for the matching pairs FormArray to easily access in the template and methods
   * @returns FormArray containing matching pair form groups
   */
  get matchingPairsArray(): FormArray {
    return this.matchingExerciseForm.get('matchingPairs') as FormArray;
  }

  /**
   * Creates a new form group structure for a matching pair
   * @returns FormGroup for representing a single matching pair
   */
  createMatchingPairFormGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      wordId: [null, Validators.required]
    });
  }

  /**
   * Adds a new matching pair to the form
   */
  addMatchingPair(): void {
    if (this.matchingPairsArray.length < 3) { // Limit to maximum 3 pairs
      this.matchingPairsArray.push(this.createMatchingPairFormGroup());
    }
  }

  /**
   * Removes a matching pair from the form, maintaining at least 1 pair
   * @param index Array index of the matching pair to remove
   */
  removeMatchingPair(index: number): void {
    if (this.matchingPairsArray.length > 1) {
      this.matchingPairsArray.removeAt(index);
    }
  }

  /**
   * Loads word data from the API for use in the exercise
   * Words are used as matching pairs in the exercise
   */
  loadWords(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Load words using the exercise ID if available
    this.matchingExerciseService.getWords(this.exercise?.id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 1000 && response.result) {
            this.words = response.result;
            console.log('Words loaded:', this.words);
          } else {
            this.errorMessage = 'Could not load words list';
          }
        },
        error: (error) => {
          console.error('Error loading words:', error);
          this.errorMessage = 'Error loading vocabulary words. Please try again.';
        }
      });
  }

  /**
   * Loads exercise details from the API when editing an existing exercise
   * Handles error states and sets loading indicators
   */
  loadExerciseDetail(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.matchingExerciseService.getMatchingExerciseDetail(this.exercise.id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 1000 && response.result) {
            this.exerciseDetail = response.result;
            console.log('Exercise detail loaded:', this.exerciseDetail);
            this.populateForm();
          } else {
            this.errorMessage = 'Could not load exercise details';
          }
        },
        error: (error) => {
          console.error('Error loading exercise details:', error);
          this.errorMessage = 'Error loading exercise details. Please try again.';
        }
      });
  }

  /**
   * Fills the form with data from an existing exercise
   * Sets up the matching pairs from the loaded exercise data
   */
  populateForm(): void {
    if (!this.exerciseDetail) return;

    // Clear existing matching pairs
    while (this.matchingPairsArray.length !== 0) {
      this.matchingPairsArray.removeAt(0);
    }

    // Add matching pairs from exercise detail
    this.exerciseDetail.matchingPairs.forEach(pair => {
      const pairGroup = this.createMatchingPairFormGroup();
      pairGroup.patchValue({
        id: pair.id,
        wordId: pair.word?.wordId // Access wordId from the nested word object
      });
      this.matchingPairsArray.push(pairGroup);
    });

    // If no matching pairs were added, add one empty pair
    if (this.matchingPairsArray.length === 0) {
      this.addMatchingPair();
    }
  }

  /**
   * Saves the matching exercise to the API
   * Performs validation before submission
   * Emits an event when successful
   */
  saveMatchingExercise(): void {
    if (this.matchingExerciseForm.invalid) {
      this.markFormGroupTouched(this.matchingExerciseForm);
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin cho tất cả các cặp từ vựng.';
      return;
    }

    // Prepare the payload
    const payload = {
      exerciseId: this.exercise.id,
      matchingPairs: this.matchingPairsArray.controls.map(control => {
        return {
          id: control.get('id')?.value || null,
          wordId: control.get('wordId')?.value
        };
      })
    };

    this.isLoading = true;
    const isUpdate = !!this.exercise?.id && !!this.exerciseDetail && this.exercise?.id === this.exerciseDetail.exerciseId;

    this.matchingExerciseService.saveMatchingExercise(payload, isUpdate)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 1000) {
            this.exerciseSaved.emit();
          } else {
            this.errorMessage = `Lỗi: ${response.message}`;
          }
        },
        error: (error) => {
          console.error('Error saving matching exercise:', error);
          this.errorMessage = 'Không thể lưu bài tập. Vui lòng thử lại.';
        }
      });
  }

  /**
   * Recursively marks all controls in a form group as touched
   * Used for displaying validation errors after a failed submission
   * @param formGroup The form group to process
   */
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          } else {
            c.markAsTouched();
          }
        });
      }
    });
  }

  /**
   * Gets the word object for a given word ID
   * Used for displaying word details in the UI
   * @param wordId ID of the word to find
   * @returns The matching word object or undefined if not found
   */
  getWord(wordId: number): Word | undefined {
    return this.words.find(word => word.wordId === wordId);
  }

  /**
   * Checks if a word is already assigned to another exercise
   * @param wordId ID of the word to check
   * @returns True if the word is used in another exercise and should be disabled
   *
   * Note: Based on new requirements, vocabulary words are not restricted by isSelectedByAnotherExercise
   * for matching exercises, so this method should always return false
   */
  isWordDisabled(wordId: number): boolean {
    // For matching exercises, any word from the topic can be used
    return false;
  }

  /**
   * Plays audio from a URL
   * Used for previewing word audio
   * @param audioUrl URL of the audio file to play
   */
  playAudio(audioUrl: string): void {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(error => console.error('Error playing audio:', error));
    }
  }
}
