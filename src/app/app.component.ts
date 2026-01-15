import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import * as AOS from 'aos';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Clínica Dental PCA';

  ngOnInit(): void {
    // Inicializar AOS para animaciones
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });
  }
}