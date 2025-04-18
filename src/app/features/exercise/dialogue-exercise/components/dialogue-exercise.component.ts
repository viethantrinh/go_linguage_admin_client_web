import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ButtonDirective, FormControlDirective, ModalModule} from '@coreui/angular';
import {IconDirective} from '@coreui/icons-angular';
import {DialogueExercise, DialogueExerciseLine} from '../models/dialogue-exercise.model';
import {DialogueExerciseService} from '../services/dialogue-exercise.service';
import {finalize} from 'rxjs';

@Component({
  selector: 'gl-dialogue-exercise',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonDirective,
    FormControlDirective,
    IconDirective,
    ModalModule
  ],
  templateUrl: './dialogue-exercise.component.html',
  styleUrls: ['./dialogue-exercise.component.scss'],
})
export class DialogueExerciseComponent implements OnInit, OnChanges {
  @Input() exercise!: any | null;
  @Input() lessonId!: number | null;
  @Output() exerciseSaved = new EventEmitter<unknown>();

  dialogueForm!: FormGroup;
  submitting = false;
  existingDialogueExercise: DialogueExercise | null = null;
  
  // Dữ liệu mẫu cho dialogue exercise
  sampleDialogueExercise: DialogueExercise = {
    id: 1,
    context: 'Đây là một cuộc hội thoại tại nhà hàng',
    exerciseId: 1,
    dialogueLines: [
      {
        id: 1,
        dialogueExerciseId: 1,
        speaker: 'A',
        englishText: 'Good evening! Welcome to our restaurant. Do you have a reservation?',
        vietnameseText: 'Chào buổi tối! Chào mừng đến nhà hàng của chúng tôi. Bạn có đặt bàn trước không?',
        displayOrder: 1,
        hasBlank: true,
        blankWord: 'reservation'
      },
      {
        id: 2,
        dialogueExerciseId: 1,
        speaker: 'B',
        englishText: 'Yes, I reserved a table for two under the name Johnson.',
        vietnameseText: 'Vâng, tôi đã đặt bàn cho hai người với tên Johnson.',
        displayOrder: 2,
        hasBlank: false
      },
      {
        id: 3,
        dialogueExerciseId: 1,
        speaker: 'A',
        englishText: 'Let me check... Ah, yes, here it is. Please follow me to your table.',
        vietnameseText: 'Để tôi kiểm tra... À, vâng, đây rồi. Xin mời theo tôi đến bàn của bạn.',
        displayOrder: 3,
        hasBlank: false
      },
      {
        id: 4,
        dialogueExerciseId: 1,
        speaker: 'B',
        englishText: 'Thank you. Could we get a table by the window?',
        vietnameseText: 'Cảm ơn bạn. Chúng tôi có thể có bàn gần cửa sổ không?',
        displayOrder: 4,
        hasBlank: true,
        blankWord: 'window'
      }
    ]
  };

