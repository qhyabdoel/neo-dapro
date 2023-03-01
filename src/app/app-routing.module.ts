import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LayoutModule } from 'src/app/layouts/layout.module';

import { AuthGuard } from 'src/app/libs/guards/auth.guard';

import { BaseLayoutComponent } from './layouts/base/base-layout.component';
import { RouteGuard } from './libs/guards/route.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: BaseLayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/home/home.module').then((mod) => mod.HomeModule),
  },
  {
    path: 'pds',
    component: BaseLayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/pds/pds.module').then((m) => m.PdsModule),
  },
  { path: 'auth', loadChildren: () => import('./pages/auth/auth.module').then((mod) => mod.AuthModule) },
  {
    path: 'pdsshare',
    loadChildren: () =>
      import('./pages/pds/datavisualization/pdsshare/pdsshare.module').then((mod) => mod.PdsShareModule),
  },
  // {
  //   path: 'user-management',
  //   canActivate: [RouteGuard],
  //   loadChildren: () =>
  //     import('src/app/pages/user-management/user-management.module').then((m) => m.UserManagementModule),
  // },
  {
    path: '',
    component: BaseLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'pds', loadChildren: () => import('./pages/pds/pds.module').then((m) => m.PdsModule) },
      {
        path: 'user-management',
        // canActivate: [RouteGuard],
        loadChildren: () =>
          import('src/app/pages/user-management/user-management.module').then((m) => m.UserManagementModule),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('src/app/pages/notifications/notification.module').then((m) => m.NotificationsModule),
      },
      // {
      // 	path: "error/403", component: ErrorPageComponent,
      // 	data: {
      // 		type: "error-v6",
      // 		code: 403,
      // 		title: "403... Access forbidden",
      // 		desc: "Looks like you don't have permission to access for requested page.<br> Please, contact administrator",
      // 	},
      // },
      // { path: "error/:type", component: ErrorPageComponent },
      { path: '**', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  declarations: [BaseLayoutComponent],
  imports: [CommonModule, LayoutModule, RouterModule.forRoot(routes, { useHash: true })],
  providers: [AuthGuard],
  exports: [RouterModule],
})
export class AppRoutingModule {}
