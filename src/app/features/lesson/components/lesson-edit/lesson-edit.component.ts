import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {NgForOf, NgIf, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  CardTitleDirective,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  FormSelectDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  TextColorDirective,
  ToastModule
} from '@coreui/angular';
import {IconDirective} from '@coreui/icons-angular';
import {finalize, Subject, takeUntil} from 'rxjs';
import {APP_ROUTE_TOKEN} from '../../../../core/routes/app.routes.constants';
import {IconSubset} from '../../../../icons/icon-subset';
import {
  VocabularyExerciseComponent
} from '../../../exercise/vocabulary-exercise/components/vocabulary-exercise.component';
import {LessonType} from '../../../topic/models/topic.model';
import {TopicService} from '../../../topic/services/topic.service';
import {CreateLessonRequest, UpdateLessonRequest} from '../../models/lesson.model';
import {LessonService} from '../../services/lesson.service';
import {
  MultipleChoiceExerciseComponent
} from '../../../exercise/multiple-choice-exercise/components/multiple-choice-exercise.component';
import {
  WordArrangementExerciseComponent
} from "../../../exercise/word-arrangement-exercise/components/word-arrangement-exercise.component";
import {MatchingExerciseComponent} from '../../../exercise/matching-exercise/components/matching-exercise.component';

// Define an interface for exercises
interface Exercise {
  id?: number;
  title: string;
  typeId: number;
}

// Define exercise types
interface ExerciseType {
  id: number;
  name: string;
}

interface Toast {
  message: string;
  title: string;
  autohide: boolean;
  delay: number;
  color: 'success' | 'danger' | 'warning' | 'info';
  icon: string;
}

// Color mapping for exercise types - constants outside the component for better performance
const EXERCISE_TYPE_COLORS: Record<number, string> = {
  1: 'rgba(78, 205, 196, 0.7)',   // Teal - Từ vựng
  2: 'rgba(255, 209, 102, 0.7)',  // Yellow - Trắc nghiệm
  3: 'rgba(255, 107, 107, 0.7)',  // Red - Nối từ
  4: 'rgba(6, 214, 160, 0.7)',    // Green - Sắp xếp từ thành câu
  5: 'rgba(118, 120, 237, 0.7)',  // Purple - Phát âm
  6: 'rgba(41, 128, 185, 0.7)',   // Blue - Hội thoại
};

