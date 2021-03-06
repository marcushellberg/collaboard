import { Commands, Context, Route, Router } from '@vaadin/router';

import './components/main-view';
import './components/board-view/board-view';
import './components/empty-view';
import './components/login-view';
import { autorun } from 'mobx';
import { appState } from './state/app-state';

const REDIRECT_PATH_KEY = 'login-redirect-path';
const routes: Route[] = [
  {
    path: '/login',
    component: 'login-view',
  },
  {
    path: '/logout',
    action: (_: Context, commands: Commands) => {
      appState.logout();
      sessionStorage.removeItem(REDIRECT_PATH_KEY);
      return commands.redirect('/login');
    },
  },

  {
    path: '/',
    component: 'main-view',
    action: (context: Context, commands: Commands) => {
      sessionStorage.setItem(REDIRECT_PATH_KEY, context.pathname);
      if (!appState.isUserKnown) {
        return commands.redirect('/login');
      }
      return undefined;
    },
    children: [
      {
        path: '/',
        component: 'empty-view',
      },
      {
        path: ':boardId',
        component: 'board-view',
      },
    ],
  },
];

autorun(() => {
  const board = appState.board;
  if (board.id) {
    Router.go('/' + board.id);
    document.title = board.name;
  } else {
    Router.go('/');
    document.title = 'CollaBoard';
  }
});

autorun(() => {
  if (appState.isUserKnown) {
    Router.go(sessionStorage.getItem(REDIRECT_PATH_KEY) || '/');
  }
});

export const router = new Router(document.querySelector('#outlet'));
router.setRoutes(routes);
