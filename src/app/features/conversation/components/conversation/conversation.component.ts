import {Component, inject, OnInit} from '@angular/core';
import {CommonModule, DatePipe, NgForOf, NgIf, NgStyle, SlicePipe} from '@angular/common';

// CoreUI imports
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
import {IconDirective} from '@coreui/icons-angular';

// Feature imports
import {ConversationService} from '../../services/conversation.service';
import {ConversationList} from '../../models/conversation.model';
import {ConversationCreationComponent} from '../conversation-creation/conversation-creation.component';

// RxJS imports
import {finalize} from 'rxjs';

@Component({
  selector: 'gl-conversation',
  standalone: true,
  imports: [
    CommonModule,
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
    SlicePipe,
    TableDirective,
    ConversationCreationComponent
  ],
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss'
})
export class ConversationComponent implements OnInit {
  conversations: ConversationList[] = [];
  filteredConversations: ConversationList[] = [];
  selectedConversation: ConversationList | null = null;

  // Modal visibility states
  createModalVisible = false;
  viewDetailsModalVisible = false;
  deleteModalVisible = false;
  audioPlayer: HTMLAudioElement | null = null;

  // Loading states
  loading = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 1;
  Math = Math; // To use Math in the template

  private conversationService = inject(ConversationService);

  constructor() {
    this.audioPlayer = new Audio();
  }

  ngOnInit(): void {
    this.loadConversations();
  }

  // Load conversations
  loadConversations(): void {
    this.loading = true;
    this.conversationService.getAllConversations()
      .pipe(finalize(() => this.loading = false))
      .subscribe(conversations => {
        this.conversations = conversations;
        this.filteredConversations = [...this.conversations];
        this.totalItems = this.conversations.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      });
  }

  // Search functionality
  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    if (searchTerm) {
      this.filteredConversations = this.conversations.filter(conversation =>
        conversation.name.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredConversations = [...this.conversations];
    }
    this.updatePagination();
  }

  // Update pagination after filtering
  private updatePagination(): void {
    this.totalItems = this.filteredConversations.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    // Reset to first page if current page is now invalid
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  // Pagination controls
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  getPageNumbers(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i + 1);
  }

  // Modal controls
  openCreateModal(): void {
    this.createModalVisible = true;
  }

  openDeleteModal(conversation: ConversationList): void {
    this.selectedConversation = conversation;
    this.deleteModalVisible = true;
  }

  openViewDetailsModal(conversation: ConversationList): void {
    this.selectedConversation = conversation;
    this.viewDetailsModalVisible = true;
  }

  // Show image preview
  openImagePreview(conversation: ConversationList): void {
    if (conversation.imageUrl) {
      window.open(conversation.imageUrl, '_blank');
    }
  }

  // Delete conversation
  deleteConversation(): void {
    if (!this.selectedConversation) return;

    this.loading = true;
    this.conversationService.deleteConversation(this.selectedConversation.id)
      .pipe(finalize(() => {
        this.loading = false;
        this.deleteModalVisible = false;
      }))
      .subscribe(() => {
        this.loadConversations();
      });
  }

  // Handle modal closing
  handleCreateModalClosed(): void {
    this.createModalVisible = false;
    this.loadConversations(); // Reload conversations after creating
  }
}
