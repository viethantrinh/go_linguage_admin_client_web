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
interface WordDisplay {
  id: number;
  englishText: string;
  vietnameseText: string;
  imageUrl?: string;
  audioUrl?: string;
  createdDate: Date;
  topicIds?: number[];
  sentenceIds?: number[];
}

interface Topic {
  id: number;
  name: string;
}

interface Sentence {
  id: number;
  englishText: string;
  vietnameseText: string;
  isSelected: boolean;
}

@Component({
  selector: 'gl-word',
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
  templateUrl: './word.component.html',
  styleUrl: './word.component.scss'
})
export class WordComponent implements OnInit {
  words: WordDisplay[] = [];
  filteredWords: WordDisplay[] = [];
  topics: Topic[] = [];
  sentences: Sentence[] = [];
  wordForm: FormGroup;
  
  editModalVisible = false;
  deleteModalVisible = false;
  selectedWord: WordDisplay | null = null;
  isEditing = false;
  
  loading = false;
  formLoading = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  Math = Math; // To use Math in template

  readonly formBuilder = inject(FormBuilder);
  previewImage: string | null = null;

  constructor() {
    this.wordForm = this.formBuilder.group({
      id: [null],
      englishText: ['', [Validators.required]],
      vietnameseText: ['', [Validators.required]],
      imageUrl: [''],
      topicIds: [[]],
      sentenceIds: this.formBuilder.array([])
    });
  }
  