@Component({
  selector: 'gl-lesson-edit',
  imports: [
    ContainerComponent,
    FormDirective,
    ReactiveFormsModule,
    FormLabelDirective,
    FormControlDirective,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    NgIf,
    NgForOf,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    IconDirective,
    NgStyle,
    ButtonDirective,
    FormSelectDirective,
    CardTitleDirective,
    RouterLink,
    ModalFooterComponent,
    NgSwitchDefault,
    NgSwitch,
    VocabularyExerciseComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    NgSwitchCase,
    ModalTitleDirective,
    ToastModule,
    TextColorDirective,
    MultipleChoiceExerciseComponent,
    WordArrangementExerciseComponent,
    MatchingExerciseComponent
  ],
  templateUrl: './lesson-edit.component.html',
  styleUrl: './lesson-edit.component.scss'
})
export class LessonEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Services - using inject pattern for better tree-shaking
  private readonly topicService = inject(TopicService);
  private readonly lessonService = inject(LessonService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Forms
  lessonForm!: FormGroup;
  editExerciseForm!: FormGroup;

  // State management with signal API for reactive UI updates
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isEditMode = signal<boolean>(false);
  lessonId = signal<number | null>(null);
  editingExerciseIndex = signal<number | null>(null);
  showExerciseContentEditor = signal<boolean>(false);
  selectedExercise = signal<Exercise | null>(null);
  toastVisible = signal<boolean>(false);

  // Collections
  exercises = signal<Exercise[]>([]);
  topics = signal<{ id: number, name: string }[]>([]);
  toasts: Toast[] = [];

  // Toast configuration
  readonly position = 'top-end';

  // Constants
  readonly lessonTypes: LessonType[] = [
    { id: 1, name: 'Bài học chính' },
    { id: 2, name: 'Bài học nói' },
    { id: 3, name: 'Bài học kiểm tra' }
  ];

  readonly exerciseTypes: ExerciseType[] = [
    { id: 1, name: 'Từ vựng' },
    { id: 2, name: 'Trắc nghiệm' },
    { id: 3, name: 'Nối từ' },
    { id: 4, name: 'Sắp xếp từ thành câu' },
    { id: 5, name: 'Phát âm' },
    { id: 6, name: 'Hội thoại' },
  ];

  protected readonly IconSubset = IconSubset;

  ngOnInit(): void {
    this.initForms();
    this.loadTopics();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Shows a toast notification with customizable message and type
   */
  showToast(message: string, success: boolean = true): void {
    const toast: Toast = {
      message,
      title: success ? 'Thành công' : 'Lỗi',
      autohide: true,
      delay: 4000,
      color: success ? 'success' : 'danger',
      icon: success ? 'cilCheck' : 'cilX'
    };

    this.toasts.push(toast);
    this.toastVisible.set(true);

    // Use setTimeout for cleanup
    setTimeout(() => {
      if (this.toasts.length > 0) {
        this.toasts.shift();
        if (this.toasts.length === 0) {
          this.toastVisible.set(false);
        }
      }
    }, 4500);
  }

  toggleVisible(): boolean {
    const current = this.toastVisible();
    this.toastVisible.set(!current);
    return !current;
  }

  /**
   * Initialize the forms used in the component.
   */
  private initForms(): void {
    this.lessonForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      typeId: [1, Validators.required],
      topicId: [null, Validators.required],
      exerciseTitle: ['', Validators.maxLength(100)],
      exerciseTypeId: [1]
    });

    this.editExerciseForm = this.fb.group({
      editTitle: ['', [Validators.required, Validators.maxLength(100)]],
      editTypeId: [1]
    });
  }

  /**
   * Load topics for the dropdown
   */
  private loadTopics(): void {
    this.topicService.getTopics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (topicsData) => {
          this.topics.set(topicsData.map(topic => ({
            id: topic.id,
            name: topic.name
          })));
        },
        error: (error) => {
          console.error('Error loading topics', error);
          this.errorMessage.set('Unable to load topics. Please try again.');
        }
      });
  }

  /**
   * Check if the component is in edit mode by examining the route parameters.
   */
  private checkEditMode(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const lessonId = params['id'];
        if (lessonId) {
          this.isEditMode.set(true);
          this.lessonId.set(+lessonId);
          this.loadLessonDetails(+lessonId);
        }
      });
  }

  /**
   * Load the details of a lesson for editing.
   */
  loadLessonDetails(id: number): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.lessonService.getLessonDetail(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.code === 1000) {
            const lessonDetail = response.result;

            // Update form with lesson details
            this.lessonForm.patchValue({
              title: lessonDetail.name,
              typeId: lessonDetail.lessonTypeId,
              topicId: lessonDetail.topicId,
            });

            // Map exercises to component model
            this.exercises.set(lessonDetail.exercises.map(exercise => ({
              id: exercise.id,
              title: exercise.name,
              typeId: exercise.exerciseTypeId
            })));
          } else {
            this.errorMessage.set(`Error: ${response.message}`);
          }
        },
        error: (error) => {
          console.error('Error loading lesson details:', error);
          this.errorMessage.set('Có lỗi xảy ra khi tải thông tin bài học. Vui lòng thử lại.');
        }
      });
  }

  /**
   * Add a new exercise to the lesson.
   */
  addExercise(): void {
    const exerciseTitle = this.lessonForm.get('exerciseTitle')?.value?.trim();
    if (exerciseTitle) {
      const typeId = +this.lessonForm.get('exerciseTypeId')?.value;
      const currentExercises = [...this.exercises()];
      currentExercises.push({
        title: exerciseTitle,
        typeId: typeId
      });
      this.exercises.set(currentExercises);
      this.lessonForm.get('exerciseTitle')?.reset();
    }
  }

  /**
   * Edit an existing exercise.
   */
  editExercise(index: number): void {
    const exercise = this.exercises()[index];
    this.editExerciseForm.patchValue({
      editTitle: exercise.title,
      editTypeId: exercise.typeId
    });
    this.editingExerciseIndex.set(index);
  }

  /**
   * Save the edited exercise.
   */
  saveEditedExercise(): void {
    const index = this.editingExerciseIndex();
    if (this.editExerciseForm.invalid || index === null) return;

    const editedTitle = this.editExerciseForm.get('editTitle')?.value?.trim();
    const editedTypeId = +this.editExerciseForm.get('editTypeId')?.value;

    if (editedTitle) {
      const updatedExercises = [...this.exercises()];
      updatedExercises[index] = {
        ...updatedExercises[index],
        title: editedTitle,
        typeId: editedTypeId
      };
      this.exercises.set(updatedExercises);
    }

    this.cancelEditing();
  }

  /**
   * Cancel the editing of an exercise.
   */
  cancelEditing(): void {
    this.editingExerciseIndex.set(null);
    this.editExerciseForm.reset({
      editTitle: '',
      editTypeId: 1
    });
  }

  /**
   * Remove an exercise from the lesson.
   */
  removeExercise(index: number): void {
    if (confirm('Bạn có chắc muốn xóa bài tập này?')) {
      const updatedExercises = [...this.exercises()];
      updatedExercises.splice(index, 1);
      this.exercises.set(updatedExercises);
    }
  }

  /**
   * Get the name of an exercise type by its ID.
   */
  getExerciseTypeName(typeId: number): string {
    const type = this.exerciseTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  }

  /**
   * Get the name of a lesson type by its ID.
   */
  getLessonTypeName(typeId: number): string {
    const type = this.lessonTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  }

  /**
   * Get the color associated with an exercise type by its ID.
   */
  getTypeColor(typeId: number): string {
    return EXERCISE_TYPE_COLORS[typeId] || '#6c757d';
  }

  /**
   * Handle the drag and drop event for reordering exercises.
   */
  drop(event: CdkDragDrop<string[]>): void {
    const updatedExercises = [...this.exercises()];
    moveItemInArray(updatedExercises, event.previousIndex, event.currentIndex);
    this.exercises.set(updatedExercises);
  }

  /**
   * Handle the form submission for creating or updating a lesson.
   */
  onSubmit(): void {
    if (this.validateForm()) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const lessonData = this.prepareFormData();

      if (this.isEditMode() && this.lessonId()) {
        this.updateLesson(lessonData);
      } else {
        this.createLesson(lessonData);
      }
    }
  }

  /**
   * Validate the form before submission.
   */
  private validateForm(): boolean {
    if (this.lessonForm.invalid) {
      Object.keys(this.lessonForm.controls).forEach(key => {
        this.lessonForm.get(key)?.markAsTouched();
      });
      return false;
    }
    return true;
  }

  /**
   * Prepare the form data for submission.
   */
  private prepareFormData(): CreateLessonRequest {
    return {
      name: this.lessonForm.get('title')?.value,
      lessonTypeId: this.lessonForm.get('typeId')?.value,
      topicId: this.lessonForm.get('topicId')?.value,
      exercises: this.exercises().map((exercise, index) => ({
        ...(exercise.id ? { id: exercise.id } : {}), // Include id only if it exists
        name: exercise.title,
        exerciseTypeId: exercise.typeId,
        displayOrder: index + 1
      }))
    };
  }

  /**
   * Create a new lesson.
   */
  private createLesson(lessonData: CreateLessonRequest): void {
    this.lessonService.createLesson(lessonData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.code === 1000) {
            this.showToast('Bài học mới đã được tạo thành công');
            this.navigateToLessons('Bài học đã được tạo thành công');
          } else {
            this.errorMessage.set(`Error: ${response.message}`);
            this.showToast(response.message || 'Đã xảy ra lỗi khi tạo bài học', false);
          }
        },
        error: (error) => {
          console.error('Error creating lesson:', error);
          this.errorMessage.set('Có lỗi xảy ra khi tạo bài học. Vui lòng thử lại.');
          this.showToast(error.error?.message || 'Đã xảy ra lỗi khi tạo bài học mới', false);
        }
      });
  }

  /**
   * Update an existing lesson.
   */
  private updateLesson(lessonData: CreateLessonRequest): void {
    const updateRequest: UpdateLessonRequest = {
      id: this.lessonId()!,
      name: lessonData.name,
      lessonTypeId: lessonData.lessonTypeId,
      topicId: lessonData.topicId,
      exercises: lessonData.exercises
    };

    this.lessonService.updateLesson(updateRequest)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.code === 1000) {
            this.showToast('Bài học đã được cập nhật thành công');
            this.loadLessonDetails(this.lessonId()!);
          } else {
            this.errorMessage.set(`Error: ${response.message}`);
            this.showToast(response.message || 'Đã xảy ra lỗi khi cập nhật bài học', false);
          }
        },
        error: (error) => {
          console.error('Error updating lesson:', error);
          this.showToast(error.error?.message || 'Đã xảy ra lỗi khi cập nhật bài học', false);
          this.errorMessage.set('Có lỗi xảy ra khi cập nhật bài học. Vui lòng thử lại.');
        }
      });
  }

  /**
   * Navigate to the lessons list with a message.
   */
  private navigateToLessons(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    console.log(`${type.toUpperCase()}: ${message}`);
    this.router.navigate([`/${APP_ROUTE_TOKEN.LEARN_STRUCTURE_LESSON}`]).then();
  }

  /**
   * Opens the exercise content editor modal for a specific exercise
   */
  openExerciseContentEditor(exercise: Exercise): void {
    // Check if lesson is saved - needed for proper context
    if (!this.isEditMode() || !this.lessonId()) {
      alert('Vui lòng lưu bài học trước khi chỉnh sửa chi tiết bài tập.');
      return;
    }

    this.selectedExercise.set({ ...exercise });
    this.showExerciseContentEditor.set(true);
  }

  /**
   * Closes the exercise content editor modal
   */
  closeExerciseContentEditor(): void {
    this.showExerciseContentEditor.set(false);
    this.selectedExercise.set(null);
  }

  /**
   * Handle event when exercise content is saved
   */
  onExerciseContentSaved(): void {
    this.showToast('Bài tập đã được cập nhật thành công');
    this.closeExerciseContentEditor();
  }

    /**
   * Handles modal visibility changes from any source (backdrop click, ESC key, etc.)
   * @param visible - Whether the modal should be visible
   */
    handleModalVisibilityChange(visible: boolean): void {
      if (!visible) {
        // If modal is being closed, reset state
        this.closeExerciseContentEditor();
      }
    }
}
