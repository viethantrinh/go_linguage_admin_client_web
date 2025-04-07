# Topic Edit Component Documentation

This component provides functionality to create and edit topics in a learning platform. It includes features for managing topic details, lessons, and images.

## Component Overview

`TopicEditComponent` handles two main scenarios:
- Creating a new topic
- Editing an existing topic

## Key Features

- Form management for topic details
- Lesson management (add, edit, delete, reorder)
- Image upload and preview
- Form validation
- API integration for CRUD operations

## Component Structure

### Properties

#### Form Management
- `topicForm`: Main form for topic details
- `editLessonForm`: Form for editing lessons

#### State Management
- `isSubmitting`: Loading state indicator
- `errorMessage`: Error message display
- `isEditMode`: Whether editing or creating a topic
- `topicId`: ID of the topic being edited
- `imagePreview`: Preview URL of uploaded image
- `editingLessonIndex`: Index of lesson being edited

#### Collections
- `lessons`: Array of lessons for the topic
- `topicLevels`: Available difficulty levels
- `lessonTypes`: Types of lessons (main, speaking, test)

### Lifecycle Methods

- `ngOnInit()`: Initializes forms and checks edit mode
- `ngOnDestroy()`: Cleans up subscriptions

### Form Management

- `initForms()`: Sets up form groups and validators
- `checkEditMode()`: Determines if editing or creating
- `loadTopicDetails()`: Fetches topic data when editing

### Lesson Management

- `addLesson()`: Adds a new lesson to the list
- `editLesson()`: Puts a lesson in edit mode
- `saveEditedLesson()`: Saves changes to a lesson
- `cancelEditing()`: Cancels lesson editing
- `removeLesson()`: Deletes a lesson
- `drop()`: Handles drag-and-drop reordering

### Image Handling

- `onFileSelected()`: Processes image uploads
- `uploadTopicImage()`: Sends image to server

### Form Submission

- `onSubmit()`: Main form submission handler
- `validateForm()`: Validates form before submission
- `prepareFormData()`: Prepares data for API submission
- `createTopic()`: Creates a new topic
- `updateTopic()`: Updates an existing topic

### Helper Methods

- `getTypeName()`: Gets lesson type name from ID
- `getTypeColor()`: Gets color for lesson type
- `hasNewImage()`: Checks if there's a new image
- `hasNewImageToUpload()`: Checks if image needs uploading
- `navigateToTopics()`: Navigation after operations

## Template Features

### Layout

The template uses a responsive layout with:
- Two-column structure for form fields
- Card-based sections for organization

### Key UI Elements

1. **Topic Details**:
  - Title input
  - Lessons list with drag-and-drop
  - Lesson editing interface

2. **Lesson Management**:
  - Add lesson form
  - Edit lesson form
  - Delete lesson functionality

3. **Topic Settings**:
  - Premium checkbox (paid vs. free)
  - Level selection (beginner to advanced)

4. **Image Management**:
  - Image upload
  - Preview display

5. **Action Buttons**:
  - Submit (Create/Update)
  - Cancel

## API Integration

The component uses `TopicService` to interact with backend APIs:
- `getTopicDetail()`: Fetch topic data
- `createTopic()`: Create new topic
- `updateTopic()`: Update existing topic
- `uploadTopicImage()`: Upload topic thumbnail

## Error Handling

- Form validation errors
- API error messages
- Loading states during operations

## Usage Flow

1. User navigates to component (new or edit mode)
2. Form loads with data if editing
3. User fills in topic details
4. User manages lessons (add/edit/delete/reorder)
5. User uploads image if needed
6. User submits form
7. Component validates and processes data
8. User is redirected to topics list with success message
