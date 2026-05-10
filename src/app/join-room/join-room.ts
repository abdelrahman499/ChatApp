import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../chatservice';

@Component({
  selector: 'app-join-room',
  templateUrl: './join-room.html',
  standalone: true,
  styleUrl: './join-room.css',
  imports: [ReactiveFormsModule]
})
export class JoinRoom implements OnInit {
  joinRoomForm!: FormGroup;
  fb = inject(FormBuilder);
  router = inject(Router);
  chatService = inject(ChatService);

  ngOnInit(): void {
    this.joinRoomForm = this.fb.group({
      name: ['', Validators.required],
      room: ['', Validators.required]
    });
  }

  onSubmit() {
    this.joinRoom();
  }

  joinRoom() {
    const { name, room } = this.joinRoomForm.value;

    sessionStorage.setItem('user', name);
    sessionStorage.setItem('room', room);

    this.chatService.joinRoom(name, room)
      .then(() => {
        this.router.navigate(['chat']);
      })
      .catch((error) => {
        console.log('Join error:', error);
      });
  }
}