  // Image handling methods
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh');
        return;
      }
      
      // Create a preview URL
      this.previewImage = URL.createObjectURL(file);
      
      // In a real application, you would upload the file to a server here
      // and get back the URL to store in the form
      // For now, we'll simulate this by using the preview URL
      this.wordForm.patchValue({
        imageUrl: this.previewImage
      });
    }
  }
  
  removeImage(): void {
    // Clear the preview
    if (this.previewImage) {
      URL.revokeObjectURL(this.previewImage);
      this.previewImage = null;
    }
    
    // Clear the form value
    this.wordForm.patchValue({
      imageUrl: ''
    });
  }

  ngOnInit(): void {
    this.loadWords();
    this.loadTopics();
    this.loadSentences();
  }

  // Mock data loading functions - replace with actual API calls later
  loadWords(): void {
    this.loading = true;
    // Mock data for now
    setTimeout(() => {
      this.words = [
        { 
          id: 1, 
          englishText: 'Apple', 
          vietnameseText: 'Quả táo', 
          imageUrl: 'https://example.com/apple.jpg',
          audioUrl: 'https://example.com/apple.mp3', 
          createdDate: new Date(),
          topicIds: [1],
          sentenceIds: [1, 2]
        },
        { 
          id: 2, 
          englishText: 'Book', 
          vietnameseText: 'Quyển sách', 
          imageUrl: 'https://example.com/book.jpg',
          audioUrl: 'https://example.com/book.mp3', 
          createdDate: new Date(Date.now() - 86400000),
          topicIds: [2],
          sentenceIds: [3]
        },
        { 
          id: 3, 
          englishText: 'Cat', 
          vietnameseText: 'Con mèo', 
          imageUrl: 'https://example.com/cat.jpg',
          audioUrl: 'https://example.com/cat.mp3', 
          createdDate: new Date(Date.now() - 172800000),
          topicIds: [3],
          sentenceIds: [4, 5]
        },
        { 
          id: 4, 
          englishText: 'Dog', 
          vietnameseText: 'Con chó', 
          imageUrl: 'https://example.com/dog.jpg',
          audioUrl: 'https://example.com/dog.mp3', 
          createdDate: new Date(Date.now() - 259200000),
          topicIds: [3],
          sentenceIds: [6]
        },
        { 
          id: 5, 
          englishText: 'House', 
          vietnameseText: 'Ngôi nhà', 
          imageUrl: 'https://example.com/house.jpg',
          audioUrl: 'https://example.com/house.mp3', 
          createdDate: new Date(Date.now() - 345600000),
          topicIds: [2],
          sentenceIds: [7, 8]
        }
      ];
      this.filteredWords = [...this.words];
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
      { id: 4, name: 'Animals' },
      { id: 5, name: 'Animals' },
      { id: 6, name: 'Animals' },
      { id: 7, name: 'Animals' },
    ];
  }

  loadSentences(): void {
    // Mock sentences for now
    this.sentences = [
      { id: 1, englishText: 'I like apples.', vietnameseText: 'Tôi thích táo.', isSelected: false },
      { id: 2, englishText: 'The apple is red.', vietnameseText: 'Quả táo màu đỏ.', isSelected: false },
      { id: 3, englishText: 'I read a book.', vietnameseText: 'Tôi đọc một quyển sách.', isSelected: false },
      { id: 4, englishText: 'The cat is sleeping.', vietnameseText: 'Con mèo đang ngủ.', isSelected: false },
      { id: 5, englishText: 'I have a cat.', vietnameseText: 'Tôi có một con mèo.', isSelected: false },
      { id: 6, englishText: 'The dog is barking.', vietnameseText: 'Con chó đang sủa.', isSelected: false },
      { id: 7, englishText: 'This is my house.', vietnameseText: 'Đây là nhà của tôi.', isSelected: false },
      { id: 8, englishText: 'The house is big.', vietnameseText: 'Ngôi nhà rất lớn.', isSelected: false }
    ];
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters(searchTerm);
  }

  applyFilters(searchTerm = ''): void {
    let filtered = this.words;

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(word =>
        word.englishText.toLowerCase().includes(searchTerm) ||
        word.vietnameseText.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredWords = filtered;
    this.updatePagination();
    this.currentPage = 1; // Reset to first page when filtering
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredWords.length / this.itemsPerPage);
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

  openEditModal(word: WordDisplay): void {
    this.isEditing = true;
    this.selectedWord = word;
    
    // Reset form and sentences selection
    this.resetForm();
    this.sentences.forEach(sentence => sentence.isSelected = false);
    
    // Populate form with selected word data
    this.wordForm.patchValue({
      id: word.id,
      englishText: word.englishText,
      vietnameseText: word.vietnameseText,
      imageUrl: word.imageUrl || '',
      topicIds: word.topicIds || []
    });

    // Mark selected sentences
    if (word.sentenceIds) {
      this.sentences.forEach(sentence => {
        sentence.isSelected = word.sentenceIds?.includes(sentence.id) || false;
      });
    }
    
    this.editModalVisible = true;
  }

  openDeleteModal(word: WordDisplay): void {
    this.selectedWord = word;
    this.deleteModalVisible = true;
  }

  resetForm(): void {
    // Reset form
    this.wordForm.reset({
      id: null,
      englishText: '',
      vietnameseText: '',
      imageUrl: '',
      topicIds: []
    });
    
    // Reset sentences
    this.sentences.forEach(sentence => sentence.isSelected = false);
  }

  toggleSentence(sentence: Sentence): void {
    sentence.isSelected = !sentence.isSelected;
  }

  saveWord(): void {
    if (this.wordForm.invalid) return;
    
    // Get form values
    const formValue = this.wordForm.value;
    
    // Get selected sentence IDs
    const selectedSentenceIds = this.sentences
      .filter(sentence => sentence.isSelected)
      .map(sentence => sentence.id);
    
    this.formLoading = true;
    
    // In a real app, you would call an API here
    setTimeout(() => {
      if (this.isEditing && this.selectedWord) {
        // Update existing word
        const index = this.words.findIndex(w => w.id === this.selectedWord!.id);
        if (index !== -1) {
          this.words[index] = {
            ...this.words[index],
            englishText: formValue.englishText,
            vietnameseText: formValue.vietnameseText,
            imageUrl: formValue.imageUrl,
            topicIds: formValue.topicIds,
            sentenceIds: selectedSentenceIds
          };
        }
      } else {
        // Add new word
        const newWord: WordDisplay = {
          id: this.words.length > 0 ? Math.max(...this.words.map(w => w.id)) + 1 : 1,
          englishText: formValue.englishText,
          vietnameseText: formValue.vietnameseText,
          imageUrl: formValue.imageUrl,
          createdDate: new Date(),
          topicIds: formValue.topicIds,
          sentenceIds: selectedSentenceIds
        };
        this.words.unshift(newWord);
      }
      
      // Update filtered words
      this.applyFilters();
      
      // Close modal and reset form
      this.editModalVisible = false;
      this.formLoading = false;
      this.resetForm();
    }, 500);
  }

  deleteWord(): void {
    if (!this.selectedWord) return;
    
    this.loading = true;
    
    // In a real app, you would call an API here
    setTimeout(() => {
      // Remove deleted word from array
      this.words = this.words.filter(w => w.id !== this.selectedWord!.id);
      
      // Update filtered words
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
