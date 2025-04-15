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
import {finalize} from 'rxjs';
import {WordService} from '../services/word.service';
import {Topic, Sentence as ApiSentence, Word} from '../models/word.model';
// Interface for internal component use
interface WordDisplay {
  id: number;
  englishText: string;
  vietnameseText: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  createdDate: Date;
  topicIds: number[];
  sentenceIds: number[];
}

// Extended sentence interface for UI selection state
interface Sentence extends Omit<ApiSentence, 'topicIds' | 'wordIds'> {
  isSelected: boolean;
  topicIds?: number[];
  wordIds?: number[];
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
  readonly wordService = inject(WordService);
  previewImage: string | null = null;
  selectedFile: File | null = null;

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
      
      // Save the file for later upload
      this.selectedFile = file;
      
      // Create a preview URL
      this.previewImage = URL.createObjectURL(file);
    }
  }
  
  removeImage(): void {
    // Clear the preview
    if (this.previewImage) {
      URL.revokeObjectURL(this.previewImage);
      this.previewImage = null;
    }
    
    // Clear the selected file
    this.selectedFile = null;
  }

  ngOnInit(): void {
    this.loadWords();
    this.loadTopics();
    this.loadSentences();
  }

  // Load words from API
  loadWords(): void {
    this.loading = true;
    this.wordService.getWords()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 1000 && response.result) {
            // Map API response to component model
            this.words = response.result.map(word => ({
              id: word.id,
              englishText: word.englishText,
              vietnameseText: word.vietnameseText,
              imageUrl: word.imageUrl,
              audioUrl: word.audioUrl,
              createdDate: new Date(word.createdAt),
              topicIds: word.topicIds || [],
              sentenceIds: word.sentenceIds || []
            }));
            
            this.filteredWords = [...this.words];
            this.updatePagination();
          } else {
            console.error('Error loading words:', response.message);
          }
        },
        error: (err) => {
          console.error('Error fetching words:', err);
        }
      });
  }

  loadTopics(): void {
    this.wordService.getTopics()
      .subscribe({
        next: (response) => {
          if (response.code === 1000 && response.result) {
            this.topics = response.result;
          } else {
            console.error('Error loading topics:', response.message);
          }
        },
        error: (err) => {
          console.error('Error fetching topics:', err);
        }
      });
  }

  loadSentences(): void {
    this.wordService.getSentences()
      .subscribe({
        next: (response) => {
          if (response.code === 1000 && response.result) {
            // Map API response to component model with isSelected property
            this.sentences = response.result.map(sentence => ({
              ...sentence,
              isSelected: false
            }));
          } else {
            console.error('Error loading sentences:', response.message);
          }
        },
        error: (err) => {
          console.error('Error fetching sentences:', err);
        }
      });
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
    
    // Get detailed word information from API
    this.loading = true;
    this.wordService.getWordDetail(word.id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 1000 && response.result) {
            const wordDetail = response.result;
            
            // Populate form with word details
            this.wordForm.patchValue({
              id: wordDetail.id,
              englishText: wordDetail.englishText,
              vietnameseText: wordDetail.vietnameseText,
              topicIds: wordDetail.topicIds || []
            });
            
            // Set image URL for preview if available
            if (wordDetail.imageUrl) {
              this.previewImage = wordDetail.imageUrl;
            }
            
            // Mark selected sentences
            if (wordDetail.sentenceIds && wordDetail.sentenceIds.length > 0) {
              this.sentences.forEach(sentence => {
                sentence.isSelected = wordDetail.sentenceIds.includes(sentence.id);
              });
            }
            
            this.editModalVisible = true;
          } else {
            console.error('Error loading word details:', response.message);
          }
        },
        error: (err) => {
          console.error('Error fetching word details:', err);
        }
      });
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
      topicIds: []
    });
    
    // Reset sentences
    this.sentences.forEach(sentence => sentence.isSelected = false);
    
    // Reset image
    if (this.previewImage) {
      URL.revokeObjectURL(this.previewImage);
      this.previewImage = null;
    }
    this.selectedFile = null;
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
    
    // Prepare word data for API request
    const wordData = {
      englishText: formValue.englishText,
      vietnameseText: formValue.vietnameseText,
      topicIds: formValue.topicIds || [],
      sentenceIds: selectedSentenceIds
    };
    
    // Determine if it's an update or create operation
    const apiCall = this.isEditing && this.selectedWord 
      ? this.wordService.updateWord(this.selectedWord.id, wordData)
      : this.wordService.createWord(wordData);
      
    apiCall
      .pipe(finalize(() => this.formLoading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 1000 && response.result) {
            const savedWord = response.result;
            
            // If we have a file to upload and the word was saved successfully
            if (this.selectedFile && savedWord.id) {
              this.uploadImage(savedWord.id, this.selectedFile);
            } else {
              // Reload words to get the updated list
              this.loadWords();
              // Close modal
              this.editModalVisible = false;
              this.resetForm();
            }
          } else {
            console.error('Error saving word:', response.message);
            alert(`Lỗi khi lưu từ vựng: ${response.message}`);
          }
        },
        error: (err) => {
          console.error('Error saving word:', err);
          alert('Đã xảy ra lỗi khi lưu từ vựng. Vui lòng thử lại sau.');
        }
      });
  }
  
  /**
   * Upload image for a word
   * @param wordId The ID of the word
   * @param file The image file to upload
   */
  uploadImage(wordId: number, file: File): void {
    this.formLoading = true;
    
    this.wordService.uploadImage(wordId, file)
      .pipe(finalize(() => {
        this.formLoading = false;
        // Close modal
        this.editModalVisible = false;
        this.resetForm();
      }))
      .subscribe({
        next: (response) => {
          if (response.code === 1000 && response.result) {
            // Reload words to get the updated image URL
            this.loadWords();
          } else {
            console.error('Error uploading image:', response.message);
            alert(`Lỗi khi tải lên hình ảnh: ${response.message}`);
          }
        },
        error: (err) => {
          console.error('Error uploading image:', err);
          alert('Đã xảy ra lỗi khi tải lên hình ảnh. Vui lòng thử lại sau.');
          // Still reload the words since the word itself might have been saved
          this.loadWords();
        }
      });
  }

  deleteWord(): void {
    if (!this.selectedWord) return;
    
    this.loading = true;
    
    this.wordService.deleteWord(this.selectedWord.id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 1000) {
            // Reload words after successful deletion
            this.loadWords();
            // Close modal
            this.deleteModalVisible = false;
          } else {
            console.error('Error deleting word:', response.message);
            alert(`Lỗi khi xóa từ vựng: ${response.message}`);
          }
        },
        error: (err) => {
          console.error('Error deleting word:', err);
          alert('Đã xảy ra lỗi khi xóa từ vựng. Vui lòng thử lại sau.');
        }
      });
  }

  playAudio(audioUrl?: string): void {
    if (!audioUrl) return;
    
    // Play the audio file
    const audio = new Audio(audioUrl);
    audio.play().catch(err => {
      console.error('Error playing audio:', err);
    });
  }

  getTopicName(topicId: number): string {
    const topic = this.topics.find(t => t.id === topicId);
    return topic ? topic.name : 'Unknown';
  }
}
