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
import {RouterLink} from '@angular/router';

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

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.topicForm = this.fb.group({
      title: ['', Validators.required],
      levelId: [1, Validators.required],
      isPremium: [false],
      thumbnailFile: [null],
      lessonTitle: [''],
      lessonTypeId: [1] // Default to type 1 (Lý thuyết)
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

    const topicData = this.prepareFormData();
    console.log('Submitting topic data:', topicData);

    // Here you would add the API call:
    // this.topicService.createTopic(topicData).subscribe(
    //   (response) => {
    //     // Handle successful response
    //     console.log('Topic created:', response);
    //     // Navigate back or show success message
    //   },
    //   (error) => {
    //     // Handle error
    //     console.error('Error creating topic:', error);
    //   }
    // );
  }

  // Update addLesson method to include the type
  addLesson() {
    const lessonTitle = this.topicForm.get('lessonTitle')?.value?.trim();
    if (lessonTitle) {
      // Get selected type ID from form
      const typeId = this.topicForm.get('lessonTypeId')?.value;
      console.log(typeId);
      this.lessons.push({
        title: lessonTitle,
        typeId: typeId
      });
      this.topicForm.get('lessonTitle')?.reset();
      // Keep the type selection as is for next lesson
    }
  }

  // Add helper methods for displaying type information
  getTypeName(typeId: number): string {
    const type = this.lessonTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  }

  getTypeColor(typeId: number): string {
    switch(typeId) {
      case 1: return 'rgba(78, 205, 196, 0.7)'; // Lý thuyết - blue-green
      case 2: return 'rgba(255, 209, 102, 0.7)'; // Thực hành - yellow
      case 3: return 'rgba(255, 107, 107, 0.7)'; // Kiểm tra - red
      default: return '#6c757d'; // Default gray
    }
  }

  editLesson(index: number) {
    const lesson = this.lessons[index];

    // First get the new title
    const newTitle = prompt('Sửa tên bài học', lesson.title);
    if (!newTitle?.trim()) return;

    // Then get the new type
    const currentType = this.lessonTypes.find(t => t.id === lesson.typeId);
    const typeOptions = this.lessonTypes.map(t => `${t.id}: ${t.name}`).join('\n');
    const typePrompt = prompt(
      `Chọn loại bài học (nhập số):\n${typeOptions}`,
      currentType?.id.toString()
    );

    // Update the lesson
    const typeId = parseInt(typePrompt || '1');
    this.lessons[index] = {
      ...lesson,
      title: newTitle.trim(),
      typeId: isNaN(typeId) ? lesson.typeId : typeId
    };
  }

  removeLesson(index: number) {
    if (confirm('Bạn có chắc muốn xóa bài học này?')) {
      this.lessons.splice(index, 1);
    }
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
