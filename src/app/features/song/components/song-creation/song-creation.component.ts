import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
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
import {LyricsData, SongService, WordTiming} from '../../services/song.service';
import {finalize} from 'rxjs/operators';
import {IconModule} from '@coreui/icons-angular';

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
export class SongCreationComponent implements OnInit {
  // Current step tracking
  currentStep: number = 1;
  totalSteps: number = 5;

  // Forms
  songForm: FormGroup;

  // Loading states
  lyricsLoading: boolean = false;
  audioLoading: boolean = false;
  alignmentLoading: boolean = false;
  saveLoading: boolean = false;

  // Generated content
  englishLyrics: string = '';
  vietnameseLyrics: string = '';
  audioUrl: string = '';
  cloudinaryUrl: string = '';

  // Word timing data for alignment
  wordTimings: WordTiming[] = [];

  // Progress tracking for audio generation
  audioProgress: number = 0;
  progressInterval: any;

  constructor(
    private fb: FormBuilder,
    private songService: SongService
  ) {
    this.songForm = this.fb.group({
      songTitle: ['', Validators.required],
      genres: this.fb.group({
        pop: [false],
        rock: [false],
        ballad: [false],
        rap: [false],
        electronic: [false],
        folk: [false],
        rnb: [false],
        jazz: [false]
      }),
      keywords: ['']
    });
  }

  ngOnInit(): void {}

  // Navigation methods
  goToStep(step: number): void {
    if (step < 1 || step > this.totalSteps) return;

    // Validate form data before advancing
    if (step > 1 && this.currentStep === 1 && !this.songForm.get('songTitle')?.value) {
      this.songForm.get('songTitle')?.markAsTouched();
      return;
    }

    this.currentStep = step;

    // Special logic for each step
    if (step === 2 && !this.englishLyrics) {
      this.generateLyrics();
    } else if (step === 3 && !this.audioUrl) {
      this.generateAudio();
    } else if (step === 4 && this.wordTimings.length === 0) {
      this.processAlignment();
    } else if (step === 5 && !this.cloudinaryUrl) {
      this.saveToDatabase();
    }
  }

  nextStep(): void {
    this.goToStep(this.currentStep + 1);
  }

  prevStep(): void {
    this.goToStep(this.currentStep - 1);
  }

  // Step process methods
  generateLyrics(): void {
    this.lyricsLoading = true;

    this.songService.generateLyrics(this.songForm.value)
      .pipe(finalize(() => this.lyricsLoading = false))
      .subscribe((data: LyricsData) => {
        this.englishLyrics = data.english;
        this.vietnameseLyrics = data.vietnamese;
      });
  }

  regenerateLyrics(): void {
    this.generateLyrics();
  }

  generateAudio(): void {
    this.audioLoading = true;
    this.audioProgress = 0;

    // Start progress animation
    this.progressInterval = setInterval(() => {
      this.audioProgress += Math.floor(Math.random() * 5) + 1;
      if (this.audioProgress >= 100) {
        this.audioProgress = 95; // Keep at 95% until actually complete
      }
    }, 300);

    // Get audio from service
    const lyricsData: LyricsData = {
      english: this.englishLyrics,
      vietnamese: this.vietnameseLyrics
    };

    this.songService.generateAudio(lyricsData)
      .pipe(finalize(() => {
        clearInterval(this.progressInterval);
        this.audioProgress = 100;
        this.audioLoading = false;
      }))
      .subscribe((audioUrl: string) => {
        this.audioUrl = audioUrl;
      });
  }

  regenerateAudio(): void {
    this.generateAudio();
  }

  processAlignment(): void {
    this.alignmentLoading = true;

    this.songService.processAlignment(this.audioUrl)
      .pipe(finalize(() => this.alignmentLoading = false))
      .subscribe((timings: WordTiming[]) => {
        this.wordTimings = timings;
      });
  }

  saveToDatabase(): void {
    this.saveLoading = true;

    const songData = {
      title: this.songForm.get('songTitle')?.value,
      genres: this.getSelectedGenres(),
      lyrics: {
        english: this.englishLyrics,
        vietnamese: this.vietnameseLyrics
      },
      audioUrl: this.audioUrl,
      wordTimings: this.wordTimings
    };

    this.songService.saveSong(songData)
      .pipe(finalize(() => this.saveLoading = false))
      .subscribe(result => {
        if (result.success) {
          this.cloudinaryUrl = result.cloudinaryUrl;
        }
      });
  }

  // Helper methods
  getSelectedGenres(): string[] {
    const genres: string[] = [];
    const genresGroup = this.songForm.get('genres') as FormGroup;

    Object.keys(genresGroup.controls).forEach(key => {
      if (genresGroup.get(key)?.value) {
        genres.push(key);
      }
    });

    return genres;
  }

  playWordAudio(startTime: number): void {
    const audio = document.getElementById('aligned-audio') as HTMLAudioElement;
    if (audio) {
      audio.currentTime = startTime;
      audio.play();

      // Visually indicate which word is active
      document.querySelectorAll('.word-timing').forEach(el => {
        el.classList.remove('active');
      });

      // Find and highlight the active word element
      const activeWords = document.querySelectorAll('.word-timing');
      for (let i = 0; i < activeWords.length; i++) {
        const wordEl = activeWords[i] as HTMLElement;
        if (parseFloat(wordEl.getAttribute('data-start') || '0') === startTime) {
          wordEl.classList.add('active');
          break;
        }
      }
    }
  }

  resetForm(): void {
    this.songForm.reset();
    this.englishLyrics = '';
    this.vietnameseLyrics = '';
    this.audioUrl = '';
    this.cloudinaryUrl = '';
    this.wordTimings = [];
    this.goToStep(1);
  }
}
