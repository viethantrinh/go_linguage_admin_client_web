import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { IconDirective } from '@coreui/icons-angular';
import { finalize } from 'rxjs';
import { LanguageType, Sentence, WordArrangementExerciseDetail, WordArrangementOption } from './models/word-arrangement-exercise.model';
import { WordArrangementExerciseService } from './services/word-arrangement-exercise.service';

/**
 * @description
 * The WordArrangementExerciseComponent manages the creation and editing of word arrangement exercises.
 * It provides a form interface for configuring sentence questions and word options for arrangement.
 * 
 * The component supports:
 * - Selecting a source sentence
 * - Configuring source and target languages
 * - Adding/removing word options
 * - Setting correct positions for each word
 * - Adding distractor words
 */
@Component({
  selector: 'gl-word-arrangement-exercise',
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
  templateUrl: './word-arrangement-exercise.component.html',
  styleUrl: './word-arrangement-exercise.component.scss'
})
export class WordArrangementExerciseComponent implements OnInit {
  /** The exercise object being edited or created */
  @Input() exercise: any;

  /** Optional lesson ID to associate the exercise with */
  @Input() lessonId: number | null = null;

  /** Event emitted when the exercise is successfully saved */
  @Output() exerciseSaved = new EventEmitter<void>();

  /** Form group for managing word arrangement exercise data */
  wordArrangementForm!: FormGroup;

  /** Flag indicating whether an API operation is in progress */
  isLoading = false;

  /** Error message to display to the user */
  errorMessage: string | null = null;

  /** Stores detailed information about the exercise being edited */
  exerciseDetail: WordArrangementExerciseDetail | null = null;

  /** Collection of sentences available for this exercise */
  sentences: Sentence[] = [];

  /** Available language types for source and target selection */
  languageTypes = Object.values(LanguageType);

  /**
   * Constructor initializes required services
   * @param fb FormBuilder for creating reactive forms
   * @param wordArrangementService Service for word arrangement exercise API calls
   */
  constructor(
    private fb: FormBuilder,
    private wordArrangementService: WordArrangementExerciseService
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

    this.loadSentences();

    // Listen for sentence changes to update options
    this.wordArrangementForm.get('sentenceId')?.valueChanges.subscribe(sentenceId => {
      if (sentenceId) {
        this.onSentenceChange(sentenceId);
      }
    });
  }

  /**
   * Initializes the reactive form structure with default values
   * Sets up form control listeners for dynamic validation
   */
  initForm(): void {
    this.wordArrangementForm = this.fb.group({
      sentenceId: [null, Validators.required],
      sourceLanguage: [LanguageType.ENGLISH, Validators.required],
      targetLanguage: [LanguageType.VIETNAMESE, Validators.required],
      options: this.fb.array([])
    });

    // Add at least one option to start with
    if (this.optionsArray.length === 0) {
      this.addOption();
    }
  }

  /**
   * Getter for the options FormArray to easily access in the template and methods
   * @returns FormArray containing option form groups
   */
  get optionsArray(): FormArray {
    return this.wordArrangementForm.get('options') as FormArray;
  }

  /**
   * Creates a new form group structure for an option
   * @param wordText Initial word text value (optional)
   * @param isDistractor Whether this is a distractor option (optional)
   * @param correctPosition The correct position of the word (optional)
   * @returns FormGroup for representing a single word option
   */
  createOptionFormGroup(wordText: string = '', isDistractor: boolean = false, correctPosition: number | null = null): FormGroup {
    return this.fb.group({
      id: [null],
      wordText: [wordText, Validators.required],
      isDistractor: [isDistractor],
      correctPosition: [correctPosition]
    });
  }

  /**
   * Adds a new word option to the form
   */
  addOption(wordText: string = '', isDistractor: boolean = false, correctPosition: number | null = null): void {
    this.optionsArray.push(this.createOptionFormGroup(wordText, isDistractor, correctPosition));
  }

  /**
   * Removes a word option from the form, maintaining at least 1 option
   * @param index Array index of the option to remove
   */
  removeOption(index: number): void {
    if (this.optionsArray.length > 1) {
      this.optionsArray.removeAt(index);

      // Recalculate correct positions after removal if needed
      this.updateCorrectPositions();
    }
  }

