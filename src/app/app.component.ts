import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Inicializar AOS para animaciones
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });

    // AOS solo escanea el DOM al inicializar. Con NoReuseStrategy, cada
    // navegación crea elementos [data-aos] nuevos que AOS nunca detecta,
    // así que quedan con opacity:0 para siempre (parece "no cargó" aunque
    // los datos sí llegaron). Hay que decirle a AOS que vuelva a escanear
    // el DOM después de cada navegación.
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      setTimeout(() => AOS.refreshHard(), 0);
    });
  }
}