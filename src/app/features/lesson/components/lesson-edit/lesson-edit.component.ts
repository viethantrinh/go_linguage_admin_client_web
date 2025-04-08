import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
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
  FormSelectDirective
} from '@coreui/angular';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {IconDirective} from '@coreui/icons-angular';

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
    RouterLink
  ],
  templateUrl: './lesson-edit.component.html',
  styleUrl: './lesson-edit.component.scss'
})
export class LessonEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

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
    { id: 1, name: 'Bài học chính' },
    { id: 2, name: 'Bài học nói' },
    { id: 3, name: 'Bài học kiểm tra' }
  ];

  readonly exerciseTypes: ExerciseType[] = [
    { id: 1, name: 'Bài tập trắc nghiệm' },
    { id: 2, name: 'Bài tập điền từ' },
    { id: 3, name: 'Bài tập sắp xếp' },
    { id: 4, name: 'Bài tập ghép đôi' }
  ];

  // Sample topics for demo purposes
  readonly sampleTopics = [
    { id: 1, name: 'English for Beginners' },
    { id: 2, name: 'Business English' },
    { id: 3, name: 'TOEFL Preparation' },
    { id: 4, name: 'Travel Vocabulary' },
    { id: 5, name: 'Everyday Conversations' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

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
   * Initialize the forms used in the component.
   */
  private initForms(): void {
    this.lessonForm = this.fb.group({
      title: ['', Validators.required],
      typeId: [1, Validators.required],
      topicId: [null, Validators.required],
      content: [''],
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
    // In a real app, this would be a service call
    this.topics = this.sampleTopics;
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

    // In a real app, this would call a lesson service
    // For now, simulate a service call
    setTimeout(() => {
      // Mock lesson data
      const lessonDetail = {
        id: id,
        title: 'Sample Lesson ' + id,
        typeId: 1,
        topicId: 2,
        content: 'This is a sample lesson content.',
        exercises: [
          { id: 1, title: 'Exercise 1', typeId: 1 },
          { id: 2, title: 'Exercise 2', typeId: 2 },
          { id: 3, title: 'Exercise 3', typeId: 3 }
        ]
      };

      this.lessonForm.patchValue({
        title: lessonDetail.title,
        typeId: lessonDetail.typeId,
        topicId: lessonDetail.topicId,
        content: lessonDetail.content
      });

      this.exercises = lessonDetail.exercises;
      this.isSubmitting = false;
    }, 500);
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
      case 1: return 'rgba(78, 205, 196, 0.7)';
      case 2: return 'rgba(255, 209, 102, 0.7)';
      case 3: return 'rgba(255, 107, 107, 0.7)';
      case 4: return 'rgba(6, 214, 160, 0.7)';
      default: return '#6c757d';
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
  private prepareFormData(): any {
    return {
      title: this.lessonForm.get('title')?.value,
      typeId: this.lessonForm.get('typeId')?.value,
      topicId: this.lessonForm.get('topicId')?.value,
      content: this.lessonForm.get('content')?.value,
      exercises: this.exercises.map((exercise, index) => ({
        id: exercise.id,
        title: exercise.title,
        typeId: exercise.typeId,
        displayOrder: index + 1
      }))
    };
  }

  /**
   * Create a new lesson.
   * @param lessonData The data for the new lesson.
   */
  private createLesson(lessonData: any): void {
    // In a real app, this would call a lesson service
    console.log('Creating lesson with data:', lessonData);

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.navigateToLessons('Bài học đã được tạo thành công');
    }, 1000);
  }

  /**
   * Update an existing lesson.
   * @param lessonData The data for the lesson to update.
   */
  private updateLesson(lessonData: any): void {
    lessonData.id = this.lessonId;

    // In a real app, this would call a lesson service
    console.log('Updating lesson with data:', lessonData);

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.navigateToLessons('Bài học đã được cập nhật thành công');
    }, 1000);
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
}
