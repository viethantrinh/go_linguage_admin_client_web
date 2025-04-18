import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {delay} from 'rxjs/operators';
import {
  Conversation,
  ConversationCreateDto,
  ConversationList,
  ConversationUpdateDto,
  LineType
} from '../models/conversation.model';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  // Mock data for conversations
  private mockConversations: ConversationList[] = [
    {
      id: 1,
      name: 'Chào hỏi cơ bản',
      displayOrder: 1,
      imageUrl: 'https://example.com/images/basic-greetings.jpg',
      createdAt: new Date().toISOString(),
      lineCount: 5
    },
    {
      id: 2,
      name: 'Gọi món ăn tại nhà hàng',
      displayOrder: 2,
      imageUrl: 'https://example.com/images/restaurant-order.jpg',
      createdAt: new Date().toISOString(),
      lineCount: 8
    },
    {
      id: 3,
      name: 'Hỏi đường đến ga tàu',
      displayOrder: 3,
      imageUrl: undefined,
      createdAt: new Date().toISOString(),
      lineCount: 6
    },
    {
      id: 4,
      name: 'Đặt lịch khám bác sĩ',
      displayOrder: 4,
      imageUrl: 'https://example.com/images/doctor-appointment.jpg',
      createdAt: new Date().toISOString(),
      lineCount: 10
    }
  ];

  // Mock detailed conversation data
  private mockDetailedConversations: Conversation[] = [
    {
      id: 1,
      name: 'Chào hỏi cơ bản',
      displayOrder: 1,
      imageUrl: 'https://example.com/images/basic-greetings.jpg',
      createdAt: new Date().toISOString(),
      lines: [
        {
          id: 1,
          conversationId: 1,
          lineNumber: 1,
          type: LineType.SYSTEM,
          englishText: 'Hello! How are you today?',
          vietnameseText: 'Xin chào! Hôm nay bạn thế nào?',
          audioUrl: 'https://example.com/audio/hello.mp3',
          options: []
        },
        {
          id: 2,
          conversationId: 1,
          lineNumber: 2,
          type: LineType.USER,
          options: [
            {
              id: 1,
              lineId: 2,
              englishText: 'I\'m fine, thank you!',
              vietnameseText: 'Tôi khỏe, cảm ơn bạn!',
              audioUrl: 'https://example.com/audio/im-fine.mp3'
            },
            {
              id: 2,
              lineId: 2,
              englishText: 'Not so good today.',
              vietnameseText: 'Hôm nay không được khỏe lắm.',
              audioUrl: 'https://example.com/audio/not-good.mp3'
            }
          ]
        },
        {
          id: 3,
          conversationId: 1,
          lineNumber: 3,
          type: LineType.SYSTEM,
          englishText: 'What\'s your name?',
          vietnameseText: 'Tên bạn là gì?',
          audioUrl: 'https://example.com/audio/whats-your-name.mp3',
          options: []
        }
      ]
    }
  ];

  constructor() { }

  // Get all conversations (paginated)
  getConversations(page: number = 1, limit: number = 10): Observable<{ items: ConversationList[], totalCount: number }> {
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = this.mockConversations.slice(startIndex, endIndex);

    // Return observable with mock data and artificial delay
    return of({
      items: paginatedItems,
      totalCount: this.mockConversations.length
    }).pipe(delay(300)); // simulate network delay
  }

  // Get all conversations without pagination (for admin displays)
  getAllConversations(): Observable<ConversationList[]> {
    return of(this.mockConversations).pipe(delay(300));
  }

  // Get a single conversation by ID
  getConversationById(id: number): Observable<Conversation> {
    const conversation = this.mockDetailedConversations.find(c => c.id === id);
    if (conversation) {
      return of(conversation).pipe(delay(300));
    }
    return of(this.mockDetailedConversations[0]).pipe(delay(300));
  }

  // Create a new conversation
  createConversation(conversationData: ConversationCreateDto): Observable<Conversation> {
    console.log('Creating conversation with data:', conversationData);

    // Create a new mock conversation with provided data
    const newId = this.mockConversations.length + 1;

    // First add to the list view
    const newConversationList: ConversationList = {
      id: newId,
      name: conversationData.name,
      displayOrder: conversationData.displayOrder,
      imageUrl: conversationData.imageUrl || undefined,
      createdAt: new Date().toISOString(),
      lineCount: conversationData.lines.length
    };

    this.mockConversations.push(newConversationList);

    // Then create the detailed conversation
    const newDetailedConversation: Conversation = {
      id: newId,
      name: conversationData.name,
      displayOrder: conversationData.displayOrder,
      imageUrl: conversationData.imageUrl,
      createdAt: new Date().toISOString(),
      lines: conversationData.lines.map((line, index) => {
        return {
          id: index + 1,
          conversationId: newId,
          lineNumber: index + 1,
          type: line.type,
          englishText: line.englishText,
          vietnameseText: line.vietnameseText,
          audioUrl: line.audioUrl,
          options: line.options?.map((option, optIndex) => {
            return {
              id: optIndex + 1,
              lineId: index + 1,
              englishText: option.englishText,
              vietnameseText: option.vietnameseText,
              audioUrl: option.audioUrl
            };
          }) || []
        };
      })
    };

    this.mockDetailedConversations.push(newDetailedConversation);

    return of(newDetailedConversation).pipe(delay(500));
  }

  // Update an existing conversation
  updateConversation(conversation: ConversationUpdateDto): Observable<Conversation> {
    // Find and update the conversation in both arrays
    const listIndex = this.mockConversations.findIndex(c => c.id === conversation.id);
    if (listIndex !== -1) {
      this.mockConversations[listIndex] = {
        ...this.mockConversations[listIndex],
        name: conversation.name,
        displayOrder: conversation.displayOrder,
        imageUrl: conversation.imageUrl
      };
    }

    const detailedIndex = this.mockDetailedConversations.findIndex(c => c.id === conversation.id);
    if (detailedIndex !== -1) {
      this.mockDetailedConversations[detailedIndex] = {
        ...this.mockDetailedConversations[detailedIndex],
        name: conversation.name,
        displayOrder: conversation.displayOrder,
        imageUrl: conversation.imageUrl
      };

      return of(this.mockDetailedConversations[detailedIndex]).pipe(delay(300));
    }

    return of(this.mockDetailedConversations[0]).pipe(delay(300));
  }

  // Delete a conversation
  deleteConversation(id: number): Observable<boolean> {
    // Remove from both arrays
    this.mockConversations = this.mockConversations.filter(c => c.id !== id);
    this.mockDetailedConversations = this.mockDetailedConversations.filter(c => c.id !== id);

    return of(true).pipe(delay(300));
  }

  // Upload audio file
  uploadAudio(file: File): Observable<string> {
    // Generate a mock URL for the audio file
    const fileName = file.name;
    const mockAudioUrl = `https://example.com/mock-audio/${Date.now()}-${fileName}`;

    // Simulate network delay for uploading
    return of(mockAudioUrl).pipe(delay(1000));
  }
}
