import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanvasComponent } from './canvas/canvas.component';
import { AuthGuard } from './core/services/auth.guard';
import { LoginComponent } from './user/login/login.component';

const routes: Routes = [
  { path: '', redirectTo: 'canvas', pathMatch: 'full' },
  // { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'canvas', component: CanvasComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'canvas', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