  constructor(
    private fb: FormBuilder, 
    private dialogueExerciseService: DialogueExerciseService
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    // Để xem trước chức năng, sử dụng dữ liệu mẫu
    this.existingDialogueExercise = this.sampleDialogueExercise;
    this.patchForm(this.sampleDialogueExercise);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['exercise'] && this.exercise?.id) {
      // Khi ở chế độ xem trước, sử dụng dữ liệu mẫu
      this.existingDialogueExercise = this.sampleDialogueExercise;
      this.patchForm(this.sampleDialogueExercise);
      
      // Trong trường hợp thực, sẽ gọi API
      // this.loadDialogueExercise();
    }
  }

  private initForm(): void {
    this.dialogueForm = this.fb.group({
      context: ['', Validators.required],
      dialogueLines: this.fb.array([])
    });
  }

  get dialogueLines(): FormArray {
    return this.dialogueForm.get('dialogueLines') as FormArray;
  }

  addLine(): void {
    const lineGroup = this.fb.group({
      speaker: ['A', Validators.required],
      englishText: ['', Validators.required],
      vietnameseText: ['', Validators.required],
      displayOrder: [this.dialogueLines.length + 1],
      hasBlank: [false],
      blankWord: ['']
    });
    this.dialogueLines.push(lineGroup);
  }

  removeLine(index: number): void {
    this.dialogueLines.removeAt(index);
    // Update displayOrder for remaining lines
    this.updateLineOrders();
  }

  updateLineOrders(): void {
    this.dialogueLines.controls.forEach((control, index) => {
      control.get('displayOrder')?.setValue(index + 1);
    });
  }

  toggleBlank(index: number): void {
    const control = this.dialogueLines.at(index);
    const hasBlank = control.get('hasBlank')?.value;
    control.get('hasBlank')?.setValue(!hasBlank);
    
    // If enabling blank, make sure blankWord validator is added
    if (!hasBlank) {
      control.get('blankWord')?.setValidators(Validators.required);
    } else {
      control.get('blankWord')?.clearValidators();
      control.get('blankWord')?.setValue('');
    }
    control.get('blankWord')?.updateValueAndValidity();
  }

  moveLine(index: number, direction: 'up' | 'down'): void {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === this.dialogueLines.length - 1)) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentLine = this.dialogueLines.at(index).value;
    const targetLine = this.dialogueLines.at(targetIndex).value;
    
    // Swap displayOrder values
    const tempOrder = currentLine.displayOrder;
    currentLine.displayOrder = targetLine.displayOrder;
    targetLine.displayOrder = tempOrder;
    
    // Update form controls
    this.dialogueLines.at(index).patchValue(currentLine);
    this.dialogueLines.at(targetIndex).patchValue(targetLine);
    
    // Reorder the FormArray
    const tempArray = this.dialogueLines.value;
    const current = tempArray[index];
    tempArray[index] = tempArray[targetIndex];
    tempArray[targetIndex] = current;
    
    // Clear and rebuild the FormArray
    while (this.dialogueLines.length) {
      this.dialogueLines.removeAt(0);
    }
    
    tempArray.forEach((line: any) => {
      this.dialogueLines.push(this.fb.group({
        id: [line.id || null],
        speaker: [line.speaker, Validators.required],
        englishText: [line.englishText, Validators.required],
        vietnameseText: [line.vietnameseText, Validators.required],
        displayOrder: [line.displayOrder],
        hasBlank: [line.hasBlank],
        blankWord: [line.blankWord]
      }));
    });
    
    this.updateLineOrders();
  }

  loadDialogueExercise(): void {
    if (!this.exercise?.id) return;

    this.dialogueExerciseService.getDialogueExerciseByExerciseId(this.exercise.id)
      .subscribe({
        next: (response) => {
          if (response && response.result) {
            this.existingDialogueExercise = response.result;
            this.patchForm(this.existingDialogueExercise);
          } else {
            // Initialize empty form if no existing dialogue exercise
            this.existingDialogueExercise = null;
            this.initForm();
          }
        },
        error: (error) => {
          console.error('Error loading dialogue exercise', error);
          this.existingDialogueExercise = null;
          this.initForm();
        }
      });
  }

  private patchForm(dialogueExercise: DialogueExercise | null): void {
    // Clear existing form
    this.initForm();
    
    if (dialogueExercise) {
      // Patch context
      this.dialogueForm.get('context')?.setValue(dialogueExercise.context);
      
      // Add lines
      if (dialogueExercise.dialogueLines && dialogueExercise.dialogueLines.length > 0) {
        // Sort by displayOrder
        const sortedLines = [...dialogueExercise.dialogueLines].sort((a, b) => 
          a.displayOrder - b.displayOrder
        );
        
        sortedLines.forEach(line => {
          const lineGroup = this.fb.group({
            id: [line.id],
            speaker: [line.speaker, Validators.required],
            englishText: [line.englishText, Validators.required],
            vietnameseText: [line.vietnameseText, Validators.required],
            displayOrder: [line.displayOrder],
            hasBlank: [line.hasBlank],
            blankWord: [line.blankWord ?? '']
          });
          
          // Add validators for blankWord if hasBlank is true
          if (line.hasBlank) {
            lineGroup.get('blankWord')?.setValidators(Validators.required);
            lineGroup.get('blankWord')?.updateValueAndValidity();
          }
          
          this.dialogueLines.push(lineGroup);
        });
      }
    }
  }

  onSubmit(): void {
    if (this.dialogueForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.dialogueForm);
      return;
    }
    
    this.submitting = true;
    
    // Lấy dữ liệu form và xử lý giá trị blankWord
    const formValue = this.dialogueForm.value;
    
    // Chuyển đổi blankWord từ chuỗi rỗng thành null
    if (formValue.dialogueLines) {
      formValue.dialogueLines = formValue.dialogueLines.map((line: any) => {
        // Nếu hasBlank là false hoặc blankWord là chuỗi rỗng, đặt blankWord thành null
        if (!line.hasBlank || line.blankWord === '') {
          return {
            ...line,
            blankWord: null
          };
        }
        return line;
      });
    }
    
    // Giả lập quá trình lưu
    setTimeout(() => {
      this.submitting = false;
      this.exerciseSaved.emit();
      console.log('Dữ liệu form đã xử lý:', formValue);
    }, 1000);
    
    // Code gọi API trong trường hợp thực
    /*
    if (this.existingDialogueExercise?.id) {
      // Update existing dialogue exercise
      const updateDto = {
        context: formValue.context,
        dialogueLines: formValue.dialogueLines
      };
      
      this.dialogueExerciseService.updateDialogueExercise(this.existingDialogueExercise.id, updateDto)
        .pipe(finalize(() => this.submitting = false))
        .subscribe({
          next: () => {
            this.exerciseSaved.emit();
          },
          error: (error) => {
            console.error('Error updating dialogue exercise', error);
          }
        });
    } else {
      // Create new dialogue exercise
      const createDto = {
        context: formValue.context,
        exerciseId: this.exercise?.id,
        dialogueLines: formValue.dialogueLines
      };
      
      this.dialogueExerciseService.createDialogueExercise(createDto)
        .pipe(finalize(() => this.submitting = false))
        .subscribe({
          next: () => {
            this.exerciseSaved.emit();
          },
          error: (error) => {
            console.error('Error creating dialogue exercise', error);
          }
        });
    }
    */
  }

  resetForm(): void {
    this.dialogueForm.reset();
    while (this.dialogueLines.length) {
      this.dialogueLines.removeAt(0);
    }
    
    if (this.existingDialogueExercise !== null) {
      this.patchForm(this.existingDialogueExercise);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}
