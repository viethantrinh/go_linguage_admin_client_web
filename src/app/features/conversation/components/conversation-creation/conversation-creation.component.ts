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
  submitting = false;

  constructor(private fb: FormBuilder, private conversationService: ConversationService) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.conversationForm = this.fb.group({
      name: ['', Validators.required],
      imageUrl: [''],
      lines: this.fb.array([])
    });
  }

  get lines(): FormArray {
    return this.conversationForm.get('lines') as FormArray;
  }

  addLine(): void {
    const lineGroup = this.fb.group({
      type: [LineType.system, Validators.required],
      englishText: ['', Validators.required],
      vietnameseText: ['', Validators.required],
      options: this.fb.array([])
    });
    this.lines.push(lineGroup);
  }

  removeLine(index: number): void {
    this.lines.removeAt(index);
  }

  getOptions(lineIndex: number): FormArray {
    return (this.lines.at(lineIndex).get('options') as FormArray);
  }

  addOption(lineIndex: number): void {
    this.getOptions(lineIndex).push(
      this.fb.group({
        englishText: ['', Validators.required],
        vietnameseText: ['', Validators.required]
      })
    );
  }

  removeOption(lineIndex: number, optionIndex: number): void {
    this.getOptions(lineIndex).removeAt(optionIndex);
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
