import {Routes} from '@angular/router';
import {APP_ROUTE_TOKEN} from './core/routes/app.routes.constants';
import {AuthComponent} from './features/auth/components/auth.component';
import {GuestGuard} from './core/guards/guest.guard';
import {AuthGuard} from './core/guards/auth.guard';
import {DefaultLayoutComponent} from './shared/components/default-layout/default-layout.component';

export const routes: Routes = [
  {
    path: APP_ROUTE_TOKEN.AUTH,
    component: AuthComponent,
    canActivate: [GuestGuard]
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: APP_ROUTE_TOKEN.DASHBOARD,
        loadComponent: () => import('./features/dashboard/components/dashboard.component').then(c => c.DashboardComponent)
      },
      {
        path: APP_ROUTE_TOKEN.USER,
        loadComponent: () => import('./features/user/components/user.component').then(c => c.UserComponent)
      },
      {
        path: APP_ROUTE_TOKEN.LEARN_STRUCTURE_TOPIC,
        loadComponent: () => import('./features/topic/components/topic.component').then(c => c.TopicComponent)
      },
      {
        path: APP_ROUTE_TOKEN.LEARN_STRUCTURE_TOPIC_EDIT,
        loadComponent: () => import('./features/topic/components/topic-edit/topic-edit.component').then(c => c.TopicEditComponent)
      },
      {
        path: APP_ROUTE_TOKEN.LEARN_STRUCTURE_LESSON,
        loadComponent: () => import('./features/lesson/components/lesson.component').then(c => c.LessonComponent)
      },
      {
        path: APP_ROUTE_TOKEN.LEARN_STRUCTURE_LESSON_EDIT,
        loadComponent: () => import('./features/lesson/components/lesson-edit/lesson-edit.component').then(c => c.LessonEditComponent)
      },
      {
        path: APP_ROUTE_TOKEN.LEARN_MATERIAL_WORD,
        loadComponent: () => import('./features/word/components/word.component').then(c => c.WordComponent)
      },
      {
        path: APP_ROUTE_TOKEN.LEARN_MATERIAL_SENTENCE,
        loadComponent: () => import('./features/sentence/components/sentence.component').then(c => c.SentenceComponent)
      },
      {
        path: APP_ROUTE_TOKEN.LEARN_MATERIAL_CONVERSATION,
        loadComponent: () => import('./features/conversation/components/conversation/conversation.component').then(c => c.ConversationComponent)
      },
      {
        path: APP_ROUTE_TOKEN.LEARN_MATERIAL_SONG,
        loadComponent: () => import('./features/song/components/song/song.component').then(c => c.SongComponent)
      },
      {
        path: '',
        redirectTo: APP_ROUTE_TOKEN.DASHBOARD,
        pathMatch: 'full'
      }
    ]
  },
  // Fallback route
  {
    path: '**',
    redirectTo: APP_ROUTE_TOKEN.AUTH
  }
];
