// src/app/shared/components/spinner/spinner.component.ts
import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'gl-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [ngStyle]="{'background-color': overlay ? 'rgba(255, 255, 255, 0.7)' : 'transparent'}">
      <div class="spinner" [ngClass]="{'spinner-sm': size === 'small', 'spinner-lg': size === 'large'}">
        <div class="spinner-border" role="status" style="color: #00DADC">
          <span class="visually-hidden">Loading...</span>
        </div>
        <div *ngIf="text" class="spinner-text mt-2">{{ text }}</div>
      </div>
    </div>
  `,
  styles: [`
  `]
})
export class SpinnerComponent {
  @Input() color: string = 'primary'; // primary, secondary, success, danger, warning, info, light, dark
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() text: string = '';
  @Input() overlay: boolean = false; // Whether to show with overlay background
}