  /**
   * Updates the correct positions after adding or removing options
   * Ensures that non-distractor words have valid position values
   */
  updateCorrectPositions(): void {
    // Get only the non-distractor options and sort them by current position
    const nonDistractorControls = this.optionsArray.controls
      .filter(control => !control.get('isDistractor')?.value)
      .sort((a, b) => {
        const posA = a.get('correctPosition')?.value ?? Number.MAX_SAFE_INTEGER;
        const posB = b.get('correctPosition')?.value ?? Number.MAX_SAFE_INTEGER;
        return posA - posB;
      });

    // Reassign positions sequentially starting from 0
    nonDistractorControls.forEach((control, index) => {
      control.get('correctPosition')?.setValue(index);
    });
  }

  /**
   * Handles when a sentence is selected
   * Extracts words from the selected sentence and creates options automatically
   * @param sentenceId ID of the selected sentence
   */
  onSentenceChange(sentenceId: number): void {
    // Find the selected sentence
    const selectedSentence = this.sentences.find(s => s.sentenceId === sentenceId);
    if (!selectedSentence) return;

    // Get text in the target language
    const sourceLanguage = this.wordArrangementForm.get('sourceLanguage')?.value;
    const targetLanguage = this.wordArrangementForm.get('targetLanguage')?.value;

    // Determine which text to use to extract words
    const targetText = targetLanguage === LanguageType.ENGLISH ?
      selectedSentence.englishText : selectedSentence.vietnameseText;

    // Split the text into words
    // This is a simple split by space - in a real app, you might need more complex parsing
    const words = targetText.split(' ');

    // Clear current options
    while (this.optionsArray.length !== 0) {
      this.optionsArray.removeAt(0);
    }

    // Add each word as an option with sequential position (non-distractor)
    words.forEach((word, index) => {
      this.addOption(word, false, index);
    });

    // Add a sample distractor word - in a real app, this would be more sophisticated
    // For example, we could have a dictionary of common distractors or use similar words
    if (targetLanguage === LanguageType.VIETNAMESE) {
      this.addOption('là', true, null);
    } else {
      this.addOption('very', true, null);
    }
  }

