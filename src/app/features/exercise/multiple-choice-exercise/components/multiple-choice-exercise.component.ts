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
import {
  LanguageType,
  MultipleChoiceExerciseDetail,
  OptionType,
  QuestionType,
  Sentence,
  Word
} from '../models/multiple-choice-exercise.model';
import {MultipleChoiceExerciseService} from '../services/multiple-choice-exercise.service';

/**
 * @description
 * The MultipleChoiceExerciseComponent manages the creation and editing of multiple choice exercises.
 * It provides a form interface for configuring exercise questions, options, and answers.
 *
 * The component supports:
 * - Different question types (word, sentence, audio)
 * - Configurable language pairs (source and target)
 * - Multiple options (up to 4) with correct/incorrect marking
 * - Loading existing exercises for editing
 */
@Component({
  selector: 'gl-multiple-choice-exercise',
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
  templateUrl: './multiple-choice-exercise.component.html',
  styleUrls: ['./multiple-choice-exercise.component.scss']
})
export class MultipleChoiceExerciseComponent implements OnInit {
  /** The exercise object being edited or created */
  @Input() exercise: any;

  /** Optional lesson ID to associate the exercise with */
  @Input() lessonId: number | null = null;

  /** Event emitted when the exercise is successfully saved */
  @Output() exerciseSaved = new EventEmitter<void>();

  /** Form group for managing multiple choice exercise data */
  multipleChoiceForm!: FormGroup;

  /** Flag indicating whether an API operation is in progress */
  isLoading = false;

  /** Error message to display to the user */
  errorMessage: string | null = null;

  /** Stores detailed information about the exercise being edited */
  exerciseDetail: MultipleChoiceExerciseDetail | null = null;

  /** Collection of words available for this exercise */
  words: Word[] = [];

  /** Collection of sentences available for this exercise */
  sentences: Sentence[] = [];

  /** Available question types for selection in the UI */
  questionTypes = Object.values(QuestionType);

  /** Available language types for source and target selection */
  languageTypes = Object.values(LanguageType);

  /** Available option types (word or sentence) */
  optionTypes = Object.values(OptionType);

  /**
   * Constructor initializes required services
   * @param fb FormBuilder for creating reactive forms
   * @param multipleChoiceService Service for multiple choice exercise API calls
   */
  constructor(
    private fb: FormBuilder,
    private multipleChoiceService: MultipleChoiceExerciseService
  ) {
  }

  /**
   * Initializes the component, sets up the form, and loads necessary data
   */
  ngOnInit(): void {
    console.log('Exercise input:', this.exercise); // Debug log to check structure
    this.initForm();

    // Load existing exercise details if editing an existing exercise
    console.log('Loading exercise with ID:', this.exercise.id);

    if (this.exercise?.id) {
      this.loadExerciseDetail();
    }

    this.loadWords();
    this.loadSentences();
  }

  /**
   * Initializes the reactive form structure with default values
   * Sets up form control listeners for dynamic validation
   */
  initForm(): void {
    this.multipleChoiceForm = this.fb.group({
      questionType: [QuestionType.WORD, Validators.required],
      questionId: [null, Validators.required],
      sourceLanguage: [LanguageType.ENGLISH, Validators.required],
      targetLanguage: [LanguageType.VIETNAMESE, Validators.required],
      options: this.fb.array([])
    });

    // Initialize with one option by default
    this.addOption();

    // Subscribe to question type changes to update form validation
    this.multipleChoiceForm.get('questionType')?.valueChanges.subscribe(value => {
      this.onQuestionTypeChange(value);
    });
  }

  /**
   * Getter for the options FormArray to easily access in the template and methods
   * @returns FormArray containing option form groups
   */
  get optionsArray(): FormArray {
    return this.multipleChoiceForm.get('options') as FormArray;
  }

