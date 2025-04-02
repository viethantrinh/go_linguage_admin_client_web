import {Routes} from '@angular/router';
import {APP_ROUTE_TOKEN} from './core/routes/app.routes.constants';
import {DashboardComponent} from './features/dashboard/components/dashboard.component';
import {UserComponent} from './features/user/components/user.component';
import {LessonComponent} from './features/lesson/components/lesson.component';
import {TopicComponent} from './features/topic/components/topic.component';
import {WordComponent} from './features/word/word.component';
import {SentenceComponent} from './features/sentence/components/sentence.component';
import {ConversationComponent} from './features/conversation/components/conversation.component';
import {SongComponent} from './features/song/components/song.component';

export const routes: Routes = [
  {
    path: APP_ROUTE_TOKEN.DASHBOARD,
    component: DashboardComponent
  },
  {
    path: APP_ROUTE_TOKEN.USER,
    component: UserComponent
  },
  {
    path: APP_ROUTE_TOKEN.LEARN_STRUCTURE_TOPIC,
    component: TopicComponent
  },
  {
    path: APP_ROUTE_TOKEN.LEARN_STRUCTURE_LESSON,
    component: LessonComponent
  },
  {
    path: APP_ROUTE_TOKEN.LEARN_MATERIAL_WORD,
    component: WordComponent
  },
  {
    path: APP_ROUTE_TOKEN.LEARN_MATERIAL_SENTENCE,
    component: SentenceComponent
  },
  {
    path: APP_ROUTE_TOKEN.LEARN_MATERIAL_CONVERSATION,
    component: ConversationComponent
  },
  {
    path: APP_ROUTE_TOKEN.LEARN_MATERIAL_SONG,
    component: SongComponent
  },
  {
    path: '',
    redirectTo: APP_ROUTE_TOKEN.DASHBOARD,
    pathMatch: 'full'
  },
];
