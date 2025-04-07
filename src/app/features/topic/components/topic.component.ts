import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  ButtonCloseDirective,
  ButtonDirective,
  ButtonModule,
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
} from '@coreui/angular';
import {IconDirective} from '@coreui/icons-angular';
import {finalize} from 'rxjs/operators';
import {TopicService} from '../services/topic.service';

// Define Topic model
interface Topic {
  id: number;
  name: string;
  imageUrl: string;
  isPremium: boolean;
  createdDate: Date;
}

/**
 * TopicComponent is responsible for managing topic data, including displaying,
 * filtering, pagination, and CRUD operations.
 */
@Component({
  selector: 'gl-topic',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ContainerComponent,
    CardComponent,
    CardBodyComponent,
    ButtonDirective,
    ButtonModule,
    ButtonCloseDirective,
    IconDirective,
    TableDirective,
    FormControlDirective,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalFooterComponent,
    PaginationComponent,
    PageItemDirective,
    PageLinkDirective,
    ModalBodyComponent,
    FormSelectDirective,
  ],
  templateUrl: './topic.component.html',
  styleUrl: './topic.component.scss'
})
export class TopicComponent implements OnInit {
  topics: Topic[] = [];
  filteredTopics: Topic[] = [];
  selectedFilter = 'all';
  deleteModalVisible = false;
  selectedTopic: Topic | null = null;
  loading = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  Math = Math; // To use Math in template

  readonly fb = inject(FormBuilder);
  readonly topicService = inject(TopicService);

  // Sample data for demonstration purposes
  sampleTopics: Topic[] = [
    {id: 1, name: 'English for Beginners', imageUrl: 'assets/images/topics/english_beginners.jpg', isPremium: false, createdDate: new Date('2023-01-15')},
    {id: 2, name: 'Business English', imageUrl: 'assets/images/topics/business_english.jpg', isPremium: true, createdDate: new Date('2023-02-20')},
    {id: 3, name: 'TOEFL Preparation', imageUrl: 'assets/images/topics/toefl_prep.jpg', isPremium: true, createdDate: new Date('2023-03-10')},
    {id: 4, name: 'Travel Vocabulary', imageUrl: 'assets/images/topics/travel_vocab.jpg', isPremium: false, createdDate: new Date('2023-04-05')},
    {id: 5, name: 'Everyday Conversations', imageUrl: 'assets/images/topics/everyday_convo.jpg', isPremium: false, createdDate: new Date('2023-05-12')},
    {id: 6, name: 'Medical English', imageUrl: 'assets/images/topics/medical_english.jpg', isPremium: true, createdDate: new Date('2023-06-20')},
    {id: 7, name: 'Academic Writing', imageUrl: 'assets/images/topics/academic_writing.jpg', isPremium: true, createdDate: new Date('2023-07-15')},
    {id: 8, name: 'English Idioms', imageUrl: 'assets/images/topics/english_idioms.jpg', isPremium: false, createdDate: new Date('2023-08-01')},
    {id: 9, name: 'Grammar Fundamentals', imageUrl: 'assets/images/topics/grammar_fund.jpg', isPremium: false, createdDate: new Date('2023-09-05')},
    {id: 10, name: 'Job Interview Skills', imageUrl: 'assets/images/topics/job_interview.jpg', isPremium: true, createdDate: new Date('2023-10-10')},
    {id: 11, name: 'English for IT', imageUrl: 'assets/images/topics/english_it.jpg', isPremium: true, createdDate: new Date('2023-11-15')},
    {id: 12, name: 'Pronunciation Practice', imageUrl: 'assets/images/topics/pronunciation.jpg', isPremium: false, createdDate: new Date('2023-12-20')}
  ];

  constructor() {}

  /**
   * Initialize the component by loading topics.
   */
  ngOnInit(): void {
    this.loadTopics();
  }

  /**
   * Load topics from API and apply filters.
   */
  loadTopics(): void {
    this.loading = true;
    this.topicService.getTopics()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          // Map API response to component model
          this.topics = data.map(item => ({
            id: item.id,
            name: item.name,
            imageUrl: item.imageUrl,
            isPremium: item.isPremium,
            createdDate: new Date(item.createdAt),
            displayOrder: item.displayOrder
          }));
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error loading topics:', error);
        }
      });
  }

  /**
   * Handle search input event to filter topics based on the search term.
   */
  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters(searchTerm);
  }

  /**
   * Apply the selected filter to the topic list.
   */
  applyFilter(): void {
    this.applyFilters();
  }

  /**
   * Apply filters to the topic list based on the selected filter and search term.
   */
  applyFilters(searchTerm = ''): void {
    let filtered = this.topics;

    // Apply premium/free filter
    if (this.selectedFilter !== 'all') {
      const isPremium = this.selectedFilter === 'premium';
      filtered = filtered.filter(topic => topic.isPremium === isPremium);
    }

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(topic =>
        topic.name.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredTopics = filtered;
    this.updatePagination();
    this.currentPage = 1; // Reset to first page when filtering
  }

  /**
   * Update pagination details based on the filtered topic list.
   */
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTopics.length / this.itemsPerPage);
  }

  /**
   * Change the current page of the topic list.
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  /**
   * Get the list of page numbers for pagination.
   */
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

  /**
   * Open the delete modal for a topic.
   */
  openDeleteModal(topic: Topic): void {
    this.selectedTopic = topic;
    this.deleteModalVisible = true;
  }

  /**
   * Delete the selected topic.
   */
  deleteTopic(): void {
    if (!this.selectedTopic) return;

    this.loading = true;
    this.topicService.deleteTopic(this.selectedTopic.id)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: () => {
          // Remove deleted topic from array
          this.topics = this.topics.filter(t => t.id !== this.selectedTopic!.id);
          this.deleteModalVisible = false;
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting topic:', error);
          this.deleteModalVisible = false;
        }
      });
  }
}
