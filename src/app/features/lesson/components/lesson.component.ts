import {Component, inject, OnInit} from '@angular/core';
import {
  ButtonCloseDirective,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ContainerComponent,
  FormControlDirective,
  FormSelectDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  PageItemDirective,
  PageLinkDirective,
  PaginationComponent,
  TableDirective
} from "@coreui/angular";
import {DatePipe, NgClass, NgForOf, NgIf, NgStyle, SlicePipe} from "@angular/common";
import {IconDirective} from "@coreui/icons-angular";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {finalize} from "rxjs/operators";
import {APP_ROUTE_TOKEN} from "../../../core/routes/app.routes.constants";
import {LessonService} from "../services/lesson.service";

// Interface for mapping API response to component model
interface LessonDisplay {
  id: number;
  title: string;
  typeId: number;
  topicName: string;
  createdDate: Date;
}

// Lesson type definition
interface LessonType {
  id: number;
  name: string;
}

@Component({
  selector: 'gl-lesson',
  standalone: true,
  imports: [
    ButtonCloseDirective,
    ButtonDirective,
    CardBodyComponent,
    CardComponent,
    ContainerComponent,
    DatePipe,
    FormControlDirective,
    FormSelectDirective,
    IconDirective,
    ModalBodyComponent,
    ModalComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    NgForOf,
    NgIf,
    NgStyle,
    NgClass,
    PageItemDirective,
    PageLinkDirective,
    PaginationComponent,
    ReactiveFormsModule,
    FormsModule,
    SlicePipe,
    TableDirective
  ],
  templateUrl: './lesson.component.html',
  styleUrl: './lesson.component.scss'
})
export class LessonComponent implements OnInit {
  lessons: LessonDisplay[] = [];
  filteredLessons: LessonDisplay[] = [];
  selectedFilter = 'all';
  deleteModalVisible = false;
  selectedLesson: LessonDisplay | null = null;
  loading = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  Math = Math; // To use Math in template

  readonly router = inject(Router);
  readonly lessonService = inject(LessonService);

  // Lesson types
  readonly lessonTypes: LessonType[] = [
    {id: 1, name: 'Bài học chính'},
    {id: 2, name: 'Bài học nói'},
    {id: 3, name: 'Bài học kiểm tra'}
  ];

  constructor() {
  }

  ngOnInit(): void {
    this.loadLessons();
  }

  loadLessons(): void {
    this.loading = true;
    this.lessonService.getLessons()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 1000) {
            // Map API response to display model
            this.lessons = response.result.map(lesson => ({
              id: lesson.id,
              title: lesson.name,
              typeId: lesson.lessonTypeId,
              topicName: lesson.topicName,
              createdDate: new Date(lesson.createdAt)
            }));
            this.applyFilters();
          } else {
            console.error('Error loading lessons:', response.message);
          }
        },
        error: (error) => {
          console.error('Error loading lessons:', error);
        }
      });
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters(searchTerm);
  }

  applyFilter(): void {
    this.applyFilters();
  }

  applyFilters(searchTerm = ''): void {
    let filtered = this.lessons;

    // Apply lesson type filter
    if (this.selectedFilter !== 'all') {
      switch (this.selectedFilter) {
        case 'main':
          filtered = filtered.filter(lesson => lesson.typeId === 1);
          break;
        case 'speaking':
          filtered = filtered.filter(lesson => lesson.typeId === 2);
          break;
        case 'test':
          filtered = filtered.filter(lesson => lesson.typeId === 3);
          break;
      }
    }

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(searchTerm) ||
        lesson.topicName.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredLessons = filtered;
    this.updatePagination();
    this.currentPage = 1; // Reset to first page when filtering
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredLessons.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pageNumbers: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= this.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show a subset of pages with current page in the middle if possible
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, this.currentPage - halfVisible);
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

      // Adjust if we're near the end
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  }

  openDeleteModal(lesson: LessonDisplay): void {
    this.selectedLesson = lesson;
    this.deleteModalVisible = true;
  }

  deleteLesson(): void {
    if (!this.selectedLesson) return;

    this.loading = true;
    this.lessonService.deleteLesson(this.selectedLesson.id)
      .pipe(finalize(() => {
        this.deleteModalVisible = false;
        this.loading = false;
      }))
      .subscribe({
        next: (response) => {
          if (response.code === 1000) {
            // Remove deleted lesson from array on success
            this.lessons = this.lessons.filter(l => l.id !== this.selectedLesson!.id);
            this.applyFilters();
          } else {
            console.error('Error deleting lesson:', response.message);
          }
        },
        error: (error) => {
          console.error('Error deleting lesson:', error);
        }
      });
  }

  onCreateLesson(): void {
    this.router.navigate([`/${APP_ROUTE_TOKEN.LEARN_STRUCTURE_LESSON_EDIT}`]).then();
  }

  onEditLesson(id: number): void {
    this.router.navigate([`/${APP_ROUTE_TOKEN.LEARN_STRUCTURE_LESSON_EDIT}`], {
      queryParams: {id: id}
    }).then();
  }

  getTypeName(typeId: number): string {
    const type = this.lessonTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  }
}
