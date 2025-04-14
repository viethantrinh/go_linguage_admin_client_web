import {Component, inject, OnInit} from '@angular/core';
import {
  ButtonCloseDirective,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ContainerComponent,
  FormControlDirective,
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
import {DatePipe, NgForOf, NgIf, NgStyle, SlicePipe} from '@angular/common';
import {IconDirective} from '@coreui/icons-angular';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

// Interface for mapping API response to component model
interface SentenceDisplay {
  id: number;
  englishText: string;
  vietnameseText: string;
  audioUrl?: string;
  createdDate: Date;
  topicIds?: number[];
  wordIds?: number[];
}

interface Topic {
  id: number;
  name: string;
}

interface Word {
  id: number;
  englishText: string;
  vietnameseText: string;
  imageUrl?: string;
  isSelected: boolean;
}

@Component({
  selector: 'gl-sentence',
  standalone: true,
  imports: [
    ButtonCloseDirective,
    ButtonDirective,
    CardBodyComponent,
    CardComponent,
    ContainerComponent,
    DatePipe,
    FormControlDirective,
    IconDirective,
    ModalBodyComponent,
    ModalComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    NgForOf,
    NgIf,
    NgStyle,
    PageItemDirective,
    PageLinkDirective,
    PaginationComponent,
    ReactiveFormsModule,
    SlicePipe,
    TableDirective
  ],
  templateUrl: './sentence.component.html',
  styleUrl: './sentence.component.scss'
})
export class SentenceComponent implements OnInit {
  sentences: SentenceDisplay[] = [];
  filteredSentences: SentenceDisplay[] = [];
  topics: Topic[] = [];
  words: Word[] = [];
  sentenceForm: FormGroup;
  
  editModalVisible = false;
  deleteModalVisible = false;
  selectedSentence: SentenceDisplay | null = null;
  isEditing = false;
  
  loading = false;
  formLoading = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  Math = Math; // To use Math in template

  readonly formBuilder = inject(FormBuilder);

  constructor() {
    this.sentenceForm = this.formBuilder.group({
      id: [null],
      englishText: ['', [Validators.required]],
      vietnameseText: ['', [Validators.required]],
      topicIds: [[]],
      wordIds: [[]]
    });
  }

  ngOnInit(): void {
    this.loadSentences();
    this.loadTopics();
    this.loadWords();
  }

  // Mock data loading functions - replace with actual API calls later
  loadSentences(): void {
    this.loading = true;
    // Mock data for now
    setTimeout(() => {
      this.sentences = [
        { 
          id: 1, 
          englishText: 'I like apples.', 
          vietnameseText: 'Tôi thích táo.', 
          audioUrl: 'https://example.com/sentence1.mp3', 
          createdDate: new Date(),
          topicIds: [1],
          wordIds: [1, 2]
        },
        { 
          id: 2, 
          englishText: 'The apple is red.', 
          vietnameseText: 'Quả táo màu đỏ.', 
          audioUrl: 'https://example.com/sentence2.mp3', 
          createdDate: new Date(Date.now() - 86400000),
          topicIds: [1],
          wordIds: [1]
        },
        { 
          id: 3, 
          englishText: 'I read a book.', 
          vietnameseText: 'Tôi đọc một quyển sách.', 
          audioUrl: 'https://example.com/sentence3.mp3', 
          createdDate: new Date(Date.now() - 172800000),
          topicIds: [2],
          wordIds: [3]
        },
        { 
          id: 4, 
          englishText: 'The cat is sleeping.', 
          vietnameseText: 'Con mèo đang ngủ.', 
          audioUrl: 'https://example.com/sentence4.mp3', 
          createdDate: new Date(Date.now() - 259200000),
          topicIds: [3],
          wordIds: [4]
        },
        { 
          id: 5, 
          englishText: 'I have a cat.', 
          vietnameseText: 'Tôi có một con mèo.', 
          audioUrl: 'https://example.com/sentence5.mp3', 
          createdDate: new Date(Date.now() - 345600000),
          topicIds: [3],
          wordIds: [4, 5]
        }
      ];
      this.filteredSentences = [...this.sentences];
      this.updatePagination();
      this.loading = false;
    }, 500);
  }

  loadTopics(): void {
    // Mock topics for now
    this.topics = [
      { id: 1, name: 'Food' },
      { id: 2, name: 'Home' },
      { id: 3, name: 'Animals' },
      { id: 4, name: 'Travel' },
      { id: 5, name: 'School' },
      { id: 6, name: 'Family' },
      { id: 7, name: 'Work' },
    ];
  }

  loadWords(): void {
    // Mock words for now
    this.words = [
      { id: 1, englishText: 'Apple', vietnameseText: 'Quả táo', imageUrl: 'https://example.com/apple.jpg', isSelected: false },
      { id: 2, englishText: 'Like', vietnameseText: 'Thích', isSelected: false },
      { id: 3, englishText: 'Book', vietnameseText: 'Quyển sách', imageUrl: 'https://example.com/book.jpg', isSelected: false },
      { id: 4, englishText: 'Cat', vietnameseText: 'Con mèo', imageUrl: 'https://example.com/cat.jpg', isSelected: false },
      { id: 5, englishText: 'Have', vietnameseText: 'Có', isSelected: false },
      { id: 6, englishText: 'Dog', vietnameseText: 'Con chó', imageUrl: 'https://example.com/dog.jpg', isSelected: false },
      { id: 7, englishText: 'House', vietnameseText: 'Ngôi nhà', imageUrl: 'https://example.com/house.jpg', isSelected: false },
      { id: 8, englishText: 'Big', vietnameseText: 'Lớn', isSelected: false }
    ];
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters(searchTerm);
  }

  applyFilters(searchTerm = ''): void {
    let filtered = this.sentences;

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(sentence =>
        sentence.englishText.toLowerCase().includes(searchTerm) ||
        sentence.vietnameseText.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredSentences = filtered;
    this.updatePagination();
    this.currentPage = 1; // Reset to first page when filtering
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredSentences.length / this.itemsPerPage);
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

  // Form and modal handling
  openAddModal(): void {
    this.isEditing = false;
    this.resetForm();
    this.editModalVisible = true;
  }

  openEditModal(sentence: SentenceDisplay): void {
    this.isEditing = true;
    this.selectedSentence = sentence;
    
    // Reset form and words selection
    this.resetForm();
    this.words.forEach(word => word.isSelected = false);
    
    // Populate form with selected sentence data
    this.sentenceForm.patchValue({
      id: sentence.id,
      englishText: sentence.englishText,
      vietnameseText: sentence.vietnameseText,
      topicIds: sentence.topicIds || []
    });

    // Mark selected words
    if (sentence.wordIds) {
      this.words.forEach(word => {
        word.isSelected = sentence.wordIds?.includes(word.id) || false;
      });
    }
    
    this.editModalVisible = true;
  }

  openDeleteModal(sentence: SentenceDisplay): void {
    this.selectedSentence = sentence;
    this.deleteModalVisible = true;
  }

  resetForm(): void {
    // Reset form
    this.sentenceForm.reset({
      id: null,
      englishText: '',
      vietnameseText: '',
      topicIds: []
    });
    
    // Reset words
    this.words.forEach(word => word.isSelected = false);
  }

  toggleWord(word: Word): void {
    word.isSelected = !word.isSelected;
  }

  saveSentence(): void {
    if (this.sentenceForm.invalid) return;
    
    // Get form values
    const formValue = this.sentenceForm.value;
    
    // Get selected word IDs
    const selectedWordIds = this.words
      .filter(word => word.isSelected)
      .map(word => word.id);
    
    this.formLoading = true;
    
    // In a real app, you would call an API here
    setTimeout(() => {
      if (this.isEditing && this.selectedSentence) {
        // Update existing sentence
        const index = this.sentences.findIndex(s => s.id === this.selectedSentence!.id);
        if (index !== -1) {
          this.sentences[index] = {
            ...this.sentences[index],
            englishText: formValue.englishText,
            vietnameseText: formValue.vietnameseText,
            topicIds: formValue.topicIds,
            wordIds: selectedWordIds
          };
        }
      } else {
        // Add new sentence
        const newSentence: SentenceDisplay = {
          id: this.sentences.length > 0 ? Math.max(...this.sentences.map(s => s.id)) + 1 : 1,
          englishText: formValue.englishText,
          vietnameseText: formValue.vietnameseText,
          createdDate: new Date(),
          topicIds: formValue.topicIds,
          wordIds: selectedWordIds
        };
        this.sentences.unshift(newSentence);
      }
      
      // Update filtered sentences
      this.applyFilters();
      
      // Close modal and reset form
      this.editModalVisible = false;
      this.formLoading = false;
      this.resetForm();
    }, 500);
  }

  deleteSentence(): void {
    if (!this.selectedSentence) return;
    
    this.loading = true;
    
    // In a real app, you would call an API here
    setTimeout(() => {
      // Remove deleted sentence from array
      this.sentences = this.sentences.filter(s => s.id !== this.selectedSentence!.id);
      
      // Update filtered sentences
      this.applyFilters();
      
      // Close modal
      this.deleteModalVisible = false;
      this.loading = false;
    }, 500);
  }

  playAudio(audioUrl?: string): void {
    if (!audioUrl) return;
    
    // In a real app, you would play the audio here
    console.log('Playing audio:', audioUrl);
    // Example:
    // const audio = new Audio(audioUrl);
    // audio.play();
  }

  getTopicName(topicId: number): string {
    const topic = this.topics.find(t => t.id === topicId);
    return topic ? topic.name : 'Unknown';
  }
}
