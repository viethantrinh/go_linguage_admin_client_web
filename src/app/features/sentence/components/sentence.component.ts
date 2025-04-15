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
import {Topic, Word as ApiWord} from '../models/sentence.model';
import {catchError, finalize} from 'rxjs/operators';
import {of} from 'rxjs';
import {HttpClientModule} from '@angular/common/http';
import {SentenceService} from '../services/sentence.service';

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

// Using Topic interface from service

interface Word extends ApiWord {
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
    TableDirective,
    HttpClientModule
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
  readonly sentenceService = inject(SentenceService);

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
    this.sentenceService.getAllSentences()
      .pipe(
        catchError(error => {
          console.error('Error loading sentences:', error);
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(sentences => {
        this.sentences = sentences.map(sentence => ({
          id: sentence.id,
          englishText: sentence.englishText,
          vietnameseText: sentence.vietnameseText,
          audioUrl: sentence.audioUrl,
          createdDate: new Date(sentence.createdAt),
          topicIds: sentence.topicIds,
          wordIds: sentence.wordIds
        }));
        this.filteredSentences = [...this.sentences];
        this.updatePagination();
      });
  }

  loadTopics(): void {
    this.sentenceService.getAllTopics()
      .pipe(
        catchError(error => {
          console.error('Error loading topics:', error);
          return of([]);
        })
      )
      .subscribe(topics => {
        this.topics = topics;
      });
  }

  loadWords(): void {
    this.sentenceService.getAllWords()
      .pipe(
        catchError(error => {
          console.error('Error loading words:', error);
          return of([]);
        })
      )
      .subscribe(words => {
        this.words = words.map(word => ({
          ...word,
          isSelected: false
        }));
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
    this.formLoading = true;
    this.selectedSentence = sentence;

    // Reset form and words selection
    this.resetForm();
    this.words.forEach(word => word.isSelected = false);

    // Get complete sentence details from API
    this.sentenceService.getSentenceById(sentence.id)
      .pipe(
        catchError(error => {
          console.error('Error loading sentence details:', error);
          return of(null);
        }),
        finalize(() => {
          this.formLoading = false;
        })
      )
      .subscribe(sentenceDetails => {
        if (sentenceDetails) {
          // Populate form with selected sentence data
          this.sentenceForm.patchValue({
            id: sentenceDetails.id,
            englishText: sentenceDetails.englishText,
            vietnameseText: sentenceDetails.vietnameseText,
            topicIds: sentenceDetails.topicIds || []
          });

          // Mark selected words
          if (sentenceDetails.wordIds) {
            this.words.forEach(word => {
              word.isSelected = sentenceDetails.wordIds.includes(word.id) || false;
            });
          }
        }

        this.editModalVisible = true;
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

    // Prepare the payload
    const payload = {
      englishText: formValue.englishText,
      vietnameseText: formValue.vietnameseText,
      topicIds: formValue.topicIds || [],
      wordIds: selectedWordIds
    };

    this.formLoading = true;

    if (this.isEditing && this.selectedSentence) {
      // Update existing sentence
      this.sentenceService.updateSentence(this.selectedSentence.id, payload)
        .pipe(
          catchError(error => {
            console.error('Error updating sentence:', error);
            return of(null);
          }),
          finalize(() => {
            this.formLoading = false;
          })
        )
        .subscribe(updatedSentence => {
          if (updatedSentence) {
            // Update local data
            const index = this.sentences.findIndex(s => s.id === this.selectedSentence!.id);
            if (index !== -1) {
              this.sentences[index] = {
                ...this.sentences[index],
                englishText: updatedSentence.englishText,
                vietnameseText: updatedSentence.vietnameseText,
                audioUrl: updatedSentence.audioUrl,
                topicIds: updatedSentence.topicIds,
                wordIds: updatedSentence.wordIds
              };
            }

            // Update filtered sentences
            this.applyFilters();

            // Close modal and reset form
            this.editModalVisible = false;
            this.resetForm();
          }
        });
    } else {
      // Add new sentence
      this.sentenceService.createSentence(payload)
        .pipe(
          catchError(error => {
            console.error('Error creating sentence:', error);
            return of(null);
          }),
          finalize(() => {
            this.formLoading = false;
          })
        )
        .subscribe(newSentence => {
          if (newSentence) {
            // Add to local data
            const sentenceDisplay: SentenceDisplay = {
              id: newSentence.id,
              englishText: newSentence.englishText,
              vietnameseText: newSentence.vietnameseText,
              audioUrl: newSentence.audioUrl,
              createdDate: new Date(newSentence.createdAt),
              topicIds: newSentence.topicIds,
              wordIds: newSentence.wordIds
            };
            this.sentences.unshift(sentenceDisplay);

            // Update filtered sentences
            this.applyFilters();

            // Close modal and reset form
            this.editModalVisible = false;
            this.resetForm();
          }
        });
    }
  }

  deleteSentence(): void {
    if (!this.selectedSentence) return;

    this.loading = true;

    this.sentenceService.deleteSentence(this.selectedSentence.id)
      .pipe(
        catchError(error => {
          console.error('Error deleting sentence:', error);
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(response => {
        if (response && response.code === 1000) {
          // Remove deleted sentence from array
          this.sentences = this.sentences.filter(s => s.id !== this.selectedSentence!.id);

          // Update filtered sentences
          this.applyFilters();
        }

        // Close modal
        this.deleteModalVisible = false;
      });
  }

  playAudio(audioUrl?: string): void {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
    });
  }

  getTopicName(topicId: number): string {
    const topic = this.topics.find(t => t.id === topicId);
    return topic ? topic.name : 'Unknown';
  }
}
