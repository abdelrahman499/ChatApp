import { Component, inject, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../chatservice';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
})
export class Chat implements OnInit, AfterViewChecked {
  @ViewChild('scrollMe') private scrollContainer!: ElementRef;

  router = inject(Router);
  chatService = inject(ChatService);
  messageControl = new FormControl('');
  messages: any[] = [];
  connectedUsers: string[] = [];
  loggedInUserName: string = sessionStorage.getItem('user') || '';

  ngOnInit(): void {
    const user = sessionStorage.getItem('user') || '';
    const room = sessionStorage.getItem('room') || '';

    if (!user || !room) {
      this.router.navigate(['welcome']);
      return;
    }

    if (this.chatService.connectedUsers$.value.length === 0) {
      this.chatService.joinRoom(user, room)
        .catch(err => console.log('Join error:', err));
    }

    this.chatService.messages$.subscribe(res => {
      this.messages = res;
    });

    this.chatService.connectedUsers$.subscribe(users => {
      this.connectedUsers = users;
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  sendMessage() {
    const message = this.messageControl.value?.trim();
    if (!message) return;

    this.chatService.sendMessage(message)
      .then(() => {
        this.messageControl.setValue('');
      })
      .catch((error) => {
        console.log(error);
      });
  }

  leaveChat() {
    this.chatService.leaveChat().then(() => {
      this.router.navigate(['welcome']);
    }).catch((error) => {
      console.log(error);
    });
  }
}