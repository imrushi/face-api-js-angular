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

  @ViewChild('video')
  public video: ElementRef;

  @ViewChild('canvas')
  public canvasRef: ElementRef;

  @ViewChild('canvasPhoto')
  public canvasPhoto: ElementRef;

  constructor(private elRef: ElementRef) {}

  captures: string[] = [];
  error: any;
  isCaptured: boolean;
  stream: any;
  detection;
  displayValues;
  resizedDetections;
  canvas;
  displaySize;
  vid;
  ctx;
  cropF;
  async ngOnInit() {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('../../assets/models'),
      await faceapi.nets.faceLandmark68Net.loadFromUri('../../assets/models'),
      await faceapi.nets.faceRecognitionNet.loadFromUri('../../assets/models'),
      await faceapi.nets.faceExpressionNet.loadFromUri('../../assets/models'),
    ]).then(() => this.startVideo());
  }
  startVideo() {
    this.vid = document.getElementById('video');
    navigator.getUserMedia(
      { video: {}, audio: false },
      (stream) => (this.vid.srcObject = stream),
      (err) => console.log(err)
    );
    console.log(this.canvasRef);
    this.detectF();
  }
  async detectF() {
    // this.vid = document.getElementById('video');
    this.elRef.nativeElement
      .querySelector('video')
      .addEventListener('play', async () => {
        this.canvas = await faceapi.createCanvasFromMedia(this.vid);
        // console.log(this.video);

        document.getElementById('canvasEL').appendChild(this.canvas);
        this.canvas.setAttribute('id', 'canvass');
        this.canvas.setAttribute(
          'style',
          `position: fixed;
        top: 0;
        left: 0;`
        );
        this.displaySize = {
          width: this.vid.width,
          height: this.vid.height,
        };
        faceapi.matchDimensions(this.canvas, this.displaySize);
        setInterval(async () => {
          this.detection = await faceapi
            .detectAllFaces(this.vid, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

          if (this.detection.length == 0) {
            console.log('0');
          } else if (this.detection.length == 1 && !this.isCaptured) {
            this.capture();
          }
          // console.log(this.detection);
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
  capture() {
    this.drawImageToCanvas(this.video.nativeElement);
    this.captures.push(this.canvasPhoto.nativeElement.toDataURL('image/png'));
    console.log(this.captures);
    this.isCaptured = true;
  }

  drawImageToCanvas(image: any) {
    this.canvasPhoto.nativeElement
      .getContext('2d')
      .drawImage(image, 0, 0, this.WIDTH, this.HEIGHT);
  }
  onReset() {
    this.captures = [];
    this.isCaptured = false;
    this.canvasPhoto.nativeElement
      .getContext('2d')
      .clearRect(
        0,
        0,
        this.canvasPhoto.nativeElement.width,
        this.canvasPhoto.nativeElement.height
      );
  }
}
