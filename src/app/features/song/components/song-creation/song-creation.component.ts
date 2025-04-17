import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  AlertModule,
  BadgeModule,
  ButtonModule,
  CardModule,
  FormModule,
  GridModule,
  ProgressModule,
  SpinnerModule
} from '@coreui/angular';
import {SongService} from '../../services/song.service';
import {catchError, finalize, interval, Subscription, switchMap, takeWhile, tap} from 'rxjs';
import {IconModule} from '@coreui/icons-angular';
import {Song} from '../../models/song.model';

@Component({
  selector: 'gl-song-creation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    FormModule,
    GridModule,
    ProgressModule,
    SpinnerModule,
    BadgeModule,
    AlertModule,
    IconModule
  ],
  templateUrl: './song-creation.component.html',
  styleUrls: ['./song-creation.component.scss']
})
export class SongCreationComponent implements OnInit, OnDestroy {
  // Current step tracking
  currentStep: number = 1;
  totalSteps: number = 4;

  // Forms
  songForm: FormGroup;
  wordsForm: FormGroup;

  // Loading states
  lyricsLoading: boolean = false;
  audioLoading: boolean = false;
  alignmentLoading: boolean = false;

  // Generated content
  currentSong: Song | null = null;
  audioUrl: string = '';

  // Status polling subscription
  statusSubscription: Subscription | null = null;

  // Error handling
  error: string = '';

  // Audio player
  audioPlayer: HTMLAudioElement | null = null;
  currentHighlightedWordIndex: number = -1;

  constructor(
    private fb: FormBuilder,
    private songService: SongService
  ) {
    this.songForm = this.fb.group({
      songName: ['', Validators.required]
    });

    this.wordsForm = this.fb.group({
      words: this.fb.array([this.createWordControl()])
    });
  }

  ngOnInit(): void {
    // Create audio player element
    this.audioPlayer = new Audio();
  }

  ngOnDestroy(): void {
    this.stopPolling();
    if (this.audioPlayer) {
      this.audioPlayer.pause();
    }
  }

  get wordsArray(): FormArray {
    return this.wordsForm.get('words') as FormArray;
  }

  createWordControl(): FormGroup {
    return this.fb.group({
      word: ['', Validators.required]
    });
  }

  addWordField(): void {
    this.wordsArray.push(this.createWordControl());
  }

  removeWordField(index: number): void {
    if (this.wordsArray.length > 1) {
      this.wordsArray.removeAt(index);
    }
  }

  // Navigation methods
  goToStep(step: number): void {
    if (step < 1 || step > this.totalSteps) return;

    // Validate form data before advancing
    if (step > 1 && this.currentStep === 1) {
      if (!this.songForm.valid || !this.wordsForm.valid) {
        this.songForm.markAllAsTouched();
        this.wordsForm.markAllAsTouched();
        return;
      }
    }

    this.currentStep = step;
  }

  nextStep(): void {
    this.goToStep(this.currentStep + 1);
  }

  prevStep(): void {
    this.goToStep(this.currentStep - 1);
  }

  // Step process methods
  createSongWithLyrics(): void {
    if (!this.songForm.valid || !this.wordsForm.valid) {
      this.songForm.markAllAsTouched();
      this.wordsForm.markAllAsTouched();
      return;
    }

    this.lyricsLoading = true;
    this.error = '';

    const songData = {
      name: this.songForm.get('songName')?.value,
      words: this.wordsArray.controls.map(control => control.get('word')?.value)
    };

    this.songService.createSongWithLyrics(songData)
      .pipe(
        finalize(() => this.lyricsLoading = false),
        catchError(err => {
          this.error = `Error creating song: ${err.message || 'Unknown error'}`;
          throw err;
        })
      )
      .subscribe((song: Song) => {
        this.currentSong = song;
        this.nextStep();
      });
  }

  generateSongAudio(): void {
    if (!this.currentSong || !this.currentSong.id) {
      this.error = 'No song available to generate audio for';
      return;
    }

    this.audioLoading = true;
    this.error = '';

    this.songService.generateSongAudio(this.currentSong.id)
      .pipe(
        finalize(() => {
          // We don't set audioLoading to false here because we'll start polling
        }),
        catchError(err => {
          this.audioLoading = false;
          this.error = `Error generating audio: ${err.message || 'Unknown error'}`;
          throw err;
        })
      )
      .subscribe((song: Song) => {
        this.currentSong = song;
        // Start polling for status
        this.startPollingStatus();
      });
  }