  /**
   * Creates a new form group structure for an option
   * @returns FormGroup for representing a single answer option
   */
  createOptionFormGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      contentId: [null, Validators.required],
      optionType: [OptionType.WORD, Validators.required],
      isCorrect: [false]
    });
  }

  /**
   * Adds a new option to the form, limited to 4 options maximum
   */
  addOption(): void {
    if (this.optionsArray.length < 4) {
      this.optionsArray.push(this.createOptionFormGroup());
    }
  }

  /**
   * Removes an option from the form, maintaining at least 1 option
   * @param index Array index of the option to remove
   */
  removeOption(index: number): void {
    if (this.optionsArray.length > 1) {
      this.optionsArray.removeAt(index);
    }
  }

  /**
   * Handles logic when question type changes
   * - Resets question ID
   * - Updates option types based on the selected question type
   * @param questionType The newly selected question type
   */
  onQuestionTypeChange(questionType: QuestionType): void {
    // Reset the question ID when type changes
    this.multipleChoiceForm.get('questionId')?.setValue(null);

    // Update options type based on question type
    // If question type is AUDIO, options type should be SENTENCE
    if (questionType === QuestionType.AUDIO) {
      this.optionsArray.controls.forEach(control => {
        control.get('optionType')?.setValue(OptionType.SENTENCE);
      });
    }
  }

  /**
   * Loads word data from the API for use in the exercise
   * Words can be used as questions or options depending on the exercise type
   */
  loadWords(): void {
    if (!this.exercise?.id) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.multipleChoiceService.getWords(this.exercise.id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 1000) {
            this.words = response.result;
          } else {
            this.errorMessage = `Lỗi: ${response.message}`;
          }
        },
        error: (error) => {
          console.error('Error loading words:', error);
          this.errorMessage = 'Không thể tải danh sách từ vựng. Vui lòng thử lại.';
        }
      });
  }

  /**
   * Loads sentence data from the API for use in the exercise
   * Sentences can be used as questions or options depending on the exercise type
   */
  loadSentences(): void {
    if (!this.exercise?.id) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.multipleChoiceService.getSentences(this.exercise.id)
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
    this.multipleChoiceService.getMultipleChoiceExerciseDetail(this.exercise.id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          console.log('API response:', response); // Debug log for API response
          if (response.code === 1000) {
            this.exerciseDetail = response.result;
            this.populateForm();
          } else {
            this.errorMessage = `Lỗi: ${response.message}`;
            console.error('API error:', response);
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
   * Handles the complexity of different question types and option structures
   */
  populateForm(): void {
    if (!this.exerciseDetail) return;

    // Set basic form values
    this.multipleChoiceForm.patchValue({
      questionType: this.exerciseDetail.questionType,
      // Prioritize related content as the selected question
      questionId: this.getQuestionIdForForm(),
      sourceLanguage: this.exerciseDetail.sourceLanguage,
      targetLanguage: this.exerciseDetail.targetLanguage
    });

    // Clear existing options and populate with the ones from the exercise detail
    this.optionsArray.clear();

    // If there are related items, make sure to process them first
    let processedOptions = [...(this.exerciseDetail?.options || [])];

    // Process related word option first if it exists
    if (this.exerciseDetail?.relatedWordId) {
      const relatedWordOption = processedOptions.find(o =>
        o.optionType === OptionType.WORD && o.wordId && o.wordId === this.exerciseDetail?.relatedWordId
      );

      if (relatedWordOption) {
        this.addOptionToForm(relatedWordOption);
        processedOptions = processedOptions.filter(o =>
          !(o.optionType === OptionType.WORD && o.wordId && o.wordId === this.exerciseDetail?.relatedWordId)
        );
      }
    }

    // Process related sentence option first if it exists
    if (this.exerciseDetail?.relatedSentenceId) {
      const relatedSentenceOption = processedOptions.find(o =>
        o.optionType === OptionType.SENTENCE && o.sentenceId && o.sentenceId === this.exerciseDetail?.relatedSentenceId
      );

      if (relatedSentenceOption) {
        this.addOptionToForm(relatedSentenceOption);
        processedOptions = processedOptions.filter(o =>
          !(o.optionType === OptionType.SENTENCE && o.sentenceId && o.sentenceId === this.exerciseDetail?.relatedSentenceId)
        );
      }
    }

    // Process remaining options
    processedOptions.forEach(option => {
      this.addOptionToForm(option);
    });

    // Make sure we have at least one option
    if (this.optionsArray.length === 0) {
      this.addOption();
    }
  }

  /**
   * Determines the appropriate question ID to use in the form
   * Applies precedence rules based on exercise structure
   * @returns The ID of the content to use as the question
   */
  private getQuestionIdForForm(): number | null {
    if (!this.exerciseDetail) return null;

    // First priority: Related word or related sentence
    if (this.exerciseDetail.questionType === QuestionType.WORD && this.exerciseDetail.relatedWordId) {
      return this.exerciseDetail.relatedWordId;
    }

    if ((this.exerciseDetail.questionType === QuestionType.SENTENCE ||
      this.exerciseDetail.questionType === QuestionType.AUDIO) &&
      this.exerciseDetail.relatedSentenceId) {
      return this.exerciseDetail.relatedSentenceId;
    }

    // Second priority: Regular wordId or sentenceId
    if (this.exerciseDetail.questionType === QuestionType.WORD && this.exerciseDetail.wordId) {
      return this.exerciseDetail.wordId;
    }

    if ((this.exerciseDetail.questionType === QuestionType.SENTENCE ||
      this.exerciseDetail.questionType === QuestionType.AUDIO) &&
      this.exerciseDetail.sentenceId) {
      return this.exerciseDetail.sentenceId;
    }

    return null;
  }

  /**
   * Adds an option from the API response to the form
   * Handles the mapping of different option types and properties
   * @param option Option object from the API
   */
  private addOptionToForm(option: any): void {
    const optionGroup = this.createOptionFormGroup();
    optionGroup.patchValue({
      id: option.id,
      optionType: option.optionType,
      contentId: option.optionType === OptionType.WORD ? option.wordId ?? null : option.sentenceId ?? null,
      isCorrect: option.isCorrect
    });
    this.optionsArray.push(optionGroup);
  }

  /**
   * Saves the multiple choice exercise to the API
   * Performs validation before submission
   * Emits an event when successful
   */
  saveMultipleChoice(): void {
    if (this.multipleChoiceForm.invalid) {
      this.markFormGroupTouched(this.multipleChoiceForm);
      return;
    }

    const formValue = this.multipleChoiceForm.value;
    const questionType = formValue.questionType;
    const questionId = formValue.questionId;

    // Prepare payload for API call
    const payload: any = {
      exerciseId: this.exercise?.id,
      questionType: questionType.toLowerCase(), // Convert to lowercase for API
      sourceLanguage: formValue.sourceLanguage.toLowerCase(), // Convert to lowercase for API
      targetLanguage: formValue.targetLanguage.toLowerCase(), // Convert to lowercase for API
      wordId: null,
      sentenceId: null,
      options: formValue.options.map((option: any) => {
        // Create basic option object
        const optionObj: any = {
          optionType: option.optionType.toLowerCase(), // Convert to lowercase for API
          isCorrect: option.isCorrect
        };

        // Add ID if it exists
        if (option.id) {
          optionObj.id = option.id;
        }

        // Add wordId or sentenceId based on type
        if (option.optionType === OptionType.WORD) {
          optionObj.wordId = option.contentId;
          optionObj.sentenceId = null;
        } else {
          optionObj.sentenceId = option.contentId;
          optionObj.wordId = null;
        }

        return optionObj;
      })
    };

    // Add question content ID based on type
    if (questionType === QuestionType.WORD) {
      payload.wordId = questionId;
      payload.sentenceId = null;
    } else {
      // Both SENTENCE and AUDIO use sentenceId
      payload.sentenceId = questionId;
      payload.wordId = null;
    }

    // Validate that at least one option is marked as correct
    const hasCorrectOption = payload.options.some((option: any) => option.isCorrect);
    if (!hasCorrectOption) {
      this.errorMessage = 'Vui lòng chọn ít nhất một đáp án đúng.';
      return;
    }

    this.isLoading = true;
    const isUpdate = !!this.exercise?.id && !!this.exerciseDetail && this.exerciseDetail.exerciseId === this.exercise.id;

    this.multipleChoiceService.saveMultipleChoiceExercise(payload, isUpdate)
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
          console.error('Error saving multiple choice exercise:', error);
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
   * Gets the text content for display based on ID, type, and language
   * Used for showing proper content in the UI
   * @param id Content ID (word or sentence)
   * @param type Type of content (WORD or SENTENCE)
   * @param language Language to display (ENGLISH or VIETNAMESE)
   * @returns Text content in the specified language
   */
  getContentText(id: number, type: OptionType, language: LanguageType): string {
    if (type === OptionType.WORD) {
      const word = this.words.find(w => w.wordId === id);
      return language === LanguageType.ENGLISH ? word?.englishText || '' : word?.vietnameseText || '';
    } else {
      const sentence = this.sentences.find(s => s.sentenceId === id);
      return language === LanguageType.ENGLISH ? sentence?.englishText || '' : sentence?.vietnameseText || '';
    }
  }

  /**
   * Plays audio from a URL
   * Used for previewing audio questions or options
   * @param audioUrl URL of the audio file to play
   */
  playAudio(audioUrl: string): void {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(error => console.error('Error playing audio:', error));
    }
  }

  /**
   * Determines if a content is already used in another exercise
   * Prevents duplicate use of content across exercises
   * @param id Content ID
   * @param type Content type (WORD or SENTENCE)
   * @returns Boolean indicating if the content should be disabled
   */
  isContentDisabled(id: number, type: OptionType): boolean {
    // If the item is related to this exercise, it should not be disabled
    if (this.exerciseDetail) {
      if (type === OptionType.WORD && this.exerciseDetail.relatedWordId === id) {
        return false;
      }
      if (type === OptionType.SENTENCE && this.exerciseDetail.relatedSentenceId === id) {
        return false;
      }
    }

    // Original check for items used in other exercises
    if (type === OptionType.WORD) {
      const word = this.words.find(w => w.wordId === id);
      return !!word?.isSelectedByAnotherExercise;
    } else {
      const sentence = this.sentences.find(s => s.sentenceId === id);
      return !!sentence?.isSelectedByAnotherExercise;
    }
  }

  protected readonly OptionType = OptionType;
}
