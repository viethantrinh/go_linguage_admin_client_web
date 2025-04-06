import {Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'gl-auth',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  isSignUp = signal<boolean>(false);
  authForm: FormGroup;

  readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);

  constructor() {
    this.authForm = this.fb.group({
      email: [''],
      password: [''],
      name: ['']
    });
  }

  toggleMode(): void {
    this.isSignUp.update(value => !value);
    this.authForm.reset();
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      return;
    }

    const { email, password, name } = this.authForm.value;

    if (this.isSignUp()) {
      this.authService.signUp(name, email, password).subscribe();
    } else {
      this.authService.signIn(email, password).subscribe();
    }
  }
}