  startPollingStatus(): void {
    if (!this.currentSong || !this.currentSong.id) {
      this.audioLoading = false;
      return;
    }

    // Poll every 15 seconds
    this.statusSubscription = interval(15000)
      .pipe(
        takeWhile(() => this.audioLoading),
        switchMap(() => this.songService.checkSongStatus(this.currentSong!.id)),
        tap(status => {
          console.log('Status check:', status);
          if (status.status) {
            // Audio generation completed
            this.audioUrl = status.audioUrl || '';
            this.audioLoading = false;
            this.stopPolling();
            this.nextStep();
          }
        }),
        catchError(err => {
          this.audioLoading = false;
          this.error = `Error checking status: ${err.message || 'Unknown error'}`;
          this.stopPolling();
          throw err;
        })
      )
      .subscribe();
  }

  stopPolling(): void {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
      this.statusSubscription = null;
    }
  }

  processAlignment(): void {
    if (!this.currentSong || !this.currentSong.id) {
      this.error = 'No song available for alignment';
      return;
    }

    this.alignmentLoading = true;
    this.error = '';

    this.songService.forceAlignmentLyrics(this.currentSong.id)
      .pipe(
        finalize(() => this.alignmentLoading = false),
        catchError(err => {
          this.error = `Error during alignment: ${err.message || 'Unknown error'}`;
          throw err;
        })
      )
      .subscribe((song: Song) => {
        this.currentSong = song;
        this.audioUrl = song.audioUrl || '';

        // Initialize audio player with the URL
        if (this.audioPlayer && this.audioUrl) {
          this.audioPlayer.src = this.audioUrl;
          this.setupAudioEvents();
        }

        this.nextStep();
      });
  }

  setupAudioEvents(): void {
    if (!this.audioPlayer || !this.currentSong?.timestamps) return;

    this.audioPlayer.ontimeupdate = () => {
      if (!this.audioPlayer || !this.currentSong?.timestamps) return;

      const currentTime = this.audioPlayer.currentTime;
      const timestamps = this.currentSong.timestamps;

      // Find the current word based on time
      let foundIndex = -1;
      for (let i = 0; i < timestamps.length; i++) {
        const word = timestamps[i];
        if (currentTime >= word.startTime && currentTime <= word.endTime) {
          foundIndex = i;
          break;
        }
      }

      // Update highlighting if a new word is found
      if (foundIndex !== this.currentHighlightedWordIndex) {
        this.currentHighlightedWordIndex = foundIndex;
        this.highlightWord(foundIndex);
      }
    };
  }

  highlightWord(index: number): void {
    // Remove all active highlights
    document.querySelectorAll('.word-highlight').forEach(el => {
      el.classList.remove('active');
    });

    // Add highlight to current word
    if (index >= 0) {
      const englishEl = document.querySelector(`.english-word-${index}`);
      const vietnameseEl = document.querySelector(`.vietnamese-word-${index}`);

      if (englishEl) englishEl.classList.add('active');
      if (vietnameseEl) vietnameseEl.classList.add('active');
    }
  }

  playAudio(): void {
    if (this.audioPlayer && this.audioUrl) {
      this.audioPlayer.play();
    }
  }

  pauseAudio(): void {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
    }
  }

  resetForm(): void {
    this.songForm.reset();
    this.wordsForm.reset();

    // Reset words form array to one empty field
    while (this.wordsArray.length) {
      this.wordsArray.removeAt(0);
    }
    this.addWordField();

    this.currentSong = null;
    this.audioUrl = '';
    this.error = '';
    this.currentHighlightedWordIndex = -1;

    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.src = '';
    }

    this.goToStep(1);
  }

  getEnglishLyricsLines(): string[] {
    return this.currentSong?.englishLyric ? this.currentSong.englishLyric.split('\n') : [];
  }

  getVietnameseLyricsLines(): string[] {
    return this.currentSong?.vietnameseLyric ? this.currentSong.vietnameseLyric.split('\n') : [];
  }
}
