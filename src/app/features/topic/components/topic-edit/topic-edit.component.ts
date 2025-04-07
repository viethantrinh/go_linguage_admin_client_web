import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Subject} from 'rxjs';
import {finalize, takeUntil} from 'rxjs/operators';
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {TopicService} from '../../services/topic.service';
import {APP_ROUTE_TOKEN} from '../../../../core/routes/app.routes.constants';
import {Lesson, LessonType, TopicLevel} from '../../models/topic.model';
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

/**
 * Component for editing or creating a topic.
 */
@Component({
  selector: 'gl-topic-edit',
  templateUrl: './topic-edit.component.html',
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
  styleUrl: './topic-edit.component.scss'
})
export class TopicEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Forms
  topicForm!: FormGroup;
  editLessonForm!: FormGroup;

  // State management
  isSubmitting = false;
  errorMessage: string | null = null;
  isEditMode = false;
  topicId: number | null = null;
  imagePreview: string | null = null;
  editingLessonIndex: number | null = null;

  // Collections
  lessons: Lesson[] = [];

  // Constants (could be moved to separate files)
  readonly topicLevels: TopicLevel[] = [
    { id: 1, name: 'Người mới' },
    { id: 2, name: 'Trung bình' },
    { id: 3, name: 'Trung cấp' },
    { id: 4, name: 'Nâng cao' }
  ];

  readonly lessonTypes: LessonType[] = [
    { id: 1, name: 'Bài học chính' },
    { id: 2, name: 'Bài học nói' },
    { id: 3, name: 'Bài học kiểm tra' }
  ];

  constructor(
    private fb: FormBuilder,
    private topicService: TopicService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForms();
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
    this.topicForm = this.fb.group({
      title: ['', Validators.required],
      levelId: [1, Validators.required],
      isPremium: [false],
      thumbnailFile: [null],
      lessonTitle: [''],
      lessonTypeId: [1]
    });

    this.editLessonForm = this.fb.group({
      editTitle: ['', Validators.required],
      editTypeId: [1]
    });
  }

  /**
   * Check if the component is in edit mode by examining the route parameters.
   */
  private checkEditMode(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const topicId = params['id'];
        if (topicId) {
          this.isEditMode = true;
          this.topicId = +topicId;
          this.loadTopicDetails(this.topicId);
        }
      });
  }

  /**
   * Load the details of a topic for editing.
   * @param id The ID of the topic to load.
   */
  loadTopicDetails(id: number): void {
    this.isSubmitting = true;
    this.errorMessage = null;

    this.topicService.getTopicDetail(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: (topicDetail) => {
          this.topicForm.patchValue({
            title: topicDetail.name,
            levelId: topicDetail.levelId,
            isPremium: topicDetail.isPremium
          });

          this.lessons = topicDetail.lessons.map((lesson: any) => ({
            id: lesson.id,
            title: lesson.name,
            typeId: lesson.lessonTypeId
          }));

          if (topicDetail.imageUrl) {
            this.imagePreview = topicDetail.imageUrl;
          }
        },
        error: (error) => {
          console.error('Error loading topic details:', error);
          this.errorMessage = 'Không thể tải thông tin chủ đề. Vui lòng thử lại.';
        }
      });
  }

  /**
   * Add a new lesson to the topic.
   */
  addLesson(): void {
    const lessonTitle = this.topicForm.get('lessonTitle')?.value?.trim();
    if (lessonTitle) {
      const typeId = +this.topicForm.get('lessonTypeId')?.value;
      this.lessons.push({
        title: lessonTitle,
        typeId: typeId
      });
      this.topicForm.get('lessonTitle')?.reset();
    }
  }

  /**
   * Edit an existing lesson.
   * @param index The index of the lesson to edit.
   */
  editLesson(index: number): void {
    const lesson = this.lessons[index];
    this.editLessonForm.patchValue({
      editTitle: lesson.title,
      editTypeId: lesson.typeId
    });
    this.editingLessonIndex = index;
  }

  /**
   * Save the edited lesson.
   */
  saveEditedLesson(): void {
    if (this.editLessonForm.invalid || this.editingLessonIndex === null) return;

    const editedTitle = this.editLessonForm.get('editTitle')?.value?.trim();
    const editedTypeId = +this.editLessonForm.get('editTypeId')?.value;

    if (editedTitle) {
      this.lessons[this.editingLessonIndex] = {
        ...this.lessons[this.editingLessonIndex],
        title: editedTitle,
        typeId: editedTypeId
      };
    }

    this.cancelEditing();
  }

  /**
   * Cancel the editing of a lesson.
   */
  cancelEditing(): void {
    this.editingLessonIndex = null;
    this.editLessonForm.reset({
      editTitle: '',
      editTypeId: 1
    });
  }

  /**
   * Remove a lesson from the topic.
   * @param index The index of the lesson to remove.
   */
  removeLesson(index: number): void {
    if (confirm('Bạn có chắc muốn xóa bài học này?')) {
      this.lessons.splice(index, 1);
    }
  }

  /**
   * Get the name of a lesson type by its ID.
   * @param typeId The ID of the lesson type.
   * @returns The name of the lesson type.
   */
  getTypeName(typeId: number): string {
    const type = this.lessonTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  }

  /**
   * Get the color associated with a lesson type by its ID.
   * @param typeId The ID of the lesson type.
   * @returns The color associated with the lesson type.
   */
  getTypeColor(typeId: number): string {
    switch (typeId) {
      case 1: return 'rgba(78, 205, 196, 0.7)';
      case 2: return 'rgba(255, 209, 102, 0.7)';
      case 3: return 'rgba(255, 107, 107, 0.7)';
      default: return '#6c757d';
    }
  }

  /**
   * Handle the drag and drop event for reordering lessons.
   * @param event The drag and drop event.
   */
  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.lessons, event.previousIndex, event.currentIndex);
  }

  /**
   * Handle the file selection event for the topic thumbnail.
   * @param event The file selection event.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.topicForm.patchValue({ thumbnailFile: file });

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Handle the form submission for creating or updating a topic.
   */
  onSubmit(): void {
    if (this.validateForm()) {
      this.isSubmitting = true;
      this.errorMessage = null;

      const topicData = this.prepareFormData();

      if (this.isEditMode && this.topicId) {
        this.updateTopic(topicData);
      } else {
        this.createTopic(topicData);
      }
    }
  }

  /**
   * Validate the form before submission.
   * @returns True if the form is valid, false otherwise.
   */
  private validateForm(): boolean {
    if (this.topicForm.invalid) {
      Object.keys(this.topicForm.controls).forEach(key => {
        this.topicForm.get(key)?.markAsTouched();
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
      name: this.topicForm.get('title')?.value,
      isPremium: this.topicForm.get('isPremium')?.value,
      levelTypeId: this.topicForm.get('levelId')?.value,
      lessons: this.lessons.map((lesson, index) => ({
        id: lesson.id,
        name: lesson.title,
        displayOrder: index + 1,
        lessonTypeId: lesson.typeId
      }))
    };
  }

  /**
   * Create a new topic.
   * @param topicData The data for the new topic.
   */
  private createTopic(topicData: any): void {
    this.topicService.createTopic(topicData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          if (!this.hasNewImage()) {
            this.isSubmitting = false;
          }
        })
      )
      .subscribe({
        next: (createdTopic) => {
          if (this.hasNewImage()) {
            this.uploadTopicImage(createdTopic.id);
          } else {
            this.navigateToTopics('Chủ đề đã được tạo thành công');
          }
        },
        error: (error) => {
          console.error('Error creating topic:', error);
          this.errorMessage = 'Không thể tạo chủ đề. Vui lòng thử lại.';
          this.isSubmitting = false;
        }
      });
  }

  /**
   * Update an existing topic.
   * @param topicData The data for the topic to update.
   */
  private updateTopic(topicData: any): void {
    topicData.id = this.topicId;

    this.topicService.updateTopic(topicData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          if (!this.hasNewImageToUpload()) {
            this.isSubmitting = false;
          }
        })
      )
      .subscribe({
        next: (updatedTopic) => {
          if (this.hasNewImageToUpload()) {
            this.uploadTopicImage(updatedTopic.id);
          } else {
            this.navigateToTopics('Chủ đề đã được cập nhật thành công');
          }
        },
        error: (error) => {
          console.error('Error updating topic:', error);
          this.errorMessage = 'Không thể cập nhật chủ đề. Vui lòng thử lại.';
          this.isSubmitting = false;
        }
      });
  }

  /**
   * Upload the image for the topic.
   * @param topicId The ID of the topic to upload the image for.
   */
  private uploadTopicImage(topicId: number): void {
    const imageFile = this.topicForm.get('thumbnailFile')?.value;
    if (!imageFile) return;

    this.topicService.uploadTopicImage(topicId, imageFile)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          const message = this.isEditMode
            ? 'Chủ đề đã được cập nhật thành công với hình ảnh mới'
            : 'Chủ đề đã được tạo thành công với hình ảnh';
          this.navigateToTopics(message);
        },
        error: (error) => {
          console.error('Error uploading topic image:', error);
          const message = this.isEditMode
            ? 'Chủ đề đã được cập nhật nhưng không thể tải lên hình ảnh mới'
            : 'Chủ đề đã được tạo thành công nhưng không thể tải lên hình ảnh';
          this.navigateToTopics(message, 'warning');
        }
      });
  }

  /**
   * Navigate to the topics list with a message.
   * @param message The message to display.
   * @param type The type of message (success, error, warning).
   */
  private navigateToTopics(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    console.log(`${type.toUpperCase()}: ${message}`);
    this.router.navigate([`/${APP_ROUTE_TOKEN.LEARN_STRUCTURE_TOPIC}`]).then();
  }

  /**
   * Check if a new image has been selected.
   * @returns True if a new image has been selected, false otherwise.
   */
  private hasNewImage(): boolean {
    return !!this.topicForm.get('thumbnailFile')?.value;
  }

  /**
   * Check if a new image needs to be uploaded.
   * @returns True if a new image needs to be uploaded, false otherwise.
   */
  private hasNewImageToUpload(): boolean {
    const file = this.topicForm.get('thumbnailFile')?.value;
    return !!file && typeof file === 'object';
  }
}
