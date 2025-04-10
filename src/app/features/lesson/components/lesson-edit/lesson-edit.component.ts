import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {finalize, Subject, takeUntil} from 'rxjs';
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {APP_ROUTE_TOKEN} from '../../../../core/routes/app.routes.constants';
import {LessonType} from '../../../topic/models/topic.model';
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
import {NgForOf, NgIf, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import {IconDirective} from '@coreui/icons-angular';
import {TopicService} from '../../../topic/services/topic.service';
import {LessonService} from '../../services/lesson.service';
import {CreateLessonRequest, UpdateLessonRequest} from '../../models/lesson.model';
import {
  VocabularyExerciseComponent
} from '../../../exercise/vocabulary-exercise/components/vocabulary-exercise.component';
import {IconSubset} from '../../../../icons/icon-subset';

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

@Component({
  selector: 'gl-lesson-edit',
  standalone: true,
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
    TextColorDirective
  ],
  templateUrl: './lesson-edit.component.html',
  styleUrl: './lesson-edit.component.scss'
})
export class LessonEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Services
  private readonly topicService = inject(TopicService);
  private readonly lessonService = inject(LessonService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Forms
  lessonForm!: FormGroup;
  editExerciseForm!: FormGroup;

  // State management
  isSubmitting = false;
  errorMessage: string | null = null;
  isEditMode = false;
  lessonId: number | null = null;
  editingExerciseIndex: number | null = null;

  // Collections
  exercises: Exercise[] = [];
  topics: { id: number, name: string }[] = [];

  // Constants
  readonly lessonTypes: LessonType[] = [
    {id: 1, name: 'Bài học chính'},
    {id: 2, name: 'Bài học nói'},
    {id: 3, name: 'Bài học kiểm tra'}
  ];

  readonly exerciseTypes: ExerciseType[] = [
    {id: 1, name: 'Từ vựng'},
    {id: 2, name: 'Trắc nghiệm'},
    {id: 3, name: 'Nối từ'},
    {id: 4, name: 'Sắp xếp từ thành câu'},
    {id: 5, name: 'Phát âm'},
    {id: 6, name: 'Hội thoại'},
  ];

  // Add toast properties
  toasts: Array<any> = [];
  position = 'top-end';

  ngOnInit(): void {
    this.initForms();
    this.loadTopics();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showToast(message: string, success: boolean = true): void {
    this.toasts.push({
      message,
      title: success ? 'Thành công' : 'Lỗi',
      autohide: true,
      delay: 4000, // Tăng lên 5 giây
      color: success ? 'success' : 'danger',
      icon: success ? 'cilCheck' : 'cilX'
    });
    this.toggleVisible();

    console.log('Current toasts:', this.toasts);

    // Tăng thời gian xóa toast khỏi mảng
    setTimeout(() => {
      this.toasts.shift();
    }, 4500);
  }

  /**
   * Initialize the forms used in the component.
   */
  private initForms(): void {
    this.lessonForm = this.fb.group({
      title: ['', Validators.required],
      typeId: [1, Validators.required],
      topicId: [null, Validators.required],
      exerciseTitle: [''],
      exerciseTypeId: [1]
    });

    this.editExerciseForm = this.fb.group({
      editTitle: ['', Validators.required],
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
        next: (topics) => {
          this.topics = topics.map(topic => ({
            id: topic.id,
            name: topic.name
          }));
        },
        error: (error) => {
          console.error('Error loading topics', error);
          this.errorMessage = 'Unable to load topics. Please try again.';
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
          this.isEditMode = true;
          this.lessonId = +lessonId;
          this.loadLessonDetails(this.lessonId);
        }
      });
  }

  /**
   * Load the details of a lesson for editing.
   * @param id The ID of the lesson to load.
   */
  loadLessonDetails(id: number): void {
    this.isSubmitting = true;
    this.errorMessage = null;

    this.lessonService.getLessonDetail(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
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
            this.exercises = lessonDetail.exercises.map(exercise => ({
              id: exercise.id,
              title: exercise.name,
              typeId: exercise.exerciseTypeId
            }));
          } else {
            this.errorMessage = `Error: ${response.message}`;
          }
        },
        error: (error) => {
          console.error('Error loading lesson details:', error);
          this.errorMessage = 'Có lỗi xảy ra khi tải thông tin bài học. Vui lòng thử lại.';
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
      this.exercises.push({
        title: exerciseTitle,
        typeId: typeId
      });
      this.lessonForm.get('exerciseTitle')?.reset();
    }
  }

  /**
   * Edit an existing exercise.
   * @param index The index of the exercise to edit.
   */
  editExercise(index: number): void {
    const exercise = this.exercises[index];
    this.editExerciseForm.patchValue({
      editTitle: exercise.title,
      editTypeId: exercise.typeId
    });
    this.editingExerciseIndex = index;
  }

  /**
   * Save the edited exercise.
   */
  saveEditedExercise(): void {
    if (this.editExerciseForm.invalid || this.editingExerciseIndex === null) return;

    const editedTitle = this.editExerciseForm.get('editTitle')?.value?.trim();
    const editedTypeId = +this.editExerciseForm.get('editTypeId')?.value;

    if (editedTitle) {
      this.exercises[this.editingExerciseIndex] = {
        ...this.exercises[this.editingExerciseIndex],
        title: editedTitle,
        typeId: editedTypeId
      };
    }

    this.cancelEditing();
  }

  /**
   * Cancel the editing of an exercise.
   */
  cancelEditing(): void {
    this.editingExerciseIndex = null;
    this.editExerciseForm.reset({
      editTitle: '',
      editTypeId: 1
    });
  }

  /**
   * Remove an exercise from the lesson.
   * @param index The index of the exercise to remove.
   */
  removeExercise(index: number): void {
    if (confirm('Bạn có chắc muốn xóa bài tập này?')) {
      this.exercises.splice(index, 1);
    }
  }

  /**
   * Get the name of an exercise type by its ID.
   * @param typeId The ID of the exercise type.
   * @returns The name of the exercise type.
   */
  getExerciseTypeName(typeId: number): string {
    const type = this.exerciseTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  }

  /**
   * Get the name of a lesson type by its ID.
   * @param typeId The ID of the lesson type.
   * @returns The name of the lesson type.
   */
  getLessonTypeName(typeId: number): string {
    const type = this.lessonTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  }

  /**
   * Get the color associated with an exercise type by its ID.
   * @param typeId The ID of the exercise type.
   * @returns The color associated with the exercise type.
   */
  getTypeColor(typeId: number): string {
    switch (typeId) {
      case 1:
        return 'rgba(78, 205, 196, 0.7)';  // Teal - existing
      case 2:
        return 'rgba(255, 209, 102, 0.7)'; // Yellow - existing
      case 3:
        return 'rgba(255, 107, 107, 0.7)'; // Red - existing
      case 4:
        return 'rgba(6, 214, 160, 0.7)';   // Green - existing
      case 5:
        return 'rgba(118, 120, 237, 0.7)'; // Purple - new
      case 6:
        return 'rgba(41, 128, 185, 0.7)';  // Blue - new
      default:
        return '#6c757d';                  // Grey - default
    }
  }

  /**
   * Handle the drag and drop event for reordering exercises.
   * @param event The drag and drop event.
   */
  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.exercises, event.previousIndex, event.currentIndex);
  }

  /**
   * Handle the form submission for creating or updating a lesson.
   */
  onSubmit(): void {
    if (this.validateForm()) {
      this.isSubmitting = true;
      this.errorMessage = null;

      const lessonData = this.prepareFormData();

      if (this.isEditMode && this.lessonId) {
        this.updateLesson(lessonData);
      } else {
        this.createLesson(lessonData);
      }
    }
  }

  /**
   * Validate the form before submission.
   * @returns True if the form is valid, false otherwise.
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
   * @returns The prepared form data.
   */
  private prepareFormData(): CreateLessonRequest {
    return {
      name: this.lessonForm.get('title')?.value,
      lessonTypeId: this.lessonForm.get('typeId')?.value,
      topicId: this.lessonForm.get('topicId')?.value,
      exercises: this.exercises.map((exercise, index) => ({
        ...(exercise.id ? { id: exercise.id } : {}), // Include id only if it exists
        name: exercise.title,
        exerciseTypeId: exercise.typeId,
        displayOrder: index + 1
      }))
    };
  }

  /**
   * Create a new lesson.
   * @param lessonData The data for the new lesson.
   */
  private createLesson(lessonData: CreateLessonRequest): void {
    this.lessonService.createLesson(lessonData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: (response) => {
          if (response.code === 1000) {
            this.showToast('Bài học mới đã được tạo thành công');
            this.navigateToLessons('Bài học đã được tạo thành công');
          } else {
            this.errorMessage = `Error: ${response.message}`;
            this.showToast(response.message || 'Đã xảy ra lỗi khi tạo bài học', false);
          }
        },
        error: (error) => {
          console.error('Error creating lesson:', error);
          this.errorMessage = 'Có lỗi xảy ra khi tạo bài học. Vui lòng thử lại.';
          this.showToast(error.error?.message || 'Đã xảy ra lỗi khi tạo bài học mới', false);
        }
      });
  }

  /**
   * Update an existing lesson.
   * @param lessonData The data for the lesson to update.
   */
  private updateLesson(lessonData: CreateLessonRequest): void {
    const updateRequest: UpdateLessonRequest = {
      id: this.lessonId!,
      name: lessonData.name,
      lessonTypeId: lessonData.lessonTypeId,
      topicId: lessonData.topicId,
      exercises: lessonData.exercises
    };

    this.lessonService.updateLesson(updateRequest)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: (response) => {
          if (response.code === 1000) {
            this.showToast('Bài học đã được cập nhật thành công');
            this.loadLessonDetails(this.lessonId!);
          } else {
            this.errorMessage = `Error: ${response.message}`;
            this.showToast(response.message || 'Đã xảy ra lỗi khi cập nhật bài học', false);
          }
        },
        error: (error) => {
          console.error('Error updating lesson:', error);
          this.showToast(error.error?.message || 'Đã xảy ra lỗi khi cập nhật bài học', false);
          this.errorMessage = 'Có lỗi xảy ra khi cập nhật bài học. Vui lòng thử lại.';
        }
      });
  }

  /**
   * Navigate to the lessons list with a message.
   * @param message The message to display.
   * @param type The type of message (success, error, warning).
   */
  private navigateToLessons(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    console.log(`${type.toUpperCase()}: ${message}`);
    this.router.navigate([`/${APP_ROUTE_TOKEN.LEARN_STRUCTURE_LESSON}`]).then();
  }

  // Add to your properties section
  showExerciseContentEditor = false;
  selectedExercise: Exercise | null = null;

  /**
   * Opens the exercise content editor modal for a specific exercise
   * @param exercise The exercise to edit
   */
  openExerciseContentEditor(exercise: Exercise): void {
    // Check if lesson is saved - needed for proper context
    if (!this.isEditMode || !this.lessonId) {
      alert('Vui lòng lưu bài học trước khi chỉnh sửa chi tiết bài tập.');
      return;
    }

    this.selectedExercise = { ...exercise };
    this.showExerciseContentEditor = true;
  }

  /**
   * Closes the exercise content editor modal
   */
  closeExerciseContentEditor(): void {
    this.showExerciseContentEditor = false;
    this.selectedExercise = null;
  }

  /**
   * Handle event when exercise content is saved
   */
  onExerciseContentSaved(): void {
    // Show success message or update UI as needed
    this.showToast('Bài tập đã được cập nhật thành công');
    this.closeExerciseContentEditor()
    // You could reload the lesson details here if needed
  }

  toastVisible = false;
  toggleVisible() {
    return this.toastVisible = !this.toastVisible;
  }

  protected readonly IconSubset = IconSubset;
}
