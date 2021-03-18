import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-webcam-snapshot-component',
  templateUrl: './webcam-snapshot.component.html',
  styleUrls: ['./webcam-snapshot.component.css'],
})
export class WebcamSnapshotComponent implements OnInit {
  WIDTH = 440;
  HEIGHT = 280;

  @ViewChild('video',{ static: true })
  public video: ElementRef;

  @ViewChild('canvas',{ static: true })
  public canvasRef: ElementRef;

  constructor(private elRef: ElementRef) {}

  stream: any;
  detection: any;
  resizedDetections: any;
  canvas: any;
  canvasEl: any;
  displaySize: any;
  videoInput: any;
  async ngOnInit() {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('../../assets/models'),
      await faceapi.nets.faceLandmark68Net.loadFromUri('../../assets/models'),
      await faceapi.nets.faceRecognitionNet.loadFromUri('../../assets/models'),
      await faceapi.nets.faceExpressionNet.loadFromUri('../../assets/models'),
    ]).then(() => this.startVideo());
  }
  startVideo() {
    this.videoInput = this.video.nativeElement;
    navigator.getUserMedia(
      { video: {}, audio: false },
      (stream) => (this.videoInput.srcObject = stream),
      (err) => console.log(err)
    );
    this.detect_Faces();
  }
  async detect_Faces() {
    this.elRef.nativeElement
      .querySelector('video')
      .addEventListener('play', async () => {
        this.canvas = await faceapi.createCanvasFromMedia(this.videoInput);

        this.canvasEl = this.canvasRef.nativeElement; 
        this.canvasEl.appendChild(this.canvas);
        this.canvas.setAttribute('id', 'canvass');
        this.canvas.setAttribute(
          'style',
          `position: fixed;
        top: 0;
        left: 0;`
        );

        this.displaySize = {
          width: this.videoInput.width,
          height: this.videoInput.height,
        };

        faceapi.matchDimensions(this.canvas, this.displaySize);
        
        setInterval(async () => {
          this.detection = await faceapi
            .detectAllFaces(this.videoInput, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

          this.resizedDetections = faceapi.resizeResults(
            this.detection,
            this.displaySize
          );

          this.canvas
            .getContext('2d')
            .clearRect(0, 0, this.canvas.width, this.canvas.height);
          faceapi.draw.drawDetections(this.canvas, this.resizedDetections);
          faceapi.draw.drawFaceLandmarks(this.canvas, this.resizedDetections);
          faceapi.draw.drawFaceExpressions(this.canvas, this.resizedDetections);
        }, 100);
      });
  }
}