  /**
   * Loads sentences data from the API for use in the exercise
   * Sentences will be used as the basis for word arrangements
   */
  loadSentences(): void {
    this.isLoading = true;
    this.wordArrangementService.getSentences(this.lessonId ?? undefined)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 1000) {
            this.sentences = response.result;
          } else {
            this.errorMessage = `Lỗi: ${response.message}`;
          }
        },
        error: (error) => {
          console.error('Error loading sentences:', error);
          this.errorMessage = 'Không thể tải danh sách câu. Vui lòng thử lại.';
        }
      });
  }

  /**
   * Loads exercise details from the API when editing an existing exercise
   * Handles error states and sets loading indicators
   */
  loadExerciseDetail(): void {
    if (!this.exercise?.id) {
      this.errorMessage = 'Không tìm thấy thông tin bài tập.';
      return;
    }

    this.isLoading = true;
    this.wordArrangementService.getWordArrangementExerciseDetail(this.exercise.id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 1000) {
            this.exerciseDetail = response.result;
            this.populateForm();
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

  /**
   * Fills the form with data from an existing exercise
   * Sets up the options from the loaded exercise data
   */
  populateForm(): void {
    if (!this.exerciseDetail) return;

    // Reset form with exercise details
    this.wordArrangementForm.patchValue({
      sentenceId: this.exerciseDetail.sentenceId,
      sourceLanguage: this.exerciseDetail.sourceLanguage,
      targetLanguage: this.exerciseDetail.targetLanguage,
    });

    // Clear existing options
    while (this.optionsArray.length !== 0) {
      this.optionsArray.removeAt(0);
    }

    // Add options from exercise detail
    this.exerciseDetail.options.forEach(option => {
      this.addOption(
        option.wordText,
        option.isDistractor,
        option.correctPosition !== undefined ? option.correctPosition : null
      );
    });

    // If no options were added, add one empty option
    if (this.optionsArray.length === 0) {
      this.addOption();
    }
  }

  /**
   * Handles the checkbox change event for distractor status
   * @param index Index of the option in the array
   * @param event The DOM event from the checkbox
   */
  handleDistractorChange(index: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.onDistractorChange(index, checkbox.checked);
  }

  /**
   * Updates a word's distractor status and manages its correct position
   * @param index Index of the option in the array
   * @param isDistractor New distractor state
   */
  onDistractorChange(index: number, isDistractor: boolean): void {
    const control = this.optionsArray.at(index);
    control.get('isDistractor')?.setValue(isDistractor);

    // Update the correct position if needed
    if (isDistractor) {
      // If it's now a distractor, remove position
      control.get('correctPosition')?.setValue(null);
    } else {
      // If it's now a real word, assign it the next available position
      const maxPosition = Math.max(
        -1,
        ...this.optionsArray.controls
          .filter(c => !c.get('isDistractor')?.value && c !== control)
          .map(c => c.get('correctPosition')?.value ?? -1)
      );
      control.get('correctPosition')?.setValue(maxPosition + 1);
    }
  }

  /**
   * Moves a word option up in the correct sequence
   * @param index Index of the option to move up
   */
  moveWordUp(index: number): void {
    const control = this.optionsArray.at(index);
    const currentPosition = control.get('correctPosition')?.value;

    if (currentPosition === null || currentPosition === undefined || currentPosition <= 0) {
      return; // Already at the top or a distractor
    }

    // Find the option with the position immediately before this one
    const previousControl = this.optionsArray.controls.find(
      c => c.get('correctPosition')?.value === currentPosition - 1
    );

    if (previousControl) {
      // Swap positions
      previousControl.get('correctPosition')?.setValue(currentPosition);
      control.get('correctPosition')?.setValue(currentPosition - 1);
    }
  }

  /**
   * Moves a word option down in the correct sequence
   * @param index Index of the option to move down
   */
  moveWordDown(index: number): void {
    const control = this.optionsArray.at(index);
    const currentPosition = control.get('correctPosition')?.value;

    if (currentPosition === null || currentPosition === undefined) {
      return; // It's a distractor
    }

    // Find the option with the position immediately after this one
    const nextControl = this.optionsArray.controls.find(
      c => c.get('correctPosition')?.value === currentPosition + 1
    );

    if (nextControl) {
      // Swap positions
      nextControl.get('correctPosition')?.setValue(currentPosition);
      control.get('correctPosition')?.setValue(currentPosition + 1);
    }
  }

  /**
   * Determines if a sentence is already assigned to another exercise
   * @param sentenceId ID of the sentence to check
   * @returns True if the sentence is used in another exercise and should be disabled
   */
  isSentenceDisabled(sentenceId: number): boolean {
    // If this is the current exercise's sentence, it shouldn't be disabled
    if (this.exerciseDetail && this.exerciseDetail.sentenceId === sentenceId) {
      return false;
    }

    // Check if the sentence is used in another exercise
    const sentence = this.sentences.find(s => s.sentenceId === sentenceId);
    return !!sentence?.isSelectedByAnotherExercise;
  }

  /**
   * Gets the text content of a sentence in the specified language
   * @param sentenceId ID of the sentence
   * @param language Language to display (english or vietnamese)
   * @returns Text content in the specified language
   */
  getSentenceText(sentenceId: number, language: LanguageType): string {
    const sentence = this.sentences.find(s => s.sentenceId === sentenceId);
    if (!sentence) return '';

    return language === LanguageType.ENGLISH ? sentence.englishText : sentence.vietnameseText;
  }

  /**
   * Saves the word arrangement exercise to the API
   * Performs validation before submission
   * Emits an event when successful
   */
  saveWordArrangement(): void {
    if (this.wordArrangementForm.invalid) {
      // Mark all controls as touched to show validation errors
      this.markFormGroupTouched(this.wordArrangementForm);
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin cho bài tập.';
      return;
    }

    // Verify we have at least one non-distractor word
    const hasRealWords = this.optionsArray.controls.some(
      control => !control.get('isDistractor')?.value
    );

    if (!hasRealWords) {
      this.errorMessage = 'Bài tập phải có ít nhất một từ không phải từ nhiễu.';
      return;
    }

    // Prepare the payload
    const formValue = this.wordArrangementForm.value;
    const payload = {
      exerciseId: this.exercise.id,
      sentenceId: formValue.sentenceId,
      sourceLanguage: formValue.sourceLanguage,
      targetLanguage: formValue.targetLanguage,
      options: this.optionsArray.controls.map(control => ({
        id: control.get('id')?.value || null,
        wordText: control.get('wordText')?.value,
        isDistractor: control.get('isDistractor')?.value || false,
        correctPosition: control.get('isDistractor')?.value ? null : control.get('correctPosition')?.value
      }))
    };

    this.isLoading = true;
    const isUpdate = !!this.exercise?.id && !!this.exerciseDetail;

    this.wordArrangementService.saveWordArrangementExercise(payload, isUpdate)
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
          console.error('Error saving word arrangement exercise:', error);
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
}
