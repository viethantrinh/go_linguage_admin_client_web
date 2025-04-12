# Multiple Choice Exercise Component (`gl-multiple-choice-exercise`)

## Overview
The `MultipleChoiceExerciseComponent` is a standalone Angular component within the GO Linguage Admin Web Client. It provides administrators with a comprehensive interface to create and edit multiple-choice exercises for language learning. This component allows defining a question (based on a word, sentence, or audio) and multiple answer options (words or sentences), with the ability to mark the correct one(s).

## Features
- Create new or edit existing multiple-choice exercises.
- Supports three question types:
    - **Word:** Question based on a vocabulary word (text, optional image/audio).
    - **Sentence:** Question based on a sentence (text, optional audio).
    - **Audio:** Question based on the audio of a sentence (options must be sentences).
- Select question content using a user-friendly card-based list interface.
- Dynamically manage 1 to 4 answer options per question.
- Options can be either words or sentences (unless the question type is Audio, then options must be sentences).
- Select source and target languages (English/Vietnamese) for the exercise context.
- Mark one or more options as the correct answer.
- Visual indicators for content (words/sentences) already used in other exercises, preventing accidental reuse (but allowing selection if it's related to the *current* exercise).
- Integrated audio playback for words and sentences that have associated audio URLs.
- Reactive form implementation with validation for required fields and constraints (e.g., at least one correct answer).
- Loading indicators and user-friendly error messages.

## Component Structure

```
multiple-choice-exercise/
├── models/
│   └── multiple-choice-exercise.model.ts  # Data models, interfaces, and enums
├── services/
│   └── multiple-choice-exercise.service.ts # Service for API interactions
├── multiple-choice-exercise.component.html # Component template (HTML structure)
├── multiple-choice-exercise.component.scss # Component-specific styles (SCSS)
├── multiple-choice-exercise.component.ts   # Component logic (TypeScript class)
└── README.md                               # This documentation file
```

## File Documentation

### 1. `models/multiple-choice-exercise.model.ts`

Defines the core data structures and enumerations used by the component and service:

- **Interfaces**: `Word`, `Sentence`, `MultipleChoiceOption`, `MultipleChoiceExerciseDetail`, `MultipleChoiceExerciseRequest`. These define the shape of data for vocabulary, sentences, answer options, fetched exercise details, and the payload sent to the API.
- **Enums**:
    - `QuestionType`: Defines possible types for the main question (`WORD`, `SENTENCE`, `AUDIO`).
    - `LanguageType`: Defines language options (`ENGLISH`, `VIETNAMESE`).
    - `OptionType`: Defines possible types for answer options (`WORD`, `SENTENCE`).

### 2. `services/multiple-choice-exercise.service.ts`

Handles communication with the backend API for multiple-choice exercise data. Key methods include:

- `getMultipleChoiceExerciseDetail(exerciseId: number)`: Fetches the detailed data for a specific exercise.
- `getWords(exerciseId: number)`: Fetches the list of available words relevant to the exercise context (e.g., associated lesson/topic). Includes flags indicating if a word is used elsewhere.
- `getSentences(exerciseId: number)`: Fetches the list of available sentences relevant to the exercise context. Includes flags indicating if a sentence is used elsewhere.
- `saveMultipleChoiceExercise(payload: MultipleChoiceExerciseRequest, isUpdate: boolean)`: Sends the exercise data (payload) to the backend API to either create a new exercise or update an existing one.

### 3. `multiple-choice-exercise.component.ts`

Contains the core logic and state management for the component.

#### Inputs/Outputs
- `@Input() exercise: any`: Receives the basic exercise data (like ID, name, instruction) when editing an existing exercise.
- `@Input() lessonId: number | null`: Receives the ID of the parent lesson (provides context, though not heavily used in current logic).
- `@Output() exerciseSaved = new EventEmitter<void>()`: Emits an event when the exercise is successfully saved via the API, allowing parent components to react (e.g., close a modal, refresh a list).

#### Key Properties
- `multipleChoiceForm: FormGroup`: The main Angular reactive form instance managing all user inputs and their validation state.
- `isLoading: boolean`: Controls the visibility of loading spinners during API calls.
- `errorMessage: string | null`: Stores error messages for display in the template's alert component.
- `exerciseDetail: MultipleChoiceExerciseDetail | null`: Holds the detailed data fetched from the API when editing.
- `words: Word[]`, `sentences: Sentence[]`: Arrays storing the lists of available words and sentences fetched from the service.
- `questionTypes`, `languageTypes`, `optionTypes`: Arrays derived from the enums, used to populate dropdowns in the template.

#### Key Methods
- `ngOnInit()`: Initializes the component by setting up the form (`initForm`) and triggering data loading (`loadExerciseDetail`, `loadWords`, `loadSentences`).
- `initForm()`: Defines the structure of `multipleChoiceForm` using `FormBuilder`, including controls for question details, languages, and the `options` `FormArray`. Sets default values and validators. Subscribes to `questionType` changes.
- `optionsArray` (getter): Provides easy access to the `options` `FormArray`.
- `createOptionFormGroup()`: Creates a `FormGroup` representing a single answer option with its controls (`id`, `contentId`, `optionType`, `isCorrect`).
- `addOption()`, `removeOption(index: number)`: Methods to dynamically add or remove option FormGroups from the `optionsArray`.
- `onQuestionTypeChange(questionType: QuestionType)`: Handles logic when the main question type changes (e.g., resets `questionId`, forces option types for 'Audio' questions).
- `loadWords()`, `loadSentences()`, `loadExerciseDetail()`: Asynchronous methods to fetch data from the `MultipleChoiceExerciseService`, handling loading states and errors. `loadExerciseDetail` calls `populateForm` on success.
- `populateForm()`: Populates the `multipleChoiceForm` with data from `exerciseDetail` when editing an existing exercise.
- `getQuestionIdForForm()`: Helper to determine the correct `questionId` when populating, prioritizing related content.
- `addOptionToForm(option: any)`: Helper to add a populated option FormGroup to the `optionsArray` during form population.
- `saveMultipleChoice()`: Handles form submission: validates the form, prepares the API payload, performs final checks (e.g., at least one correct answer), calls the service to save, and handles the response (success or error). Emits `exerciseSaved` on success.
- `markFormGroupTouched()`: Utility to mark all form controls as touched to trigger validation messages.
- `playAudio(audioUrl: string)`: Plays audio using the browser's `Audio` API.
- `isContentDisabled(id: number, type: OptionType)`: Determines if a word/sentence should be visually disabled in the selection list based on whether it's used in another exercise (unless it's related to the current one).

