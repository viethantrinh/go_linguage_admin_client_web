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
import {Song} from '../../models/song.model';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
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
    ReactiveFormsModule,
    SlicePipe,
    TableDirective,
    SongCreationComponent
  ],
  templateUrl: './song.component.html',
  styleUrl: './song.component.scss'
})
export class SongComponent implements OnInit {
  songs: Song[] = [];
  filteredSongs: Song[] = [];
  selectedSong: Song | null = null;

  // Modal visibility states
  createModalVisible = false;
  editModalVisible = false;
  deleteModalVisible = false;
  viewDetailsModalVisible = false;

  // Loading states
  loading = false;
  formLoading = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  totalPages = 1;
  Math = Math; // To use Math in the template

  private songService = inject(SongService);
  private formBuilder = inject(FormBuilder);

  // Form for song editing (simple fields, not full creation)
  songForm: FormGroup;

  constructor() {
    this.songForm = this.formBuilder.group({
      title: ['', Validators.required],
      englishLyrics: ['', Validators.required],
      vietnameseLyrics: ['', Validators.required],
      genres: [[]]
    });
  }

  ngOnInit(): void {
    this.loadSongs();
  }

  // Load songs with pagination
  loadSongs(): void {
    this.loading = true;
    this.songService.getSongs(this.currentPage, this.itemsPerPage)
      .pipe(finalize(() => this.loading = false))
      .subscribe(response => {
        this.songs = response.items;
        this.filteredSongs = [...this.songs];
        this.totalItems = response.totalCount;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      });
  }

  // Search functionality
  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    if (searchTerm) {
      this.filteredSongs = this.songs.filter(song =>
        song.title.toLowerCase().includes(searchTerm) ||
        song.englishLyrics.toLowerCase().includes(searchTerm) ||
        song.vietnameseLyrics.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredSongs = [...this.songs];
    }
  }

  // Pagination controls
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadSongs();
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

  openEditModal(song: Song): void {
    this.selectedSong = song;
    this.songForm.patchValue({
      title: song.title,
      englishLyrics: song.englishLyrics,
      vietnameseLyrics: song.vietnameseLyrics,
      genres: song.genres
    });
    this.editModalVisible = true;
  }

  openDeleteModal(song: Song): void {
    this.selectedSong = song;
    this.deleteModalVisible = true;
  }

  openViewDetailsModal(song: Song): void {
    this.selectedSong = song;
    this.viewDetailsModalVisible = true;
  }

  // Song operations
  updateSong(): void {
    if (this.songForm.invalid || !this.selectedSong) return;

    this.formLoading = true;
    const updatedSong = {
      ...this.songForm.value,
      id: this.selectedSong.id,
      audioUrl: this.selectedSong.audioUrl,
      wordTimings: this.selectedSong.wordTimings
    };

    this.songService.updateSong(updatedSong)
      .pipe(finalize(() => {
        this.formLoading = false;
        this.editModalVisible = false;
      }))
      .subscribe(() => {
        this.loadSongs();
      });
  }

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

  // Audio playback
  playAudio(audioUrl: string): void {
    const audio = new Audio(audioUrl);
    audio.play();
  }

  // Format genres for display
  formatGenres(genres: string[]): string {
    return genres.map(genre => genre.charAt(0).toUpperCase() + genre.slice(1)).join(', ');
  }

  // Handle the result of song creation
  handleSongCreated(): void {
    this.createModalVisible = false;
    this.loadSongs();
  }

  // Toggle genre selection
  toggleGenre(genre: string): void {
    if (!this.selectedSong) return;

    const genresList = [...(this.songForm.get('genres')?.value as string[] || [])];

    const index = genresList.indexOf(genre);
    if (index === -1) {
      genresList.push(genre);
    } else {
      genresList.splice(index, 1);
    }

    this.songForm.get('genres')?.setValue(genresList);
  }
}
