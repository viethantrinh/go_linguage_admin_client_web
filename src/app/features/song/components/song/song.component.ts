import {Component, inject, OnInit} from '@angular/core';
import {CommonModule, DatePipe, NgForOf, NgIf, NgStyle, SlicePipe} from '@angular/common';
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
import {SongService} from '../../services/song.service';
import {SongList} from '../../models/song.model';
import {finalize} from 'rxjs';
import {SongCreationComponent} from '../song-creation/song-creation.component';

@Component({
  selector: 'gl-song',
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
    SongCreationComponent
  ],
  templateUrl: './song.component.html',
  styleUrl: './song.component.scss'
})
export class SongComponent implements OnInit {
  songs: SongList[] = [];
  filteredSongs: SongList[] = [];
  selectedSong: SongList | null = null;

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

  private songService = inject(SongService);

  constructor() {
    this.audioPlayer = new Audio();
  }

  ngOnInit(): void {
    this.loadSongs();
  }

  // Load songs with the new API
  loadSongs(): void {
    this.loading = true;
    this.songService.getAllSongs()
      .pipe(finalize(() => this.loading = false))
      .subscribe(songs => {
        this.songs = songs;
        this.filteredSongs = [...this.songs];
        this.totalItems = this.songs.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      });
  }

  // Search functionality
  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    if (searchTerm) {
      this.filteredSongs = this.songs.filter(song =>
        song.name.toLowerCase().includes(searchTerm) ||
        song.englishLyric.toLowerCase().includes(searchTerm) ||
        song.vietnameseLyric.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredSongs = [...this.songs];
    }
    this.updatePagination();
  }

  // Update pagination after filtering
  private updatePagination(): void {
    this.totalItems = this.filteredSongs.length;
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
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Modal controls
  openCreateModal(): void {
    this.createModalVisible = true;
  }

  openDeleteModal(song: SongList): void {
    this.selectedSong = song;
    this.deleteModalVisible = true;
  }

  openViewDetailsModal(song: SongList): void {
    this.selectedSong = song;
    this.viewDetailsModalVisible = true;
  }

  // Play audio
  playAudio(audioUrl: string): void {
    if (this.audioPlayer) {
      if (this.audioPlayer.src === audioUrl && !this.audioPlayer.paused) {
        this.audioPlayer.pause();
      } else {
        this.audioPlayer.src = audioUrl;
        this.audioPlayer.play();
      }
    }
  }

  // Delete song
  deleteSong(): void {
    if (!this.selectedSong) return;

    this.loading = true;
    this.songService.deleteSong(this.selectedSong.id)
      .pipe(finalize(() => {
        this.loading = false;
        this.deleteModalVisible = false;
      }))
      .subscribe(() => {
        this.loadSongs();
      });
  }

  // Handle modal closing
  handleCreateModalClosed(): void {
    this.createModalVisible = false;
    this.loadSongs(); // Reload songs after creating
  }
}
