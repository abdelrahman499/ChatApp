import { Routes } from '@angular/router';
import { JoinRoom } from './join-room/join-room';
import { Welcome } from './welcome/welcome';
import { Chat } from './chat/chat';

export const routes: Routes = [
    {path: '', redirectTo: 'join-room', pathMatch: 'full' },
    {path: 'join-room',component: JoinRoom },
    {path:'welcome', component:Welcome},
    {path:'chat',component:Chat},
];
