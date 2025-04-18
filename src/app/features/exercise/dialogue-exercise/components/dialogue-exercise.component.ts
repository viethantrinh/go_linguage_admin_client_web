import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'gl-dialogue-exercise',
  imports: [],
  templateUrl: './dialogue-exercise.component.html',
  styleUrl: './dialogue-exercise.component.scss',
})
export class DialogueExerciseComponent {
  @Input() exercise!: any | null;
  @Input() lessonId!: number | null;
  @Output() exerciseSaved = new EventEmitter<unknown>();


}
