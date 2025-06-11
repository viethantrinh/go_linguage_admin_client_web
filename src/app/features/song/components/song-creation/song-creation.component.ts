import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { IconModule } from '@coreui/icons-angular';
import { catchError, finalize, interval, Subscription, switchMap, takeWhile, tap } from 'rxjs';
import { Song } from '../../models/song.model';
import { SongService } from '../../services/song.service';

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
  totalSteps: number = 5;

  // Forms
  songForm: FormGroup;
  wordsForm: FormGroup;

  // Loading states
  lyricsLoading: boolean = false;
  audioLoading: boolean = false;
  alignmentLoading: boolean = false;
  cloudinaryLoading: boolean = false;

  // Generated content
  currentSong: Song | null = null;
  audioUrl: string = '';
  cloudinaryUrl: string = '';

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

  uploadToCloudinary(): void {
    if (!this.currentSong || !this.currentSong.id) {
      this.error = 'No song available for upload';
      return;
    }

    this.cloudinaryLoading = true;
    this.error = '';

    this.songService.uploadToCloudinary(this.currentSong.id)
      .pipe(
        finalize(() => this.cloudinaryLoading = false),
        catchError(err => {
          this.error = `Error uploading to Cloudinary: ${err.message || 'Unknown error'}`;
          throw err;
        })
      )
      .subscribe((song: Song) => {
        this.currentSong = song;
        this.cloudinaryUrl = song.audioUrl || '';
        // Don't auto-navigate, stay on step 5 to show results
        console.log('Upload to Cloudinary completed:', this.cloudinaryUrl);
      });
  }

  setupAudioEvents(): void {
    if (!this.audioPlayer || !this.currentSong?.timestamps) return;

    this.audioPlayer.ontimeupdate = () => {
      if (!this.audioPlayer || !this.currentSong?.timestamps) return;

      const currentTime = this.audioPlayer.currentTime;
      const timestamps = this.currentSong.timestamps;

      // Find the current word based on time
      let foundWordIndex = -1;
      for (let i = 0; i < timestamps.length; i++) {
        const word = timestamps[i];
        if (currentTime >= word.startTime && currentTime <= word.endTime) {
          foundWordIndex = i;
          break;
        }
      }

      // Convert timestamp index to display position in lyrics
      let displayIndex = -1;
      if (foundWordIndex >= 0) {
        displayIndex = this.convertTimestampIndexToDisplayIndex(foundWordIndex);

        // Debug logging
        console.log(`Time: ${currentTime.toFixed(2)}s, Word: "${timestamps[foundWordIndex].word}", TimestampIndex: ${foundWordIndex}, DisplayIndex: ${displayIndex}`);
      }

      // Update highlighting if a new word is found
      if (displayIndex !== this.currentHighlightedWordIndex) {
        this.currentHighlightedWordIndex = displayIndex;
        this.highlightWord(displayIndex);
      }
    };

    // Handle when audio ends
    this.audioPlayer.onended = () => {
      this.clearAllHighlights();
      console.log('Audio playback ended, highlights cleared');
    };

    // Handle when audio is paused
    this.audioPlayer.onpause = () => {
      console.log('Audio paused');
    };

    // Handle when audio starts playing
    this.audioPlayer.onplay = () => {
      console.log('Audio started playing');
    };
  }

  convertTimestampIndexToDisplayIndex(timestampIndex: number): number {
    if (!this.currentSong?.timestamps || timestampIndex < 0 || timestampIndex >= this.currentSong.timestamps.length) {
      return -1;
    }

    const englishLines = this.getEnglishLyricsLines();
    const timestamps = this.currentSong.timestamps;

    // Build a flattened word list with their display positions
    const flatWordList: { word: string, originalWord: string, displayIndex: number, lineIndex: number, wordIndex: number }[] = [];

    for (let lineIndex = 0; lineIndex < englishLines.length; lineIndex++) {
      const words = englishLines[lineIndex].split(' ').filter(word => word.trim() !== '');

      for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
        const originalWord = words[wordIndex];
        const normalizedWord = originalWord.toLowerCase().replace(/[^\w\s]/g, '');
        flatWordList.push({
          word: normalizedWord,
          originalWord: originalWord,
          displayIndex: lineIndex * 20 + wordIndex,
          lineIndex,
          wordIndex
        });
      }
    }

    // Map timestamps to display positions with better matching
    let timestampPointer = 0;

    for (let i = 0; i < flatWordList.length && timestampPointer < timestamps.length; i++) {
      const lyricWord = flatWordList[i].word;
      const timestampWord = timestamps[timestampPointer].word.toLowerCase().replace(/[^\w\s]/g, '');

      // Exact match
      if (lyricWord === timestampWord) {
        if (timestampPointer === timestampIndex) {
          console.log(`Matched word "${timestamps[timestampIndex].word}" at display index ${flatWordList[i].displayIndex}`);
          return flatWordList[i].displayIndex;
        }
        timestampPointer++;
      }
      // Partial match for similar words (e.g., contractions)
      else if (lyricWord.includes(timestampWord) || timestampWord.includes(lyricWord)) {
        if (timestampPointer === timestampIndex) {
          console.log(`Partial matched word "${timestamps[timestampIndex].word}" with "${flatWordList[i].originalWord}" at display index ${flatWordList[i].displayIndex}`);
          return flatWordList[i].displayIndex;
        }
        timestampPointer++;
      }
    }

    // Fallback: if we can't find exact match, estimate position
    if (timestampIndex < flatWordList.length) {
      console.log(`Fallback: Using estimated position ${flatWordList[timestampIndex].displayIndex} for word "${timestamps[timestampIndex].word}"`);
      return flatWordList[timestampIndex].displayIndex;
    }

    console.warn(`Could not find display index for timestamp ${timestampIndex}, word: "${timestamps[timestampIndex].word}"`);
    return -1;
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

      if (englishEl) {
        englishEl.classList.add('active');
      }
      if (vietnameseEl) {
        vietnameseEl.classList.add('active');
      }

      // Scroll to the highlighted word if needed
      if (englishEl) {
        const container = englishEl.closest('.lyrics-container');
        if (container) {
          const elementRect = (englishEl as HTMLElement).getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          // Check if element is not visible in container
          if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
            (englishEl as HTMLElement).scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }
      }
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
      // Optionally clear highlighting when paused
      // this.clearAllHighlights();
    }
  }

  clearAllHighlights(): void {
    document.querySelectorAll('.word-highlight.active').forEach(el => {
      el.classList.remove('active');
    });
    this.currentHighlightedWordIndex = -1;
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
    this.cloudinaryUrl = '';
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

  onWordClick(lineIndex: number, wordIndex: number): void {
    if (!this.currentSong?.timestamps || !this.audioPlayer) return;

    const displayIndex = lineIndex * 20 + wordIndex;

    // Find the corresponding timestamp for this display index
    const englishLines = this.getEnglishLyricsLines();
    let globalWordCount = 0;
    let targetTimestampIndex = -1;

    for (let i = 0; i < englishLines.length; i++) {
      const words = englishLines[i].split(' ').filter(word => word.trim() !== '');
      for (let j = 0; j < words.length; j++) {
        if (i === lineIndex && j === wordIndex) {
          targetTimestampIndex = globalWordCount;
          break;
        }
        if (globalWordCount < this.currentSong.timestamps.length) {
          globalWordCount++;
        }
      }
      if (targetTimestampIndex >= 0) break;
    }

    if (targetTimestampIndex >= 0 && targetTimestampIndex < this.currentSong.timestamps.length) {
      const timestamp = this.currentSong.timestamps[targetTimestampIndex];
      this.audioPlayer.currentTime = timestamp.startTime;
      console.log(`Jumped to word "${timestamp.word}" at time ${timestamp.startTime}s`);
    }
  }
}
