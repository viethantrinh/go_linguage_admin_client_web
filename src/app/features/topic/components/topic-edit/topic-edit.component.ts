import {Component, OnInit} from '@angular/core';
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
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {IconDirective} from '@coreui/icons-angular';
import {Router, RouterLink} from '@angular/router';
import {TopicService} from '../../services/topic.service';
import {finalize} from 'rxjs/operators';
import {APP_ROUTE_TOKEN} from '../../../../core/routes/app.routes.constants';

@Component({
  selector: 'gl-topic-edit',
  imports: [
    ContainerComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    FormDirective,
    ReactiveFormsModule,
    ButtonDirective,
    NgStyle,
    FormControlDirective,
    FormLabelDirective,
    CardTitleDirective,
    NgForOf,
    NgIf,
    IconDirective,
    RouterLink,
    FormSelectDirective,
  ],
  templateUrl: './topic-edit.component.html',
  styleUrl: './topic-edit.component.scss'
})
export class TopicEditComponent implements OnInit {
  topicForm!: FormGroup;
  imagePreview: string | null = null;

  topicLevels = [
    {id: 1, name: 'Người mới'},
    {id: 2, name: 'Trung bình'},
    {id: 3, name: 'Trung cấp'},
    {id: 4, name: 'Nâng cao'}
  ];

  // In topic-edit.component.ts
  lessonTypes = [
    { id: 1, name: 'Bài học chính' },
    { id: 2, name: 'Bài học nói' },
    { id: 3, name: 'Bài học kiểm tra' }
  ];

  lessons: { id?: number, title: string, typeId: number }[] = [];

  constructor(
    private fb: FormBuilder,
    private topicService: TopicService,
    private router: Router
  ) {}

  // Add these properties for editing state
  editingLessonIndex: number | null = null;
  editLessonForm!: FormGroup;

  isSubmitting = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.topicForm = this.fb.group({
      title: ['', Validators.required],
      levelId: [1, Validators.required],
      isPremium: [false],
      thumbnailFile: [null],
      lessonTitle: [''],
      lessonTypeId: [1] // Default to type 1 (Lý thuyết)
    });

    // Initialize edit lesson form
    this.editLessonForm = this.fb.group({
      editTitle: ['', Validators.required],
      editTypeId: [1]
    });
  }

  // Add this method to prepare data for API submission
  prepareFormData(): any {
    if (!this.topicForm.valid) {
      return null;
    }

    this.lessons.map((lesson, index) => ({
      name: lesson.title,
      displayOrder: index + 1,
      lessonTypeId: lesson.typeId || 1
    }))

    // Create the request object according to API format
    return {
      name: this.topicForm.get('title')?.value,
      isPremium: this.topicForm.get('isPremium')?.value,
      levelTypeId: this.topicForm.get('levelId')?.value,
      lessons: this.lessons.map((lesson, index) => ({
        name: lesson.title,
        displayOrder: index + 1,
        lessonTypeId: lesson.typeId // Use the actual lesson type ID
      }))
    };
  }


  // Update addLesson method to include the type
  addLesson() {
    const lessonTitle = this.topicForm.get('lessonTitle')?.value?.trim();
    if (lessonTitle) {
      // Get selected type ID from form and convert to number
      const typeId = +this.topicForm.get('lessonTypeId')?.value;
      this.lessons.push({
        title: lessonTitle,
        typeId: typeId
      });
      this.topicForm.get('lessonTitle')?.reset();
    }
  }

  // Add helper methods for displaying type information
  getTypeName(typeId: number): string {
    const type = this.lessonTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  }

  getTypeColor(typeId: number): string {
    switch(typeId) {
      case 1: return 'rgba(78, 205, 196, 0.7)';
      case 2: return 'rgba(255, 209, 102, 0.7)';
      case 3: return 'rgba(255, 107, 107, 0.7)';
      default: return '#6c757d'; // Default gray
    }
  }

  editLesson(index: number) {
    const lesson = this.lessons[index];

    // Set form values
    this.editLessonForm.patchValue({
      editTitle: lesson.title,
      editTypeId: lesson.typeId
    });

    // Set editing state
    this.editingLessonIndex = index;
  }

  // Add method to save edits
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

    // Reset editing state
    this.cancelEditing();
  }

  // Add method to cancel editing
  cancelEditing(): void {
    this.editingLessonIndex = null;
    this.editLessonForm.reset();
  }

  removeLesson(index: number) {
    if (confirm('Bạn có chắc muốn xóa bài học này?')) {
      this.lessons.splice(index, 1);
    }
  }

  // Add a submit handler
  onSubmit() {
    if (this.topicForm.invalid) {
      // Mark form controls as touched to trigger validation messages
      Object.keys(this.topicForm.controls).forEach(key => {
        const control = this.topicForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const topicData = this.prepareFormData();
    console.log('Submitting topic data:', topicData);

    // First, create the topic
    this.topicService.createTopic(topicData)
      .pipe(
        finalize(() => {
          if (!this.imageExists()) {
            this.isSubmitting = false;
          }
        })
      )
      .subscribe({
        next: (createdTopic) => {
          console.log('Topic created:', createdTopic);

          // If there's an image, upload it
          if (this.imageExists()) {
            this.uploadTopicImage(createdTopic.id);
          } else {
            // No image to upload, navigate back to topics list
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

  // Add helper methods
  private imageExists(): boolean {
    return !!this.topicForm.get('thumbnailFile')?.value;
  }

  private uploadTopicImage(topicId: number) {
    const imageFile = this.topicForm.get('thumbnailFile')?.value;
    if (!imageFile) return;

    this.topicService.uploadTopicImage(topicId, imageFile)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (updatedTopic) => {
          console.log('Topic image uploaded:', updatedTopic);
          this.navigateToTopics('Chủ đề đã được tạo thành công với hình ảnh');
        },
        error: (error) => {
          console.error('Error uploading topic image:', error);
          // Topic was created but image upload failed
          this.navigateToTopics(
            'Chủ đề đã được tạo thành công nhưng không thể tải lên hình ảnh',
            'warning'
          );
        }
      });
  }

  private navigateToTopics(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    // You'd typically use a toast/notification service here
    // For now, just log to console
    console.log(`${type.toUpperCase()}: ${message}`);

    // Navigate back to topics list
    this.router.navigate([`/${APP_ROUTE_TOKEN.LEARN_STRUCTURE_TOPIC}`]);
  }

  // Add a method for handling file upload separately or as part of the main submission
  submitWithImage() {
    const topicData = this.prepareFormData();
    if (!topicData) return;

    const formData = new FormData();
    // Add the JSON data as a string
    formData.append('topicData', JSON.stringify(topicData));

    // Add the image file if present
    const thumbnailFile = this.topicForm.get('thumbnailFile')?.value;
    if (thumbnailFile) {
      formData.append('image', thumbnailFile);
    }

    // Then send the formData to your API
    // this.topicService.createTopicWithImage(formData).subscribe(...);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Update form control
      this.topicForm.patchValue({
        thumbnailFile: file
      });

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }


}
