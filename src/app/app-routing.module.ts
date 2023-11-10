import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PruebaPokerComponent } from './components/prueba-poker/prueba-poker.component';

const routes: Routes = [
  {path: '', component: PruebaPokerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
