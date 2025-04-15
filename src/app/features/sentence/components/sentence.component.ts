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
import {Sentence} from '../models/sentence.model';
import {SentenceService} from '../services/sentence.service';
import {Word as WordModel} from '../../word/models/word.model';
import {WordService} from '../../word/services/word.service';
import {finalize} from 'rxjs';

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

// Import token constants
import { BASE_LOCAL_URL, TOKEN_KEY } from '../../../shared/utils/app.constants';

interface Topic {
  id: number;
  name: string;
}

interface WordDisplay {
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
  words: WordDisplay[] = [];
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
  readonly sentenceService = inject(SentenceService);
  readonly wordService = inject(WordService);

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

  // Load sentences from API
  loadSentences(): void {
    this.loading = true;
    this.sentenceService.getSentences()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 1000 && response.result) {
            this.sentences = response.result.map(sentence => ({
              id: sentence.id,
              englishText: sentence.englishText,
              vietnameseText: sentence.vietnameseText,
              audioUrl: sentence.audioUrl || undefined,
              createdDate: new Date(sentence.createdAt),
              topicIds: sentence.topicIds,
              wordIds: sentence.wordIds
            }));
            this.filteredSentences = [...this.sentences];
            this.updatePagination();
          } else {
            console.error('Failed to load sentences:', response.message);
          }
        },
        error: (error) => {
          console.error('Error loading sentences:', error);
        }
      });
  }

  loadTopics(): void {
    // Use HttpClient to fetch topics from API
    fetch(`${BASE_LOCAL_URL}/topics`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.code === 1000 && data.result) {
          this.topics = data.result.map((topic: any) => ({
            id: topic.id,
            name: topic.name
          }));
        } else {
          console.error('Failed to load topics:', data.message);
        }
      })
      .catch(error => {
        console.error('Error loading topics:', error);
      });
  }

  loadWords(): void {
    this.wordService.getWords()
      .subscribe({
        next: (response) => {
          if (response.code === 1000 && response.result) {
            this.words = response.result.map(word => ({
              id: word.id,
              englishText: word.englishText,
              vietnameseText: word.vietnameseText,
              imageUrl: word.imageUrl,
              isSelected: false
            }));
          } else {
            console.error('Failed to load words:', response.message);
          }
        },
        error: (error) => {
          console.error('Error loading words:', error);
        }
      });
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
    this.formLoading = true;
    
    // Reset form and words selection
    this.resetForm();
    
    // Get the detailed information about the sentence
    this.sentenceService.getSentenceById(sentence.id)
      .pipe(finalize(() => this.formLoading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 1000 && response.result) {
            const sentenceDetail = response.result;
            
            // Populate form with selected sentence data
            this.sentenceForm.patchValue({
              id: sentenceDetail.id,
              englishText: sentenceDetail.englishText,
              vietnameseText: sentenceDetail.vietnameseText,
              topicIds: sentenceDetail.topicIds || []
            });
            
            // Mark selected words
            this.words.forEach(word => {
              word.isSelected = sentenceDetail.wordIds?.includes(word.id) || false;
            });
            
            this.editModalVisible = true;
          } else {
            console.error('Failed to fetch sentence details:', response.message);
          }
        },
        error: (error) => {
          console.error('Error fetching sentence details:', error);
        }
      });
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

  toggleWord(word: WordDisplay): void {
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
    
    const sentenceData = {
      englishText: formValue.englishText,
      vietnameseText: formValue.vietnameseText,
      topicIds: formValue.topicIds || [],
      wordIds: selectedWordIds
    };
    
    if (this.isEditing && this.selectedSentence) {
      // Update existing sentence
      this.sentenceService.updateSentence(this.selectedSentence.id, sentenceData)
        .pipe(finalize(() => {
          this.formLoading = false;
          this.editModalVisible = false;
        }))
        .subscribe({
          next: (response) => {
            if (response.code === 1000) {
              this.loadSentences(); // Reload sentences after update
              this.resetForm();
            } else {
              console.error('Failed to update sentence:', response.message);
            }
          },
          error: (error) => {
            console.error('Error updating sentence:', error);
          }
        });
    } else {
      // Add new sentence
      this.sentenceService.createSentence(sentenceData)
        .pipe(finalize(() => {
          this.formLoading = false;
          this.editModalVisible = false;
        }))
        .subscribe({
          next: (response) => {
            if (response.code === 1000) {
              this.loadSentences(); // Reload sentences after creation
              this.resetForm();
            } else {
              console.error('Failed to create sentence:', response.message);
            }
          },
          error: (error) => {
            console.error('Error creating sentence:', error);
          }
        });
    }
  }

  deleteSentence(): void {
    if (!this.selectedSentence) return;
    
    this.loading = true;
    
    this.sentenceService.deleteSentence(this.selectedSentence.id)
      .pipe(finalize(() => {
        this.loading = false;
        this.deleteModalVisible = false;
      }))
      .subscribe({
        next: (response) => {
          if (response.code === 1000) {
            // Reload sentences after deletion
            this.loadSentences();
          } else {
            console.error('Failed to delete sentence:', response.message);
          }
        },
        error: (error) => {
          console.error('Error deleting sentence:', error);
        }
      });
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
