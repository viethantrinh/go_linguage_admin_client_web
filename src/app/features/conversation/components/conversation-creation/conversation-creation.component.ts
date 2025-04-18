import {Component, OnInit} from '@angular/core';
import {CommonModule, NgForOf, NgIf} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ButtonDirective, FormControlDirective} from '@coreui/angular';
import {ConversationService} from '../../services/conversation.service';
import {ConversationCreateDto, LineType} from '../../models/conversation.model';
import {finalize} from 'rxjs';
import {IconDirective} from '@coreui/icons-angular';

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
    ButtonDirective,
    IconDirective
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

  // Handle type change between System and User
  onTypeChange(lineIndex: number): void {
    const line = this.lines.at(lineIndex) as FormGroup;
    const type = line.get('type')?.value;
    
    if (type === LineType.user) {
      // If changing to user type, clear englishText and vietnameseText
      line.get('englishText')?.setValue(null);
      line.get('vietnameseText')?.setValue(null);
      
      // Make sure there's at least one option for user line
      if (this.getOptions(lineIndex).length === 0) {
        this.addOption(lineIndex);
      }
      
      // Remove validators for englishText and vietnameseText
      line.get('englishText')?.clearValidators();
      line.get('vietnameseText')?.clearValidators();
    } else {
      // If changing to system type, add validators back
      line.get('englishText')?.setValidators(Validators.required);
      line.get('vietnameseText')?.setValidators(Validators.required);
    }
    
    // Update the validation status
    line.get('englishText')?.updateValueAndValidity();
    line.get('vietnameseText')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.conversationForm.invalid) return;
    this.submitting = true;
    
    // Create a copy of the form value to modify before submission
    const formValue = this.conversationForm.value;
    
    // Prepare the lines data for API submission
    const lines = formValue.lines.map((line: any) => {
      if (line.type === LineType.user) {
        // Ensure user lines have null for text fields
        return {
          type: line.type,
          englishText: null,
          vietnameseText: null,
          options: line.options || []
        };
      } else {
        // System lines maintain their values
        return {
          type: line.type,
          englishText: line.englishText,
          vietnameseText: line.vietnameseText,
          options: []
        };
      }
    });
    
    const dto: ConversationCreateDto = {
      ...formValue,
      lines: lines
    };
    
    this.conversationService.createConversation(dto)
      .pipe(finalize(() => this.submitting = false))
      .subscribe(() => {
        this.conversationForm.reset();
        this.lines.clear();
      });
  }
}
