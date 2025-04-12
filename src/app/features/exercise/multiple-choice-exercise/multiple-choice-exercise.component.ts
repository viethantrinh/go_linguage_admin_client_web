import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AlertComponent,
  ButtonDirective, CardBodyComponent, CardComponent, ColComponent,
  ContainerComponent,
  FormLabelDirective, FormSelectDirective, RowComponent, SpinnerComponent,
  TextColorDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { finalize } from 'rxjs';
import {
  LanguageType,
  MultipleChoiceExerciseDetail,
  OptionType,
  QuestionType,
  Sentence,
  Word
} from './models/multiple-choice-exercise.model';
import { MultipleChoiceExerciseService } from './services/multiple-choice-exercise.service';

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
  @Input() exercise: any;
  @Input() lessonId: number | null = null;
  @Output() exerciseSaved = new EventEmitter<void>();

  // Form for the multiple choice exercise
  multipleChoiceForm!: FormGroup;

  // Loading state
  isLoading = false;

  // Error message
  errorMessage: string | null = null;

  // Exercise details
  exerciseDetail: MultipleChoiceExerciseDetail | null = null;

  // Available data for selection
  words: Word[] = [];
  sentences: Sentence[] = [];

  // Enums for templates
  questionTypes = Object.values(QuestionType);
  languageTypes = Object.values(LanguageType);
  optionTypes = Object.values(OptionType);

  constructor(
    private fb: FormBuilder,
    private multipleChoiceService: MultipleChoiceExerciseService
  ) {
  }

  ngOnInit(): void {
    console.log('Exercise input:', this.exercise); // kiểm tra cấu trúc
    this.initForm();

    // Load existing exercise details if editing an existing exercise
    console.log('Loading exercise with ID:', this.exercise.id);

    if (this.exercise?.id) {
      this.loadExerciseDetail();
    }

    this.loadWords();
    this.loadSentences();
  }

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

  // Get the options FormArray
  get optionsArray(): FormArray {
    return this.multipleChoiceForm.get('options') as FormArray;
  }

  // Creates a new option form group
  createOptionFormGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      contentId: [null, Validators.required],
      optionType: [OptionType.WORD, Validators.required],
      isCorrect: [false]
    });
  }

  // Add a new option to the form
  addOption(): void {
    if (this.optionsArray.length < 4) {
      this.optionsArray.push(this.createOptionFormGroup());
    }
  }

  // Remove an option from the form
  removeOption(index: number): void {
    if (this.optionsArray.length > 1) {
      this.optionsArray.removeAt(index);
    }
  }

  // Handle question type change
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

  // Load words for the dropdown
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

  // Load sentences for the dropdown
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

  // Phương thức loadExerciseDetail
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
          console.log('API response:', response); // kiểm tra response
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

  // Populate form with exercise details
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

  // Helper method to determine the question ID based on priority
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

  // Helper method to add an option to the form
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

  // Save the multiple choice exercise
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
      questionType: questionType.toLowerCase(), // Chuyển thành chữ thường
      sourceLanguage: formValue.sourceLanguage.toLowerCase(), // Chuyển thành chữ thường
      targetLanguage: formValue.targetLanguage.toLowerCase(), // Chuyển thành chữ thường
      wordId: null,
      sentenceId: null,
      options: formValue.options.map((option: any) => {
        // Tạo đối tượng cơ bản
        const optionObj: any = {
          optionType: option.optionType.toLowerCase(), // Chuyển thành chữ thường
          isCorrect: option.isCorrect
        };

        // Thêm ID nếu có
        if (option.id) {
          optionObj.id = option.id;
        }

        // Thêm wordId hoặc sentenceId tùy theo loại
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
      // Cả SENTENCE và AUDIO đều dùng sentenceId
      payload.sentenceId = questionId;
      payload.wordId = null;
    }

    // Check if at least one option is marked as correct
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

  // Utility function to mark all controls as touched
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

  // Get display content based on ID and type
  getContentText(id: number, type: OptionType, language: LanguageType): string {
    if (type === OptionType.WORD) {
      const word = this.words.find(w => w.wordId === id);
      return language === LanguageType.ENGLISH ? word?.englishText || '' : word?.vietnameseText || '';
    } else {
      const sentence = this.sentences.find(s => s.sentenceId === id);
      return language === LanguageType.ENGLISH ? sentence?.englishText || '' : sentence?.vietnameseText || '';
    }
  }

  // Play audio if available
  playAudio(audioUrl: string): void {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(error => console.error('Error playing audio:', error));
    }
  }

  // Check if a content is already used in another exercise
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