### 4. `multiple-choice-exercise.component.html`

Defines the user interface structure and binds it to the component's logic and data.

#### Key Sections
- **Error Alert & Loading Spinner**: Conditionally displayed based on `errorMessage` and `isLoading` properties.
- **Main Form**: Wraps all input fields, bound to `multipleChoiceForm`. Handles submission via `(ngSubmit)`.
- **Exercise Info**: Displays read-only title and instruction.
- **Question Type Selection**: Dropdown (`<select>`) bound to `questionType` FormControl.
- **Question Content Selection**:
    - Conditional warnings if no words/sentences are available.
    - Card-based lists (`*ngFor`) for selecting the main question word or sentence. Uses dynamic classes (`[class.selected]`, `[class.disabled]`) and click handlers to update the `questionId` FormControl. Includes image previews and audio playback buttons.
- **Language Selections**: Dropdowns for `sourceLanguage` and `targetLanguage`.
- **Options Section**:
    - "Add Option" button.
    - Dynamically rendered cards (`*ngFor`) for each option FormGroup within the `options` FormArray (`formArrayName="options"`).
    - Each option card contains controls for:
        - Option Type (Word/Sentence, hidden for Audio questions).
        - Option Content (dropdown populated based on selected Option Type).
        - "Correct Answer" checkbox.
        - "Delete Option" button.
- **Submit Button**: Triggers form submission, disabled based on form validity and loading state.

#### UI Features
- Uses CoreUI components (`c-container`, `c-alert`, `c-spinner`, `c-select`, `c-row`, `c-col`, `c-card`, `c-button`, `c-icon`).
- Reactive form validation messages displayed near relevant controls.
- Interactive card selection for question content.
- Dynamic addition/removal of answer options.
- Clear visual distinction for selected and disabled content items.

### 5. `multiple-choice-exercise.component.scss`

Contains component-specific styles, particularly for enhancing the card-based selection UI:

- `.content-list`: Styles the container for word/sentence selection cards (e.g., border, padding, scrollbar).
- `.content-item`: Styles individual cards, including hover effects (`cursor-pointer`) and visual states:
    - `.selected`: Styles for the currently selected question card.
    - `.disabled`: Styles for cards representing content used elsewhere (e.g., reduced opacity, muted text).
- Minor adjustments for layout and alignment within the form.

## Color Scheme
The component utilizes specific background colors for action buttons, defined via inline `[ngStyle]`:
- Add/Save buttons: `rgba(118, 120, 237, 0.7)` (Purplish)
- Delete buttons: `rgba(255, 107, 107, 0.7)` (Reddish)

## Usage

This is a standalone component. To use it, import it into the `imports` array of another standalone component or an NgModule:

```typescript
// In parent component or NgModule
import { MultipleChoiceExerciseComponent } from './path/to/multiple-choice-exercise/multiple-choice-exercise.component';

@Component({
  // ...
  standalone: true,
  imports: [ CommonModule, MultipleChoiceExerciseComponent /* ... other imports */ ],
  // ...
})
export class ParentComponent {
  exerciseData = { id: 123, exercise_name: '...', instruction: '...' }; // Example data
  currentLessonId = 45; // Example lesson ID

  onExerciseSaved() {
    console.log('Exercise was saved!');
    // Add logic here, e.g., close modal, refresh list
  }
}
```

```html
<!-- In parent component's template -->
<gl-multiple-choice-exercise
  [exercise]="exerciseData"
  [lessonId]="currentLessonId"
  (exerciseSaved)="onExerciseSaved()">
</gl-multiple-choice-exercise>
```

## Integration Points

- **Parent Components**: Typically used within a modal or dedicated page for creating/editing exercises within a lesson context.
- **API Integration**: Relies heavily on `MultipleChoiceExerciseService` for all data operations.
- **Design System**: Leverages `@coreui/angular` components for UI consistency.

## Development Notes

- Built using Angular's Reactive Forms module for robust form management and validation.
- Asynchronous operations (API calls) use RxJS observables with `finalize` operator to manage loading states reliably.
- Clear separation of concerns between the component (logic), template (presentation), service (API interaction), and models (data structure).
- Includes basic debugging `console.log` statements that might be removed in production builds.