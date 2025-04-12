# Multiple Choice Exercise Component

## Overview
The Multiple Choice Exercise component is a feature of the GO Language Admin Web Client that allows administrators to create and manage multiple-choice exercises for language learning. This component provides a user-friendly interface for creating questions with various answer options where users can select the correct answer(s).

## Features
- Create and edit multiple-choice exercises
- Support for different question types: Word, Sentence, or Audio
- Custom UI with card-based selection for questions
- Support for multilingual content (English/Vietnamese)
- Audio playback for words and sentences
- Dynamic form for managing multiple answer options
- Visual indication of selected and disabled content

## Component Structure

```
multiple-choice-exercise/
├── models/
│   └── multiple-choice-exercise.model.ts  # Data models and interfaces
├── services/
│   └── multiple-choice-exercise.service.ts # API integration
├── multiple-choice-exercise.component.html # Component template
├── multiple-choice-exercise.component.scss # Component styles
├── multiple-choice-exercise.component.ts   # Component logic
└── README.md                               # Documentation
```

## File Documentation

### 1. models/multiple-choice-exercise.model.ts

Defines the data models and interfaces used throughout the component:

- **Word**: Represents a vocabulary word with English and Vietnamese text, optional image and audio URLs.
- **Sentence**: Represents a sentence with English and Vietnamese text and optional audio URL.
- **Enums**:
  - `QuestionType`: WORD, SENTENCE, AUDIO
  - `LanguageType`: ENGLISH, VIETNAMESE
  - `OptionType`: WORD, SENTENCE
- **MultipleChoiceOption**: Represents an answer option in a multiple-choice exercise.
- **MultipleChoiceExerciseDetail**: Represents all details of a multiple-choice exercise.
- **MultipleChoiceExerciseRequest**: Represents the data structure for creating/updating exercises.

### 2. services/multiple-choice-exercise.service.ts

Provides API integration for the component with methods for:

- `getMultipleChoiceExerciseDetail(exerciseId)`: Fetches exercise details by ID
- `getWords()`: Fetches available vocabulary words 
- `getSentences()`: Fetches available sentences
- `saveMultipleChoiceExercise(payload, isUpdate)`: Creates or updates an exercise

All API calls use proper authentication with JWT tokens and handle API responses according to the application standards.

### 3. multiple-choice-exercise.component.ts

The main component class that implements the logic for the multiple-choice exercise editor:

#### Inputs/Outputs
- `@Input() exercise`: The exercise to edit
- `@Input() lessonId`: The ID of the parent lesson
- `@Output() exerciseSaved`: Event emitted when the exercise is saved

#### Key Properties
- `multipleChoiceForm`: FormGroup for the exercise data
- `words`, `sentences`: Arrays of available words and sentences
- `questionTypes`, `languageTypes`, `optionTypes`: Enums for dropdown options

#### Key Methods
- `ngOnInit()`: Initializes the component, loads data and sets up the form
- `initForm()`: Creates the reactive form structure
- `createOptionFormGroup()`: Creates a form group for an answer option
- `addOption()`, `removeOption()`: Manages answer options
- `onQuestionTypeChange()`: Handles question type changes 
- `saveMultipleChoice()`: Validates and submits the form
- `isContentDisabled()`: Checks if content is already used in another exercise
- `playAudio()`: Plays audio content

### 4. multiple-choice-exercise.component.html

The template for the component with a user-friendly interface:

#### Key Sections
- **Form Header**: Shows exercise title and instructions
- **Question Type Selection**: Dropdown for selecting question type (Word, Sentence, Audio)
- **Content Selection**: Card-based interface for selecting question content (word or sentence)
- **Language Selections**: Dropdowns for source and target languages
- **Options Section**: Dynamic form for managing answer options
- **Submit Button**: Button for saving the exercise

#### UI Features
- Loading spinner when data is being processed
- Error messages for invalid form inputs
- Card-based selection UI for words and sentences
- Tooltip indicators for content already used in other exercises
- Audio playback buttons for words and sentences with audio

### 5. multiple-choice-exercise.component.scss

Provides styling for the component with focus on the card-based selection UI:

- `.content-list`: Styles for the list of selectable content items
- `.content-item`: Styles for individual content cards
  - Custom hover and selected states
  - Visual indication for disabled items
- Custom button styling with appropriate colors for the application design

## Color Scheme
The component uses the application's color scheme for consistency:
- Primary action buttons: `rgba(255, 209, 102, 0.7)` (Yellow - type 2)
- Delete/remove action buttons: `rgba(255, 107, 107, 0.7)` (Red - type 3)

## Usage

To use this component in a parent component:

```html
<gl-multiple-choice-exercise 
  [exercise]="exerciseData" 
  [lessonId]="currentLessonId"
  (exerciseSaved)="onExerciseSaved()">
</gl-multiple-choice-exercise>
```

## Integration Points

- **Parent Components**: This component is designed to be used within lesson editing interfaces.
- **API Integration**: Uses the MultipleChoiceExerciseService for data operations.
- **Design System**: Utilizes CoreUI components and follows the application's design guidelines.

## Development Notes

- The component uses reactive forms for data management.
- Form validation ensures all required fields are completed before submission.
- The component handles loading states and error messages to provide a good user experience.
- The card-based selection UI was designed to match the vocabulary exercise component for consistency.
