import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WebcamSnapshotComponent } from './webcam-snapshot-component/webcam-snapshot.component';

@NgModule({
  declarations: [AppComponent, WebcamSnapshotComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
