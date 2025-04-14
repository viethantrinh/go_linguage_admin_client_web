import {INavData} from '@coreui/angular';
import {IconSubset} from '../../../icons/icon-subset';
import {APP_ROUTE_TOKEN} from '../../../core/routes/app.routes.constants';

export const navItems: INavData[] = [
  {
    title: true,
    name: 'Quản trị'
  },
  {
    name: 'Trang chủ',
    url: `/${APP_ROUTE_TOKEN.DASHBOARD}`,
    iconComponent: {
      name: 'cil-speedometer'
    }
  },
  {
    name: 'Người dùng',
    url: `/${APP_ROUTE_TOKEN.USER}`,
    iconComponent: {
      name: 'cil-user'
    }
  },
  {
    name: 'Cấu trúc bài học',
    iconComponent: {
      name: 'cilFeaturedPlaylist'
    },
    children: [
      {
        name: 'Chủ đề',
        url: `/${APP_ROUTE_TOKEN.LEARN_STRUCTURE_TOPIC}`
      },
      {
        name: 'Bài học',
        url: `/${APP_ROUTE_TOKEN.LEARN_STRUCTURE_LESSON}`
      },
    ]
  },
  {
    name: 'Tài nguyên học tập',
    iconComponent: {
      name: IconSubset.cilDescription
    },
    children: [
      {
        name: 'Từ vựng',
        url: `/${APP_ROUTE_TOKEN.LEARN_MATERIAL_WORD}`
      },
      {
        name: 'Câu',
        url: `/${APP_ROUTE_TOKEN.LEARN_MATERIAL_SENTENCE}`
      },
      {
        name: 'Hội thoại',
        url: `/${APP_ROUTE_TOKEN.LEARN_MATERIAL_CONVERSATION}`
      },
      {
        name: 'Bài hát',
        url: `/${APP_ROUTE_TOKEN.LEARN_MATERIAL_SONG}`
      },
      {
        name: 'Hội thoại (cho bài tập)',
        url: `/${APP_ROUTE_TOKEN.LEARN_MATERIAL_DIALOGUE}`
      },
    ]
  }
]
