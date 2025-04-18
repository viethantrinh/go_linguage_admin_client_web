import {Component, OnInit} from '@angular/core';
import {CommonModule, NgForOf, NgIf} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ButtonDirective, FormControlDirective} from '@coreui/angular';
import {ConversationService} from '../../services/conversation.service';
import {ConversationCreateDto, LineType} from '../../models/conversation.model';
import {finalize} from 'rxjs';

@Component({
  selector: 'gl-conversation-creation',
  standalone: true,
  imports: [
    CommonModule,
    NgForOf,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    FormControlDirective,
    ButtonDirective
  ],
  templateUrl: './conversation-creation.component.html',
  styleUrls: ['./conversation-creation.component.scss']
})
export class ConversationCreationComponent implements OnInit {
  conversationForm!: FormGroup;
  LineType = LineType;
  uploadingAudio: boolean[] = [];
  uploadingOptionAudio: boolean[][] = [];
  submitting = false;

  constructor(private fb: FormBuilder, private conversationService: ConversationService) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.conversationForm = this.fb.group({
      name: ['', Validators.required],
      displayOrder: [1, [Validators.required, Validators.min(1)]],
      imageUrl: [''],
      lines: this.fb.array([])
    });
  }

  get lines(): FormArray {
    return this.conversationForm.get('lines') as FormArray;
  }

  addLine(): void {
    const lineGroup = this.fb.group({
      type: [LineType.SYSTEM, Validators.required],
      englishText: ['', Validators.required],
      vietnameseText: ['', Validators.required],
      audioUrl: [''],
      options: this.fb.array([])
    });
    this.lines.push(lineGroup);
    this.uploadingAudio.push(false);
    this.uploadingOptionAudio.push([]);
  }

  removeLine(index: number): void {
    this.lines.removeAt(index);
    this.uploadingAudio.splice(index, 1);
    this.uploadingOptionAudio.splice(index, 1);
  }

  getOptions(lineIndex: number): FormArray {
    return (this.lines.at(lineIndex).get('options') as FormArray);
  }

  addOption(lineIndex: number): void {
    this.getOptions(lineIndex).push(
      this.fb.group({
        englishText: ['', Validators.required],
        vietnameseText: ['', Validators.required],
        audioUrl: ['']
      })
    );
    this.uploadingOptionAudio[lineIndex].push(false);
  }

  removeOption(lineIndex: number, optionIndex: number): void {
    this.getOptions(lineIndex).removeAt(optionIndex);
    this.uploadingOptionAudio[lineIndex].splice(optionIndex, 1);
  }

  onLineAudioSelected(event: Event, lineIndex: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploadingAudio[lineIndex] = true;
      this.conversationService.uploadAudio(file)
        .pipe(finalize(() => this.uploadingAudio[lineIndex] = false))
        .subscribe(url => {
          this.lines.at(lineIndex).get('audioUrl')?.setValue(url);
        });
    }
  }

  onOptionAudioSelected(event: Event, lineIndex: number, optionIndex: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploadingOptionAudio[lineIndex][optionIndex] = true;
      this.conversationService.uploadAudio(file)
        .pipe(finalize(() => this.uploadingOptionAudio[lineIndex][optionIndex] = false))
        .subscribe(url => {
          this.getOptions(lineIndex).at(optionIndex).get('audioUrl')?.setValue(url);
        });
    }
  }

  onSubmit(): void {
    if (this.conversationForm.invalid) return;
    this.submitting = true;
    const dto: ConversationCreateDto = this.conversationForm.value;
    this.conversationService.createConversation(dto)
      .pipe(finalize(() => this.submitting = false))
      .subscribe(() => {
        this.conversationForm.reset();
        this.lines.clear();
      });
  }
}
